const swiper = new Swiper(".swiper-container", {
  loop: true, 
  slidesPerView: 3, 
  slidesPerGroup: 1, 
  spaceBetween: 20, 
  autoplay: {
    delay: 3000, 
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
