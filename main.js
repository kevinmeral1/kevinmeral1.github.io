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

// Connect filter, reverb, and delay to synth for each variant
variants.forEach(variant => {
    variant.synth.chain(variant.filter, variant.reverb, variant.delay);
});

function handleStartStop() {
    let button = document.getElementById('start-stop');
    if (isRunning) {
        clearInterval(interval);
        button.textContent = 'Start';
    } else {
        interval = setInterval(analyzeColor, analyzeInterval);
        button.textContent = 'Stop';
    }
    isRunning = !isRunning;
}

async function switchCamera() {
    let constraints = {
        video: {
            facingMode: cameraFacing
        }
    };
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        cameraFacing = (cameraFacing === 'user') ? 'environment' : 'user';
    } catch (error) {
        console.error('Error switching camera:', error);
    }
}

async function startCamera() {
    let constraints = {
        video: {
            facingMode: cameraFacing
        }
    };
    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

function analyzeColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    let r = imageData[0];
    let g = imageData[1];
    let b = imageData[2];

    let hsl = rgbToHsl(r, g, b);

    if (Math.abs(hsl.h - previousHSL.h) > 0.1 || Math.abs(hsl.s - previousHSL.s) > 0.1 || Math.abs(hsl.l - previousHSL.l) > 0.1) {
        let note = hslToFrequency(hsl.h);
        let velocity = hsl.s;
        let duration = variants[currentVariant - 1].minDuration + hsl.l * (variants[currentVariant - 1].maxDuration - variants[currentVariant - 1].minDuration);
        variants[currentVariant - 1].synth.triggerAttackRelease(note, duration, undefined, velocity);
        previousHSL = hsl;
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
        h = s = 0;
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

function hslToFrequency(h) {
    let minFreq = 220;
    let maxFreq = 880;
    return minFreq + h * (maxFreq - minFreq);
}

function selectVariant(variantNumber) {
    currentVariant = variantNumber;
    document.querySelectorAll('.variant-button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById('variant' + variantNumber).classList.add('selected');
}

document.getElementById('start-stop').addEventListener('click', handleStartStop);
document.getElementById('camera-switch').addEventListener('click', switchCamera);
document.getElementById('variant1').addEventListener('click', () => selectVariant(1));
document.getElementById('variant2').addEventListener('click', () => selectVariant(2));
document.getElementById('variant3').addEventListener('click', () => selectVariant(3));

startCamera();
selectVariant(1);
