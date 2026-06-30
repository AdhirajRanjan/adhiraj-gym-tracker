import { useState } from "react";

export function SettingsView({ onBack, onClearAllData }) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const closeConfirmation = () => {
    setIsConfirmingClear(false);
  };

  const confirmClearAllData = () => {
    onClearAllData();
    closeConfirmation();
  };

  return (
    <div className="page">
      <div className="container settings-container">
        <header className="header">
          <div>
            <h1>Settings</h1>
            <p>Manage Venato preferences and local data.</p>
          </div>
          <button type="button" className="ghost-button" onClick={onBack}>
            Back
          </button>
        </header>

        <section className="settings-section">
          <div className="settings-section-copy">
            <h2>About Venato</h2>
            <p>
              Venato is a modern workout tracker built around progressive overload,
              designed to help you remember your last workout and train smarter.
            </p>
          </div>
        </section>

        <section className="settings-section settings-danger-section">
          <div className="settings-section-copy">
            <h2>Danger Zone</h2>
            <p>
              Clear all workouts and templates stored on this device. This action
              cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="danger-button settings-danger-button"
            onClick={() => setIsConfirmingClear(true)}
          >
            Clear All Data
          </button>
        </section>

        <p className="settings-future-note">
          More settings will appear here as Venato evolves.
        </p>
      </div>

      {isConfirmingClear && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeConfirmation();
            }
          }}
        >
          <section
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-data-title"
            aria-describedby="clear-data-description"
          >
            <div className="confirmation-modal-copy">
              <p className="confirmation-eyebrow">Permanent action</p>
              <h2 id="clear-data-title">Clear all local data?</h2>
              <p id="clear-data-description">
                This will permanently delete all workouts and templates stored on
                this device. Venato cannot recover this data after it is cleared.
              </p>
            </div>
            <div className="confirmation-actions">
              <button type="button" className="ghost-button" onClick={closeConfirmation}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={confirmClearAllData}
              >
                Delete All Local Data
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
