// Shared site behavior for Veteran Detail Services
// Handles:
// - mobile navigation toggle
// - smooth scrolling for same-page anchors only
// - FAQ accordion
// - homepage hero slider

(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  function closeMobileNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openMobileNav() {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileNav();
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav || !toggle) return;
    if (!nav.classList.contains('is-open')) return;

    const clickedInsideNav = nav.contains(event.target);
    const clickedToggle = toggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileNav();
    }
  });

  const faqButtons = document.querySelectorAll('.faq-q');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answer = button.nextElementSibling;
      const icon = button.querySelector('.faq-icon');

      faqButtons.forEach((otherButton) => {
        if (otherButton === button) return;

        otherButton.setAttribute('aria-expanded', 'false');
        const otherAnswer = otherButton.nextElementSibling;
        const otherIcon = otherButton.querySelector('.faq-icon');

        if (otherAnswer) otherAnswer.hidden = true;
        if (otherIcon) otherIcon.textContent = '+';
      });

      button.setAttribute('aria-expanded', String(!isExpanded));

      if (answer) {
        answer.hidden = isExpanded;
      }

      if (icon) {
        icon.textContent = isExpanded ? '+' : '–';
      }
    });
  });

  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
  const prevHeroButton = document.querySelector('.hero-slider-btn.prev');
  const nextHeroButton = document.querySelector('.hero-slider-btn.next');
  const heroSlider = document.querySelector('.hero-slider');

  if (heroSlides.length > 0) {
    let currentHeroSlide = 0;
    let heroSliderInterval = null;
    const heroSlideCount = heroSlides.length;

    function showHeroSlide(index) {
      heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });

      heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });

      currentHeroSlide = index;
    }

    function nextHeroSlide() {
      const nextIndex = (currentHeroSlide + 1) % heroSlideCount;
      showHeroSlide(nextIndex);
    }

    function prevHeroSlide() {
      const prevIndex = (currentHeroSlide - 1 + heroSlideCount) % heroSlideCount;
      showHeroSlide(prevIndex);
    }

    function startHeroSlider() {
      stopHeroSlider();
      heroSliderInterval = window.setInterval(nextHeroSlide, 4500);
    }

    function stopHeroSlider() {
      if (heroSliderInterval) {
        window.clearInterval(heroSliderInterval);
        heroSliderInterval = null;
      }
    }

    if (nextHeroButton) {
      nextHeroButton.addEventListener('click', () => {
        nextHeroSlide();
        startHeroSlider();
      });
    }

    if (prevHeroButton) {
      prevHeroButton.addEventListener('click', () => {
        prevHeroSlide();
        startHeroSlider();
      });
    }

    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showHeroSlide(index);
        startHeroSlider();
      });
    });

    if (heroSlider) {
      heroSlider.addEventListener('mouseenter', stopHeroSlider);
      heroSlider.addEventListener('mouseleave', startHeroSlider);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopHeroSlider();
      } else {
        startHeroSlider();
      }
    });

    showHeroSlide(0);
    startHeroSlider();
  }
})();
