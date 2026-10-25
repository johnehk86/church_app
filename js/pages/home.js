/**
 * 홈 - 매장 목록 (에디토리얼 스타일, Firebase 비동기)
 */
const HomePage = {
  _selectedCategory: '전체',
  _searchQuery: '',
  _searchTimeout: null,

  async render(container) {
    container.innerHTML = `
      <div class="page">
        <div class="search-bar">
          <input class="search-bar__input" type="text" placeholder="Search curated stores..."
                 value="${Utils.escapeHtml(this._searchQuery)}"
                 oninput="HomePage.onSearch(this.value)">
          <span class="material-symbols-outlined search-bar__icon">filter_list</span>
        </div>
        <header style="margin-bottom:24px">
          <h2 class="headline-md">Discover</h2>
          <p class="label-caps" style="margin-top:6px;margin-bottom:0">성도 매장 둘러보기</p>
        </header>
        <div style="display:flex;gap:8px;align-items:flex-start">
          <div class="category-filter" id="category-filter" style="flex:1;min-width:0"></div>
          <button onclick="HomePage.openOrderEditor()" title="카테고리 순서 바꾸기"
                  style="flex-shrink:0;display:flex;align-items:center;gap:2px;padding:8px 10px;border:1px solid var(--outline-variant);border-radius:20px;background:var(--surface,#fff);color:var(--secondary);font-size:0.8125rem;cursor:pointer">
            <span class="material-symbols-outlined" style="font-size:18px">swap_vert</span>순서
          </button>
        </div>
        <div id="store-list">
          <div class="loading-screen"><div class="loading-spinner"></div></div>
        </div>

        ${this._isInstalled() ? '' : `
        <button onclick="InstallHelper.triggerInstall()" style="margin-top:32px;width:100%;background:var(--surface-container-high);border:none;border-radius:20px;padding:28px 20px;cursor:pointer;text-align:center;display:block">
          <span class="material-symbols-outlined" style="font-size:2rem;color:var(--primary);display:block;margin-bottom:10px">install_mobile</span>
          <div style="font-weight:700;font-size:1rem;color:var(--primary);margin-bottom:4px">앱으로 설치하기</div>
          <div style="font-size:0.8125rem;color:var(--secondary)">버튼 하나로 홈 화면에 추가!</div>
        </button>`}
      </div>
    `;

    this._renderCategoryChips();
    await this.loadStores();
  },

  // 순서는 앱을 열 때 한 번만 정해서, 보는 도중에는 칩이 움직이지 않게 함
  _categoryOrder: null,

  _getClickCounts() {
    try { return JSON.parse(localStorage.getItem('category-clicks')) || {}; } catch (_) { return {}; }
  },

  _recordClick(category) {
    if (category === '전체') return;
    try {
      const counts = this._getClickCounts();
      counts[category] = (counts[category] || 0) + 1;
      localStorage.setItem('category-clicks', JSON.stringify(counts));
    } catch (_) {}
  },

  // 사용자가 직접 정한 순서 (없으면 null → 자주 누른 순)
  _getCustomOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem('category-order'));
      if (!Array.isArray(saved)) return null;
      const valid = Utils.categories.filter(c => c !== '전체');
      // 나중에 추가된 카테고리는 뒤에 붙이고, 없어진 카테고리는 제거
      return [...saved.filter(c => valid.includes(c)), ...valid.filter(c => !saved.includes(c))];
    } catch (_) { return null; }
  },

  _getOrderedCategories() {
    if (!this._categoryOrder) {
      let rest = this._getCustomOrder();
      if (!rest) {
        const counts = this._getClickCounts();
        rest = Utils.categories.filter(c => c !== '전체')
          .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
      }
      this._categoryOrder = ['전체', ...rest];
    }
    return this._categoryOrder;
  },

  _renderCategoryChips() {
    const el = document.getElementById('category-filter');
    if (!el) return;
    el.innerHTML = this._getOrderedCategories().map(cat => `
        <button class="category-chip ${cat === this._selectedCategory ? 'category-chip--active' : ''} ${cat === '전체' ? 'category-chip--fixed' : ''}"
                data-cat="${cat}" onclick="HomePage.filterByCategory('${cat}')">
          ${cat}
        </button>`).join('');
    this._enableChipDrag(el);
  },

  // 꾹 누르기(0.3초) 후에만 드래그 시작 → 그냥 좌우로 넘기는 스크롤과 구분
  _enableChipDrag(el) {
    if (typeof Sortable === 'undefined' || Sortable.get(el)) return;
    Sortable.create(el, {
      delay: 300,
      touchStartThreshold: 6,
      forceFallback: true,
      fallbackTolerance: 3,
      animation: 180,
      filter: '.category-chip--fixed',
      preventOnFilter: false,
      chosenClass: 'category-chip--lifted',
      ghostClass: 'category-chip--ghost',
      onMove: (evt) => !evt.related.classList.contains('category-chip--fixed'),
      onChoose: () => { try { navigator.vibrate?.(15); } catch (_) {} },
      onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const order = [...el.querySelectorAll('[data-cat]')].map(b => b.dataset.cat).filter(c => c !== '전체');
        try { localStorage.setItem('category-order', JSON.stringify(order)); } catch (_) {}
        this._categoryOrder = ['전체', ...order];
        Toast.show('순서를 저장했어요.', 'success');
      }
    });
  },

  // --- 순서 편집 (▲▼ 버튼 방식: 드래그는 좌우 스크롤과 겹쳐 어르신들께 어려움) ---
  _editOrder: [],

  openOrderEditor() {
    this._editOrder = this._getOrderedCategories().filter(c => c !== '전체');
    const modal = document.createElement('div');
    modal.id = 'category-order-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center';
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.innerHTML = `
      <div style="background:var(--surface,#fff);border-radius:24px 24px 0 0;width:100%;max-width:480px;max-height:85vh;display:flex;flex-direction:column">
        <div style="padding:20px 20px 8px">
          <h3 style="font-size:1.125rem;font-weight:700">카테고리 순서 바꾸기</h3>
          <p style="font-size:0.8125rem;color:var(--secondary);margin-top:4px">▲▼ 버튼으로 자주 쓰는 카테고리를 위로 올려주세요. '전체'는 항상 맨 앞이에요.<br>💡 홈 화면에서 카테고리를 <strong>꾹 누른 채 옆으로 끌어도</strong> 순서를 바꿀 수 있어요.</p>
        </div>
        <div id="category-order-list" style="overflow-y:auto;padding:4px 20px;flex:1"></div>
        <div style="padding:12px 20px 28px;display:flex;flex-direction:column;gap:8px">
          <button class="btn btn--primary" onclick="HomePage.saveOrder()">완료</button>
          <button class="btn btn--ghost" onclick="HomePage.resetOrder()" style="font-size:0.8125rem;color:var(--secondary)">자주 누른 순서로 자동 정렬하기</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    this._renderOrderList();
  },

  _renderOrderList() {
    const list = document.getElementById('category-order-list');
    if (!list) return;
    const btn = (i, dir, icon, disabled) => `
      <button onclick="HomePage.moveCategory(${i}, ${dir})" ${disabled ? 'disabled' : ''}
              style="width:44px;height:44px;border:1px solid var(--outline-variant);border-radius:10px;background:var(--surface,#fff);cursor:pointer;opacity:${disabled ? 0.3 : 1}">
        <span class="material-symbols-outlined">${icon}</span>
      </button>`;
    list.innerHTML = this._editOrder.map((cat, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--outline-variant)">
        <span style="width:22px;text-align:center;color:var(--secondary);font-size:0.8125rem">${i + 1}</span>
        <span class="material-symbols-outlined" style="color:var(--accent)">${Utils.categoryIcons[cat] || 'storefront'}</span>
        <span style="flex:1;font-weight:600">${cat}</span>
        ${btn(i, -1, 'arrow_upward', i === 0)}
        ${btn(i, 1, 'arrow_downward', i === this._editOrder.length - 1)}
      </div>`).join('');
  },

  moveCategory(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= this._editOrder.length) return;
    [this._editOrder[i], this._editOrder[j]] = [this._editOrder[j], this._editOrder[i]];
    this._renderOrderList();
  },

  saveOrder() {
    try { localStorage.setItem('category-order', JSON.stringify(this._editOrder)); } catch (_) {}
    this._categoryOrder = null;
    document.getElementById('category-order-modal')?.remove();
    this._renderCategoryChips();
    Toast.show('카테고리 순서를 저장했어요.', 'success');
  },

  resetOrder() {
    try { localStorage.removeItem('category-order'); } catch (_) {}
    this._categoryOrder = null;
    document.getElementById('category-order-modal')?.remove();
    this._renderCategoryChips();
    Toast.show('자주 누른 순서로 정렬해요.', 'info');
  },

  async loadStores() {
    let stores;
    if (this._searchQuery) {
      stores = await StoreService.search(this._searchQuery);
    } else {
      stores = await StoreService.getByCategory(this._selectedCategory);
    }
    this.renderStoreList(stores);
  },

  renderStoreList(stores) {
    const listEl = document.getElementById('store-list');
    if (!listEl) return;

    if (stores.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-state__icon" style="font-size:3rem">storefront</span>
          <h3 class="empty-state__title">${this._searchQuery ? '검색 결과가 없습니다' : '등록된 매장이 없습니다'}</h3>
          <p class="empty-state__desc">${this._searchQuery ? '다른 검색어로 시도해보세요' : '아직 등록된 매장이 없습니다'}</p>
        </div>
      `;
      return;
    }

    let html = '';
    if (stores.length >= 2 && !this._searchQuery && this._selectedCategory === '전체') {
      html += `<div class="store-grid" style="margin-bottom:24px">`;
      html += StoreCard.renderFeatured(stores[0]);
      html += StoreCard.renderFeatured(stores[1]);
      html += `</div>`;
      if (stores.length > 2) {
        html += `<div style="margin-bottom:24px"><h3 class="headline-sm" style="margin-bottom:16px">All Stores</h3></div>`;
        for (let i = 2; i < stores.length; i++) html += StoreCard.render(stores[i]);
      }
    } else {
      stores.forEach(store => { html += StoreCard.render(store); });
    }
    listEl.innerHTML = html;
  },

  filterByCategory(category) {
    if (category !== this._selectedCategory) this._recordClick(category);
    this._selectedCategory = category;
    this._searchQuery = '';
    this.render(document.getElementById('app-content'));
  },

  onSearch(query) {
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this._searchQuery = query;
      this.loadStores();
    }, 300);
  },

  _isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  },

  destroy() { clearTimeout(this._searchTimeout); }
};
