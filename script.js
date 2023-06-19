// JavaScript-Code in script.js



// Logo neu laden Seite
document.getElementById('logoLink').addEventListener('click', function() {
  location.reload();
});


document.addEventListener("DOMContentLoaded", function() {
  var loginField = document.querySelector("form");
  loginField.style.display = "none";
  
  document.getElementById("leftIconLink").addEventListener("click", function() {
    if (loginField.style.display === "none") {
      loginField.style.display = "block";
    } else {
      loginField.style.display = "none";
    }
  });
});




/* öffnende NAvigationsleiste */

const navToggle = document.getElementById('rightIcon');
const navList = document.querySelector('.nav-list');

navToggle.addEventListener('click', () => {
  navList.classList.toggle('open');
});


// H1 Erscheinen
window.addEventListener('DOMContentLoaded', (event) => {
  const heading = document.querySelector('header h1');
  heading.classList.add('show');
});



/* Dodecaeder Szene */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // Setze den Hintergrund auf Weiß
renderer.shadowMap.enabled = true; // Aktiviere Schatten

document.getElementById('container').appendChild(renderer.domElement);

const dodecahedronRadius = 0.1;
const geometry = new THREE.DodecahedronGeometry(dodecahedronRadius);

// Load the image texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('abstrakte-klare-metallische-hintergrundnahaufnahme.jpg');

// Use the image texture in the material
const material = new THREE.MeshStandardMaterial({ map: texture });

const dodecahedron = new THREE.Mesh(geometry, material);

// Positionierung des Dodekaeders
dodecahedron.position.y; // Höhe des Dodekaeders (halbe Kantenlänge)
dodecahedron.rotation.z;

 // Rotiere den Dodekaeder um 90 Grad um die x-Achse, sodass eine Fläche auf dem Boden liegt

dodecahedron.castShadow = true; // Objekt wirft Schatten
scene.add(dodecahedron);

const light = new THREE.DirectionalLight(0xffffff, 10); // Weiße Richtungslichtquelle
light.position.set(10, 10, 10);
light.castShadow = true; // Lichtquelle wirft Schatten
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Hintergrundbeleuchtung
scene.add(ambientLight);        

const groundSize = 10;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.3 }) // Material für den Boden mit Schatten
);
ground.rotation.x = -Math.PI / 2; // Rotiere den Boden um 90 Grad entlang der x-Achse
ground.receiveShadow = true;
scene.add(ground);  

camera.position.z = dodecahedronRadius * 5;

function animate() {
  requestAnimationFrame(animate);

  dodecahedron.rotation.y += 0.01; // Horizontaler Drehwinkel

  renderer.render(scene, camera);
}

animate();

/* Skalierung Dodecaedergröße */

function resizeContainer() {
  var container = document.getElementById('container');
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;

  // Hier können Sie die maximalen Breite und Höhe anpassen, bei denen der Container skaliert werden soll
  var maxWidth = 400;
  var maxHeight = 1800;

  var widthScaleFactor = windowWidth / maxWidth;
  var heightScaleFactor = windowHeight / maxHeight;
  var scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

  container.style.transform = 'scale(' + scaleFactor + ')';
}

window.addEventListener('resize', resizeContainer);

// Initialisieren der Skalierung beim Laden der Seite
window.addEventListener('load', resizeContainer);
// Schaltflächen referenzieren
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const button4 = document.getElementById('button4');

// Funktionen für Schaltflächen
button1.addEventListener('click', function() {
  dodecahedron.material.color.set(0x1c1c1c); // Setze die Farbe des Dodekaeders auf Schwarz
});

button2.addEventListener('click', function() {
  dodecahedron.material.color.set(0xffffff); // Setze die Farbe des Dodekaeders auf Weiß
});

button3.addEventListener('click', function() {
  dodecahedron.material.color.set(0x00ff00); // Setze die Farbe des Dodekaeders auf Grün
});

button4.addEventListener('click', function() {
  dodecahedron.material.color.set(0x0000ff); // Setze die Farbe des Dodekaeders auf Blau
});


// Video automatisches Abspielen

// Funktion, um zu überprüfen, ob ein Element im sichtbaren Bereich ist
function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Überwache das Scrollereignis
window.addEventListener('scroll', function() {
  var video = document.querySelector('.video-container video');
  
  // Überprüfe, ob das Video im sichtbaren Bereich ist
  if (isElementInViewport(video)) {
    // Prüfe, ob das Video bereits abgespielt wurde
    if (video.currentTime === 0 || video.paused) {
      // Spiele das Video ab, wenn es im sichtbaren Bereich ist und nicht bereits abgespielt wird
      video.play();
    }
  } else {
    // Pausiere das Video, wenn es außerhalb des sichtbaren Bereichs ist
    video.pause();
  }
});





















