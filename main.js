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
    volume: -20
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
        r: totalColor.r / points.length,
        g: totalColor.g / points.length,
        b: totalColor.b / points.length,
    };

    let hslColor = rgbToHsl(averageColor.r, averageColor.g, averageColor.b);
    let brightness = hslColor.l;

    filter.frequency.rampTo(brightness * 10, 0.5);

    let chord = [];
    if (brightness < 20) {
        chord = ["C3", "E3", "G3"];
    } else if (brightness < 40) {
        chord = ["D3", "F#3", "A3"];
    } else if (brightness < 60) {
        chord = ["E3", "G#3", "B3"];
    } else if (brightness < 80) {
        chord = ["F3", "A3", "C4"];
    } else {
        chord = ["G3", "B3", "D4"];
    }

    synth.triggerAttackRelease(chord, "8n");

    let hslString = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
    document.getElementById('video-container').style.borderColor = hslString;
}

document.getElementById('start-stop').addEventListener('click', async () => {
    if (!isRunning) {
        await Tone.start();
        interval = setInterval(analyzeColor, 100);
        isRunning = true;
        document.getElementById('start-stop').textContent = 'Stop'; // Change button text to Stop
    } else {
        clearInterval(interval);
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
