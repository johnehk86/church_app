/**
 * 관리자 페이지 (Firebase 비동기)
 */
const AdminPage = {
  _activeTab: 'users',

  async render(container) {
    container.innerHTML = `
      <div class="page">
        <div class="admin-tabs">
          <button class="admin-tab ${this._activeTab === 'users' ? 'admin-tab--active' : ''}" onclick="AdminPage.switchTab('users')">
            <span class="material-symbols-outlined" style="font-size:18px">group</span> 사용자
          </button>
          <button class="admin-tab ${this._activeTab === 'stores' ? 'admin-tab--active' : ''}" onclick="AdminPage.switchTab('stores')">
            <span class="material-symbols-outlined" style="font-size:18px">storefront</span> 매장
          </button>
        </div>
        <div id="admin-content"><div class="loading-screen"><div class="loading-spinner"></div></div></div>
      </div>`;

    if (this._activeTab === 'users') await this._loadUsers();
    else await this._loadStores();
  },

  switchTab(tab) {
    this._activeTab = tab;
    this.render(document.getElementById('app-content'));
  },

  async _loadUsers() {
    const users = await AuthService.getAllUsers();
    const el = document.getElementById('admin-content');
    if (!el) return;
    if (users.length === 0) {
      el.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">group</span><h3 class="empty-state__title">등록된 사용자가 없습니다</h3></div>`;
      return;
    }
    el.innerHTML = `
      <p style="font-size:0.8125rem;color:var(--secondary);margin-bottom:12px">총 ${users.length}명</p>
      ${users.map(user => `
        <div class="user-list-item">
          <div class="user-list-item__info">
            <div class="user-list-item__name">${Utils.escapeHtml(user.name || '이름 없음')}</div>
            <div class="user-list-item__email">${Utils.escapeHtml(user.email || '')}</div>
          </div>
          <select class="form-select" style="width:auto;padding:6px 32px 6px 10px;font-size:0.8125rem"
                  onchange="AdminPage.changeRole('${user.id}', this.value)">
            <option value="member" ${user.role === 'member' ? 'selected' : ''}>일반 성도</option>
            <option value="business" ${user.role === 'business' ? 'selected' : ''}>사업자</option>
            <option value="master" ${user.role === 'master' ? 'selected' : ''}>관리자</option>
          </select>
        </div>
      `).join('')}`;
  },

  async _loadStores() {
    const stores = await StoreService.getAll();
    const el = document.getElementById('admin-content');
    if (!el) return;
    if (stores.length === 0) {
      el.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">storefront</span><h3 class="empty-state__title">등록된 매장이 없습니다</h3></div>`;
      return;
    }
    el.innerHTML = `
      <p style="font-size:0.8125rem;color:var(--secondary);margin-bottom:12px">총 ${stores.length}개</p>
      ${stores.map(store => `
        <div class="user-list-item">
          <div class="user-list-item__info" style="cursor:pointer" onclick="App.navigate('#/store/${store.id}')">
            <div class="user-list-item__name"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">${Utils.categoryIcons[store.category] || 'storefront'}</span> ${Utils.escapeHtml(store.name)}</div>
            <div class="user-list-item__email">${Utils.escapeHtml(store.ownerName || '')} | ${Utils.escapeHtml(store.category || '')}</div>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn btn--secondary btn--small" onclick="App.navigate('#/edit-store/${store.id}')">수정</button>
            <button class="btn btn--danger btn--small" onclick="AdminPage.deleteStore('${store.id}', '${Utils.escapeHtml(store.name).replace(/'/g, "\\'")}')">삭제</button>
          </div>
        </div>
      `).join('')}`;
  },

  async changeRole(userId, newRole) {
    await AuthService.updateUserRole(userId, newRole);
    await this._loadUsers();
  },

  async deleteStore(storeId, storeName) {
    if (!confirm(`"${storeName}" 매장을 정말 삭제하시겠습니까?`)) return;
    await StoreService.delete(storeId);
    Toast.show('매장이 삭제되었습니다.', 'success');
    await this._loadStores();
  },

  destroy() {}
};
