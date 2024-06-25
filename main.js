async function startCamera() {
    try {
        const cameras = await navigator.mediaDevices.enumerateDevices();
        let videoConstraints = {
            video: {
                facingMode: "environment" // Rückkamera als Standard verwenden
            }
        };

        // Durchsuche die Kameras nach Front- und Rückkameras
        cameras.forEach(camera => {
            if (camera.kind === 'videoinput') {
                if (camera.label.includes('front')) {
                    videoConstraints.video.facingMode = 'user'; // Frontkamera gefunden
                }
            }
        });

        const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        video.srcObject = stream;
    } catch (err) {
        console.error("Fehler beim Zugriff auf die Kamera: ", err);
    }
}
