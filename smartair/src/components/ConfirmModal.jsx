

export function ConfirmModal({ isOpen, body, confirmText, cancelText, onConfirm, onCancel }) {
    if (!isOpen) {
        return null;
    }

    console.log('Rendering ConfirmModal with body:');

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{body}</p>
                <div className="modal-buttons">
                    <button onClick={onCancel}>{cancelText || 'Annulla'}</button>
                    <button onClick={onConfirm}>{confirmText || 'Conferma'}</button>
                </div>
            </div>
        </div>
    );
}