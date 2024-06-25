let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let interval;
let colorData;
let isRunning = false;

let synth = new Tone.Synth().toDestination();
let filter = new Tone.Filter(1000, "lowpass").toDestination();
synth.connect(filter);

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { exact: 'environment' }  // Nutze die Rückkamera
            }
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Kamera: ", err);
    }
}

function analyzeColor() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1);
    colorData = imageData.data;
    
    let brightness = (colorData[0] + colorData[1] + colorData[2]) / 3;
    
    filter.frequency.value = brightness * 5;

    let frequency = 200 + (colorData[0] + colorData[1] + colorData[2]) / 3;
    synth.triggerAttackRelease(frequency, "8n");
}

document.getElementById('start').addEventListener('click', () => {
    if (!isRunning) {
        interval = setInterval(analyzeColor, 500);
        isRunning = true;
    }
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    isRunning = false;
});

window.onload = startCamera;
