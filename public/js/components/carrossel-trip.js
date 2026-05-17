// Carousel simples
let currentIndex = 0;

function slideCarousel(direction) {
  const track = document.getElementById('tripsTrack');
  const cards = track.querySelectorAll('.trips-list__card');
  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(0, cards.length - visibleCount);

  currentIndex = Math.min(Math.max(currentIndex + direction, 0), maxIndex);

  const cardWidth = cards[0].offsetWidth + 16; // gap = 16px
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

function getVisibleCount() {
  const w = window.innerWidth;
  if (w <= 560) return 1;
  if (w <= 900) return 2;
  return 4;
}