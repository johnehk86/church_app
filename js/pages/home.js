/**
 * 홈 - 매장 목록 (에디토리얼 스타일)
 */
const HomePage = {
  _selectedCategory: '전체',
  _searchQuery: '',
  _searchTimeout: null,

  render(container) {
    const categoryChips = Utils.categories.map(cat => `
      <button class="category-chip ${cat === this._selectedCategory ? 'category-chip--active' : ''}"
              onclick="HomePage.filterByCategory('${cat}')">
        ${cat}
      </button>
    `).join('');

    container.innerHTML = `
      <div class="page">
        <!-- 검색 -->
        <div class="search-bar">
          <input class="search-bar__input" type="text" placeholder="Search curated stores..."
                 value="${Utils.escapeHtml(this._searchQuery)}"
                 oninput="HomePage.onSearch(this.value)">
          <span class="material-symbols-outlined search-bar__icon">filter_list</span>
        </div>

        <!-- 섹션 헤더 -->
        <header style="margin-bottom:24px">
          <p class="label-caps" style="margin-bottom:6px">EXPLORE COLLECTIONS</p>
          <h2 class="headline-md">Discover</h2>
        </header>

        <!-- 카테고리 필터 -->
        <div class="category-filter">${categoryChips}</div>

        <!-- 매장 목록 -->
        <div id="store-list">
          <div class="loading-screen"><div class="loading-spinner"></div></div>
        </div>
      </div>
    `;

    this.loadStores();
  },

  loadStores() {
    let stores;
    if (this._searchQuery) {
      stores = StoreService.search(this._searchQuery);
    } else {
      stores = StoreService.getByCategory(this._selectedCategory);
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

    // 첫 2개는 피처드 그리드, 나머지는 일반 카드
    let html = '';

    if (stores.length >= 2 && !this._searchQuery && this._selectedCategory === '전체') {
      html += `<div class="store-grid" style="margin-bottom:24px">`;
      html += StoreCard.renderFeatured(stores[0]);
      html += StoreCard.renderFeatured(stores[1]);
      html += `</div>`;

      // 에디토리얼 섹션
      if (stores.length > 2) {
        html += `
          <div style="margin-bottom:24px">
            <h3 class="headline-sm" style="margin-bottom:16px">All Stores</h3>
          </div>
        `;
        for (let i = 2; i < stores.length; i++) {
          html += StoreCard.render(stores[i]);
        }
      }
    } else {
      stores.forEach(store => {
        html += StoreCard.render(store);
      });
    }

    listEl.innerHTML = html;
  },

  filterByCategory(category) {
    this._selectedCategory = category;
    this._searchQuery = '';
    const content = document.getElementById('app-content');
    this.render(content);
  },

  onSearch(query) {
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this._searchQuery = query;
      this.loadStores();
    }, 300);
  },

  destroy() {
    clearTimeout(this._searchTimeout);
  }
};
