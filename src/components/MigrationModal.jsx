export function MigrationModal({ error, isImporting, onImport, onDismiss }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-title"
        aria-describedby="migration-description"
      >
        <div className="confirmation-modal-copy">
          <p className="migration-eyebrow">Cloud sync</p>
          <h2 id="migration-title">Move your workouts to your Venato account?</h2>
          <p id="migration-description">
            Upload the workouts and templates stored on this device to your Venato
            account. After importing, your data will automatically stay in sync
            across all your devices.
          </p>
          {error && <p className="migration-error">{error}</p>}
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onDismiss}
            disabled={isImporting}
          >
            Not now
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onImport}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </button>
        </div>
      </section>
    </div>
  );
}
