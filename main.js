let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let colorData;
let isRunning = false;

// Synthesizer und Low-Pass-Filter erstellen
let synth = new Tone.Synth().toDestination();
let filter = new Tone.Filter(1000, "lowpass").toDestination();
synth.connect(filter);

// Funktion zur Kameraaktivierung
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Kamera: ", err);
    }
}

// Funktion zur Farberkennung und Tonerzeugung
function analyzeColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1);
    colorData = imageData.data;
    
    // Berechnung der durchschnittlichen Helligkeit
    let brightness = (colorData[0] + colorData[1] + colorData[2]) / 3;
    
    // Anpassung der Filterfrequenz basierend auf der Helligkeit
    filter.frequency.value = brightness * 5;

    // Anpassung des Synthesizer-Tons basierend auf der Farbe
    let frequency = 200 + (colorData[0] + colorData[1] + colorData[2]) / 3;
    synth.triggerAttackRelease(frequency, "8n");
}

// Start-Button-Event
document.getElementById('start').addEventListener('click', () => {
    if (!isRunning) {
        interval = setInterval(analyzeColor, 500);
        isRunning = true;
    }
});

// Stop-Button-Event
document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
});

// Kamera beim Laden der Seite starten
window.onload = startCamera;