// Tabelle Animation
const targetSize = 100; // Zielgröße für die Animation
let currentSize = 0; // Aktuelle Größe
let animationRunning = false; // Variable zur Verfolgung des Animationsstatus

function animateSize() {
  if (currentSize < targetSize) {
    currentSize++;

    // Geschwindigkeitsanpassung basierend auf dem aktuellen Wert
    const speed = Math.max(0.1, 1 - currentSize / targetSize); // Je größer der Wert, desto langsamer wird die Animation

    document.getElementById('sizeVariable').textContent = currentSize + 'm';
    document.getElementById('areaVariable').textContent = currentSize * 10 + 'm²'; // Annahme: Fläche ist das Zehnfache der Größe
    document.getElementById('soundPowerVariable').textContent = currentSize * 2 + 'dB'; // Annahme: Schalleistung ist das 1,4-Fache der Größe
    document.getElementById('frequencyRangeVariable').textContent = currentSize * 100 + 'Hz'; // Annahme: Frequenzbereich ist das Hundertfache der Größe
    document.getElementById('bluetoothPowerVariable').textContent = currentSize * 10 + 'W'; // Annahme: Frequenzbereich ist das Hundertfache der Größe

  }

  if (currentSize < targetSize && animationRunning) {
    // Führe die nächste Aktualisierung in der nächsten Frame-Anfrage aus
    requestAnimationFrame(animateSize);
  }
}







// Erstelle einen Intersection Observer
const observer = new IntersectionObserver((entries) => {
  // Überprüfe, ob die Tabelle im sichtbaren Bereich ist
  if (entries[0].isIntersecting) {
    // Starte die Animation
    animationRunning = true;
    animateSize();
  } else {
    // Stoppe die Animation, wenn die Tabelle außerhalb des sichtbaren Bereichs ist
    animationRunning = false;
  }
});

// Beobachte die Tabelle
const table = document.querySelector('table');
observer.observe(table);



// Überprüfen, ob das Bild im sichtbaren Bereich ist
function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Überprüfen Sie beim Scrollen, ob das Bild angezeigt werden soll
function checkTableImageVisibility() {
  var tableImage = document.querySelector(".table-image");
  if (isElementInViewport(tableImage)) {
    tableImage.classList.remove("hidden");
  }
}

// Fügen Sie einen Event-Listener für das Scroll-Ereignis hinzu
window.addEventListener("scroll", checkTableImageVisibility);

// Überprüfen Sie die Sichtbarkeit des Bildes, wenn die Seite geladen wird
window.addEventListener("DOMContentLoaded", checkTableImageVisibility);










// SLider
const slides = document.querySelectorAll('.slider-image');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
let currentIndex = 1;

function swapPositions(slide1, slide2) {
  slide1.style.transform = 'scale(0.72)';
  slide1.style.top = '-60px';

  slide2.style.transform = 'scale(1)';
  slide2.style.top = '0';
}

function showSlide() {
  slides.forEach((slide, index) => {
    if (index === currentIndex) {
      slide.style.transform = 'scale(1)';
      slide.style.top = '0';
    } else if (index === (currentIndex + 1) % slides.length) {
      slide.style.transform = 'scale(0.72)';
      slide.style.top = '-60px';
    } else {
      slide.style.transform = 'scale(0.72)';
      slide.style.top = '-60px';
    }
  });
}

function nextSlide() {
  const nextIndex = (currentIndex + 1) % slides.length;
  currentIndex = nextIndex;
  swapPositions(slides[currentIndex], slides[nextIndex]);
  showSlide();
}

function previousSlide() {
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  
  swapPositions(slides[currentIndex], slides[prevIndex]);
  currentIndex = prevIndex;
  showSlide();
}


leftArrow.addEventListener('click', previousSlide);
rightArrow.addEventListener('click', nextSlide);









document.addEventListener("DOMContentLoaded", function() {
  const imageContainers = document.querySelectorAll(".image-text-container");

  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  imageContainers.forEach(function(container) {
    observer.observe(container);
  });
});










 // Function to check if an element is in the viewport
 function isInViewport(element) {
  var rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to add a CSS class when an element is in the viewport
function addAnimationOnScroll() {
  var elements = document.querySelectorAll('.main-content .links, .main-content .rechts');

  elements.forEach(function(element) {
    if (isInViewport(element)) {
      element.classList.remove('animate');
    } else {
      element.classList.add('animate');
    }
  });
}

// Add the scroll event listener
window.addEventListener('scroll', addAnimationOnScroll);