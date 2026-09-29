/**
 * 하단 네비게이션 - 글래스모피즘 스타일
 */
const BottomNav = {
  render(activeTab) {
    const nav = document.getElementById('bottom-nav');
    const user = AuthService.getCurrentUser();
    const role = AuthService.getUserRole();

    const myPageHash = '#/login';

    nav.innerHTML = `
      <nav class="bottom-nav">
        <button class="bottom-nav__item ${activeTab === 'home' ? 'bottom-nav__item--active' : ''}"
                onclick="App.navigate('#/')">
          <span class="material-symbols-outlined ${activeTab === 'home' ? 'icon-filled' : ''}">auto_awesome</span>
          <span>홈</span>
        </button>
        <button class="bottom-nav__item ${activeTab === 'map' ? 'bottom-nav__item--active' : ''}"
                onclick="App.navigate('#/map')">
          <span class="material-symbols-outlined ${activeTab === 'map' ? 'icon-filled' : ''}">explore</span>
          <span>지도</span>
        </button>
        <button class="bottom-nav__item ${activeTab === 'my' ? 'bottom-nav__item--active' : ''}"
                onclick="App.navigate('${myPageHash}')">
          <span class="material-symbols-outlined ${activeTab === 'my' ? 'icon-filled' : ''}">person</span>
          <span>내 정보</span>
        </button>
      </nav>
    `;
  }
};
