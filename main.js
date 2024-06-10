let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let colorData;
let synth = new Tone.Synth().toDestination();
let isRunning = false;

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
    let avgColor = (colorData[0] + colorData[1] + colorData[2]) / 3;
    synth.triggerAttackRelease(avgColor, "8n");
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
