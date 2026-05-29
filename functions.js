// Animación de fondo para el body: movimiento horizontal lento
function animarFondoBody() {
  // Si se quiere controlar la animación por JS en vez de CSS, usar este código:
  // (Por defecto, la animación está en CSS, pero esto permite mayor control si se desea)
  //
  // const body = document.body;
  // let pos = 0;
  // function loop() {
  //   pos -= 0.05; // velocidad
  //   body.style.setProperty('--fondo-x', `${pos}vw`);
  //   requestAnimationFrame(loop);
  // }
  // loop();
  //
  // Si se quiere pausar/reanudar, se puede manipular la clase fondo-animado-body o la animación CSS.
}
// functions.js - Global functions for Maison Élance web

function closeMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (menu) {
    menu.classList.add('hidden');
  }
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }
}

function closeUserMenu() {
  const userToggle = document.getElementById('user-menu-toggle');
  const userMenu = document.getElementById('user-menu');

  if (userMenu) {
    userMenu.classList.add('hidden');
  }
  if (userToggle) {
    userToggle.setAttribute('aria-expanded', 'false');
  }
}

// Mobile menu
function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (!toggle || !menu) {
    return false;
  }

  if (toggle.dataset.menuReady === 'true') {
    return true;
  }

  toggle.dataset.menuReady = 'true';
  toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
    closeUserMenu();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMobileMenu();
    }
  });

  return true;
}

// User menu
function setupUserMenu() {
  const userToggle = document.getElementById('user-menu-toggle');
  const userMenu = document.getElementById('user-menu');

  if (!userToggle || !userMenu) {
    return false;
  }

  if (userToggle.dataset.menuReady === 'true') {
    return true;
  }

  userToggle.dataset.menuReady = 'true';
  userToggle.setAttribute('aria-expanded', userMenu.classList.contains('hidden') ? 'false' : 'true');

  userToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    userMenu.classList.toggle('hidden');
    userToggle.setAttribute('aria-expanded', userMenu.classList.contains('hidden') ? 'false' : 'true');
    closeMobileMenu();
  });

  return true;
}

function setupGlobalClosers() {
  if (document.documentElement.dataset.maisonClosersReady === 'true') {
    return;
  }

  document.documentElement.dataset.maisonClosersReady = 'true';

  document.addEventListener('click', (event) => {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const userToggle = document.getElementById('user-menu-toggle');
    const userMenu = document.getElementById('user-menu');

    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
      closeMobileMenu();
    }

    if (userMenu && userToggle && !userMenu.contains(event.target) && !userToggle.contains(event.target)) {
      closeUserMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1025) {
      closeMobileMenu();
    }
  });
}

// Global init
function initMaisonElance(attempt = 0) {
  setupGlobalClosers();

  const mobileReady = setupMobileMenu();
  const userReady = setupUserMenu();

  if ((!mobileReady || !userReady) && attempt < 20) {
    setTimeout(() => initMaisonElance(attempt + 1), 100);
  }
}

document.addEventListener('DOMContentLoaded', () => initMaisonElance());
document.addEventListener('maison:fragments-loaded', () => initMaisonElance());
window.addEventListener('load', () => {
  setTimeout(() => initMaisonElance(), 300);
});
