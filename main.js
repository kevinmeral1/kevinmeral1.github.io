let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let isRunning = false;
let currentStream;
let cameraFacing = 'user'; // Initial camera facing mode
let previousHSL = { h: 0, s: 0, l: 0 }; // Store previous HSL values to maintain rhythm
let analyzeInterval = 1000; // Start with a 1-second interval
let currentVariant = 1; // Initial variant

// Synthesizer and parameters for each variant
let variants = [
    {
        synth: new Tone.PolySynth(Tone.FMSynth, { maxPolyphony: 4, volume: -10 }).toDestination(),
        minDuration: 0.5,
        maxDuration: 2,
        filter: new Tone.Filter(800, "lowpass", -12).toDestination(),
        reverb: new Tone.Reverb({ decay: 2, wet: 0.4 }).toDestination(),
        delay: new Tone.FeedbackDelay("8n", 0.35).toDestination(),
    },
    {
        synth: new Tone.PolySynth(Tone.AMSynth, { maxPolyphony: 4, volume: -10 }).toDestination(),
        minDuration: 0.2,
        maxDuration: 1.5,
        filter: new Tone.Filter(1000, "highpass", -12).toDestination(),
        reverb: new Tone.Reverb({ decay: 3, wet: 0.5 }).toDestination(),
        delay: new Tone.FeedbackDelay("4n", 0.5).toDestination(),
    },
    {
        synth: new Tone.PolySynth(Tone.Synth, { maxPolyphony: 4, volume: -10 }).toDestination(),
        minDuration: 0.1,
        maxDuration: 1,
        filter: new Tone.Filter(500, "bandpass", -12).toDestination(),
        reverb: new Tone.Reverb({ decay: 1, wet: 0.3 }).toDestination(),
        delay: new Tone.FeedbackDelay("16n", 0.2).toDestination(),
    }
];

// Initial routing for each variant
variants.forEach(variant => {
    variant.synth.chain(variant.filter, variant.reverb, variant.delay);
});

// Get user media
async function getUserMedia(constraints) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
}

// Start camera
async function startCamera() {
    try {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        const constraints = {
            video: {
                facingMode: cameraFacing,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        currentStream = await getUserMedia(constraints);
        video.srcObject = currentStream;
        await Tone.start(); // Ensure Tone.js is started
        console.log('Audio context started');
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

// Switch camera
document.getElementById('camera-switch').addEventListener('click', () => {
    cameraFacing = (cameraFacing === 'user') ? 'environment' : 'user';
    startCamera();
});

// Capture and analyze color
function captureAndAnalyzeColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let length = frame.data.length;
    let totalR = 0, totalG = 0, totalB = 0;

    for (let i = 0; i < length; i += 4) {
        totalR += frame.data[i];
        totalG += frame.data[i + 1];
        totalB += frame.data[i + 2];
    }

    let avgR = totalR / (length / 4);
    let avgG = totalG / (length / 4);
    let avgB = totalB / (length / 4);

    let hsl = rgbToHsl(avgR, avgG, avgB);

    playSound(hsl);
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l };
}

// Map HSL to frequency
function hslToFrequency(h, s, l) {
    const minFrequency = 200;
    const maxFrequency = 1000;
    return minFrequency + (maxFrequency - minFrequency) * h;
}

// Map lightness to volume
function lightnessToVolume(l) {
    const minVolume = -20;
    const maxVolume = 0;
    return minVolume + (maxVolume - minVolume) * l;
}

// Map saturation to interval
function saturationToInterval(s) {
    const minInterval = 200;
    const maxInterval = 2000;
    return minInterval + (maxInterval - minInterval) * (1 - s);
}

// Play sound based on color
function playSound(hsl) {
    let frequency = hslToFrequency(hsl.h, hsl.s, hsl.l);
    let volume = lightnessToVolume(hsl.l);
    analyzeInterval = saturationToInterval(hsl.s);

    let noteDuration = variants[currentVariant - 1].minDuration + (variants[currentVariant - 1].maxDuration - variants[currentVariant - 1].minDuration) * hsl.l;

    variants[currentVariant - 1].synth.volume.value = volume;
    variants[currentVariant - 1].synth.triggerAttackRelease(frequency, noteDuration);

    setTimeout(captureAndAnalyzeColor, analyzeInterval);
}

// Start/Stop button event listener
document.getElementById('start-stop').addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        captureAndAnalyzeColor();
        document.getElementById('start-stop').textContent = 'Stop';
    } else {
        isRunning = false;
        clearInterval(interval);
        document.getElementById('start-stop').textContent = 'Start';
    }
});

// Variant buttons event listeners
document.querySelectorAll('.variant-button').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.variant-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentVariant = parseInt(button.id.replace('variant', ''));
    });
});

// Initial setup
startCamera();
document.getElementById('variant1').classList.add('active'); // Set initial active variant
