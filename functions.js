// functions.js - Navegación Maison Élance
// Controla Home / Catálogo, menú móvil y menú de usuario.

(function () {
  'use strict';

  const SELECTORS = {
    home: 'main_home',
    catalogo: 'main_catalogo',
    mobileToggle: 'menu-toggle',
    mobileMenu: 'mobile-menu',
    userToggle: 'user-menu-toggle',
    userMenu: 'user-menu'
  };

  function getById(id) {
    return document.getElementById(id);
  }

  function getViews() {
    return {
      home: getById(SELECTORS.home),
      catalogo: getById(SELECTORS.catalogo)
    };
  }

  function closeMobileMenu() {
    const toggle = getById(SELECTORS.mobileToggle);
    const menu = getById(SELECTORS.mobileMenu);

    if (menu) menu.classList.add('hidden');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function closeUserMenu() {
    const userToggle = getById(SELECTORS.userToggle);
    const userMenu = getById(SELECTORS.userMenu);

    if (userMenu) userMenu.classList.add('hidden');
    if (userToggle) userToggle.setAttribute('aria-expanded', 'false');
  }

  function updateHash(viewName) {
    const newHash = viewName === 'catalogo' ? '#catalogo' : '#home';

    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  }

  function showView(viewName, options = {}) {
    const { updateUrl = true, scrollTop = true } = options;
    const { home, catalogo } = getViews();

    if (!home || !catalogo) {
      console.warn('No se encontraron #main_home y/o #main_catalogo');
      return;
    }

    if (viewName === 'catalogo') {
      home.style.display = 'none';
      catalogo.style.display = 'block';
      if (updateUrl) updateHash('catalogo');
    } else {
      home.style.display = 'block';
      catalogo.style.display = 'none';
      if (updateUrl) updateHash('home');
    }

    if (document.body) {
      document.body.classList.toggle('view-catalogo', viewName === 'catalogo');
    }

    closeMobileMenu();
    closeUserMenu();

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function renderCatalogo() {
    showView('catalogo', { updateUrl: true, scrollTop: true });
  }

  function renderFromHash() {
    if (window.location.hash === '#catalogo') {
      showView('catalogo', { updateUrl: false, scrollTop: false });
    } else {
      showView('home', { updateUrl: false, scrollTop: false });
    }
  }

  function getNavigationTarget(element) {
    const navElement = element.closest('[data-nav-target], a[href^="#"]');
    if (!navElement) return null;

    const dataTarget = navElement.dataset.navTarget;
    const href = navElement.getAttribute('href');
    const category = navElement.dataset.catalogoCategory || '';

    if (dataTarget === 'home' || href === '#home') {
      return { element: navElement, view: 'home', action: 'home' };
    }

    if (dataTarget === 'catalogo' || href === '#catalogo') {
      return { element: navElement, view: 'catalogo', action: 'catalogo', category };
    }

    return null;
  }

  function setupNavigationMaisonElance() {
    if (document.documentElement.dataset.maisonNavigationReady === 'true') return;

    document.documentElement.dataset.maisonNavigationReady = 'true';

    document.addEventListener('click', (event) => {
      const navigation = getNavigationTarget(event.target);
      if (!navigation) return;

      if (navigation.action === 'home') {
        event.preventDefault();
        showView('home', { updateUrl: true, scrollTop: true });
      }

      if (navigation.action === 'catalogo') {
        event.preventDefault();
        showView('catalogo', { updateUrl: true, scrollTop: true });

        if (navigation.category) {
          if (typeof window.setCatalogCategory === 'function') {
            window.setCatalogCategory(navigation.category);
          } else {
            document.documentElement.dataset.pendingCatalogCategory = navigation.category;
          }
        }
      }

      closeMobileMenu();
      closeUserMenu();
    });

    window.addEventListener('popstate', renderFromHash);
  }

  function setupMobileMenu() {
    const toggle = getById(SELECTORS.mobileToggle);
    const menu = getById(SELECTORS.mobileMenu);

    if (!toggle || !menu) return false;
    if (toggle.dataset.menuReady === 'true') return true;

    toggle.dataset.menuReady = 'true';
    toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
      closeUserMenu();
    });

    return true;
  }

  function setupUserMenu() {
    const userToggle = getById(SELECTORS.userToggle);
    const userMenu = getById(SELECTORS.userMenu);

    if (!userToggle || !userMenu) return false;
    if (userToggle.dataset.menuReady === 'true') return true;

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
    if (document.documentElement.dataset.maisonClosersReady === 'true') return;

    document.documentElement.dataset.maisonClosersReady = 'true';

    document.addEventListener('click', (event) => {
      const toggle = getById(SELECTORS.mobileToggle);
      const menu = getById(SELECTORS.mobileMenu);
      const userToggle = getById(SELECTORS.userToggle);
      const userMenu = getById(SELECTORS.userMenu);

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

  function setupCatalogFilters() {
    const form = getById('filtros-catalogo');
    const grid = getById('catalogo-grid');

    if (!form || !grid) return false;
    if (form.dataset.filtersReady === 'true') return true;

    form.dataset.filtersReady = 'true';

    const applyFilters = () => {
      const category = getById('filtro-categoria')?.value || '';
      const size = getById('filtro-talla')?.value || '';
      const cards = Array.from(grid.children);

      cards.forEach((card) => {
        const paragraphs = Array.from(card.querySelectorAll('p'));
        const cardCategory = paragraphs[0]?.textContent.trim() || '';
        const sizeText = paragraphs.find((p) => p.textContent.trim().startsWith('Talla:'))?.textContent || '';
        const cardSize = sizeText.replace('Talla:', '').trim();

        const matchesCategory = !category || cardCategory === category;
        const matchesSize = !size || cardSize === size;

        card.style.display = matchesCategory && matchesSize ? 'flex' : 'none';
      });
    };

    form.addEventListener('change', applyFilters);
    form.addEventListener('submit', (event) => event.preventDefault());
    applyFilters();

    return true;
  }

  function setupCatalogCategories() {
    const toggle = getById('catalogo-categorias-toggle');
    const menu = getById('catalogo-categorias-menu');
    const buttons = Array.from(document.querySelectorAll('[data-catalogo-category]'));
    const sections = Array.from(document.querySelectorAll('[data-catalogo-section]'));

    if (!toggle || !menu || !buttons.length || !sections.length) return false;
    if (document.documentElement.dataset.catalogCategoriesReady === 'true') return true;

    document.documentElement.dataset.catalogCategoriesReady = 'true';
    toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');

    const setActiveCategory = (category) => {
      sections.forEach((section) => {
        const isMatch = section.dataset.catalogoSection === category;
        section.classList.toggle('hidden', !isMatch);
      });

      buttons.forEach((button) => {
        const isActive = button.dataset.catalogoCategory === category;
        button.classList.toggle('bg-[rgba(194,154,91,0.8)]', isActive);
        button.classList.toggle('text-[color:var(--azul-muy-oscuro)]', isActive);
        button.classList.toggle('bg-blanco-caldo', !isActive);
        button.classList.toggle('text-[color:var(--azul-muy-oscuro)]', !isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    window.setCatalogCategory = setActiveCategory;

    document.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('#catalogo-categorias-toggle');
      const categoryButton = event.target.closest('[data-catalogo-category]');

      if (toggleButton) {
        event.preventDefault();
        menu.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
        return;
      }

      if (categoryButton) {
        setActiveCategory(categoryButton.dataset.catalogoCategory);
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        return;
      }

      if (!menu.classList.contains('hidden') && !menu.contains(event.target)) {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    const pendingCategory = document.documentElement.dataset.pendingCatalogCategory;
    const defaultButton = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') || buttons[0];

    if (pendingCategory) {
      setActiveCategory(pendingCategory);
      delete document.documentElement.dataset.pendingCatalogCategory;
    } else if (defaultButton) {
      setActiveCategory(defaultButton.dataset.catalogoCategory);
    }

    return true;
  }

  function setupCatalogShowcaseStyle() {
    const sections = Array.from(document.querySelectorAll('[data-catalogo-section]'));
    if (!sections.length) return false;
    if (document.documentElement.dataset.catalogShowcaseStyleReady === 'true') return true;

    document.documentElement.dataset.catalogShowcaseStyleReady = 'true';

    sections.forEach((section) => {
      const grids = Array.from(section.querySelectorAll('.grid'));
      if (!grids.length) return;

      grids.forEach((grid) => {
        grid.classList.remove('grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'gap-6');
        grid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4', 'gap-7');

        const cards = Array.from(grid.children);
        cards.forEach((card) => {
          const isExclusivePerfumeCard = card.dataset.perfumeExclusive === 'true';
          const image = card.querySelector('img');
          const title = card.querySelector('h3');
          const paragraphs = Array.from(card.querySelectorAll('p'));
          const category = paragraphs[0];
          const price = paragraphs[1];

          card.classList.remove(
            'min-h-[320px]',
            'items-center',
            'justify-between',
            'border-black/70',
            'bg-[#f7f2e8]',
            'backdrop-blur-md',
            'p-4',
            'duration-200',
            'hover:border-black/90',
            'hover:shadow-[0_14px_26px_rgba(31,42,68,0.12)]'
          );
          card.classList.add(
            'group',
            'relative',
            'min-h-[360px]',
            'overflow-hidden',
            'rounded-2xl',
            'border',
            'border-[#cbb48f]',
            'bg-gradient-to-b',
            'from-[#fffaf0]',
            'to-[#f4ead8]',
            'p-3',
            'shadow-[0_10px_22px_rgba(31,42,68,0.10)]',
            'transition',
            'duration-300',
            'hover:-translate-y-1',
            'hover:shadow-[0_18px_32px_rgba(31,42,68,0.18)]'
          );

          if (isExclusivePerfumeCard) {
            card.classList.remove('border-[#cbb48f]', 'bg-gradient-to-b', 'from-[#fffaf0]', 'to-[#f4ead8]');
            card.classList.add('border-[#111827]', 'bg-[#1f2937]', 'hover:shadow-[0_14px_26px_rgba(17,24,39,0.35)]');
          }

          if (image) {
            image.classList.remove('h-40', 'rounded-xl', 'mb-3', 'duration-200', 'hover:scale-[1.03]');
            image.classList.add('h-44', 'rounded-xl', 'mb-4', 'transition', 'duration-300', 'group-hover:scale-[1.04]');
          }

          if (title) {
            title.classList.remove('text-center', 'min-h-[2.6em]', 'mb-1', 'text-black');
            title.classList.add('text-left', 'min-h-[2.8em]', 'mb-1', 'leading-snug', 'text-[#111827]');
            if (isExclusivePerfumeCard) {
              title.classList.remove('text-[#111827]');
              title.classList.add('text-[#f8f3e8]');
            }
          }

          if (category) {
            category.classList.remove('text-sm', 'text-black', 'mb-2', 'min-h-[1.3em]');
            category.classList.add('text-xs', 'uppercase', 'tracking-[0.14em]', 'text-[#6b7280]', 'mb-3', 'min-h-[1.3em]');
            if (isExclusivePerfumeCard) {
              category.classList.remove('text-[#6b7280]');
              category.classList.add('text-[#d1d5db]');
            }
          }

          if (price) {
            price.classList.remove('text-black', 'text-lg', 'mb-2');
            price.classList.add('text-[#0f172a]', 'text-2xl', 'mt-auto');
            if (isExclusivePerfumeCard) {
              price.classList.remove('text-[#0f172a]');
              price.classList.add('text-[#f8f3e8]');
            }
          }

          if (!card.querySelector('[data-card-cta]')) {
            const cta = document.createElement('span');
            cta.dataset.cardCta = 'true';
            cta.className = isExclusivePerfumeCard
              ? 'mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#f8f3e8]/30 bg-[#111827] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f8f3e8] transition duration-300 group-hover:bg-[#f8f3e8] group-hover:text-[#111827]'
              : 'mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#cbb48f] bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f2a44] transition duration-300 group-hover:bg-[#1f2a44] group-hover:text-[#f8f3e8]';
            cta.textContent = 'Ver detalles';
            card.appendChild(cta);
          }
        });
      });
    });

    return true;
  }

  function setupCatalogProductModal() {
    const modal = getById('catalogo-producto-modal');
    const closeButton = getById('catalogo-producto-modal-close');
    const overlay = getById('catalogo-producto-modal-overlay');
    const image = getById('catalogo-producto-modal-img');
    const name = getById('catalogo-producto-modal-nombre');
    const productCode = getById('catalogo-producto-modal-codigo');
    const price = getById('catalogo-producto-modal-precio');
    const stock = getById('catalogo-producto-modal-stock');
    const sizeGroup = getById('catalogo-producto-modal-talla-group');
    const sizeSelect = getById('catalogo-producto-modal-talla');
    const quantityInput = getById('catalogo-producto-modal-cantidad');
    const addCartButton = getById('catalogo-producto-modal-add-cart');
    const feedback = getById('catalogo-producto-modal-feedback');
    const catalogSections = Array.from(document.querySelectorAll('[data-catalogo-section]'));

    if (!modal || !closeButton || !overlay || !image || !name || !productCode || !price || !stock || !sizeGroup || !sizeSelect || !quantityInput || !addCartButton || !feedback || !catalogSections.length) {
      return false;
    }

    if (document.documentElement.dataset.catalogProductModalReady === 'true') return true;

    document.documentElement.dataset.catalogProductModalReady = 'true';

    const productCards = Array.from(document.querySelectorAll('[data-catalogo-section] .grid > div')).filter((card) => {
      return Boolean(card.querySelector('img') && card.querySelector('h3') && card.querySelectorAll('p').length >= 2);
    });

    const storageKeys = {
      cart: 'maisonCartItems'
    };

    const createOrderId = (usedOrderIds) => {
      let candidate = '';
      do {
        candidate = String(Math.floor(Math.random() * 900000) + 100000);
      } while (usedOrderIds.has(candidate));
      return candidate;
    };

    const getCartItems = () => {
      try {
        const raw = window.localStorage.getItem(storageKeys.cart);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    };

    const saveCartItems = (items) => {
      window.localStorage.setItem(storageKeys.cart, JSON.stringify(items));
    };

    const getProductSuffix = (card, sectionName) => {
      const imageSrc = card.querySelector('img')?.getAttribute('src') || '';
      const fileName = imageSrc.split('/').pop() || '';
      const imageSuffixMatch = fileName.match(/_([A-Za-z0-9]+)\.webp$/i);
      if (imageSuffixMatch) return imageSuffixMatch[1].toUpperCase();

      if (sectionName === 'ropa') return 'ROP';
      if (sectionName === 'accesorios') return 'ACC';
      if (sectionName === 'perfumeria') return 'PRF';
      return 'GEN';
    };

    const stockFromProductCode = (productCodeValue) => {
      let accumulator = 0;
      for (let index = 0; index < productCodeValue.length; index += 1) {
        accumulator += productCodeValue.charCodeAt(index) * (index + 1);
      }
      return 10 + (accumulator % 41);
    };

    productCards.forEach((card, index) => {
      const sectionName = card.closest('[data-catalogo-section]')?.dataset.catalogoSection || '';
      const suffix = getProductSuffix(card, sectionName);
      const productCodeValue = `${String(1000 + index)}-${suffix}`;
      const categoryText = (card.querySelectorAll('p')[0]?.textContent || '').trim().toLowerCase();
      const isExclusivePerfume = sectionName === 'perfumeria' && (card.dataset.perfumeExclusive === 'true' || categoryText.includes('exclusivo'));

      card.dataset.productCode = productCodeValue;
      card.dataset.productStock = String(stockFromProductCode(productCodeValue));
      card.dataset.isExclusivePerfume = isExclusivePerfume ? 'true' : 'false';
    });

    productCards.forEach((card) => {
      card.dataset.catalogoProductCard = 'true';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Ver detalles de ${card.querySelector('h3')?.textContent.trim() || 'producto'}`);

      if (card.dataset.modalListenerReady === 'true') return;
      card.dataset.modalListenerReady = 'true';

      card.addEventListener('click', (event) => {
        event.preventDefault();
        const productData = getProductDataFromCard(card);
        if (!productData) return;
        openModal(productData);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        const productData = getProductDataFromCard(card);
        if (!productData) return;
        openModal(productData);
      });
    });

    const closeModal = () => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      feedback.classList.add('hidden');
      feedback.textContent = '';
    };

    const setQuantityOptions = (stockUnits, isExclusivePerfume) => {
      quantityInput.innerHTML = '';

      const maxSelectableUnits = isExclusivePerfume ? 1 : stockUnits;

      for (let optionValue = 1; optionValue <= maxSelectableUnits; optionValue += 1) {
        const option = document.createElement('option');
        option.value = String(optionValue);
        option.textContent = String(optionValue);
        quantityInput.appendChild(option);
      }

      quantityInput.value = '1';
    };

    const openModal = (productData) => {
      image.src = productData.imageSrc;
      image.alt = productData.imageAlt;
      name.textContent = productData.productName;
      productCode.textContent = `Producto ${productData.productCode}`;
      price.textContent = productData.productPrice;
      stock.textContent = productData.isExclusivePerfume
        ? 'Ultimas unidades'
        : `Stock disponible: ${productData.stockUnits} unidades`;
      setQuantityOptions(productData.stockUnits, productData.isExclusivePerfume);

      if (productData.requiresSize) {
        sizeGroup.classList.remove('hidden');
        sizeSelect.value = 'S';
      } else {
        sizeGroup.classList.add('hidden');
      }

      addCartButton.dataset.productName = productData.productName;
      addCartButton.dataset.requiresSize = productData.requiresSize ? 'true' : 'false';
      addCartButton.dataset.productCode = productData.productCode;
      addCartButton.dataset.productPrice = productData.productPrice;
      addCartButton.dataset.stockUnits = String(productData.stockUnits);
      addCartButton.dataset.isExclusivePerfume = productData.isExclusivePerfume ? 'true' : 'false';
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      feedback.classList.add('hidden');
      feedback.textContent = '';
    };

    const getProductDataFromCard = (card) => {
      const imageElement = card.querySelector('img');
      const nameElement = card.querySelector('h3');
      const priceElement = card.querySelectorAll('p')[1];
      const section = card.closest('[data-catalogo-section]');
      const sectionName = section?.dataset.catalogoSection || '';

      if (!imageElement || !nameElement || !priceElement) return null;

      return {
        imageSrc: imageElement.getAttribute('src') || '',
        imageAlt: imageElement.getAttribute('alt') || nameElement.textContent.trim(),
        productName: nameElement.textContent.trim(),
        productPrice: priceElement.textContent.trim(),
        requiresSize: sectionName === 'ropa',
        productCode: card.dataset.productCode || '',
        stockUnits: Number(card.dataset.productStock || '10'),
        isExclusivePerfume: card.dataset.isExclusivePerfume === 'true'
      };
    };

    document.addEventListener('click', (event) => {
      if (event.target.closest('#catalogo-producto-modal-close') || event.target.closest('#catalogo-producto-modal-overlay')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    addCartButton.addEventListener('click', () => {
      const selectedProduct = addCartButton.dataset.productName || 'Producto';
      const requiresSize = addCartButton.dataset.requiresSize === 'true';
      const selectedSize = requiresSize ? ` (Talla ${sizeSelect.value})` : '';
      const selectedProductCode = addCartButton.dataset.productCode || '';
      const selectedProductPrice = addCartButton.dataset.productPrice || '';
      const selectedStockUnits = Number(addCartButton.dataset.stockUnits || '10');
      const isExclusivePerfume = addCartButton.dataset.isExclusivePerfume === 'true';
      const requestedQuantity = Number(quantityInput.value || '1');
      const selectedQuantity = isExclusivePerfume
        ? 1
        : Math.min(Math.max(requestedQuantity, 1), selectedStockUnits);
      const cartItems = getCartItems();
      const usedOrderIds = new Set(cartItems.map((item) => String(item.orderId || '')).filter(Boolean));
      const now = new Date();

      cartItems.push({
        orderId: createOrderId(usedOrderIds),
        productCode: selectedProductCode,
        productName: selectedProduct,
        productPrice: selectedProductPrice,
        quantity: selectedQuantity,
        stockAtOrder: selectedStockUnits,
        isExclusivePerfume,
        selectedSize: requiresSize ? sizeSelect.value : null,
        orderedAtIso: now.toISOString(),
        orderedAtLocal: now.toLocaleString('es-ES')
      });

      saveCartItems(cartItems);

      feedback.textContent = `${selectedProduct}${selectedSize} x${selectedQuantity} agregado al carrito.`;
      feedback.classList.remove('hidden');
    });

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    return true;
  }

  function initMaisonElance(attempt = 0) {
    setupNavigationMaisonElance();
    setupGlobalClosers();
    setupMobileMenu();
    setupUserMenu();
    setupCatalogFilters();
    setupCatalogCategories();
    setupCatalogShowcaseStyle();
    setupCatalogProductModal();
    renderFromHash();

    const navbarReady = getById(SELECTORS.mobileToggle) && getById(SELECTORS.userToggle);

    if (!navbarReady && attempt < 20) {
      setTimeout(() => initMaisonElance(attempt + 1), 100);
    }
  }

  function cargarFragmento(id, archivo) {
    return fetch(archivo)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar ${archivo}`);
        }
        return response.text();
      })
      .then((html) => {
        const target = getById(id);
        if (!target) return;
        target.innerHTML = html;
      });
  }

  function cargarLayout() {
    const navbarPlaceholder = getById('navbar-placeholder');
    const footerPlaceholder = getById('footer-placeholder');

    if (!navbarPlaceholder || !footerPlaceholder) return;
    if (document.documentElement.dataset.maisonFragmentsLoading === 'true') return;

    document.documentElement.dataset.maisonFragmentsLoading = 'true';

    Promise.all([
      cargarFragmento('navbar-placeholder', 'navbar.html'),
      cargarFragmento('footer-placeholder', 'footer.html')
    ]).then(() => {
      document.dispatchEvent(new Event('maison:fragments-loaded'));
      initMaisonElance();
    }).catch((error) => {
      console.error('Error cargando fragmentos:', error);
    });
  }

  window.closeMobileMenu = closeMobileMenu;
  window.closeUserMenu = closeUserMenu;
  window.renderCatalogo = renderCatalogo;
  window.mostrarCatalogo = renderCatalogo;
  window.initMaisonElance = initMaisonElance;

  function bootstrapMaison() {
    cargarLayout();
    initMaisonElance();

    if (typeof window.animarFondoBody === 'function') {
      window.animarFondoBody();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapMaison);
  } else {
    bootstrapMaison();
  }
  document.addEventListener('maison:fragments-loaded', () => initMaisonElance());
  window.addEventListener('load', () => initMaisonElance());
})();
