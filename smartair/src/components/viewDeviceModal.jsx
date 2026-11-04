import React from 'react';
import { useState } from 'react';
import { auth } from '../firebase/config';
import { modifyStationNickname, modifyStationLimits } from '../firebase/firestore';
import { LuClipboardPaste } from 'react-icons/lu'
import { roleGenerator } from '../pages/utils'


import '../styles/Modal.css';


export function ViewDeviceModal({ isViewed, station, mode, onClose }) {

  const [editedNickname, setEditedNickname] = useState(station?.nickname || '');
  const [newLimits, setNewLimits] = useState(
  {
    temp_limit: station?.temp_limit || 20,
    hum_limit: station?.hum_limit || 80,
    ppm_limit: station?.ppm_limit || 1000
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isViewed) {
    return null;
  }

  if (!station || !mode) {
    return null;
  }

  const handleSave = async () => {
    let nicknameChanged = editedNickname.trim() !== (station.nickname || '');
    let limitsChanged = newLimits.temp_limit !== station.temp_limit ||
                       newLimits.hum_limit !== station.hum_limit ||
                       newLimits.ppm_limit !== station.ppm_limit;

    if (isNaN(newLimits.temp_limit) || isNaN(newLimits.hum_limit) || isNaN(newLimits.ppm_limit)){
      return;
    }

    // converto i limiti da testo a interi
    newLimits.temp_limit = parseInt(newLimits.temp_limit);
    newLimits.hum_limit = parseInt(newLimits.hum_limit);
    newLimits.ppm_limit = parseInt(newLimits.ppm_limit);

    setIsSaving(true);

    try {
      const userUid = auth.currentUser.uid;
      await modifyStationNickname(userUid, station.id, editedNickname.trim());
      await modifyStationLimits(station.id, newLimits);
      onClose();
    } catch (e) {
      setError('Errore nel salvataggio: ' + e.message);
    }
    setIsSaving(false);
  };

  const handleClose = () => {
    setEditedNickname(station?.nickname || '');
    setNewLimits({
      temp_limit: station?.temp_limit || 20,
      hum_limit: station?.hum_limit || 80,
      ppm_limit: station?.ppm_limit || 1000
    });
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
          <div className="field-group-inline">
            <div className="field-group">
              <label className="field-label-small">Limite temperatura</label>
              <p className="field-value">{station.temp_limit} °C</p>
            </div>
            <div className="field-group">
              <label className="field-label-small">Limite umidità</label>
              <p className="field-value">{station.hum_limit} %</p>
            </div>
            <div className="field-group">
              <label className="field-label-small">Limite PPM</label>
              <p className="field-value">{station.ppm_limit} ppm</p>
            </div>
          </div>
        </div>
        <div className="field-group-inline">
          <div className="field-group">
            <label className="field-label-small">Proprietario</label>
            <p className="field-value-secondary">
              {station.owner === auth.currentUser.uid ? 'Tu' : station.owner}
            </p>
          </div>

          <div className="field-group">
            <label className="field-label-small">Ruolo</label>
            <p className="field-value-secondary">
              {roleGenerator(station.role)}
            </p>
          </div>
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

        <div className="field-group">
          <h3>Limiti stazione</h3>
          <div className="field-group-inline">
            <div className="field-group">
              <label className="field-label">Temperatura</label>
              <input
                type="text"
                className="input-field"
                value={newLimits.temp_limit}
                onChange={e => setNewLimits({ ...newLimits, temp_limit: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Umidità</label>
              <input
                type="text"
                className="input-field"
                value={newLimits.hum_limit}
                onChange={e => setNewLimits({ ...newLimits, hum_limit: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">PPM</label>
              <input
                type="text"
                className="input-field"
                value={newLimits.ppm_limit}
                onChange={e => setNewLimits({ ...newLimits, ppm_limit: e.target.value })}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
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