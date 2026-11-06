import { useState } from 'react';
import {generateTestReadings, generateLimitReading} from '../firebase/firestore';
import { sendNotification } from '../components/notifications';

import '../index.css';
import '../styles/style.css';
import '../styles/deviceTesting.css';

export default function DevicesTesting() {
    const [inputStationId, setInputStationId] = useState('');
    const [stationIdMissing, setStationIdMissing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setInputStationId(e.target.value);
        if (e.target.value.trim() !== '') {
            setStationIdMissing(false);
        }
    };

    const handleAddTestReadings = async () => {
        console.log("Aggiunta letture di test...");
        if(inputStationId.trim() == ""){
            document.getElementsByClassName('testing_station_input')[0].focus();
            setStationIdMissing(true);
            return;
        }
        setLoading(true);
        await generateTestReadings(inputStationId).then(() => {
            setLoading(false);
        });
    };

    const handleAddLimitReading = async () => {
        if(inputStationId.trim() == ""){
            document.getElementsByClassName('testing_station_input')[0].focus();
            setStationIdMissing(true);
            return;
        }
        let type = document.getElementById("notificationType").value;
        setLoading(true);
        await generateLimitReading(inputStationId, type).then(() => {
            setLoading(false);
        });
    };

    return (
    <>
    <div className='testing_page'>
        <div className='inputs_container'>
            <h2>Test dispositivi</h2>
            {/* casella di testo per la selezione della stazione */}
            <input
                className   = 'testing_station_input'
                placeholder = 'ID stazione'
                value       = {inputStationId}
                onChange    = {handleInputChange}
            />
            {stationIdMissing && (
                <p className="error" style={{ color: '#f44336', fontSize: 13, margin: '8px 0' }}>Inserire l'ID della stazione</p>
            )}

            <div className='inputs_container'>
                <h3>Creazione letture di prova</h3>
                {/* pulsanti per generare dati di test */}
                <button
                    className   = 'addReadingsBtn'
                    onClick     = {handleAddTestReadings}
                    disabled    = {loading}>
                Aggiungi letture di test
                </button>
            </div>
            <div className='inputs_container'>
                <h3>Test notifiche</h3>
                <select 
                    id='notificationType'
                    name='Tipo notifica'>
                    <option value="TEMP_LIMIT">Temperatura</option>
                    <option value="HUM_LIMIT">Umidità</option>
                    <option value="PPM_LIMIT">Limite PPM</option>
                    <option value="ALL">Combinato</option>
                </select>
                <button
                    className   = 'addLimitReadingBtn'
                    onClick     = {handleAddLimitReading}
                    disabled    = {loading}>
                Scatena notifica
                </button>
            </div>
        </div>
    </div>
    </>
    );
}