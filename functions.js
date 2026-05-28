// functions.js - Global functions for Maison Élance web

// Mobile menu
function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
  }
}

// User menu
function setupUserMenu() {
  const userToggle = document.getElementById('user-menu-toggle');
  const userMenu = document.getElementById('user-menu');
  if (userToggle && userMenu) {
    userToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && !userToggle.contains(e.target)) {
        userMenu.classList.add('hidden');
      }
    });
  }
}

// Global init
function initMaisonElance() {
  setupMobileMenu();
  setupUserMenu();
}

document.addEventListener('DOMContentLoaded', initMaisonElance);
