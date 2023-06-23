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
renderer.setClearColor(0xffffff); 
renderer.shadowMap.enabled = true; 

document.getElementById('container').appendChild(renderer.domElement);

const dodecahedronRadius = 0.1;
const geometry = new THREE.DodecahedronGeometry(dodecahedronRadius);


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('abstrakte-klare-metallische-hintergrundnahaufnahme.jpg');


const material = new THREE.MeshStandardMaterial({ map: texture });

const dodecahedron = new THREE.Mesh(geometry, material);


dodecahedron.position.y; 
dodecahedron.rotation.z;



dodecahedron.castShadow = true; 
scene.add(dodecahedron);

const light = new THREE.DirectionalLight(0xffffff, 10); 
light.position.set(10, 10, 10);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);

const groundSize = 10;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.3 }) 
);
ground.rotation.x = -Math.PI / 2; 
ground.receiveShadow = true;
scene.add(ground);

camera.position.z = dodecahedronRadius * 3;

function animate() {
  requestAnimationFrame(animate);


  if (window.innerWidth < 480) {
    dodecahedron.scale.set(0.8, 0.8, 0.8); 
  } else {
    dodecahedron.scale.set(1, 1, 1); 
  }

  dodecahedron.rotation.y += 0.01; 

  renderer.render(scene, camera);
}

animate();


/* Skalierung Dodecaedergröße */

function resizeContainer() {
  var container = document.getElementById('container');
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;

  var maxWidth = 400;
  var maxHeight = 1800;

  var widthScaleFactor = windowWidth / maxWidth;
  var heightScaleFactor = windowHeight / maxHeight;
  var scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

  container.style.transform = 'scale(' + scaleFactor + ')';
}

window.addEventListener('resize', resizeContainer);


window.addEventListener('load', resizeContainer);

const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const button4 = document.getElementById('button4');

// Funktionen für Schaltflächen
button1.addEventListener('click', function() {
  dodecahedron.material.color.set(0x1c1c1c); 
});

button2.addEventListener('click', function() {
  dodecahedron.material.color.set(0x999999); 
});

button3.addEventListener('click', function() {
  dodecahedron.material.color.set(0x1FB01C); 
});

button4.addEventListener('click', function() {
  dodecahedron.material.color.set(0x037CC2); 
});


// Video automatisches Abspielen

 function isElementInViewport(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    window.addEventListener('scroll', function() {
      var video = document.querySelector('.video-container video');
  
      if (isElementInViewport(video)) {
        if (video.currentTime === 0 || video.paused) {
          video.play();
        }
      } else {
        video.pause();
      }
    });





















// Tabelle Animation
const targetSize = 100; 
let currentSize = 0; 
let animationRunning = false; 

function animateSize() {
  if (currentSize < targetSize) {
    currentSize++;

    
    const speed = Math.max(0.1, 1 - currentSize / targetSize);

    document.getElementById('sizeVariable').textContent = currentSize + 'm';
    document.getElementById('areaVariable').textContent = currentSize * 10 + 'm²'; 
    document.getElementById('soundPowerVariable').textContent = currentSize * 2 + 'dB'; 
    document.getElementById('frequencyRangeVariable').textContent = currentSize * 100 + 'Hz'; 
    document.getElementById('bluetoothPowerVariable').textContent = currentSize * 10 + 'W'; 

  }

  if (currentSize < targetSize && animationRunning) {
 
    requestAnimationFrame(animateSize);
  }
}








const observer = new IntersectionObserver((entries) => {

  if (entries[0].isIntersecting) {

    animationRunning = true;
    animateSize();
  } else {
    
    animationRunning = false;
  }
});


const table = document.querySelector('table');
observer.observe(table);




function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}


function checkTableImageVisibility() {
  var tableImage = document.querySelector(".table-image");
  if (isElementInViewport(tableImage)) {
    tableImage.classList.remove("hidden");
  }
}


window.addEventListener("scroll", checkTableImageVisibility);


window.addEventListener("DOMContentLoaded", checkTableImageVisibility);










// SLider
const slides = document.querySelectorAll('.slider-image');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
let currentIndex = 0; 

function swapPositions(slide1, slide2) {
  slide1.style.transform = 'scale(0.72)';
  slide1.style.top = '-60px';

  slide2.style.transform = 'scale(1)';
  slide2.style.top = '0';
}

function showSlide() {
  slides.forEach((slide, index) => {
    if (slides.length <= 1) {
      slide.style.display = 'block';
    } else if (index === currentIndex) {
      slide.style.transform = 'scale(1)';
      slide.style.top = '0';
      slide.style.display = 'block';
    } else {
      slide.style.transform = 'scale(0.72)';
      slide.style.top = '-60px';
      if (window.innerWidth >= 958) {
        slide.style.display = 'block';
      } else {
        slide.style.display = 'none';
      }
    }
  });
}

function nextSlide() {
  if (slides.length <= 1) {
    return; 
  }
  
  const nextIndex = (currentIndex + 1) % slides.length;
  currentIndex = nextIndex;
  swapPositions(slides[currentIndex], slides[nextIndex]);
  showSlide();
}

function previousSlide() {
  if (slides.length <= 1) {
    return; 
  }
  
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  swapPositions(slides[currentIndex], slides[prevIndex]);
  currentIndex = prevIndex;
  showSlide();
}

leftArrow.addEventListener('click', previousSlide);
rightArrow.addEventListener('click', nextSlide);


function updateSlideDisplay() {
  const screenWidth = window.innerWidth;
  if (screenWidth < 958) {
    showSlide();
  } else {
    slides.forEach((slide) => {
      slide.style.display = 'block'; 
    });
  }
}

window.addEventListener('load', updateSlideDisplay);
window.addEventListener('resize', updateSlideDisplay);












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
















window.addEventListener("scroll", function() {
  var containers = document.querySelectorAll(".main-content .image-text-container");
  var windowHeight = window.innerHeight;

  containers.forEach(function(container) {
    var rect = container.getBoundingClientRect();
    var topVisible = rect.top > -290 && rect.top < windowHeight;
    var bottomVisible = rect.bottom > 170 && rect.bottom < windowHeight;

    if (!topVisible || !bottomVisible) {
      container.style.visibility = "hidden";
    } else {
      container.style.visibility = "visible";
    }
  });
});









