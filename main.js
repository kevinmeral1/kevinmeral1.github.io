let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let isRunning = false;
let currentStream;
let cameraFacing = 'user'; // Initial camera facing mode
let previousHSL = { h: 0, s: 0, l: 0 }; // Store previous HSL values to maintain rhythm

// Create a synthesizer with effects
let synth = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    volume: -15 // Reduced volume
}).toDestination();

let filter = new Tone.Filter(1000, "lowpass", -12).toDestination();
let reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
let delay = new Tone.FeedbackDelay("8n", 0.25).toDestination();
synth.connect(filter);
filter.connect(reverb);
reverb.connect(delay);

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
        r: totalColor.r / points.length
