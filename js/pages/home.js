/**
 * 홈 - 매장 목록 (에디토리얼 스타일, Firebase 비동기)
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
        <div class="category-filter">${categoryChips}</div>
        <div id="store-list">
          <div class="loading-screen"><div class="loading-spinner"></div></div>
        </div>

        ${this._isInstalled() ? '' : `
        <div style="margin-top:32px;border:1.5px solid var(--outline-variant);border-radius:16px;overflow:hidden">
          <div style="padding:16px 20px;background:var(--surface-container);border-bottom:1px solid var(--outline-variant);display:flex;align-items:center;gap:10px">
            <span class="material-symbols-outlined" style="color:var(--accent);font-size:22px">install_mobile</span>
            <span style="font-weight:600;font-size:0.9375rem">앱으로 설치하면 더 편리해요!</span>
          </div>
          ${/iPhone|iPad|iPod/.test(navigator.userAgent) ? `
          <div style="padding:16px 20px">
            <p style="font-size:0.8125rem;color:var(--secondary);margin-bottom:12px">📱 아이폰 설치 방법</p>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.8125rem">
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">1</span><span><strong>사파리</strong>로 이 페이지 열기</span></div>
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">2</span><span>하단 <strong>공유 버튼 (↑)</strong> 터치</span></div>
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">3</span><span><strong>"홈 화면에 추가"</strong> 선택 후 추가</span></div>
            </div>
          </div>
          ` : `
          <div style="padding:16px 20px">
            <p style="font-size:0.8125rem;color:var(--secondary);margin-bottom:12px">📱 안드로이드 설치 방법</p>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:0.8125rem">
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">1</span><span><strong>크롬</strong>으로 이 페이지 열기</span></div>
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">2</span><span>오른쪽 상단 <strong>⋮ 메뉴</strong> 터치</span></div>
              <div style="display:flex;align-items:center;gap:10px"><span style="background:var(--accent);color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0">3</span><span><strong>"앱 설치"</strong> 선택</span></div>
            </div>
          </div>`}
        </div>`}
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
