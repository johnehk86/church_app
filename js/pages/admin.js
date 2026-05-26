/**
 * 관리자 페이지 - 사용자 역할 관리 + 매장 관리
 */
const AdminPage = {
  _activeTab: 'users',

  render(container) {
    const content = this._activeTab === 'users' ? this._renderUsers() : this._renderStores();

    container.innerHTML = `
      <div class="page">
        <div class="admin-tabs">
          <button class="admin-tab ${this._activeTab === 'users' ? 'admin-tab--active' : ''}"
                  onclick="AdminPage.switchTab('users')">
            &#128100; 사용자 관리
          </button>
          <button class="admin-tab ${this._activeTab === 'stores' ? 'admin-tab--active' : ''}"
                  onclick="AdminPage.switchTab('stores')">
            &#127978; 매장 관리
          </button>
        </div>
        <div id="admin-content">${content}</div>
      </div>
    `;
  },

  switchTab(tab) {
    this._activeTab = tab;
    const container = document.getElementById('app-content');
    this.render(container);
  },

  _renderUsers() {
    const users = AuthService.getAllUsers();
    if (users.length === 0) {
      return `<div class="empty-state"><div class="empty-state__icon">&#128100;</div><h3 class="empty-state__title">등록된 사용자가 없습니다</h3></div>`;
    }

    const roleLabels = { master: '관리자', business: '사업자', member: '일반 성도' };

    return `
      <p style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:12px">
        총 ${users.length}명의 사용자
      </p>
      ${users.map(user => `
        <div class="user-list-item">
          <div class="user-list-item__info">
            <div class="user-list-item__name">${Utils.escapeHtml(user.name || user.id)}</div>
            <div class="user-list-item__email">${Utils.escapeHtml(user.email || user.id)}</div>
          </div>
          <select class="form-select" style="width:auto;padding:6px 32px 6px 10px;font-size:0.8125rem"
                  onchange="AdminPage.changeRole('${Utils.escapeHtml(user.id)}', this.value)">
            <option value="member" ${user.role === 'member' ? 'selected' : ''}>일반 성도</option>
            <option value="business" ${user.role === 'business' ? 'selected' : ''}>사업자</option>
            <option value="master" ${user.role === 'master' ? 'selected' : ''}>관리자</option>
          </select>
        </div>
      `).join('')}
    `;
  },

  _renderStores() {
    const stores = StoreService.getAll();
    if (stores.length === 0) {
      return `<div class="empty-state"><div class="empty-state__icon">&#127978;</div><h3 class="empty-state__title">등록된 매장이 없습니다</h3></div>`;
    }

    return `
      <p style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:12px">
        총 ${stores.length}개 매장
      </p>
      ${stores.map(store => `
        <div class="user-list-item">
          <div class="user-list-item__info" style="cursor:pointer" onclick="App.navigate('#/store/${store.id}')">
            <div class="user-list-item__name">
              ${Utils.categoryIcons[store.category] || '📦'} ${Utils.escapeHtml(store.name)}
            </div>
            <div class="user-list-item__email">
              ${Utils.escapeHtml(store.ownerName || '')} | ${Utils.escapeHtml(store.category || '')}
            </div>
          </div>
          <button class="btn btn--danger btn--small" onclick="AdminPage.deleteStore('${store.id}', '${Utils.escapeHtml(store.name).replace(/'/g, "\\'")}')">삭제</button>
        </div>
      `).join('')}
    `;
  },

  changeRole(userId, newRole) {
    AuthService.updateUserRole(userId, newRole);
    const container = document.getElementById('app-content');
    this.render(container);
  },

  deleteStore(storeId, storeName) {
    if (!confirm(`"${storeName}" 매장을 정말 삭제하시겠습니까?`)) return;
    StoreService.delete(storeId);
    Toast.show('매장이 삭제되었습니다.', 'success');
    const container = document.getElementById('app-content');
    this.render(container);
  },

  destroy() {}
};
