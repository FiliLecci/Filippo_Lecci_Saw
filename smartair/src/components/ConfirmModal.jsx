import '../styles/Modal.css'

export function ConfirmModal({ isOpen, body, confirmText, cancelText, onConfirm, onCancel }) {
    if (!isOpen) {
        return null;
    }

    console.log('Rendering ConfirmModal with body:');

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* <div className="modal-header">
                    <h2>Conferma eliminazione stazione</h2>
                </div> */}
                <div className="modal-body">
                    <p>{body}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onCancel}>{cancelText || 'Annulla'}</button>
                    <button className="btn-save-danger" onClick={onConfirm}>{confirmText || 'Conferma'}</button>
                </div>
            </div>
        </div>
    );
}