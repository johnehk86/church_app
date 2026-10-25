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
        <div class="category-filter" id="category-filter"></div>
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

    await Promise.all([this._renderCategoryChips(), this.loadStores()]);
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

  _getOrderedCategories() {
    if (!this._categoryOrder) {
      const counts = this._getClickCounts();
      const rest = Utils.categories.filter(c => c !== '전체')
        .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
      this._categoryOrder = ['전체', ...rest];
    }
    return this._categoryOrder;
  },

  async _renderCategoryChips() {
    const stores = await StoreService.getPublic();
    const used = new Set(stores.map(s => s.category));
    const el = document.getElementById('category-filter');
    if (!el) return;
    el.innerHTML = this._getOrderedCategories()
      .filter(c => c === '전체' || used.has(c) || c === this._selectedCategory)
      .map(cat => `
        <button class="category-chip ${cat === this._selectedCategory ? 'category-chip--active' : ''}"
                onclick="HomePage.filterByCategory('${cat}')">
          ${cat}
        </button>`).join('');
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
