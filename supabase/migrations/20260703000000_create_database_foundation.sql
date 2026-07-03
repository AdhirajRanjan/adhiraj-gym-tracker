create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  coaching_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  name text not null check (length(trim(name)) > 0),
  performed_on date not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workouts_id_user_id_key unique (id, user_id)
);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null,
  local_id text,
  exercise_name text not null check (length(trim(exercise_name)) > 0),
  exercise_order integer not null check (exercise_order >= 0),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_exercises_id_user_id_key unique (id, user_id),
  constraint workout_exercises_workout_user_fk
    foreign key (workout_id, user_id)
    references public.workouts(id, user_id)
    on delete cascade,
  constraint workout_exercises_workout_order_key unique (workout_id, exercise_order)
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null,
  local_id text,
  set_order integer not null check (set_order >= 0),
  weight numeric(8, 2) not null check (weight >= 0),
  reps integer not null check (reps > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_sets_exercise_user_fk
    foreign key (workout_exercise_id, user_id)
    references public.workout_exercises(id, user_id)
    on delete cascade,
  constraint workout_sets_exercise_order_key unique (workout_exercise_id, set_order)
);

create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  name text not null check (length(trim(name)) > 0),
  notes text,
  template_order integer not null default 0 check (template_order >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_templates_id_user_id_key unique (id, user_id)
);

create table public.template_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null,
  local_id text,
  exercise_name text not null check (length(trim(exercise_name)) > 0),
  exercise_order integer not null check (exercise_order >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint template_exercises_template_user_fk
    foreign key (template_id, user_id)
    references public.workout_templates(id, user_id)
    on delete cascade,
  constraint template_exercises_template_order_key unique (template_id, exercise_order)
);

create unique index workouts_user_local_id_key
  on public.workouts(user_id, local_id)
  where local_id is not null;

create unique index workout_exercises_workout_local_id_key
  on public.workout_exercises(workout_id, local_id)
  where local_id is not null;

create unique index workout_sets_exercise_local_id_key
  on public.workout_sets(workout_exercise_id, local_id)
  where local_id is not null;

create unique index workout_templates_user_local_id_key
  on public.workout_templates(user_id, local_id)
  where local_id is not null;

create unique index template_exercises_template_local_id_key
  on public.template_exercises(template_id, local_id)
  where local_id is not null;

create index workouts_user_history_idx
  on public.workouts(user_id, performed_on desc, created_at desc);

create index workout_exercises_workout_order_idx
  on public.workout_exercises(workout_id, exercise_order);

create index workout_exercises_user_exercise_history_idx
  on public.workout_exercises(user_id, lower(exercise_name));

create index workout_sets_exercise_order_idx
  on public.workout_sets(workout_exercise_id, set_order);

create index workout_templates_user_lookup_idx
  on public.workout_templates(user_id, updated_at desc, name);

create index template_exercises_template_order_idx
  on public.template_exercises(template_id, exercise_order);

create index template_exercises_user_name_idx
  on public.template_exercises(user_id, lower(exercise_name));

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger set_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

create trigger set_workout_exercises_updated_at
  before update on public.workout_exercises
  for each row execute function public.set_updated_at();

create trigger set_workout_sets_updated_at
  before update on public.workout_sets
  for each row execute function public.set_updated_at();

create trigger set_workout_templates_updated_at
  before update on public.workout_templates
  for each row execute function public.set_updated_at();

create trigger set_template_exercises_updated_at
  before update on public.template_exercises
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;

create policy "Users can select own profiles"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profiles"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profiles"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete own profiles"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can select own preferences"
  on public.user_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own preferences"
  on public.user_preferences for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can select own workouts"
  on public.workouts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can select own workout exercises"
  on public.workout_exercises for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own workout exercises"
  on public.workout_exercises for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own workout exercises"
  on public.workout_exercises for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own workout exercises"
  on public.workout_exercises for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can select own workout sets"
  on public.workout_sets for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own workout sets"
  on public.workout_sets for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own workout sets"
  on public.workout_sets for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own workout sets"
  on public.workout_sets for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can select own workout templates"
  on public.workout_templates for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own workout templates"
  on public.workout_templates for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own workout templates"
  on public.workout_templates for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own workout templates"
  on public.workout_templates for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can select own template exercises"
  on public.template_exercises for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own template exercises"
  on public.template_exercises for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own template exercises"
  on public.template_exercises for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own template exercises"
  on public.template_exercises for delete
  to authenticated
  using ((select auth.uid()) = user_id);
