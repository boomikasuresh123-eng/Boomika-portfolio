// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 50,
});

// --- Cursor Glow ---
const cursorGlow = document.getElementById('cursor-glow');
let cursorVisible = false;

document.addEventListener('mousemove', (e) => {
  if (!cursorVisible) {
    cursorGlow.classList.add('active');
    cursorVisible = true;
  }
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

document.addEventListener('mouseleave', () => {
  cursorGlow.classList.remove('active');
  cursorVisible = false;
});

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  }
});

// --- Mobile Menu ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Typing Effect ---
const typingTexts = [
  'Web Development',
  'IoT',
  'UI/UX Design',
  'Creative Engineering',
  'Data Science',
];

const typingElement = document.getElementById('typing-text');
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeEffect() {
  const currentText = typingTexts[textIndex];

  if (isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;
  } else {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;
  }

  if (!isDeleting && charIndex === currentText.length) {
    typingSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % typingTexts.length;
    typingSpeed = 500;
  }

  setTimeout(typeEffect, typingSpeed);
}

typeEffect();

// --- Skill Bars Animation ---
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.skill-bar-fill');
      bars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
      });
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.getElementById('skills');
if (skillsSection) {
  skillObserver.observe(skillsSection);
}

// --- Animated Counters ---
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.achievement-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };

        updateCounter();
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const achievementsSection = document.getElementById('achievements');
if (achievementsSection) {
  counterObserver.observe(achievementsSection);
}

// --- Certifications Slider ---
const certSlider = document.getElementById('cert-slider');
const certPrev = document.getElementById('cert-prev');
const certNext = document.getElementById('cert-next');

if (certSlider && certPrev && certNext) {
  const scrollAmount = 300;

  certPrev.addEventListener('click', () => {
    certSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  certNext.addEventListener('click', () => {
    certSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

// --- Scroll to Top ---
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Navbar Background on Scroll ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 20px rgba(200, 182, 255, 0.15)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

// --- Contact Form ---
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    alert(`Thank you, ${name}! Your message has been received. 💖`);
    contactForm.reset();
  });
}
