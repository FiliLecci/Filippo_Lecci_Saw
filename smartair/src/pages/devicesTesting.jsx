import { useState } from 'react';
import {generateTestReadings, generateLimitReading} from '../firebase/firestore';

import '../index.css';
import '../styles/style.css';
import '../styles/deviceTesting.css';

export default function DevicesTesting() {
    const [inputStationId, setInputStationId] = useState('');

    const handleAddTestReadings = async () => {
        console.log("Aggiunta letture di test...");
        if(inputStationId.trim() == ""){
            console.log("Inserire Id della stazione");
            return;
        }
        await generateTestReadings(inputStationId);
    };

    const handleAddLimitReading = async () => {
        console.log("aggiunta letture per notifica fake: ", document.getElementById("notificationType").value);
    };

    return (
    <>
    <div className='testing_page'>
        <div className='inputs_container'>
            {/* casella di testo per la selezione della stazione */}
            <input
                className   = 'testingStationBtn'
                placeholder = 'ID stazione'
                value       = {inputStationId}
                onChange    = {e => setInputStationId(e.target.value)}
            />
            {/* pulsanti per generare dati di test */}
            <button
                className   = 'addReadingsBtn'
                onClick     = {handleAddTestReadings}
                disabled    = {false}>
            Aggiungi letture di test
            </button>
            <label>Test notifiche</label>
            <div>
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
                    disabled    = {false}>
                Scatena notifica
                </button>
            </div>
        </div>
    </div>
    </>
    );
}