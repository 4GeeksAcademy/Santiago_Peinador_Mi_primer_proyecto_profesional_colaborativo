
(function () {
  'use strict';

  const SELECTORS = {
    home: 'main_home',
    catalog: 'main_catalog',
    cart: 'main_cart',
    checkout: 'main_checkout',
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
      catalog: getById(SELECTORS.catalog),
      cart: getById(SELECTORS.cart),
      checkout: getById(SELECTORS.checkout)
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
    const newHash = viewName === 'catalog'
      ? '#catalog'
      : viewName === 'cart'
        ? '#cart'
        : viewName === 'checkout'
          ? '#checkout'
          : '#home';

    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  }

  function showView(viewName, options = {}) {
    const { updateUrl = true, scrollTop = true } = options;
    const { home, catalog, cart, checkout } = getViews();
    const mainContent = getById('main-content');

    if (!home || !catalog || !cart || !checkout) {
      console.warn('Primary view containers were not found (#main_home, #main_catalog, #main_cart, #main_checkout)');
      return;
    }

    if (viewName === 'catalog') {
      home.style.display = 'none';
      catalog.style.display = 'block';
      cart.style.display = 'none';
      checkout.style.display = 'none';
      if (updateUrl) updateHash('catalog');
    } else if (viewName === 'cart') {
      home.style.display = 'none';
      catalog.style.display = 'none';
      cart.style.display = 'block';
      checkout.style.display = 'none';
      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
      if (updateUrl) updateHash('cart');
    } else if (viewName === 'checkout') {
      home.style.display = 'none';
      catalog.style.display = 'none';
      cart.style.display = 'none';
      checkout.style.display = 'block';
      if (typeof window.renderCheckoutSummary === 'function') {
        window.renderCheckoutSummary();
      }
      if (updateUrl) updateHash('checkout');
    } else {
      home.style.display = 'block';
      catalog.style.display = 'none';
      cart.style.display = 'none';
      checkout.style.display = 'none';
      if (updateUrl) updateHash('home');
    }

    if (document.body) {
      document.body.classList.toggle('view-catalog', viewName === 'catalog');
    }

    if (mainContent) {
      const shouldAlignTop = viewName === 'cart' || viewName === 'checkout';
      mainContent.classList.toggle('justify-center', !shouldAlignTop);
      mainContent.classList.toggle('justify-start', shouldAlignTop);
    }

    closeMobileMenu();
    closeUserMenu();

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function renderCatalog() {
    showView('catalog', { updateUrl: true, scrollTop: true });
  }

  function renderFromHash() {
    if (window.location.hash === '#catalog') {
      showView('catalog', { updateUrl: false, scrollTop: false });
    } else if (window.location.hash === '#cart') {
      showView('cart', { updateUrl: false, scrollTop: false });
    } else if (window.location.hash === '#checkout') {
      showView('checkout', { updateUrl: false, scrollTop: false });
    } else {
      showView('home', { updateUrl: false, scrollTop: false });
    }
  }

  function getNavigationTarget(element) {
    const navElement = element.closest('[data-nav-target], a[href^="#"]');
    if (!navElement) return null;

    const dataTarget = navElement.dataset.navTarget;
    const href = navElement.getAttribute('href');
    const category = navElement.dataset.catalogCategory || '';

    if (dataTarget === 'home' || href === '#home') {
      return { element: navElement, view: 'home', action: 'home' };
    }

    if (dataTarget === 'catalog' || href === '#catalog') {
      return { element: navElement, view: 'catalog', action: 'catalog', category };
    }

    if (dataTarget === 'cart' || href === '#cart') {
      return { element: navElement, view: 'cart', action: 'cart' };
    }

    if (dataTarget === 'checkout' || href === '#checkout') {
      return { element: navElement, view: 'checkout', action: 'checkout' };
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

      if (navigation.action === 'catalog') {
        event.preventDefault();
        showView('catalog', { updateUrl: true, scrollTop: true });

        if (navigation.category) {
          if (typeof window.setCatalogCategory === 'function') {
            window.setCatalogCategory(navigation.category);
          } else {
            document.documentElement.dataset.pendingCatalogCategory = navigation.category;
          }
        }
      }

      if (navigation.action === 'cart') {
        event.preventDefault();
        showView('cart', { updateUrl: true, scrollTop: true });
      }

      if (navigation.action === 'checkout') {
        event.preventDefault();
        showView('checkout', { updateUrl: true, scrollTop: true });
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
    const form = getById('filtros-catalog');
    const grid = getById('catalog-grid');

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
    const toggle = getById('catalog-categories-toggle');
    const menu = getById('catalog-categories-menu');
    const buttons = Array.from(document.querySelectorAll('[data-catalog-category]'));
    const sections = Array.from(document.querySelectorAll('[data-catalog-section]'));

    if (!toggle || !menu || !buttons.length || !sections.length) return false;
    if (document.documentElement.dataset.catalogCategoriesReady === 'true') return true;

    document.documentElement.dataset.catalogCategoriesReady = 'true';
    toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');

    const scrollToCatalogSubsection = (subsection) => {
      if (!subsection) return;

      const target = document.querySelector(`[data-catalog-subsection="${subsection}"]`);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const setActiveCategory = (category, options = {}) => {
      const { subsection = '' } = options;

      sections.forEach((section) => {
        const isMatch = section.dataset.catalogSection === category;
        section.classList.toggle('hidden', !isMatch);
      });

      buttons.forEach((button) => {
        const isActive = button.dataset.catalogCategory === category;
        button.classList.toggle('bg-[rgba(194,154,91,0.8)]', isActive);
        button.classList.toggle('text-[color:var(--azul-muy-oscuro)]', isActive);
        button.classList.toggle('bg-blanco-caldo', !isActive);
        button.classList.toggle('text-[color:var(--azul-muy-oscuro)]', !isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (subsection) {
        scrollToCatalogSubsection(subsection);
      }
    };

    window.setCatalogCategory = setActiveCategory;

    document.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('#catalog-categories-toggle');
      const categoryButton = event.target.closest('[data-catalog-category]');

      if (toggleButton) {
        event.preventDefault();
        menu.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
        return;
      }

      if (categoryButton) {
        setActiveCategory(categoryButton.dataset.catalogCategory);
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
      setActiveCategory(defaultButton.dataset.catalogCategory);
    }

    return true;
  }

  function setupProductSearchSuggestions() {
    if (document.documentElement.dataset.productSearchSuggestionsReady === 'true') return true;

    const searchForms = Array.from(document.querySelectorAll('#desktop-search, #mobile-menu form[role="search"]'));
    if (!searchForms.length) return false;

    document.documentElement.dataset.productSearchSuggestionsReady = 'true';

    const suggestionsByCategory = [
      {
        category: 'clothing',
        label: 'Clothing',
        entries: [
          { label: 'Tren superior', subsection: 'clothing-tren-superior' },
          { label: 'Tren inferior', subsection: 'clothing-tren-inferior' },
          { label: 'Completos', subsection: 'clothing-completos' }
        ]
      },
      {
        category: 'accessories',
        label: 'Accessories',
        entries: [
          { label: 'Jewelry', subsection: 'accessories-joyeria' },
          { label: 'Accessories de clothing', subsection: 'accessories-clothing' }
        ]
      },
      {
        category: 'perfumery',
        label: 'Perfumery',
        entries: [
          { label: 'Uso diario', subsection: 'perfumery-uso-diario' },
          { label: 'Nocturnos', subsection: 'perfumery-nocturnos' },
          { label: 'Exclusivos', subsection: 'perfumery-exclusivos' }
        ]
      }
    ];

    const allEntries = suggestionsByCategory.flatMap((group) => group.entries.map((entry) => ({
      ...entry,
      category: group.category,
      categoryLabel: group.label
    })));

    const renderSuggestionItems = (searchValue) => {
      const value = searchValue.trim().toLowerCase();

      return suggestionsByCategory.map((group) => {
        const groupEntries = group.entries.filter((entry) => {
          if (!value) return true;
          const composed = `${group.label} ${entry.label}`.toLowerCase();
          return composed.includes(value);
        });

        if (!groupEntries.length) return '';

        const items = groupEntries.map((entry) => `
          <button
            type="button"
            class="w-full text-left rounded-lg px-3 py-2 text-sm text-[color:var(--azul-muy-oscuro)] transition duration-200 hover:bg-[rgba(194,154,91,0.18)]"
            data-search-category="${group.category}"
            data-search-subsection="${entry.subsection}">
            ${entry.label}
          </button>
        `).join('');

        return `
          <div class="space-y-1">
            <p class="px-3 text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">${group.label}</p>
            <div class="space-y-1">${items}</div>
          </div>
        `;
      }).join('');
    };

    searchForms.forEach((form) => {
      const input = form.querySelector('input[type="search"]');
      if (!input) return;

      form.classList.add('relative');

      const panel = document.createElement('div');
      panel.className = 'hidden absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-[color:var(--dorado)] bg-[#f7f2e8]/95 backdrop-blur-md p-3 shadow-[0_14px_26px_rgba(31,42,68,0.16)] max-h-[320px] overflow-y-auto';
      form.appendChild(panel);

      const openPanel = () => {
        panel.innerHTML = renderSuggestionItems(input.value);
        panel.classList.remove('hidden');
      };

      const closePanel = () => {
        panel.classList.add('hidden');
      };

      input.addEventListener('focus', openPanel);
      input.addEventListener('click', openPanel);
      input.addEventListener('input', openPanel);

      panel.addEventListener('click', (event) => {
        const option = event.target.closest('[data-search-category][data-search-subsection]');
        if (!option) return;

        const category = option.dataset.searchCategory;
        const subsection = option.dataset.searchSubsection;
        const entry = allEntries.find((item) => item.category === category && item.subsection === subsection);

        showView('catalog', { updateUrl: true, scrollTop: true });
        if (typeof window.setCatalogCategory === 'function') {
          window.setCatalogCategory(category, { subsection });
        }

        input.value = entry ? `${entry.categoryLabel}: ${entry.label}` : '';
        closePanel();
      });

      document.addEventListener('click', (event) => {
        if (form.contains(event.target)) return;
        closePanel();
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closePanel();
        }
      });
    });

    return true;
  }

  function setupCatalogShowcaseStyle() {
    const sections = Array.from(document.querySelectorAll('[data-catalog-section]'));
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
    const modal = getById('catalog-producto-modal');
    const closeButton = getById('catalog-producto-modal-close');
    const overlay = getById('catalog-producto-modal-overlay');
    const image = getById('catalog-producto-modal-img');
    const name = getById('catalog-producto-modal-first-name');
    const productCode = getById('catalog-producto-modal-codigo');
    const price = getById('catalog-producto-modal-precio');
    const stock = getById('catalog-producto-modal-stock');
    const description = getById('catalog-producto-modal-descripcion');
    const sizeGroup = getById('catalog-producto-modal-talla-group');
    const sizeSelect = getById('catalog-producto-modal-talla');
    const quantityInput = getById('catalog-producto-modal-cantidad');
    const addCartButton = getById('catalog-producto-modal-add-cart');
    const feedback = getById('catalog-producto-modal-feedback');
    const catalogSections = Array.from(document.querySelectorAll('[data-catalog-section]'));

    if (!modal || !closeButton || !overlay || !image || !name || !productCode || !price || !stock || !description || !sizeGroup || !sizeSelect || !quantityInput || !addCartButton || !feedback || !catalogSections.length) {
      return false;
    }

    if (document.documentElement.dataset.catalogProductModalReady === 'true') return true;

    document.documentElement.dataset.catalogProductModalReady = 'true';

    const productCards = Array.from(document.querySelectorAll('[data-catalog-section] .grid > div')).filter((card) => {
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

      if (sectionName === 'clothing') return 'ROP';
      if (sectionName === 'accessories') return 'ACC';
      if (sectionName === 'perfumery') return 'PRF';
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
      const sectionName = card.closest('[data-catalog-section]')?.dataset.catalogSection || '';
      const suffix = getProductSuffix(card, sectionName);
      const productCodeValue = `${String(1000 + index)}-${suffix}`;
      const categoryText = (card.querySelectorAll('p')[0]?.textContent || '').trim().toLowerCase();
      const isExclusivePerfume = sectionName === 'perfumery' && (card.dataset.perfumeExclusive === 'true' || categoryText.includes('exclusivo'));

      card.dataset.productCode = productCodeValue;
      card.dataset.productStock = String(stockFromProductCode(productCodeValue));
      card.dataset.isExclusivePerfume = isExclusivePerfume ? 'true' : 'false';
    });

    productCards.forEach((card) => {
      card.dataset.catalogProductCard = 'true';
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
      description.textContent = getProductUsageDescription(productData.productName, productData.sectionName, productData.isExclusivePerfume);
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
      addCartButton.dataset.productImage = productData.imageSrc;
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
      const section = card.closest('[data-catalog-section]');
      const sectionName = section?.dataset.catalogSection || '';

      if (!imageElement || !nameElement || !priceElement) return null;

      return {
        imageSrc: imageElement.getAttribute('src') || '',
        imageAlt: imageElement.getAttribute('alt') || nameElement.textContent.trim(),
        productName: nameElement.textContent.trim(),
        productPrice: priceElement.textContent.trim(),
        requiresSize: sectionName === 'clothing',
        productCode: card.dataset.productCode || '',
        stockUnits: Number(card.dataset.productStock || '10'),
        isExclusivePerfume: card.dataset.isExclusivePerfume === 'true',
        sectionName
      };
    };

    const getProductUsageDescription = (productName, sectionName, isExclusivePerfume) => {
      const normalizedName = String(productName || '').toLowerCase();

      if (sectionName === 'clothing') {
        if (normalizedName.includes('chaqueta') || normalizedName.includes('blazer')) {
          return `${productName} esta pensado para elevar looks formales o smart-casual, ideal para eventos, reuniones y dias frescos.`;
        }
        if (normalizedName.includes('camisa') || normalizedName.includes('polo')) {
          return `${productName} ofrece una opcion versatil para uso diario, con presencia cuidada para oficina, salidas o encuentros informales.`;
        }
        return `${productName} es una prenda funcional de uso diario que combina comodidad y estilo para jornadas largas.`;
      }

      if (sectionName === 'accessories') {
        if (normalizedName.includes('reloj')) {
          return `${productName} aporta un toque elegante y practico, perfecto para complementar atuendos de trabajo o ocasiones especiales.`;
        }
        if (normalizedName.includes('gaf') || normalizedName.includes('lente')) {
          return `${productName} esta disenado para proteger y estilizar tu look en desplazamientos diarios y actividades al aire libre.`;
        }
        return `${productName} funciona como complemento de estilo para reforzar tu identidad visual en el dia a dia.`;
      }

      if (sectionName === 'perfumery') {
        if (isExclusivePerfume || normalizedName.includes('exclusiv')) {
          return `${productName} es una fragancia exclusiva de perfil sofisticado, recomendada para noches especiales y momentos memorables.`;
        }
        if (normalizedName.includes('nocturn')) {
          return `${productName} esta orientado a uso nocturno, con mayor intensidad y permanencia para cenas, eventos y salidas.`;
        }
        return `${productName} es una fragancia equilibrada para uso diario, fresca y adaptable a rutinas de trabajo o ocio.`;
      }

      return `${productName} es un producto seleccionado para ofrecer funcionalidad y estilo en su categoria.`;
    };

    document.addEventListener('click', (event) => {
      if (event.target.closest('#catalog-producto-modal-close') || event.target.closest('#catalog-producto-modal-overlay')) {
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
      const selectedProductImage = addCartButton.dataset.productImage || '';
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
        productImage: selectedProductImage,
        quantity: selectedQuantity,
        stockAtOrder: selectedStockUnits,
        isExclusivePerfume,
        selectedSize: requiresSize ? sizeSelect.value : null,
        orderedAtIso: now.toISOString(),
        orderedAtLocal: now.toLocaleString('es-ES')
      });

      saveCartItems(cartItems);

      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
      if (typeof window.renderCheckoutSummary === 'function') {
        window.renderCheckoutSummary();
      }

      closeModal();
    });

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    return true;
  }

  function setupCartView() {
    const cartView = getById(SELECTORS.cart);
    const emptyState = getById('cart-empty-state');
    const cartContent = getById('cart-content');
    const cartItemsContainer = getById('cart-items');
    const cartSummaryCount = getById('cart-summary-count');
    const cartSummarySubtotal = getById('cart-summary-subtotal');
    const cartSummaryIva = getById('cart-summary-vat');
    const cartSummaryTotal = getById('cart-summary-total');
    const clearButton = getById('cart-clear-btn');

    if (!cartView || !emptyState || !cartContent || !cartItemsContainer || !cartSummaryCount || !cartSummarySubtotal || !cartSummaryIva || !cartSummaryTotal || !clearButton) {
      return false;
    }

    if (document.documentElement.dataset.cartViewReady === 'true') {
      if (typeof window.renderCart === 'function') {
        window.renderCart();
      }
      return true;
    }

    document.documentElement.dataset.cartViewReady = 'true';

    const readCartItems = () => {
      try {
        const raw = window.localStorage.getItem('maisonCartItems');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    };

    const saveCartItems = (items) => {
      window.localStorage.setItem('maisonCartItems', JSON.stringify(items));
    };

    const toNumberPrice = (priceText) => {
      if (!priceText) return 0;
      return Number(String(priceText).replace('€', '').replace(',', '.').trim()) || 0;
    };

    const formatEuro = (amount) => `€${amount.toFixed(2)}`;

    const renderCart = () => {
      const items = readCartItems();

      if (!items.length) {
        emptyState.classList.remove('hidden');
        cartContent.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        cartSummaryCount.textContent = '0';
        cartSummarySubtotal.textContent = '€0.00';
        cartSummaryIva.textContent = '€0.00';
        cartSummaryTotal.textContent = '€0.00';
        if (typeof window.renderCheckoutSummary === 'function') {
          window.renderCheckoutSummary();
        }
        return;
      }

      emptyState.classList.add('hidden');
      cartContent.classList.remove('hidden');

      let subtotal = 0;
      let quantityTotal = 0;

      const cardsMarkup = items.map((item, itemIndex) => {
        const unitPrice = toNumberPrice(item.productPrice);
        const lineTotal = unitPrice * (item.quantity || 1);
        subtotal += lineTotal;
        quantityTotal += item.quantity || 1;

        const sizeText = item.selectedSize ? `<span class="text-xs uppercase tracking-wide text-[#6b7280]">Talla: ${item.selectedSize}</span>` : '';
        const imageMarkup = item.productImage
          ? `<img src="${item.productImage}" alt="${item.productName}" class="w-24 h-24 object-cover rounded-lg border border-black/10" />`
          : '<div class="w-24 h-24 rounded-lg border border-black/10 bg-[#ece4d5]"></div>';

        return `
          <article class="rounded-2xl border border-[color:var(--dorado)] bg-[#f7f2e8] p-4 shadow-[0_10px_18px_rgba(31,42,68,0.08)]">
            <div class="flex gap-4 items-start">
              ${imageMarkup}
              <div class="flex-1 min-w-0">
                <h4 class="font-serif text-lg text-[color:var(--azul-muy-oscuro)] break-words">${item.productName}</h4>
                <p class="text-sm text-[color:var(--azul-muy-oscuro)]">${item.productCode || ''}</p>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span class="text-xs uppercase tracking-wide text-[#6b7280]">Cantidad: ${item.quantity || 1}</span>
                  ${sizeText}
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-[color:var(--azul-muy-oscuro)]">
                  <span>Pedido #${item.orderId || '-'}</span>
                  <span>${item.orderedAtLocal || ''}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-[color:var(--azul-muy-oscuro)]">${item.productPrice || '€0'}</p>
                <p class="text-xs text-[#6b7280]">Total: ${formatEuro(lineTotal)}</p>
                <button type="button" data-cart-remove-one="true" data-order-id="${item.orderId || ''}" data-item-index="${itemIndex}" class="mt-2 rounded-md border border-[#1f2a44]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--azul-muy-oscuro)] transition duration-200 hover:bg-[#e8e4dc]">
                  Quitar 1
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      cartItemsContainer.innerHTML = cardsMarkup;
      const iva = subtotal * 0.21;
      const total = subtotal + iva;
      cartSummaryCount.textContent = String(quantityTotal);
      cartSummarySubtotal.textContent = formatEuro(subtotal);
      cartSummaryIva.textContent = formatEuro(iva);
      cartSummaryTotal.textContent = formatEuro(total);
      if (typeof window.renderCheckoutSummary === 'function') {
        window.renderCheckoutSummary();
      }
    };

    window.renderCart = renderCart;

    cartItemsContainer.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-cart-remove-one="true"]');
      if (!removeButton) return;

      const orderId = removeButton.dataset.orderId || '';
      const fallbackIndex = Number(removeButton.dataset.itemIndex || '-1');
      const items = readCartItems();

      let itemIndex = items.findIndex((item) => String(item.orderId || '') === orderId);
      if (itemIndex < 0) {
        itemIndex = fallbackIndex;
      }
      if (itemIndex < 0 || itemIndex >= items.length) return;

      const currentQuantity = Number(items[itemIndex].quantity || 1);
      if (currentQuantity > 1) {
        items[itemIndex].quantity = currentQuantity - 1;
      } else {
        items.splice(itemIndex, 1);
      }

      saveCartItems(items);
      renderCart();
    });

    clearButton.addEventListener('click', () => {
      window.localStorage.removeItem('maisonCartItems');
      renderCart();
    });

    renderCart();

    return true;
  }

  function setupCheckoutFlow() {
    const checkoutView = getById(SELECTORS.checkout);
    const progressLine = getById('checkout-progress-line');
    const stepIndicator1 = getById('checkout-step-indicator-1');
    const stepIndicator2 = getById('checkout-step-indicator-2');
    const stepIndicator3 = getById('checkout-step-indicator-3');
    const step1 = getById('checkout-step-1');
    const step2 = getById('checkout-step-2');
    const step3 = getById('checkout-step-3');
    const continueStep1 = getById('checkout-step-1-continue');
    const continueStep2 = getById('checkout-step-2-continue');

    const nameInput = getById('checkout-first-name');
    const lastNameInput = getById('checkout-last-name');
    const emailInput = getById('checkout-email');
    const phonePrefixSelect = getById('checkout-country-code');
    const phoneInput = getById('checkout-phone');
    const billingCountrySelect = getById('checkout-billing-pais');
    const billingMunicipalityInput = getById('checkout-billing-city');
    const billingStreetInput = getById('checkout-billing-street');
    const billingPostalCodeInput = getById('checkout-billing-postal-code');
    const scheduleMinSelect = getById('checkout-schedule-min');
    const scheduleMaxSelect = getById('checkout-schedule-max');
    const estimatedDeliveryText = getById('checkout-estimated-delivery');
    const checkoutSummaryEmpty = getById('checkout-summary-empty');
    const checkoutSummaryContent = getById('checkout-summary-content');
    const checkoutSummaryItems = getById('checkout-summary-items');
    const checkoutSummarySubtotal = getById('checkout-summary-subtotal');
    const checkoutSummaryIva = getById('checkout-summary-iva');
    const checkoutSummaryTotal = getById('checkout-summary-total');
    const cardNumberInput = getById('checkout-card-number');
    const cardCvvInput = getById('checkout-card-cvv');
    const cardExpiryMonthSelect = getById('checkout-card-exp-month');
    const cardExpiryYearSelect = getById('checkout-card-exp-year');
    const cardOwnerNameInput = getById('checkout-card-owner-name');
    const cardOwnerLastName1Input = getById('checkout-card-owner-lastname1');
    const cardOwnerLastName2Input = getById('checkout-card-owner-lastname2');
    const payButton = getById('checkout-pay-button');
    const paymentModal = getById('checkout-payment-modal');
    const paymentProcessingBlock = getById('checkout-payment-processing');
    const paymentSuccessBlock = getById('checkout-payment-success');
    const paymentSuccessMessage = getById('checkout-payment-success-message');

    if (!checkoutView || !progressLine || !stepIndicator1 || !stepIndicator2 || !stepIndicator3 || !step1 || !step2 || !step3 || !continueStep1 || !continueStep2 || !nameInput || !lastNameInput || !emailInput || !phonePrefixSelect || !phoneInput || !billingCountrySelect || !billingMunicipalityInput || !billingStreetInput || !billingPostalCodeInput || !scheduleMinSelect || !scheduleMaxSelect || !estimatedDeliveryText || !checkoutSummaryEmpty || !checkoutSummaryContent || !checkoutSummaryItems || !checkoutSummarySubtotal || !checkoutSummaryIva || !checkoutSummaryTotal || !cardNumberInput || !cardCvvInput || !cardExpiryMonthSelect || !cardExpiryYearSelect || !cardOwnerNameInput || !cardOwnerLastName1Input || !cardOwnerLastName2Input || !payButton || !paymentModal || !paymentProcessingBlock || !paymentSuccessBlock || !paymentSuccessMessage) {
      return false;
    }

    if (document.documentElement.dataset.checkoutFlowReady === 'true') return true;
    document.documentElement.dataset.checkoutFlowReady = 'true';

    let currentStep = 1;

    const phonePrefixesByCountry = [
      { code: '+34', country: 'Espana' },
      { code: '+56', country: 'Chile' },
      { code: '+54', country: 'Argentina' },
      { code: '+591', country: 'Bolivia' },
      { code: '+55', country: 'Brasil' },
      { code: '+57', country: 'Colombia' },
      { code: '+506', country: 'Costa Rica' },
      { code: '+53', country: 'Cuba' },
      { code: '+593', country: 'Ecuador' },
      { code: '+503', country: 'El Salvador' },
      { code: '+502', country: 'Guatemala' },
      { code: '+504', country: 'Honduras' },
      { code: '+52', country: 'Mexico' },
      { code: '+505', country: 'Nicaragua' },
      { code: '+507', country: 'Panama' },
      { code: '+595', country: 'Paraguay' },
      { code: '+51', country: 'Peru' },
      { code: '+1', country: 'Puerto Rico/EE. UU./Canada' },
      { code: '+598', country: 'Uruguay' },
      { code: '+58', country: 'Venezuela' },
      { code: '+1', country: 'Estados Unidos' },
      { code: '+1', country: 'Canada' },
      { code: '+33', country: 'Francia' },
      { code: '+49', country: 'Alemania' },
      { code: '+39', country: 'Italia' },
      { code: '+351', country: 'Portugal' },
      { code: '+44', country: 'Reino Unido' },
      { code: '+31', country: 'Countryes Bajos' },
      { code: '+32', country: 'Belgica' },
      { code: '+41', country: 'Suiza' },
      { code: '+43', country: 'Austria' },
      { code: '+46', country: 'Suecia' },
      { code: '+47', country: 'Noruega' },
      { code: '+45', country: 'Dinamarca' },
      { code: '+353', country: 'Irlanda' },
      { code: '+48', country: 'Polonia' },
      { code: '+420', country: 'Chequia' },
      { code: '+30', country: 'Grecia' },
      { code: '+90', country: 'Turquia' },
      { code: '+7', country: 'Rusia' },
      { code: '+380', country: 'Ucrania' },
      { code: '+81', country: 'Japon' },
      { code: '+82', country: 'Corea del Sur' },
      { code: '+86', country: 'China' },
      { code: '+91', country: 'India' },
      { code: '+66', country: 'Tailandia' },
      { code: '+84', country: 'Vietnam' },
      { code: '+65', country: 'Singapur' },
      { code: '+971', country: 'Emiratos Arabes Unidos' },
      { code: '+966', country: 'Arabia Saudita' },
      { code: '+27', country: 'Sudafrica' },
      { code: '+20', country: 'Egipto' },
      { code: '+212', country: 'Marruecos' },
      { code: '+61', country: 'Australia' },
      { code: '+64', country: 'Nueva Zelanda' }
    ];

    const populatePhonePrefixes = () => {
      if (phonePrefixSelect.dataset.ready === 'true') return;

      const options = phonePrefixesByCountry.map(({ code, country }) => (
        `<option value="${code}">${code} ${country}</option>`
      )).join('');

      phonePrefixSelect.insertAdjacentHTML('beforeend', options);
      phonePrefixSelect.dataset.ready = 'true';
    };

    const populateBillingCountries = () => {
      if (billingCountrySelect.dataset.ready === 'true') return;

      const countries = [...new Set(phonePrefixesByCountry.map(({ country }) => country))]
        .sort((a, b) => a.localeCompare(b, 'es'));
      const options = countries.map((country) => `<option value="${country}">${country}</option>`).join('');

      billingCountrySelect.insertAdjacentHTML('beforeend', options);
      billingCountrySelect.dataset.ready = 'true';
    };

    const populateScheduleOptions = () => {
      if (scheduleMinSelect.dataset.ready === 'true' && scheduleMaxSelect.dataset.ready === 'true') return;

      const hourOptions = [];
      for (let hour = 8; hour <= 18; hour += 1) {
        const hh = String(hour).padStart(2, '0');
        hourOptions.push(`<option value="${hh}:00">${hh}:00</option>`);
      }
      const optionsMarkup = hourOptions.join('');

      scheduleMinSelect.insertAdjacentHTML('beforeend', optionsMarkup);
      scheduleMaxSelect.insertAdjacentHTML('beforeend', optionsMarkup);
      scheduleMinSelect.dataset.ready = 'true';
      scheduleMaxSelect.dataset.ready = 'true';
    };

    const populateCardExpiryOptions = () => {
      if (cardExpiryMonthSelect.dataset.ready === 'true' && cardExpiryYearSelect.dataset.ready === 'true') return;

      const monthOptions = [];
      for (let month = 1; month <= 12; month += 1) {
        const mm = String(month).padStart(2, '0');
        monthOptions.push(`<option value="${mm}">${mm}</option>`);
      }

      const currentYear = new Date().getFullYear();
      const yearOptions = [];
      for (let year = currentYear; year <= currentYear + 15; year += 1) {
        yearOptions.push(`<option value="${year}">${year}</option>`);
      }

      cardExpiryMonthSelect.insertAdjacentHTML('beforeend', monthOptions.join(''));
      cardExpiryYearSelect.insertAdjacentHTML('beforeend', yearOptions.join(''));
      cardExpiryMonthSelect.dataset.ready = 'true';
      cardExpiryYearSelect.dataset.ready = 'true';
    };

    populatePhonePrefixes();
    populateBillingCountries();
    populateScheduleOptions();
    populateCardExpiryOptions();

    const markIndicator = (indicator, isActive) => {
      indicator.classList.toggle('border-[color:var(--dorado)]', isActive);
      indicator.classList.toggle('bg-[rgba(194,154,91,0.85)]', isActive);
      indicator.classList.toggle('border-[rgba(31,42,68,0.25)]', !isActive);
      indicator.classList.toggle('bg-white', !isActive);
    };

    const updateStepState = () => {
      step2.classList.toggle('opacity-55', currentStep < 2);
      step2.classList.toggle('pointer-events-none', currentStep < 2);
      step2.setAttribute('aria-disabled', currentStep < 2 ? 'true' : 'false');

      step3.classList.toggle('opacity-55', currentStep < 3);
      step3.classList.toggle('pointer-events-none', currentStep < 3);
      step3.setAttribute('aria-disabled', currentStep < 3 ? 'true' : 'false');

      markIndicator(stepIndicator1, true);
      markIndicator(stepIndicator2, currentStep >= 2);
      markIndicator(stepIndicator3, currentStep >= 3);

      progressLine.style.width = currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%';
    };

    const isStep1Valid = () => {
      const name = nameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const email = emailInput.value.trim();
      const prefix = phonePrefixSelect.value.trim();
      const phone = phoneInput.value.trim();

      const emailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
      const phoneDigits = phone.replace(/\D/g, '');
      const phoneValid = phoneDigits.length >= 6 && phoneDigits.length <= 14;
      const prefixValid = prefix.length > 0;

      return Boolean(name && lastName && emailValid && prefixValid && phoneValid);
    };

    const parseHourValue = (timeValue) => {
      if (!timeValue) return NaN;
      const [hours, minutes] = timeValue.split(':').map(Number);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
      return (hours * 60) + minutes;
    };

    const toNumberPrice = (priceText) => {
      if (!priceText) return 0;
      return Number(String(priceText).replace('€', '').replace(',', '.').trim()) || 0;
    };

    const formatEuro = (amount) => `€${amount.toFixed(2)}`;

    const getLocalCartItems = () => {
      try {
        const raw = window.localStorage.getItem('maisonCartItems');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    };

    const renderCheckoutSummary = () => {
      const items = getLocalCartItems();

      if (!items.length) {
        checkoutSummaryEmpty.classList.remove('hidden');
        checkoutSummaryContent.classList.add('hidden');
        checkoutSummaryItems.innerHTML = '';
        checkoutSummarySubtotal.textContent = '€0.00';
        checkoutSummaryIva.textContent = '€0.00';
        checkoutSummaryTotal.textContent = '€0.00';
        return;
      }

      checkoutSummaryEmpty.classList.add('hidden');
      checkoutSummaryContent.classList.remove('hidden');

      let subtotal = 0;
      const rows = items.map((item) => {
        const quantity = Number(item.quantity || 1);
        const unit = toNumberPrice(item.productPrice);
        const line = unit * quantity;
        subtotal += line;

        return `
          <div class="rounded-xl border border-black/10 bg-white/70 p-3 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="font-semibold text-[color:var(--azul-muy-oscuro)] truncate">${item.productName || 'Producto'}</p>
              <p class="text-xs text-[#6b7280]">Cantidad: ${quantity}</p>
            </div>
            <p class="font-semibold text-[color:var(--azul-muy-oscuro)]">${formatEuro(line)}</p>
          </div>
        `;
      }).join('');

      const iva = subtotal * 0.21;
      const total = subtotal + iva;

      checkoutSummaryItems.innerHTML = rows;
      checkoutSummarySubtotal.textContent = formatEuro(subtotal);
      checkoutSummaryIva.textContent = formatEuro(iva);
      checkoutSummaryTotal.textContent = formatEuro(total);
    };

    window.renderCheckoutSummary = renderCheckoutSummary;
    renderCheckoutSummary();

    const getReferenceOrderDate = () => {
      let cartItems = [];
      try {
        const raw = window.localStorage.getItem('maisonCartItems');
        const parsed = raw ? JSON.parse(raw) : [];
        cartItems = Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        cartItems = [];
      }

      const validTimes = cartItems
        .map((item) => new Date(item.orderedAtIso || '').getTime())
        .filter((value) => Number.isFinite(value));

      if (!validTimes.length) return new Date();
      return new Date(Math.max(...validTimes));
    };

    const getEstimatedDeliveryDays = (windowHours) => {
      if (windowHours <= 2) return 7;
      if (windowHours <= 4) return 6;
      if (windowHours <= 6) return 5;
      if (windowHours <= 8) return 4;
      return 3;
    };

    const getStep2State = () => {
      const countryValid = billingCountrySelect.value.trim().length > 0;
      const municipalityValid = billingMunicipalityInput.value.trim().length > 0;
      const streetValid = billingStreetInput.value.trim().length > 0;
      const postalDigits = billingPostalCodeInput.value.trim().replace(/\D/g, '');
      const postalValid = /^\d{5}$/.test(postalDigits);

      const minMinutes = parseHourValue(scheduleMinSelect.value);
      const maxMinutes = parseHourValue(scheduleMaxSelect.value);
      const minSelected = Number.isFinite(minMinutes);
      const maxSelected = Number.isFinite(maxMinutes);
      const inRange = minSelected && maxSelected && minMinutes >= (8 * 60) && maxMinutes <= (18 * 60);
      const validOrder = inRange && minMinutes < maxMinutes;

      const allValid = countryValid && municipalityValid && streetValid && postalValid && validOrder;

      return {
        countryValid,
        municipalityValid,
        streetValid,
        postalValid,
        minValid: minSelected && inRange,
        maxValid: maxSelected && inRange && validOrder,
        allValid,
        minMinutes,
        maxMinutes
      };
    };

    const lettersOnlyRegex = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/;

    const getStep3State = () => {
      const cardDigits = cardNumberInput.value.trim().replace(/\D/g, '');
      const cvvDigits = cardCvvInput.value.trim().replace(/\D/g, '');
      const cardNumberValid = /^\d{16}$/.test(cardDigits);
      const cvvValid = /^\d{3}$/.test(cvvDigits);

      const month = Number(cardExpiryMonthSelect.value || '0');
      const year = Number(cardExpiryYearSelect.value || '0');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expirySelected = Number.isFinite(month) && Number.isFinite(year) && month >= 1 && month <= 12 && year >= currentYear;
      const expiryValid = expirySelected && (year > currentYear || (year === currentYear && month >= currentMonth));

      const ownerNameValid = lettersOnlyRegex.test(cardOwnerNameInput.value.trim());
      const ownerLastName1Valid = lettersOnlyRegex.test(cardOwnerLastName1Input.value.trim());
      const ownerLastName2Valid = lettersOnlyRegex.test(cardOwnerLastName2Input.value.trim());

      const allValid = cardNumberValid && cvvValid && expiryValid && ownerNameValid && ownerLastName1Valid && ownerLastName2Valid;

      return {
        cardNumberValid,
        cvvValid,
        expiryMonthValid: expiryValid,
        expiryYearValid: expiryValid,
        ownerNameValid,
        ownerLastName1Valid,
        ownerLastName2Valid,
        allValid
      };
    };

    const touchedFields = new Set();

    const setFieldState = (field, isValid) => {
      const shouldPaint = touchedFields.has(field.id);
      field.classList.remove('border-black/25', 'border-green-600', 'border-red-500', 'bg-green-50', 'bg-red-50', 'text-green-900', 'text-red-900');

      if (!shouldPaint) {
        field.classList.add('border-black/25');
        return;
      }

      if (isValid) {
        field.classList.add('border-green-600', 'bg-green-50', 'text-green-900');
      } else {
        field.classList.add('border-red-500', 'bg-red-50', 'text-red-900');
      }
    };

    const evaluateFields = () => {
      const nameValid = nameInput.value.trim().length > 0;
      const lastNameValid = lastNameInput.value.trim().length > 0;
      const emailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailInput.value.trim());
      const prefixValid = phonePrefixSelect.value.trim().length > 0;
      const phoneDigits = phoneInput.value.trim().replace(/\D/g, '');
      const phoneValid = phoneDigits.length >= 6 && phoneDigits.length <= 14;
      const step2State = getStep2State();
      const step3State = getStep3State();

      setFieldState(nameInput, nameValid);
      setFieldState(lastNameInput, lastNameValid);
      setFieldState(emailInput, emailValid);
      setFieldState(phonePrefixSelect, prefixValid);
      setFieldState(phoneInput, phoneValid);
      setFieldState(billingCountrySelect, step2State.countryValid);
      setFieldState(billingMunicipalityInput, step2State.municipalityValid);
      setFieldState(billingStreetInput, step2State.streetValid);
      setFieldState(billingPostalCodeInput, step2State.postalValid);
      setFieldState(scheduleMinSelect, step2State.minValid);
      setFieldState(scheduleMaxSelect, step2State.maxValid);
      setFieldState(cardNumberInput, step3State.cardNumberValid);
      setFieldState(cardCvvInput, step3State.cvvValid);
      setFieldState(cardExpiryMonthSelect, step3State.expiryMonthValid);
      setFieldState(cardExpiryYearSelect, step3State.expiryYearValid);
      setFieldState(cardOwnerNameInput, step3State.ownerNameValid);
      setFieldState(cardOwnerLastName1Input, step3State.ownerLastName1Valid);
      setFieldState(cardOwnerLastName2Input, step3State.ownerLastName2Valid);

      if (step2State.allValid) {
        const windowHours = (step2State.maxMinutes - step2State.minMinutes) / 60;
        const deliveryDays = getEstimatedDeliveryDays(windowHours);
        const baseDate = getReferenceOrderDate();
        const estimatedDate = new Date(baseDate);
        estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
        estimatedDeliveryText.textContent = `Entrega estimada: ${estimatedDate.toLocaleDateString('es-ES')} entre ${scheduleMinSelect.value} y ${scheduleMaxSelect.value} (${deliveryDays} dias desde tu pedido).`;
      } else {
        estimatedDeliveryText.textContent = 'Select your availability window to see the estimated package arrival.';
      }

      return {
        step2State,
        step3State,
        step1Valid: Boolean(nameValid && lastNameValid && emailValid && prefixValid && phoneValid)
      };
    };

    const updateContinueAvailability = () => {
      const evaluation = evaluateFields();
      continueStep1.disabled = !evaluation.step1Valid;
      continueStep2.disabled = !evaluation.step2State.allValid;
      payButton.disabled = !(evaluation.step1Valid && evaluation.step2State.allValid && evaluation.step3State.allValid);
    };

    billingPostalCodeInput.addEventListener('input', () => {
      const onlyDigits = billingPostalCodeInput.value.replace(/\D/g, '').slice(0, 5);
      if (billingPostalCodeInput.value !== onlyDigits) {
        billingPostalCodeInput.value = onlyDigits;
      }
    });

    cardNumberInput.addEventListener('input', () => {
      const onlyDigits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
      if (cardNumberInput.value !== onlyDigits) {
        cardNumberInput.value = onlyDigits;
      }
    });

    cardCvvInput.addEventListener('input', () => {
      const onlyDigits = cardCvvInput.value.replace(/\D/g, '').slice(0, 3);
      if (cardCvvInput.value !== onlyDigits) {
        cardCvvInput.value = onlyDigits;
      }
    });

    const sanitizeLettersInput = (input) => {
      const sanitized = input.value.replace(/[^A-Za-z\s'-]/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    };

    [cardOwnerNameInput, cardOwnerLastName1Input, cardOwnerLastName2Input].forEach((input) => {
      input.addEventListener('input', () => sanitizeLettersInput(input));
    });

    const trackedInputs = [
      nameInput,
      lastNameInput,
      emailInput,
      phonePrefixSelect,
      phoneInput,
      billingCountrySelect,
      billingMunicipalityInput,
      billingStreetInput,
      billingPostalCodeInput,
      scheduleMinSelect,
      scheduleMaxSelect,
      cardNumberInput,
      cardCvvInput,
      cardExpiryMonthSelect,
      cardExpiryYearSelect,
      cardOwnerNameInput,
      cardOwnerLastName1Input,
      cardOwnerLastName2Input
    ];

    trackedInputs.forEach((input) => {
      input.addEventListener('input', () => {
        touchedFields.add(input.id);
        updateContinueAvailability();
      });
      input.addEventListener('change', () => {
        touchedFields.add(input.id);
        updateContinueAvailability();
      });
      input.addEventListener('blur', () => {
        touchedFields.add(input.id);
        updateContinueAvailability();
      });
    });

    continueStep1.addEventListener('click', () => {
      [nameInput, lastNameInput, emailInput, phonePrefixSelect, phoneInput].forEach((input) => touchedFields.add(input.id));
      updateContinueAvailability();
      if (!isStep1Valid()) return;
      currentStep = Math.max(currentStep, 2);
      updateStepState();
      step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    continueStep2.addEventListener('click', () => {
      [billingCountrySelect, billingMunicipalityInput, billingStreetInput, billingPostalCodeInput, scheduleMinSelect, scheduleMaxSelect].forEach((input) => touchedFields.add(input.id));
      updateContinueAvailability();
      if (continueStep2.disabled) return;
      currentStep = Math.max(currentStep, 3);
      updateStepState();
      step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const resetCheckoutFlow = ({ scrollIntoStep = true } = {}) => {
      trackedInputs.forEach((input) => {
        if ('value' in input) {
          input.value = '';
        }
        if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        }
      });

      touchedFields.clear();
      currentStep = 1;
      estimatedDeliveryText.textContent = 'Select your availability window to see the estimated package arrival.';
      updateContinueAvailability();
      updateStepState();
      if (scrollIntoStep) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.resetCheckoutFlow = resetCheckoutFlow;

    const openPaymentModal = () => {
      paymentModal.classList.remove('hidden');
      paymentProcessingBlock.classList.remove('hidden');
      paymentSuccessBlock.classList.add('hidden');
      payButton.disabled = true;

      window.setTimeout(() => {
        paymentProcessingBlock.classList.add('hidden');
        paymentSuccessBlock.classList.remove('hidden');
        const customerName = nameInput.value.trim() || 'cliente';
        paymentSuccessMessage.textContent = `Gracias ${customerName} por comprar con nosotros.`;

        window.setTimeout(() => {
          paymentModal.classList.add('hidden');
          window.localStorage.removeItem('maisonCartItems');
          if (typeof window.renderCart === 'function') {
            window.renderCart();
          }
          if (typeof window.renderCheckoutSummary === 'function') {
            window.renderCheckoutSummary();
          }
          resetCheckoutFlow();
          showView('home', { updateUrl: true, scrollTop: true });
        }, 3000);
      }, 5000);
    };

    payButton.addEventListener('click', () => {
      trackedInputs.forEach((input) => touchedFields.add(input.id));
      updateContinueAvailability();
      if (payButton.disabled) return;
      openPaymentModal();
    });

    updateContinueAvailability();
    updateStepState();

    return true;
  }

  function initMaisonElance(attempt = 0) {
    if (attempt === 0 && document.documentElement.dataset.freshLoadResetDone !== 'true') {
      document.documentElement.dataset.freshLoadResetDone = 'true';
      window.history.replaceState(null, '', '#home');
    }

    setupNavigationMaisonElance();
    setupGlobalClosers();
    setupMobileMenu();
    setupUserMenu();
    setupCatalogFilters();
    setupCatalogCategories();
    setupProductSearchSuggestions();
    setupCatalogShowcaseStyle();
    setupCatalogProductModal();
    setupCartView();
    setupCheckoutFlow();

    if (attempt === 0 && typeof window.resetCheckoutFlow === 'function') {
      window.resetCheckoutFlow({ scrollIntoStep: false });
    }

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
      console.error('Error loading fragments:', error);
    });
  }

  function animarFondoBody() {
    const background = getById('fondo-animado');
    if (!background) return;
    if (background.dataset.animationReady === 'true') return;

    background.dataset.animationReady = 'true';
    background.style.backgroundSize = 'cover';
    background.style.backgroundRepeat = 'repeat-x';
    background.style.willChange = 'background-position';

    let posX = 0;

    const tick = () => {
      posX = (posX - 0.12 + 2000) % 2000;
      background.style.backgroundPosition = `${posX}px 0px`;
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }

  window.closeMobileMenu = closeMobileMenu;
  window.closeUserMenu = closeUserMenu;
  window.renderCatalog = renderCatalog;
  window.showCatalog = renderCatalog;
  window.initMaisonElance = initMaisonElance;
  window.animarFondoBody = animarFondoBody;

  function bootstrapMaison() {
    window.localStorage.removeItem('maisonCartItems');
    window.history.replaceState(null, '', '#home');
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
