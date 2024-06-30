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
let sequence;

// Initialize Tone.js sequence
function initializeSequence() {
    let notes = [];
    let scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

    // Create an empty sequence
    sequence = new Tone.Sequence((time, note) => {
        let chord = determineChord(lastHue);
        let duration = mapLightnessToDuration(lastLightness, chord.length);

        // Stop all previous notes to prevent overlapping
        synth.triggerRelease();

        // Play the chord with the determined duration
        chord.forEach((note, index) => {
            let noteDuration = duration / chord.length;
            synth.triggerAttack(note, time + index * noteDuration);
            synth.triggerRelease(time + (index + 1) * noteDuration);
        });
    }, scale, rhythmInterval).start(0);

    Tone.Transport.start();
}

function determineChord(hue) {
    let chord = [];
    
    // Determine the chord based on hue
    switch (Math.floor(hue / 60) % 6) {
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

    return chord;
}

function mapLightnessToDuration(lightness, numNotes) {
    let minDuration = 0.5; // minimum duration of a note in seconds
    let maxDuration = 1.5; // maximum duration of a note in seconds
    return minDuration + ((100 - lightness) / 100) * (maxDuration - minDuration) * numNotes;
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

