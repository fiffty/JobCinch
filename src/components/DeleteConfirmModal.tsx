import { useState } from "react";

const STORAGE_KEY = "skipDeleteConfirmation";

function shouldSkipConfirmation(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function setSkipConfirmation(value: boolean) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

export function useDeleteWithConfirmation(onDelete: () => void) {
  const [showModal, setShowModal] = useState(false);

  const requestDelete = () => {
    if (shouldSkipConfirmation()) {
      onDelete();
    } else {
      setShowModal(true);
    }
  };

  const confirmDelete = (dontAskAgain: boolean) => {
    if (dontAskAgain) {
      setSkipConfirmation(true);
    }
    setShowModal(false);
    onDelete();
  };

  const cancelDelete = () => setShowModal(false);

  return { showModal, requestDelete, confirmDelete, cancelDelete };
}

export function DeleteConfirmModal({
  itemLabel,
  onConfirm,
  onCancel,
}: {
  itemLabel: string;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete {itemLabel}?</h3>
        <p>This will hide {itemLabel} from the list. To permanently delete it, remove the corresponding JSON file from the project.</p>
        <label className="delete-modal-checkbox">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
          />
          Do not ask again
        </label>
        <div className="delete-modal-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => onConfirm(dontAskAgain)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
