/**
 * 앱 메인 - SPA 라우터 및 초기화
 */
const App = {
  currentPage: null,
  currentRoute: '',

  routes: {
    '':         { page: HomePage,     title: '우리교회 상점',    nav: 'home',  needsAuth: false },
    'login':    { page: LoginPage,    title: '로그인',          nav: 'my',    needsAuth: false },
    'store':    { page: DetailPage,   title: '매장 상세',       nav: 'home',  needsAuth: false },
    'map':      { page: MapPage,      title: '지도',            nav: 'map',   needsAuth: false },
    'my-store':   { page: BusinessPage, title: '내 매장 관리',    nav: 'my',    needsAuth: true, roles: ['business', 'master'] },
    'edit-store': { page: BusinessPage, title: '매장 수정',      nav: 'my',    needsAuth: true, roles: ['master'] },
    'admin':      { page: AdminPage,    title: '관리자',          nav: 'my',    needsAuth: true, roles: ['master'] },
  },

  init() {
    // 데모 데이터 초기화
    DB.seedDemoData();

    // 인증 상태 복원
    AuthService.init();

    // 해시 변경 감지
    window.addEventListener('hashchange', () => this.navigate());

    // 초기 페이지 렌더링
    this.navigate();

    // PWA 서비스 워커 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

  parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.replace(/^\//, '').split('/');
    const route = parts[0] || '';
    const params = parts.slice(1);
    return { route, params };
  },

  navigate(hash) {
    if (hash !== undefined) {
      window.location.hash = hash;
      return;
    }

    const { route, params } = this.parseHash();
    const routeConfig = this.routes[route];

    if (!routeConfig) {
      this.navigate('#/');
      return;
    }

    // 인증 체크
    if (routeConfig.needsAuth) {
      if (!AuthService.isLoggedIn()) {
        this.navigate('#/login');
        return;
      }
      if (routeConfig.roles) {
        const userRole = AuthService.getUserRole();
        if (!routeConfig.roles.includes(userRole)) {
          Toast.show('접근 권한이 없습니다.', 'error');
          this.navigate('#/');
          return;
        }
      }
    }

    this.currentRoute = route;

    // 헤더 렌더링
    const showBack = route !== '' && route !== 'map';
    Header.render(routeConfig.title, showBack);

    // 하단 네비 렌더링
    BottomNav.render(routeConfig.nav);

    // 페이지 전환
    const content = document.getElementById('app-content');
    content.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div></div>';

    // 이전 페이지 정리
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }
    this.currentPage = routeConfig.page;

    // 약간의 딜레이로 로딩 애니메이션 표시
    setTimeout(() => {
      routeConfig.page.render(content, params);
    }, 50);
  }
};

// 토스트 유틸
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// 유틸 함수들
const Utils = {
  categories: [
    '전체', '음식점', '카페', '미용/뷰티', '의료/건강',
    '교육', '생활서비스', '패션/잡화', '자동차', '부동산', '기타'
  ],

  categoryIcons: {
    '전체': 'apps', '음식점': 'restaurant', '카페': 'coffee',
    '미용/뷰티': 'spa', '의료/건강': 'local_hospital',
    '교육': 'school', '생활서비스': 'handyman',
    '패션/잡화': 'checkroom', '자동차': 'directions_car',
    '부동산': 'apartment', '기타': 'storefront'
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatDate(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('ko-KR');
  }
};

// 앱 시작
document.addEventListener('DOMContentLoaded', () => App.init());
