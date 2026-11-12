// Catálogo de cajitas navideñas con fotografías realistas y respaldo cálido
    const BOX_CATALOG = {
      mini: {
        id: 'mini',
        name: 'Caja Mini',
        price: 12,
        description: 'Dulces, galletas decoradas y tarjeta festiva',
        idealFor: 'Ideal para compañeros de trabajo',
        image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=900&q=85',
        fallback: 'https://placehold.co/900x650/1E5638/FFFDF9?text=Caja+Mini+-+Galletas+y+Dulces',
        tags: ['Galletas decoradas', 'Dulces navideños', 'Tarjeta']
      },
      clasica: {
        id: 'clasica',
        name: 'Caja Clásica',
        price: 25,
        description: 'Chocolates finos, vela aromática, taza y tarjeta',
        idealFor: 'Ideal para familia y amigos',
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=85',
        fallback: 'https://placehold.co/900x650/B91C1C/FFFDF9?text=Caja+Clasica+-+Chocolates+y+Vela',
        tags: ['Chocolates finos', 'Vela aromática', 'Taza + Tarjeta']
      },
      premium: {
        id: 'premium',
        name: 'Caja Premium',
        price: 45,
        description: 'Detalle grabado personalizado, snacks gourmet y bebida festiva',
        idealFor: 'Ideal para clientes y parejas',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85',
        fallback: 'https://placehold.co/900x650/D97706/FFFDF9?text=Caja+Premium+-+Snacks+Gourmet',
        tags: ['Detalle grabado', 'Snacks gourmet', 'Bebida festiva']
      }
    };

    const ECO_EXTRA = 3;
    const SHIPPING_FEE = 5;

    const STORAGE_KEYS = {
      USERS: 'cajitas_nav_users_pure_v1',
      SESSION: 'cajitas_nav_session_pure_v1',
      ORDERS: 'cajitas_nav_orders_pure_v1'
    };

    // Estado global precargado con el carrito del wireframe
    const appState = {
      selectedModel: 'clasica',
      currentUser: null,
      cart: [
        {
          uid: 'init-1',
          modelId: 'clasica',
          name: 'Caja Clásica',
          image: BOX_CATALOG.clasica.image,
          fallback: BOX_CATALOG.clasica.fallback,
          basePrice: 25,
          packaging: 'eco', // $28
          message: '¡Felices fiestas! Con mucho cariño y buenos deseos.',
          recipientName: 'Familia López',
          qty: 1
        },
        {
          uid: 'init-2',
          modelId: 'mini',
          name: 'Caja Mini',
          image: BOX_CATALOG.mini.image,
          fallback: BOX_CATALOG.mini.fallback,
          basePrice: 12,
          packaging: 'standard', // $12
          message: 'Dulces y galletas navideñas para alegrar tu día.',
          recipientName: 'Equipo Oficina',
          qty: 1
        }
      ]
    };

    // Inicialización al cargar DOM
    document.addEventListener('DOMContentLoaded', () => {
      initAuthSystem();
      renderCatalogGrid();
      selectCustomizerModel('clasica');
      renderCartAndSummary();
    });

    // Cerrar menú desplegable del usuario al hacer clic fuera
    document.addEventListener('click', (event) => {
      const wrapper = document.getElementById('header-user-wrapper');
      const dropdown = document.getElementById('user-dropdown');
      if (wrapper && dropdown && !wrapper.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // =====================================================================
    // SISTEMA DE INICIO DE SESIÓN, PERFIL Y PEDIDOS (localStorage)
    // =====================================================================
    function getUsersList() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
      } catch {
        return [];
      }
    }

    function saveUsersList(list) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    }

    function getOrdersByEmail(email) {
      if (!email) return [];
      try {
        const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || {};
        return map[email.toLowerCase()] || [];
      } catch {
        return [];
      }
    }

    function storeOrderForEmail(email, order) {
      if (!email) return;
      try {
        const map = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || {};
        const key = email.toLowerCase();
        if (!map[key]) map[key] = [];
        map[key].unshift(order);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(map));
      } catch (e) {
        console.error(e);
      }
    }

    function initAuthSystem() {
      const users = getUsersList();
      const demoEmail = 'ana.demo@cajitasnavidenas.com';

      if (!users.some(u => u.email === demoEmail)) {
        users.push({
          name: 'Ana Sofía Mendoza',
          email: demoEmail,
          whatsapp: '+51 987 654 321',
          address: 'Av. Navideña 124, Dpto 401',
          password: 'demo123'
        });
        saveUsersList(users);

        if (getOrdersByEmail(demoEmail).length === 0) {
          storeOrderForEmail(demoEmail, {
            orderNumber: 'NAV-8421',
            date: '10/11/2026, 06:45 p. m.',
            status: 'En preparación',
            total: 50,
            address: 'Av. Navideña 124, Dpto 401',
            items: [
              {
                name: 'Caja Premium',
                qty: 1,
                packaging: 'standard',
                recipientName: 'Gerencia General',
                lineTotal: 45
              }
            ]
          });
        }
      }

      const activeEmail = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (activeEmail) {
        const found = getUsersList().find(u => u.email === activeEmail);
        if (found) appState.currentUser = found;
      }

      refreshAuthHeaderUI();
    }

    function getInitials(name) {
      const parts = (name || 'U').trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function refreshAuthHeaderUI() {
      const loginBtn = document.getElementById('header-login-btn');
      const userWrapper = document.getElementById('header-user-wrapper');
      const checkoutStatus = document.getElementById('checkout-auth-status');

      if (appState.currentUser) {
        const user = appState.currentUser;
        const ordersCount = getOrdersByEmail(user.email).length;

        loginBtn.classList.add('hidden');
        userWrapper.classList.remove('hidden');

        document.getElementById('header-user-avatar').textContent = getInitials(user.name);
        document.getElementById('header-user-firstname').textContent = user.name.split(' ')[0];
        document.getElementById('dropdown-fullname').textContent = user.name;
        document.getElementById('dropdown-email').textContent = user.email;
        document.getElementById('dropdown-orders-count').textContent = ordersCount;

        // Autocompletar Checkout
        const nameInput = document.getElementById('checkout-name');
        const waInput = document.getElementById('checkout-whatsapp');
        const addrInput = document.getElementById('checkout-address');

        if (!nameInput.value) nameInput.value = user.name || '';
        if (!waInput.value) waInput.value = user.whatsapp || '';
        if (!addrInput.value && user.address) addrInput.value = user.address;

        checkoutStatus.innerHTML = `
          <span class="checkout-auth-pill">
            ✓ Sesión activa: <strong style="color: var(--forest-900);">${escapeHtml(user.name.split(' ')[0])}</strong>
          </span>
        `;
      } else {
        loginBtn.classList.remove('hidden');
        userWrapper.classList.add('hidden');
        document.getElementById('user-dropdown').classList.add('hidden');

        checkoutStatus.innerHTML = `
          <button type="button" class="checkout-auth-pill" onclick="openAuthModal('login')">
            <span>Inicia sesión para guardar tu pedido</span>
          </button>
        `;
      }
    }

    function toggleUserDropdown() {
      document.getElementById('user-dropdown').classList.toggle('hidden');
    }

    function openAuthModal(tab) {
      hideAuthError();
      switchAuthTab(tab || 'login');
      document.getElementById('auth-modal').classList.remove('hidden');
    }

    function closeAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
      hideAuthError();
    }

    function switchAuthTab(tab) {
      hideAuthError();
      const loginForm = document.getElementById('login-form');
      const regForm = document.getElementById('register-form');
      const tabLogin = document.getElementById('tab-login');
      const tabReg = document.getElementById('tab-register');

      if (tab === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
      } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
      }
    }

    function showAuthError(text) {
      document.getElementById('auth-error-msg').textContent = text;
      document.getElementById('auth-error-banner').classList.remove('hidden');
    }

    function hideAuthError() {
      document.getElementById('auth-error-banner').classList.add('hidden');
    }

    function togglePassField(id) {
      const el = document.getElementById(id);
      el.type = el.type === 'password' ? 'text' : 'password';
    }

    function handleLoginSubmit(event) {
      event.preventDefault();
      hideAuthError();

      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      const user = getUsersList().find(u => u.email === email && u.password === password);
      if (!user) {
        showAuthError('Correo o contraseña incorrectos. Prueba registrarte o usar Acceso rápido demo.');
        return;
      }

      finalizeLogin(user);
      document.getElementById('login-form').reset();
    }

    function handleRegisterSubmit(event) {
      event.preventDefault();
      hideAuthError();

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const whatsapp = document.getElementById('reg-whatsapp').value.trim();
      const password = document.getElementById('reg-password').value;

      if (password.length < 6) {
        showAuthError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      const users = getUsersList();
      if (users.some(u => u.email === email)) {
        showAuthError('Este correo ya está registrado. Inicia sesión.');
        return;
      }

      const newUser = { name, email, whatsapp, address: '', password };
      users.push(newUser);
      saveUsersList(users);
      finalizeLogin(newUser);
      document.getElementById('register-form').reset();
    }

    function loginWithDemo() {
      const demo = getUsersList().find(u => u.email === 'ana.demo@cajitasnavidenas.com');
      if (demo) finalizeLogin(demo);
    }

    function finalizeLogin(user) {
      appState.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.SESSION, user.email);

      document.getElementById('checkout-name').value = user.name || '';
      document.getElementById('checkout-whatsapp').value = user.whatsapp || '';
      if (user.address) document.getElementById('checkout-address').value = user.address;

      closeAuthModal();
      refreshAuthHeaderUI();
      showToast(`¡Bienvenido/a, ${user.name.split(' ')[0]}!`, 'Tus datos y pedidos están sincronizados.');
    }

    function handleLogout() {
      appState.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      refreshAuthHeaderUI();
      showToast('Sesión cerrada', 'Has salido de tu cuenta correctamente.');
    }

    // Modal Mis Pedidos y Mi Perfil
    function openAccountModal(tab) {
      if (!appState.currentUser) {
        openAuthModal('login');
        return;
      }
      document.getElementById('user-dropdown').classList.add('hidden');

      const user = appState.currentUser;
      document.getElementById('acct-avatar').textContent = getInitials(user.name);
      document.getElementById('acct-name').textContent = user.name;
      document.getElementById('acct-email').textContent = user.email;

      document.getElementById('prof-name').value = user.name || '';
      document.getElementById('prof-email').value = user.email || '';
      document.getElementById('prof-whatsapp').value = user.whatsapp || '';
      document.getElementById('prof-address').value = user.address || '';

      renderOrdersHistory();
      switchAccountTab(tab || 'orders');
      document.getElementById('account-modal').classList.remove('hidden');
    }

    function closeAccountModal() {
      document.getElementById('account-modal').classList.add('hidden');
    }

    function switchAccountTab(tab) {
      const ordersView = document.getElementById('acct-orders-view');
      const profileView = document.getElementById('acct-profile-view');
      const tabOrders = document.getElementById('acct-tab-orders');
      const tabProfile = document.getElementById('acct-tab-profile');

      if (tab === 'orders') {
        ordersView.classList.remove('hidden');
        profileView.classList.add('hidden');
        tabOrders.classList.add('active');
        tabProfile.classList.remove('active');
      } else {
        ordersView.classList.add('hidden');
        profileView.classList.remove('hidden');
        tabProfile.classList.add('active');
        tabOrders.classList.remove('active');
      }
    }

    function renderOrdersHistory() {
      const container = document.getElementById('acct-orders-view');
      const orders = getOrdersByEmail(appState.currentUser.email);

      if (orders.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 32px 16px;">
            <p style="font-weight: 700; color: var(--forest-900); margin-bottom: 6px;">Aún no tienes pedidos guardados</p>
            <p style="font-size: 0.84rem; color: var(--forest-600);">Cuando confirmes una compra con tu cuenta iniciada, aparecerá aquí.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(order => `
        <div class="order-history-card">
          <div class="order-card-top">
            <div>
              <strong style="color: var(--forest-900); font-size: 0.95rem;">#${escapeHtml(order.orderNumber)}</strong>
              <span class="order-status-badge">${escapeHtml(order.status)}</span>
              <div style="font-size: 0.76rem; color: var(--forest-600); margin-top: 3px;">${escapeHtml(order.date)}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.72rem; color: var(--forest-600); display: block;">Total pagado</span>
              <strong style="font-size: 1.2rem; color: var(--terracotta-600);">$${order.total}</strong>
            </div>
          </div>

          <div>
            ${order.items.map(it => `
              <div class="order-line-item">
                <span><strong>${it.qty}x ${escapeHtml(it.name)}</strong> (${it.packaging === 'eco' ? 'Ecológico' : 'Estándar'}) — Para: <em>${escapeHtml(it.recipientName)}</em></span>
                <strong style="color: var(--forest-900);">$${it.lineTotal}</strong>
              </div>
            `).join('')}
          </div>

          <div style="font-size: 0.78rem; color: var(--forest-600); margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--cream-200);">
            📍 Entrega en: ${escapeHtml(order.address)}
          </div>
        </div>
      `).join('');
    }

    function handleSaveProfile(event) {
      event.preventDefault();
      if (!appState.currentUser) return;

      const name = document.getElementById('prof-name').value.trim();
      const whatsapp = document.getElementById('prof-whatsapp').value.trim();
      const address = document.getElementById('prof-address').value.trim();

      const users = getUsersList();
      const idx = users.findIndex(u => u.email === appState.currentUser.email);
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].whatsapp = whatsapp;
        users[idx].address = address;
        saveUsersList(users);
        appState.currentUser = users[idx];
      }

      document.getElementById('acct-avatar').textContent = getInitials(name);
      document.getElementById('acct-name').textContent = name;
      document.getElementById('checkout-name').value = name;
      document.getElementById('checkout-whatsapp').value = whatsapp;
      if (address) document.getElementById('checkout-address').value = address;

      refreshAuthHeaderUI();
      showToast('Perfil actualizado', 'Tus datos de entrega se han guardado con éxito.');
    }

    // =====================================================================
    // CATÁLOGO Y PERSONALIZADOR EN VIVO
    // =====================================================================
    function renderCatalogGrid() {
      const grid = document.getElementById('catalog-grid');
      grid.innerHTML = Object.values(BOX_CATALOG).map(box => `
        <article class="product-card">
          <div>
            <div class="product-media">
              <img
                src="${box.image}"
                onerror="this.onerror=null;this.src='${box.fallback}';"
                alt="${box.name}"
              />
              <div class="product-media-overlay"></div>
              <span class="product-ideal-badge">${box.idealFor}</span>
              <div class="product-tags-row">
                ${box.tags.map(t => `<span class="product-mini-tag">${t}</span>`).join('')}
              </div>
            </div>

            <div class="product-content">
              <div class="product-title-row">
                <h3 class="product-name">${box.name}</h3>
                <span class="product-price-label">Desde <strong>$${box.price}</strong></span>
              </div>
              <p class="product-desc">
                ${box.description}. <span style="color: var(--forest-600); font-weight: 600;">${box.idealFor}.</span>
              </p>
            </div>
          </div>

          <div class="product-action">
            <button type="button" class="btn-choose-box" onclick="selectBoxAndScroll('${box.id}')">
              <span>✦ Elegir / Personalizar</span>
            </button>
          </div>
        </article>
      `).join('');
    }

    function selectBoxAndScroll(modelId) {
      selectCustomizerModel(modelId);
      document.getElementById('personalizar').scrollIntoView({ behavior: 'smooth' });
    }

    function selectCustomizerModel(modelId) {
      appState.selectedModel = modelId;
      document.querySelectorAll('.model-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-model') === modelId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      updateCustomizerPreview();
    }

    function setQuickMessage(text) {
      document.getElementById('input-card-message').value = text;
      updateCustomizerPreview();
    }

    function updateCustomizerPreview() {
      const box = BOX_CATALOG[appState.selectedModel];
      const msg = document.getElementById('input-card-message').value;
      const recipient = document.getElementById('input-recipient-name').value;
      const pack = document.querySelector('input[name="packaging"]:checked').value;

      document.getElementById('char-counter').textContent = `${msg.length} / 140`;

      const photo = document.getElementById('preview-photo');
      if (photo.getAttribute('data-model') !== box.id) {
        photo.src = box.image;
        photo.onerror = function () {
          this.onerror = null;
          this.src = box.fallback;
        };
        photo.setAttribute('data-model', box.id);
      }

      document.getElementById('preview-ideal-text').textContent = box.idealFor;
      document.getElementById('preview-box-title').textContent = box.name;
      document.getElementById('preview-box-desc').textContent = box.description;

      document.getElementById('preview-recipient-name').textContent =
        recipient.trim() !== '' ? recipient.trim() : 'Tu persona especial';

      document.getElementById('preview-card-message').textContent =
        msg.trim() !== ''
          ? `“${msg.trim()}”`
          : '“¡Feliz Navidad! Que esta cajita llene tus días de alegría, paz y momentos dulces.”';

      const stage = document.getElementById('preview-stage');
      const badge = document.getElementById('preview-pack-badge');
      const ecoRibbon = document.getElementById('preview-eco-ribbon');
      const cardStd = document.getElementById('pack-card-std');
      const cardEco = document.getElementById('pack-card-eco');

      let unitPrice = box.price;

      if (pack === 'eco') {
        unitPrice += ECO_EXTRA;
        stage.classList.add('eco-border');
        badge.classList.add('eco-active');
        badge.textContent = 'Empaque Ecológico (+$3)';
        ecoRibbon.classList.remove('hidden');
        cardEco.classList.add('selected');
        cardStd.classList.remove('selected');
      } else {
        stage.classList.remove('eco-border');
        badge.classList.remove('eco-active');
        badge.textContent = 'Empaque Estándar';
        ecoRibbon.classList.add('hidden');
        cardStd.classList.add('selected');
        cardEco.classList.remove('selected');
      }

      document.getElementById('preview-unit-price').textContent = `$${unitPrice}`;
      document.getElementById('btn-add-unit-price').textContent = `$${unitPrice}`;
    }

    // =====================================================================
    // CARRITO LATERAL (DRAWER) Y CHECKOUT
    // =====================================================================
    function getItemUnitPrice(item) {
      return item.basePrice + (item.packaging === 'eco' ? ECO_EXTRA : 0);
    }

    function addConfiguredBoxToCart() {
      const box = BOX_CATALOG[appState.selectedModel];
      const msg = document.getElementById('input-card-message').value.trim();
      const recipient = document.getElementById('input-recipient-name').value.trim();
      const pack = document.querySelector('input[name="packaging"]:checked').value;

      appState.cart.push({
        uid: 'item-' + Date.now(),
        modelId: box.id,
        name: box.name,
        image: box.image,
        fallback: box.fallback,
        basePrice: box.price,
        packaging: pack,
        message: msg || '¡Feliz Navidad!',
        recipientName: recipient || 'Sin nombre grabado',
        qty: 1
      });

      renderCartAndSummary();
      showToast('¡Agregado al carrito!', `${box.name} (${pack === 'eco' ? 'Empaque ecológico' : 'Estándar'})`);
      toggleCartDrawer(true);
    }

    function renderCartAndSummary() {
      const drawerList = document.getElementById('drawer-items-list');
      const checkoutList = document.getElementById('checkout-summary-list');
      const totalCount = appState.cart.reduce((sum, it) => sum + it.qty, 0);

      document.getElementById('header-cart-count').textContent = totalCount;

      if (appState.cart.length === 0) {
        const emptyMsg = `
          <div style="text-align: center; padding: 44px 16px;">
            <p style="font-weight: 700; color: var(--forest-900); margin-bottom: 6px;">Tu carrito navideño está vacío</p>
            <p style="font-size: 0.84rem; color: var(--forest-600);">Elige un modelo de cajita y personalízalo para comenzar.</p>
          </div>
        `;
        drawerList.innerHTML = emptyMsg;
        checkoutList.innerHTML = emptyMsg;
        updateTotals(0);
        return;
      }

      drawerList.innerHTML = appState.cart.map(item => {
        const lineTotal = getItemUnitPrice(item) * item.qty;
        const boxInfo = BOX_CATALOG[item.modelId];
        const subText = item.packaging === 'eco' ? 'Dedicatoria + empaque ecológico' : boxInfo.description;

        return `
          <div class="cart-item-card">
            <img
              src="${item.image}"
              onerror="this.onerror=null;this.src='${item.fallback}';"
              alt="${item.name}"
              class="cart-item-thumb"
            />
            <div class="cart-item-info">
              <div class="cart-item-top">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${lineTotal}</span>
              </div>
              <div class="cart-item-sub">${subText}</div>
              <div class="cart-item-meta">
                <strong>Para:</strong> ${escapeHtml(item.recipientName)} • <em>“${escapeHtml(item.message)}”</em>
              </div>
              <div class="cart-item-controls">
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" onclick="changeItemQty('${item.uid}', -1)">−</button>
                  <span class="qty-value">${item.qty}</span>
                  <button type="button" class="qty-btn" onclick="changeItemQty('${item.uid}', 1)">+</button>
                </div>
                <button type="button" class="btn-remove-item" onclick="removeItemFromCart('${item.uid}')">
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      checkoutList.innerHTML = appState.cart.map(item => {
        const lineTotal = getItemUnitPrice(item) * item.qty;
        return `
          <div class="checkout-item-row">
            <div class="checkout-item-left">
              <img
                src="${item.image}"
                onerror="this.onerror=null;this.src='${item.fallback}';"
                alt="${item.name}"
                class="checkout-thumb"
              />
              <div style="min-width: 0;">
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--forest-900);">
                  ${item.name} <span style="font-weight: 500; color: var(--forest-600);">x${item.qty}</span>
                </div>
                <div style="font-size: 0.76rem; color: var(--forest-600); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${item.packaging === 'eco' ? 'Empaque ecológico' : 'Empaque estándar'} • Para: ${escapeHtml(item.recipientName)}
                </div>
              </div>
            </div>
            <strong style="font-size: 0.95rem; color: var(--forest-900);">$${lineTotal}</strong>
          </div>
        `;
      }).join('');

      const subtotal = appState.cart.reduce((sum, it) => sum + getItemUnitPrice(it) * it.qty, 0);
      updateTotals(subtotal);
    }

    function updateTotals(subtotal) {
      const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
      const total = subtotal + shipping;

      document.getElementById('drawer-subtotal').textContent = `$${subtotal}`;
      document.getElementById('drawer-shipping').textContent = `$${shipping}`;
      document.getElementById('drawer-total').textContent = `$${total}`;

      document.getElementById('checkout-subtotal').textContent = `$${subtotal}`;
      document.getElementById('checkout-shipping').textContent = `$${shipping}`;
      document.getElementById('checkout-total').textContent = `$${total}`;
    }

    function changeItemQty(uid, delta) {
      const idx = appState.cart.findIndex(i => i.uid === uid);
      if (idx === -1) return;
      appState.cart[idx].qty += delta;
      if (appState.cart[idx].qty <= 0) {
        appState.cart.splice(idx, 1);
      }
      renderCartAndSummary();
    }

    function removeItemFromCart(uid) {
      appState.cart = appState.cart.filter(i => i.uid !== uid);
      renderCartAndSummary();
    }

    function toggleCartDrawer(open) {
      const overlay = document.getElementById('cart-overlay');
      const drawer = document.getElementById('cart-drawer');
      if (open) {
        overlay.classList.add('open');
        drawer.classList.add('open');
      } else {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
      }
    }

    function proceedToCheckout() {
      toggleCartDrawer(false);
      setTimeout(() => {
        document.getElementById('checkout-section').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('checkout-name').focus();
      }, 220);
    }

    function togglePaymentMethod(method) {
      const cardBox = document.getElementById('payment-card-box');
      const transferBox = document.getElementById('payment-transfer-box');
      const lblCard = document.getElementById('pay-label-card');
      const lblTransfer = document.getElementById('pay-label-transfer');

      if (method === 'card') {
        cardBox.classList.remove('hidden');
        transferBox.classList.add('hidden');
        lblCard.classList.add('active');
        lblTransfer.classList.remove('active');
      } else {
        cardBox.classList.add('hidden');
        transferBox.classList.remove('hidden');
        lblTransfer.classList.add('active');
        lblCard.classList.remove('active');
      }
    }

    function copyBankAccount() {
      const text = document.getElementById('bank-account-number').textContent;
      const temp = document.createElement('input');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast('Cuenta copiada', text);
    }

    function handleConfirmOrder(event) {
      event.preventDefault();

      if (appState.cart.length === 0) {
        showToast('Carrito vacío', 'Agrega al menos una cajita antes de confirmar tu pedido.');
        return;
      }

      const name = document.getElementById('checkout-name').value.trim();
      const address = document.getElementById('checkout-address').value.trim();
      const whatsapp = document.getElementById('checkout-whatsapp').value.trim();

      const subtotal = appState.cart.reduce((sum, it) => sum + getItemUnitPrice(it) * it.qty, 0);
      const total = subtotal + SHIPPING_FEE;
      const orderNumber = 'NAV-' + Math.floor(1000 + Math.random() * 9000);

      const historyNotice = document.getElementById('confirm-history-notice');

      if (appState.currentUser) {
        const now = new Date();
        const formattedDate =
          now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        storeOrderForEmail(appState.currentUser.email, {
          orderNumber,
          date: formattedDate,
          status: 'En preparación',
          total,
          address,
          items: appState.cart.map(it => ({
            name: it.name,
            qty: it.qty,
            packaging: it.packaging,
            recipientName: it.recipientName,
            lineTotal: getItemUnitPrice(it) * it.qty
          }))
        });

        refreshAuthHeaderUI();
        historyNotice.classList.remove('hidden');
      } else {
        historyNotice.classList.add('hidden');
      }

      document.getElementById('confirm-order-id').textContent = orderNumber;
      document.getElementById('confirm-name').textContent = name;
      document.getElementById('confirm-whatsapp').textContent = whatsapp;
      document.getElementById('confirm-address').textContent = address;
      document.getElementById('confirm-total').textContent = `$${total}`;

      document.getElementById('confirmation-modal').classList.remove('hidden');
    }

    function closeConfirmationModal() {
      document.getElementById('confirmation-modal').classList.add('hidden');
      document.getElementById('checkout-form').reset();

      if (appState.currentUser) {
        document.getElementById('checkout-name').value = appState.currentUser.name || '';
        document.getElementById('checkout-whatsapp').value = appState.currentUser.whatsapp || '';
        if (appState.currentUser.address) {
          document.getElementById('checkout-address').value = appState.currentUser.address;
        }
      }

      togglePaymentMethod('card');
      appState.cart = [];
      renderCartAndSummary();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Utilidades
    let toastTimer;
    function showToast(title, desc) {
      const toast = document.getElementById('toast-banner');
      document.getElementById('toast-title').textContent = title;
      document.getElementById('toast-desc').textContent = desc;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3200);
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str || '';
      return div.innerHTML;
    }
