import { useEffect, useMemo, useState } from "react";
import { STORAGE_KEY, TEMPLATES_STORAGE_KEY } from "../lib/constants.js";
import { createSet, createExercise, createTemplateExercise } from "../lib/factories.js";
import {
  getInitialWorkouts,
  getInitialTemplates,
  hasStoredLocalTrainingData,
} from "../lib/storage.js";
import { useAuthSession } from "../hooks/useAuthSession.js";
import {
  fetchCloudTrainingData,
  importCloudTrainingData,
  removeCloudTemplate,
  removeCloudWorkout,
  saveCloudTemplate,
  saveCloudWorkout,
} from "../lib/supabase/database/index.js";
import {
  getUniqueExerciseNames,
  getExerciseAnalytics,
} from "../lib/analytics.js";
import { Dashboard } from "../components/Dashboard.jsx";
import { ExerciseHistoryView } from "../components/ExerciseHistoryView.jsx";
import { MigrationModal } from "../components/MigrationModal.jsx";
import { SettingsView } from "../components/SettingsView.jsx";
import { TemplatesView } from "../components/TemplatesView.jsx";

const MIGRATION_DISMISSED_KEY_PREFIX = "venato-migration-dismissed";

function getMigrationDismissedKey(userId) {
  return `${MIGRATION_DISMISSED_KEY_PREFIX}:${userId}`;
}

