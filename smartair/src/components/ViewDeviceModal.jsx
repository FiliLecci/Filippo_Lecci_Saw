import React from 'react';
import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { modifyStationNickname, getUserInfo } from '../firebase/firestore';
import { LuClipboardPaste, LuEye } from 'react-icons/lu'
import { GoPerson } from "react-icons/go";


import '../styles/Modal.css';


export function ViewDeviceModal({ isViewed, station, mode, onClose }) {

  const [editedNickname, setEditedNickname] = useState(station?.nickname || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isViewed) {
      return null;
  }

  if(!station || !mode) {
      return null;
  }

  const toggleModal = () => {
      setIsOpen(!isOpen);
  };

  const handleSave = async () => {
    if (!editedNickname.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const userUid = auth.currentUser.uid;
      await modifyStationNickname(userUid, station.id, editedNickname.trim());
      onClose();
    } catch (e) {
      setError('Errore nel salvataggio: ' + e.message);
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setEditedNickname('');
    setIsSaving(false);
    onClose();
  };

  const RenderViewInfo = ({ station }) => {
    return (
      <>
        <div className="field-group">
          <label className="field-label-small">Nome Visualizzazione</label>
          <p className="field-value">{station.nickname || station.name}</p>
        </div>

        <div className="field-group">
          <label className="field-label-small">Nome Stazione</label>
          <p className="field-value">{station.name}</p>
        </div>

        <div className="field-group">
          <label className="field-label-small">ID Stazione</label>
          <p className="field-value field-value-mono">{station.id}</p>
        </div>

        <div className="field-group">
          <label className="field-label-small">Device Token</label>
          <div className="field-with-button">
            <p className="token-box">{station.device_token}</p>
            <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(station.device_token)}
              > 
              <LuClipboardPaste /> Copia
            </button>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label-small">Proprietario</label>
          <p className="field-value-secondary">
            {console.log(getUserInfo(auth.currentUser.uid))}
            {station.owner === auth.currentUser.uid ? 'Tu' : station.owner}
          </p>
        </div>

        <div className="field-group">
          <label className="field-label-small">Ruolo</label>
          <p className="field-value-secondary">
            {station.role === 'owner' ? <GoPerson /> + 'Proprietario' : <LuEye /> + ' Osservatore'}
          </p>
        </div>
      </>
    );
  }

  const RenderModifyForm = ({ station, editedNickname, setEditedNickname }) => {
    
    // Questo è per mantenere il focus sul campo di input
    const { useRef, useEffect } = React;
    const nicknameRef = React.createRef(null);

    useEffect(() => {
      if (mode === 'edit' && nicknameRef.current) {
        nicknameRef.current.focus();
      }
    }, []);

    return (
      <>
        <div className="field-group">
          <label className="field-label">Nome Visualizzazione</label>
          <input
            type="text"
            className="input-field"
            value={editedNickname}
            ref={nicknameRef}
            onChange={e => setEditedNickname(e.target.value)}
            placeholder="Es. Camera da letto"
          />
          <p className="field-hint">Questo è il nome che vedrai nella dashboard</p>
        </div>

        <div className="field-group">
          <label className="field-label">Nome Stazione (non modificabile)</label>
          <input
            type="text"
            className="input-field"
            value={station.name}
            disabled
          />
        </div>

        <div className="field-group">
          <label className="field-label">Device Token</label>
          <div className="field-with-button">
            <input
              type="text"
              className="input-field"
              value={station.device_token}
              disabled
            />
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(station.device_token)}
            >
              <LuClipboardPaste /> Copia
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}/>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2>{mode === 'view' ? 'Dettagli Stazione' : 'Modifica Stazione'}</h2>
          <button className="modal-close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Contenuto */}
        <div className="modal-content">
          {mode === 'view' ? (
            <RenderViewInfo station={station} />
          ) : (
            <RenderModifyForm
              station={station}
              editedNickname={editedNickname}
              setEditedNickname={setEditedNickname}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            {mode === 'view' ? 'Chiudi' : 'Annulla'}
          </button>

          {mode === 'edit' && (
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Salvataggio...' : 'Salva'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}