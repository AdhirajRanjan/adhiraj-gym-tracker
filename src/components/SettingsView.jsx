import { useState } from "react";

function getUserDisplayName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Venato user"
  );
}

function getUserAvatarUrl(user) {
  return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
}

export function SettingsView({ auth, onBack, onClearAllData }) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const userName = getUserDisplayName(auth.user);
  const userEmail = auth.user?.email || "";
  const userAvatarUrl = getUserAvatarUrl(auth.user);

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
            <h2>Account</h2>
            {auth.user ? (
              <div className="account-profile">
                {userAvatarUrl ? (
                  <img className="account-avatar" src={userAvatarUrl} alt="" />
                ) : (
                  <div className="account-avatar account-avatar-fallback" aria-hidden="true">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="account-details">
                  <strong>{userName}</strong>
                  {userEmail && <span>{userEmail}</span>}
                </div>
              </div>
            ) : (
              <p>
                Sign in to prepare Venato for cloud sync across your devices.
                Your workouts will continue to stay on this device for now.
              </p>
            )}
            {!auth.user && !auth.isAuthConfigured && (
              <p className="settings-auth-message">
                Sign in is unavailable in this environment.
              </p>
            )}
            {auth.authError && (
              <p className="settings-auth-message">{auth.authError}</p>
            )}
          </div>

          {auth.user ? (
            <button
              type="button"
              className="ghost-button settings-account-action"
              onClick={auth.signOut}
              disabled={auth.isAuthActionPending}
            >
              {auth.isAuthActionPending ? "Signing Out..." : "Sign Out"}
            </button>
          ) : (
            <button
              type="button"
              className="primary-button settings-account-action"
              onClick={auth.signIn}
              disabled={
                auth.isAuthLoading ||
                auth.isAuthActionPending ||
                !auth.isAuthConfigured
              }
            >
              {auth.isAuthLoading
                ? "Checking Account..."
                : auth.isAuthActionPending
                  ? "Opening Google..."
                  : "Sign in with Google"}
            </button>
          )}
        </section>

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
