let slideMas = document.querySelectorAll('.protect-electro');
let i = 1;
let ns = 0;

setInterval(() => {
    slideMas.forEach((item) => {
        item.style.display = 'none';
    });
    slideMas[i].style.display = 'block';
    i++;
    if (i >= 3) i = 0;
}, 5000);

// var goTopBtn = document.querySelector('.back_to_top');

// (function() {
//     'use strict';
  
//     function trackScroll() {
//       var scrolled = window.pageYOffset;
//       var coords = document.documentElement.clientHeight;
  
//       if (scrolled > coords) {
//         goTopBtn.classList.add('back_to_top-show');
//       }
//       if (scrolled < coords) {
//         goTopBtn.classList.remove('back_to_top-show');
//       }
//     }
  
//     function backToTop() {
//       if (window.pageYOffset > 0) {
//         window.scrollBy(0, -80);
//         setTimeout(backToTop, 0);
//       }
//     }
  
//     var goTopBtn = document.querySelector('.back_to_top');
  
//     window.addEventListener('scroll', trackScroll);
//     goTopBtn.addEventListener('click', backToTop);
//   })();