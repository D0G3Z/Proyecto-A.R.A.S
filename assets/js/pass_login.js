// Redirección de botones 
document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.querySelector('.btn-acceso.admin');
  const estudianteBtn = document.querySelector('.btn-acceso.estudiante');

  adminBtn.addEventListener('click', () => {
    window.location.href = '/pages/login.html'; 
  });

  estudianteBtn.addEventListener('click', () => {
    window.location.href = '/pages/login.html';
  });
});

// Carrusel de videos
const track = document.querySelector('.carousel-track');
const prevButton = document.querySelector('.carousel-btn.prev');
const nextButton = document.querySelector('.carousel-btn.next');
const items = Array.from(track.children);
let currentIndex = 0;

// Mover el carrusel
function moveCarousel(index) {
  const itemWidth = items[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${itemWidth * index}px)`;
}

// Botón anterior
prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
  moveCarousel(currentIndex);
});

// Botón siguiente
nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
  moveCarousel(currentIndex);
});
