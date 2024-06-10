// Zugriff auf die Kamera
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let synth; // Synthesizer-Instanz
let intervalId; // ID des Intervalls für die kontinuierliche Tonerzeugung

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
        console.log('Camera stream started');
    })
    .catch((err) => {
        console.error('Error accessing the camera: ', err);
    });

// Start-Button
document.getElementById('start').addEventListener('click', () => {
    console.log('Start button clicked');
    startContinuousSoundGeneration();
});

// Stop-Button
document.getElementById('stop').addEventListener('click', () => {
    console.log('Stop button clicked');
    stopContinuousSoundGeneration();
});

function startContinuousSoundGeneration() {
    // Erstelle den Synthesizer, falls noch nicht vorhanden
    if (!synth) {
        synth = new Tone.Synth().toDestination();
    }

    // Starte die kontinuierliche Tonerzeugung, falls nicht bereits gestartet
    if (!intervalId) {
        intervalId = setInterval(() => {
            // Zeichne das aktuelle Videobild auf das Canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Hol die Bilddaten des Pixels in der Mitte des Bildes
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            const imageData = context.getImageData(x, y, 1, 1).data;

            const r = imageData[0];
            const g = imageData[1];
            const b = imageData[2];

            console.log(`Captured color: rgb(${r}, ${g}, ${b})`);

            // Mappe die Farben auf Frequenzen und spiele einen Ton ab
            const frequency = mapColorToFrequency(r, g, b);
            console.log(`Mapped frequency: ${frequency}`);
            playTone(frequency);
        }, 100); // Intervall in Millisekunden
    }
}

function stopContinuousSoundGeneration() {
    // Stoppe das Intervall, falls aktiv
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null; // Setze die intervalId zurück
    }
}

function mapColorToFrequency(r, g, b) {
    // Einfache Mapping-Funktion von Farbe zu Frequenz
    const maxFreq = 1000; // Maximale Frequenz in Hz
    const minFreq = 200; // Minimale Frequenz in Hz
    const avg = (r + g + b) / 3; // Durchschnittlicher Farbwert
    return minFreq + (avg / 255) * (maxFreq - minFreq);
}

function playTone(frequency) {
    console.log(`Playing tone at frequency: ${frequency}`);
    synth.triggerAttackRelease(frequency, '8n');
}
