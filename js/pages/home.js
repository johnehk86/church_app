/**
 * 홈 - 매장 목록 (Yelp 스타일)
 */
const HomePage = {
  _selectedCategory: '전체',
  _searchQuery: '',
  _searchTimeout: null,

  async render(container) {
    const categoryChips = Utils.categories.map(cat => `
      <button class="category-chip ${cat === this._selectedCategory ? 'category-chip--active' : ''}"
              onclick="HomePage.filterByCategory('${cat}')">
        ${cat}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="page">

        <!-- 검색바 -->
        <div class="search-bar">
          <input class="search-bar__input" type="text" placeholder="매장 이름, 업종 검색..."
                 value="${Utils.escapeHtml(this._searchQuery)}"
                 oninput="HomePage.onSearch(this.value)">
          <span class="material-symbols-outlined search-bar__icon">search</span>
        </div>

        <!-- 카테고리 필터 -->
        <div class="category-filter">${categoryChips}</div>

        <!-- 매장 목록 -->
        <div id="store-list">
          <div class="loading-screen"><div class="loading-spinner"></div></div>
        </div>

        <!-- 앱 설치 배너 -->
        <div style="padding:16px;background:var(--surface-dim)">
          <div style="background:var(--primary);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer"
               onclick="App.navigate('#/install')">
            <span class="material-symbols-outlined" style="color:white;font-size:28px">install_mobile</span>
            <div>
              <p style="color:white;font-weight:700;font-size:0.9375rem">앱으로 설치하기</p>
              <p style="color:rgba(255,255,255,0.75);font-size:0.8125rem;margin-top:2px">홈 화면에 추가하면 더 빠르게!</p>
            </div>
            <span class="material-symbols-outlined" style="color:rgba(255,255,255,0.7);margin-left:auto">chevron_right</span>
          </div>
        </div>

      </div>
    `;

    await this.loadStores();
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
          <span class="material-symbols-outlined empty-state__icon">storefront</span>
          <h3 class="empty-state__title">${this._searchQuery ? '검색 결과가 없습니다' : '등록된 매장이 없습니다'}</h3>
          <p class="empty-state__desc">${this._searchQuery ? '다른 검색어로 시도해보세요' : '아직 등록된 매장이 없습니다'}</p>
        </div>
      `;
      return;
    }

    const label = this._searchQuery
      ? `"${Utils.escapeHtml(this._searchQuery)}" 검색결과`
      : this._selectedCategory === '전체' ? '전체 매장' : Utils.escapeHtml(this._selectedCategory);

    listEl.innerHTML = `
      <p class="store-count">${label} ${stores.length}곳</p>
      <div class="store-list">
        ${stores.map(store => StoreCard.render(store)).join('')}
      </div>
    `;
  },

  filterByCategory(category) {
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

  destroy() { clearTimeout(this._searchTimeout); }
};
