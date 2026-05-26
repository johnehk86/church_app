/**
 * 상단 헤더 - 글래스모피즘 스타일
 */
const Header = {
  render(title, showBack = false) {
    const header = document.getElementById('app-header');
    const role = AuthService.getUserRole();

    let rightAction = '<div style="width:40px"></div>'; // 공간 확보
    if (AuthService.isLoggedIn() && role === 'master') {
      rightAction = `
        <button class="app-header__action" onclick="App.navigate('#/admin')">
          <span class="material-symbols-outlined">settings</span>
        </button>`;
    }

    const leftAction = showBack
      ? `<button class="app-header__back" onclick="history.back()">
           <span class="material-symbols-outlined">arrow_back</span>
         </button>`
      : `<img src="assets/icons/church-logo.png" alt="" style="width:32px;height:32px;object-fit:contain">`;

    header.innerHTML = `
      <div class="app-header">
        ${leftAction}
        <h1 class="app-header__title">${Utils.escapeHtml(title)}</h1>
        ${rightAction}
      </div>
    `;
  }
};
