let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let isRunning = false;
let currentStream;
let cameraFacing = 'user'; // Initial camera facing mode

// Create a synthesizer with effects
let synth = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    volume: -50 // Further reduce the initial volume
}).toDestination();

let filter = new Tone.Filter(1000, "lowpass", -12).toDestination();
let reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();
let delay = new Tone.FeedbackDelay("8n", 0.2).toDestination();
synth.connect(filter);
filter.connect(reverb);
reverb.connect(delay);

// Add a limiter to prevent overdriving
let limiter = new Tone.Limiter(-24).toDestination();
synth.connect(limiter);

let lastColor = null;
let lastHue = 0;
let lastLightness = 50;

// Rhythm settings
const rhythmInterval = 1; // Rhythm interval in seconds
let rhythmTimer = null;

async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: {
                    ideal: cameraFacing
                }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        currentStream = stream;
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Kamera: ", err);
    }
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function analyzeColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const points = [
        { x: canvas.width / 2, y: canvas.height / 2 },
        { x: canvas.width / 2 - 10, y: canvas.height / 2 },
        { x: canvas.width / 2 + 10, y: canvas.height / 2 },
        { x: canvas.width / 2, y: canvas.height / 2 - 10 },
        { x: canvas.width / 2, y: canvas.height / 2 + 10 },
    ];

    let totalColor = { r: 0, g: 0, b: 0 };
    points.forEach(point => {
        let imageData = ctx.getImageData(point.x, point.y, 1, 1);
        totalColor.r += imageData.data[0];
        totalColor.g += imageData.data[1];
        totalColor.b += imageData.data[2];
    });

    let averageColor = {
        r: totalColor.r / points.length,
        g: totalColor.g / points.length,
        b: totalColor.b / points.length,
    };

    let hslColor = rgbToHsl(averageColor.r, averageColor.g, averageColor.b);

    // Update the last known color values
    lastHue = hslColor.h;
    lastLightness = hslColor.l;

    // Set the border color based on the HSL values
    let hslString = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
    document.getElementById('video-container').style.borderColor = hslString;
}

function playRhythmicPattern() {
    let scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    let scaleIndex = Math.floor((lastHue / 360) * scale.length);
    let chord = [];
    
    // Determine the chord based on hue
    switch (Math.floor(lastHue / 60) % 6) {
        case 0:
            chord = ["C4", "E4", "G4"]; // C Major
            break;
        case 1:
            chord = ["D4", "F#4", "A4"]; // D Major
            break;
        case 2:
            chord = ["E4", "G#4", "B4"]; // E Major
            break;
        case 3:
            chord = ["F4", "A4", "C5"]; // F Major
            break;
        case 4:
            chord = ["G4", "B4", "D5"]; // G Major
            break;
        case 5:
            chord = ["A4", "C#5", "E5"]; // A Major
            break;
    }

    // Map lightness to volume (0 dB at white to silence at black)
    let volume = lastLightness > 30 ? -50 + (lastLightness / 100) * 10 : -Infinity; // silence if too dark

    // Map lightness to note duration (longer notes for darker colors)
    let minDuration = 0.5; // minimum duration of a note in seconds
    let maxDuration = 1.5; // maximum duration of a note in seconds
    let duration = minDuration + ((100 - lastLightness) / 100) * (maxDuration - minDuration);

    // Apply the mapped values
    synth.set({ volume: volume });
    filter.frequency.rampTo((lastLightness / 100) * 1980 + 20, 0.5);

    // Play the chord with a rhythmic pattern
    chord.forEach((note, index) => {
        let noteDuration = duration / chord.length;
        synth.triggerAttack(note, Tone.now() + index * noteDuration);
        synth.triggerRelease(Tone.now() + (index + 1) * noteDuration);
    });
}

function startRhythm() {
    // Ensure the rhythm continues
    rhythmTimer = setInterval(playRhythmicPattern, rhythmInterval * 1000);
}

document.getElementById('start-stop').addEventListener('click', async () => {
    if (!isRunning) {
        await Tone.start();
        interval = setInterval(analyzeColor, 100);
        startRhythm();
        isRunning = true;
        document.getElementById('start-stop').textContent = 'Stop'; // Change button text to Stop
    } else {
        clearInterval(interval);
        clearInterval(rhythmTimer);
        rhythmTimer = null;
        isRunning = false;
        document.getElementById('start-stop').textContent = 'Start'; // Change button text to Start
    }
});

document.getElementById('camera-switch').addEventListener('click', () => {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    cameraFacing = cameraFacing === 'user' ? 'environment' : 'user';
    startCamera();
});

window.onload = startCamera;
