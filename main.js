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
        synth: new Tone.PolySynth(Tone.Synth, { maxPolyphony: 4, volume: -10 }).toDestination(),
        minDuration: 0.5,
        maxDuration: 2,
        filter: new Tone.Filter(1000, "lowpass", -6).toDestination(),
        reverb: new Tone.Reverb({ decay: 3, wet: 0.3 }).toDestination(),
        delay: new Tone.FeedbackDelay("8n", 0.3).toDestination(),
    },
    {
        synth: new Tone.PolySynth(Tone.Synth, { maxPolyphony: 4, volume: -10 }).toDestination(),
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
    },
];

// Initialize current variant
let synth = variants[currentVariant - 1].synth;
let minDuration = variants[currentVariant - 1].minDuration;
let maxDuration = variants[currentVariant - 1].maxDuration;
let filter = variants[currentVariant - 1].filter;
let reverb = variants[currentVariant - 1].reverb;
let delay = variants[currentVariant - 1].delay;
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

    // Map HSL to musical parameters
    let hue = hslColor.h; // 0 - 360
    let saturation = hslColor.s; // 0 - 100
    let lightness = hslColor.l; // 0 - 100

    // Define a threshold for darkness
    const darknessThreshold = 20; // below this lightness value is considered too dark

    // Determine the chord based on hue
    let chord = getChord(hue);

    // Map lightness to volume (0 dB at white to silence at black)
    let volume = lightness > darknessThreshold ? Tone.gainToDb(lightness / 100) : -Infinity; // silence if too dark

    // Map lightness to note duration (longer notes for darker colors)
    let duration = minDuration + ((100 - lightness) / 100) * (maxDuration - minDuration);

    // Only play note if lightness is above the threshold (not too dark)
    if (lightness > darknessThreshold) {
        playArpeggio(chord, duration);
    } else {
        synth.triggerRelease();
    }

    // Update previous HSL values only if color has changed
    if (hslColor.h !== previousHSL.h || hslColor.s !== previousHSL.s || hslColor.l !== previousHSL.l) {
        previousHSL = hslColor;
    }

    // Set the border color based on the HSL values
    let hslString = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
    document.getElementById('video-container').style.borderColor = hslString;

    // Adjust analyze interval based on lightness (brightness)
    clearInterval(interval); // Clear the previous interval
    analyzeInterval = 1000 - (lightness * 10); // Example mapping, adjust as needed
    interval = setInterval(analyzeColor, analyzeInterval); // Set the new interval
}

function getChord(hue) {
    let chord;
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

function playArpeggio(chord, duration) {
    let time = 0;
    chord.forEach(note => {
        synth.triggerAttackRelease(note, duration / 4, time); // 4 Noten pro Akkord
        time += duration / 4; // Zeit zwischen den Noten
    });
}

function playMelody(hue, lightness) {
    let scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    let melodyNote = scale[Math.floor((hue / 360) * scale.length)];
    let duration = minDuration + ((100 - lightness) / 100) * (maxDuration - minDuration);

    synth.triggerAttackRelease(melodyNote, duration);
}

document.getElementById('start-stop').addEventListener('click', async () => {
    if (!isRunning) {
        await Tone.start();
        interval = setInterval(analyzeColor, analyzeInterval); // Start with the initial interval
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

document.querySelectorAll('.variant-button').forEach(button => {
    button.addEventListener('click', () => {
        switchVariant(parseInt(button.id.replace('variant', '')));
        updateSelectedButton(button);
    });
});

function switchVariant(variantNumber) {
    // Update the current variant
    currentVariant = variantNumber;
    // Update synth and parameters
    synth = variants[currentVariant - 1].synth;
    minDuration = variants[currentVariant - 1].minDuration;
    maxDuration = variants[currentVariant - 1].maxDuration;
    filter = variants[currentVariant - 1].filter;
    reverb = variants[currentVariant - 1].reverb;
    delay = variants[currentVariant - 1].delay;
    synth.connect(filter);
    filter.connect(reverb);
    reverb.connect(delay);
}

function updateSelectedButton(selectedButton) {
    // Remove the 'selected' class from all buttons
    document.querySelectorAll('.variant-button').forEach(button => {
        button.classList.remove('selected');
    });
    // Add the 'selected' class to the clicked button
    selectedButton.classList.add('selected');
}

// Initialize the camera on page load
startCamera();