export function TrackerPage() {
  const auth = useAuthSession();
  const [workouts, setWorkouts] = useState(() => getInitialWorkouts());
  const [templates, setTemplates] = useState(() => getInitialTemplates());
  const [hasLocalTrainingData, setHasLocalTrainingData] = useState(() =>
    hasStoredLocalTrainingData()
  );
  const [storageMode, setStorageMode] = useState("local");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isImportingLocalData, setIsImportingLocalData] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState("");
  const [exercises, setExercises] = useState([createExercise()]);
  const [autocompleteExerciseId, setAutocompleteExerciseId] = useState(null);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState([createTemplateExercise()]);
  const [templateAutocompleteExerciseId, setTemplateAutocompleteExerciseId] = useState(null);
  const isCloudMode = storageMode === "cloud";

  useEffect(() => {
    if (auth.isAuthLoading) return;

    if (!auth.user) {
      setStorageMode("local");
      setShowMigrationModal(false);
      setIsDataLoading(false);
      setDataError("");
      setWorkouts(getInitialWorkouts());
      setTemplates(getInitialTemplates());
      setHasLocalTrainingData(hasStoredLocalTrainingData());
      return;
    }

    let isActive = true;
    setIsDataLoading(true);
    setDataError("");

    fetchCloudTrainingData(auth.user.id)
      .then((trainingData) => {
        if (!isActive) return;
        const cloudHasTrainingData =
          trainingData.workouts.length > 0 || trainingData.templates.length > 0;
        const localWorkouts = getInitialWorkouts();
        const localTemplates = getInitialTemplates();
        const localHasTrainingData =
          localWorkouts.length > 0 || localTemplates.length > 0;

        setHasLocalTrainingData(localHasTrainingData);

        if (cloudHasTrainingData) {
          setStorageMode("cloud");
          setShowMigrationModal(false);
          setWorkouts(trainingData.workouts);
          setTemplates(trainingData.templates);
          return;
        }

        if (localHasTrainingData) {
          const hasDismissedMigration = sessionStorage.getItem(
            getMigrationDismissedKey(auth.user.id)
          );

          setStorageMode("local");
          setWorkouts(localWorkouts);
          setTemplates(localTemplates);
          setShowMigrationModal(!hasDismissedMigration);
          return;
        }

        setStorageMode("cloud");
        setShowMigrationModal(false);
        setWorkouts([]);
        setTemplates([]);
      })
      .catch(() => {
        if (!isActive) return;
        setDataError("Unable to load cloud data. Please refresh and try again.");
        setStorageMode("local");
        setWorkouts(getInitialWorkouts());
        setTemplates(getInitialTemplates());
        setHasLocalTrainingData(hasStoredLocalTrainingData());
      })
      .finally(() => {
        if (!isActive) return;
        setIsDataLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [auth.isAuthLoading, auth.user?.id]);

  const sortedWorkouts = useMemo(
    () =>
      [...workouts].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          b.createdAt - a.createdAt
      ),
    [workouts]
  );

  const persistWorkouts = (nextWorkouts) => {
    setWorkouts(nextWorkouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkouts));
    setHasLocalTrainingData(nextWorkouts.length > 0 || templates.length > 0);
  };

  const persistTemplates = (nextTemplates) => {
    setTemplates(nextTemplates);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));
    setHasLocalTrainingData(workouts.length > 0 || nextTemplates.length > 0);
  };

  const cacheTrainingData = (nextWorkouts, nextTemplates) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkouts));
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));
  };

  const uniqueExercises = useMemo(() => getUniqueExerciseNames(workouts), [workouts]);

  const stats = useMemo(() => {
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    return {
      totalWorkouts: workouts.length,
      totalExercises,
      totalTemplates: templates.length,
    };
  }, [workouts, templates]);

  const selectedExerciseEntries = useMemo(() => {
    if (!selectedExercise) return [];
    const selectedKey = selectedExercise.toLowerCase();
    const entries = [];

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name.trim().toLowerCase() !== selectedKey) return;
        exercise.sets.forEach((set) => {
          entries.push({
            id: `${workout.id}-${exercise.id}-${set.id}`,
            workoutName: workout.name,
            date: workout.date,
            createdAt: workout.createdAt,
            weight: set.weight,
            reps: set.reps,
          });
        });
      });
    });

    return entries.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
    );
  }, [workouts, selectedExercise]);

  const personalRecord = useMemo(() => {
    if (!selectedExerciseEntries.length) return { highestWeight: null, highestReps: null };

    return selectedExerciseEntries.reduce(
      (records, entry) => ({
        highestWeight: Math.max(records.highestWeight, Number(entry.weight)),
        highestReps: Math.max(records.highestReps, Number(entry.reps)),
      }),
      { highestWeight: 0, highestReps: 0 }
    );
  }, [selectedExerciseEntries]);

  const exerciseAnalytics = useMemo(
    () => (selectedExercise ? getExerciseAnalytics(workouts, selectedExercise) : null),
    [workouts, selectedExercise]
  );

  const deleteWorkout = async (workoutId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this workout?");
    if (!shouldDelete) return;

    if (isCloudMode) {
      setDeletingWorkoutId(workoutId);
      setDataError("");

      try {
        await removeCloudWorkout(auth.user.id, workoutId);
        const nextWorkouts = workouts.filter((workout) => workout.id !== workoutId);
        setWorkouts(nextWorkouts);
        cacheTrainingData(nextWorkouts, templates);
      } catch {
        setDataError("Unable to delete workout. Please try again.");
      } finally {
        setDeletingWorkoutId(null);
      }

      return;
    }

    const nextWorkouts = workouts.filter((workout) => workout.id !== workoutId);
    persistWorkouts(nextWorkouts);
  };

  const deleteTemplate = async (templateId) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this template?");
    if (!shouldDelete) return;

    if (isCloudMode) {
      setDeletingTemplateId(templateId);
      setDataError("");

      try {
        await removeCloudTemplate(auth.user.id, templateId);
        const nextTemplates = templates.filter((template) => template.id !== templateId);
        setTemplates(nextTemplates);
        cacheTrainingData(workouts, nextTemplates);
      } catch {
        setDataError("Unable to delete template. Please try again.");
      } finally {
        setDeletingTemplateId(null);
      }

      return;
    }

    const nextTemplates = templates.filter((template) => template.id !== templateId);
    persistTemplates(nextTemplates);
  };

  const resetForm = () => {
    setWorkoutName("");
    setWorkoutDate("");
    setExercises([createExercise()]);
    setAutocompleteExerciseId(null);
    setWorkoutNotes("");
    setEditingWorkoutId(null);
  };

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateExercises([createTemplateExercise()]);
    setTemplateAutocompleteExerciseId(null);
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TEMPLATES_STORAGE_KEY);
    setWorkouts([]);
    setTemplates([]);
    setHasLocalTrainingData(false);
    resetForm();
    setIsCreating(false);
    setView("dashboard");
    setSelectedExercise("");
  };

  const dismissMigrationPrompt = () => {
    if (auth.user) {
      sessionStorage.setItem(getMigrationDismissedKey(auth.user.id), "true");
    }

    setShowMigrationModal(false);
  };

  const importLocalData = async () => {
    if (!auth.user || isImportingLocalData) return;

    const localWorkouts = getInitialWorkouts();
    const localTemplates = getInitialTemplates();

    setIsImportingLocalData(true);
    setDataError("");

    try {
      const trainingData = await importCloudTrainingData(auth.user.id, {
        workouts: localWorkouts,
        templates: localTemplates,
      });

      setStorageMode("cloud");
      setShowMigrationModal(false);
      setWorkouts(trainingData.workouts);
      setTemplates(trainingData.templates);
      setHasLocalTrainingData(
        localWorkouts.length > 0 || localTemplates.length > 0
      );
      cacheTrainingData(trainingData.workouts, trainingData.templates);
    } catch {
      setDataError("Unable to import local data. Please try again.");
    } finally {
      setIsImportingLocalData(false);
    }
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, createExercise()]);
  };

  const addTemplateExercise = () => {
    setTemplateExercises((prev) => [...prev, createTemplateExercise()]);
  };

  const updateExerciseName = (exerciseId, value) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name: value } : exercise
      )
    );
  };

  const updateTemplateExerciseName = (exerciseId, value) => {
    setTemplateExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name: value } : exercise
      )
    );
  };

  const addSetToExercise = (exerciseId) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSet()] }
          : exercise
      )
    );
  };

  const updateSetField = (exerciseId, setId, field, value) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  const removeSet = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const remainingSets = exercise.sets.filter((set) => set.id !== setId);
        return { ...exercise, sets: remainingSets.length ? remainingSets : [createSet()] };
      })
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises((prev) => {
      const remaining = prev.filter((exercise) => exercise.id !== exerciseId);
      return remaining.length ? remaining : [createExercise()];
    });
  };

  const moveExerciseUp = (index) => {
    if (index === 0) return;
    setExercises((prev) => {
      const newExercises = [...prev];
      [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
      return newExercises;
    });
  };

  const moveExerciseDown = (index) => {
    if (index === exercises.length - 1) return;
    setExercises((prev) => {
      const newExercises = [...prev];
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
      return newExercises;
    });
  };

  const removeTemplateExercise = (exerciseId) => {
    setTemplateExercises((prev) => {
      const remaining = prev.filter((exercise) => exercise.id !== exerciseId);
      return remaining.length ? remaining : [createTemplateExercise()];
    });
  };

  const handleSaveWorkout = async (event) => {
    event.preventDefault();

    if (isSavingWorkout) return;

    const trimmedName = workoutName.trim();
    const trimmedNotes = workoutNotes.trim();
    const validExercises = exercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        sets: exercise.sets
          .map((set) => ({
            ...set,
            weight: set.weight.toString().trim(),
            reps: set.reps.toString().trim(),
          }))
          .filter((set) => set.weight !== "" && set.reps !== ""),
      }))
      .filter((exercise) => exercise.name !== "" && exercise.sets.length > 0);

    if (!trimmedName || !workoutDate || validExercises.length === 0) {
      window.alert(
        "Please enter workout name, date, and at least one exercise with one complete set."
      );
      return;
    }

    const workoutData = {
      name: trimmedName,
      date: workoutDate,
      notes: trimmedNotes,
      exercises: validExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          weight: Number(set.weight),
          reps: Number(set.reps),
        })),
      })),
    };

    if (editingWorkoutId) {
      const editedWorkout = workouts.find((workout) => workout.id === editingWorkoutId);
      const updatedWorkout = {
        id: editingWorkoutId,
        createdAt: editedWorkout?.createdAt || Date.now(),
        ...workoutData,
      };

      if (isCloudMode) {
        setIsSavingWorkout(true);
        setDataError("");

        try {
          const savedWorkout = await saveCloudWorkout(auth.user.id, updatedWorkout, {
            isEditing: true,
          });
          const nextWorkouts = workouts.map((workout) =>
            workout.id === editingWorkoutId ? savedWorkout : workout
          );
          setWorkouts(nextWorkouts);
          cacheTrainingData(nextWorkouts, templates);
          resetForm();
          setIsCreating(false);
        } catch {
          setDataError("Unable to save workout. Please try again.");
        } finally {
          setIsSavingWorkout(false);
        }

        return;
      }

      const updatedWorkouts = workouts.map((workout) =>
        workout.id === editingWorkoutId
          ? { ...workout, ...workoutData }
          : workout
      );
      persistWorkouts(updatedWorkouts);
    } else {
      const newWorkout = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...workoutData,
      };

      if (isCloudMode) {
        setIsSavingWorkout(true);
        setDataError("");

        try {
          const savedWorkout = await saveCloudWorkout(auth.user.id, newWorkout);
          const nextWorkouts = [savedWorkout, ...workouts];
          setWorkouts(nextWorkouts);
          cacheTrainingData(nextWorkouts, templates);
          resetForm();
          setIsCreating(false);
        } catch {
          setDataError("Unable to save workout. Please try again.");
        } finally {
          setIsSavingWorkout(false);
        }

        return;
      }

      persistWorkouts([newWorkout, ...workouts]);
    }

    resetForm();
    setIsCreating(false);
  };

  const handleSaveTemplate = async (event) => {
    event.preventDefault();

    if (isSavingTemplate) return;

    const trimmedName = templateName.trim();
    const validExercises = templateExercises
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
      }))
      .filter((exercise) => exercise.name !== "");

    if (!trimmedName || validExercises.length === 0) {
      window.alert("Please enter template name and at least one exercise.");
      return;
    }

    const newTemplate = {
      id: crypto.randomUUID(),
      name: trimmedName,
      exercises: validExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
      })),
    };

    if (isCloudMode) {
      setIsSavingTemplate(true);
      setDataError("");

      try {
        const savedTemplate = await saveCloudTemplate(
          auth.user.id,
          newTemplate,
          templates
        );
        const nextTemplates = [savedTemplate, ...templates];
        setTemplates(nextTemplates);
        cacheTrainingData(workouts, nextTemplates);
        resetTemplateForm();
        setIsCreatingTemplate(false);
      } catch {
        setDataError("Unable to save template. Please try again.");
      } finally {
        setIsSavingTemplate(false);
      }

      return;
    }

    persistTemplates([newTemplate, ...templates]);
    resetTemplateForm();
    setIsCreatingTemplate(false);
  };

  const applyTemplate = (template) => {
    const hasExistingExercises = exercises.some(
      (exercise) => exercise.name.trim() !== ""
    );

    if (hasExistingExercises) {
      const shouldReplace = window.confirm(
        "This will replace your current exercises. Continue?"
      );
      if (!shouldReplace) return;
    }

    const newExercises = template.exercises.map((exercise) => ({
      id: crypto.randomUUID(),
      name: exercise.name,
      sets: [createSet()],
    }));

    setExercises(newExercises);
    setWorkoutName(template.name);
  };

  const editWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutName(workout.name);
    setWorkoutDate(workout.date);
    setWorkoutNotes(workout.notes || "");
    setExercises(
      workout.exercises.map((exercise) => ({
        id: crypto.randomUUID(),
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          id: crypto.randomUUID(),
          weight: set.weight,
          reps: set.reps,
        })),
      }))
    );
    setIsCreating(true);
  };

  const migrationModal = showMigrationModal ? (
    <MigrationModal
      error={dataError}
      isImporting={isImportingLocalData}
      onImport={importLocalData}
      onDismiss={dismissMigrationPrompt}
    />
  ) : null;

  if (view === "history") {
    return (
      <>
        <ExerciseHistoryView
          uniqueExercises={uniqueExercises}
          selectedExercise={selectedExercise}
          exerciseAnalytics={exerciseAnalytics}
          personalRecord={personalRecord}
          selectedExerciseEntries={selectedExerciseEntries}
          onExerciseSelect={setSelectedExercise}
          onBack={() => {
            setView("dashboard");
            setSelectedExercise("");
          }}
        />
        {migrationModal}
      </>
    );
  }

  if (view === "templates") {
    return (
      <>
        <TemplatesView
          templates={templates}
          templateName={templateName}
          templateExercises={templateExercises}
          templateAutocompleteExerciseId={templateAutocompleteExerciseId}
          isCreatingTemplate={isCreatingTemplate}
          uniqueExercises={uniqueExercises}
          dataError={dataError}
          isDataLoading={isDataLoading}
          isSavingTemplate={isSavingTemplate}
          deletingTemplateId={deletingTemplateId}
          onTemplateNameChange={setTemplateName}
          onTemplateExerciseNameChange={updateTemplateExerciseName}
          onAddTemplateExercise={addTemplateExercise}
          onRemoveTemplateExercise={removeTemplateExercise}
          onTemplateAutocompleteFocus={setTemplateAutocompleteExerciseId}
          onTemplateAutocompleteBlur={setTemplateAutocompleteExerciseId}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={deleteTemplate}
          onCancelTemplate={() => {
            resetTemplateForm();
            setIsCreatingTemplate(false);
          }}
          onNewTemplate={() => setIsCreatingTemplate(true)}
          onBack={() => {
            setView("dashboard");
            setIsCreatingTemplate(false);
            resetTemplateForm();
          }}
        />
        {migrationModal}
      </>
    );
  }

  if (view === "settings") {
    return (
      <>
        <SettingsView
          auth={auth}
          onBack={() => setView("dashboard")}
          onClearAllData={clearAllData}
        />
        {migrationModal}
      </>
    );
  }

  return (
    <>
      <Dashboard
        stats={stats}
        isCreating={isCreating}
        editingWorkoutId={editingWorkoutId}
        workoutName={workoutName}
        workoutDate={workoutDate}
        exercises={exercises}
        workoutNotes={workoutNotes}
        templates={templates}
        uniqueExercises={uniqueExercises}
        autocompleteExerciseId={autocompleteExerciseId}
        sortedWorkouts={sortedWorkouts}
        workouts={workouts}
        dataError={dataError}
        isDataLoading={isDataLoading}
        isSavingWorkout={isSavingWorkout}
        deletingWorkoutId={deletingWorkoutId}
        onViewChange={setView}
        onNewWorkout={() => setIsCreating(true)}
        onWorkoutNameChange={setWorkoutName}
        onWorkoutDateChange={setWorkoutDate}
        onWorkoutNotesChange={setWorkoutNotes}
        onExerciseNameChange={updateExerciseName}
        onSetFieldChange={updateSetField}
        onAddExercise={addExercise}
        onRemoveExercise={removeExercise}
        onMoveExerciseUp={moveExerciseUp}
        onMoveExerciseDown={moveExerciseDown}
        onAddSet={addSetToExercise}
        onRemoveSet={removeSet}
        onAutocompleteFocus={setAutocompleteExerciseId}
        onAutocompleteBlur={setAutocompleteExerciseId}
        onApplyTemplate={applyTemplate}
        onSaveWorkout={handleSaveWorkout}
        onCancelWorkout={() => {
          resetForm();
          setIsCreating(false);
        }}
        onEditWorkout={editWorkout}
        onDeleteWorkout={deleteWorkout}
      />
      {migrationModal}
    </>
  );
}
