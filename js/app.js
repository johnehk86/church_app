/**
 * 앱 메인 - SPA 라우터 및 초기화
 */
const App = {
  currentPage: null,
  currentRoute: '',

  routes: {
    '':           { page: HomePage,     title: '수원하나교회 상점',  nav: 'home',  needsAuth: false },
    'login':      { page: LoginPage,    title: '로그인',          nav: 'my',    needsAuth: false },
    'store':      { page: DetailPage,   title: '매장 상세',       nav: 'home',  needsAuth: false },
    'map':        { page: MapPage,      title: '지도',            nav: 'map',   needsAuth: false },
    'my-store':   { page: BusinessPage, title: '내 매장 관리',    nav: 'my',    needsAuth: true, roles: ['business', 'master'] },
    'edit-store': { page: BusinessPage, title: '매장 수정',       nav: 'my',    needsAuth: true, roles: ['master'] },
    'new-store':  { page: BusinessPage, title: '새 매장 등록',    nav: 'my',    needsAuth: true, roles: ['master'] },
    'admin':      { page: AdminPage,    title: '관리자',          nav: 'my',    needsAuth: true, roles: ['master'] },
    'install':    { page: InstallPage,  title: '앱 설치',         nav: null,    needsAuth: false },
  },

  async init() {
    // Firebase 인증 초기화 (타임아웃 5초 - 실패해도 앱은 동작)
    try {
      await Promise.race([
        AuthService.init(),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 10000))
      ]);
    } catch (e) {
      console.warn('Auth 초기화 지연 또는 실패:', e);
    }

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

    // 헤더
    const showBack = route !== '' && route !== 'map';
    Header.render(routeConfig.title, showBack);

    // 하단 네비
    BottomNav.render(routeConfig.nav);

    // 페이지 전환
    const content = document.getElementById('app-content');
    content.innerHTML = '<div class="loading-screen"><div class="loading-spinner"></div></div>';

    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }
    this.currentPage = routeConfig.page;

    // 비동기 페이지 렌더링
    setTimeout(() => {
      routeConfig.page.render(content, params);
    }, 50);
  }
};

// 토스트
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

// 유틸
const Utils = {
  categories: [
    '전체', '음식점', '카페', '베이커리', '미용/뷰티', '의료/건강',
    '교육', '생활서비스', '패션/잡화', '안경/광학', '자동차', '부동산', '기타'
  ],

  categoryIcons: {
    '전체': 'apps', '음식점': 'restaurant', '카페': 'coffee',
    '베이커리': 'bakery_dining', '미용/뷰티': 'spa', '의료/건강': 'local_hospital',
    '교육': 'school', '생활서비스': 'handyman',
    '패션/잡화': 'checkroom', '안경/광학': 'visibility',
    '자동차': 'directions_car',
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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR');
  }
};

// 홈 화면 설치 프롬프트 (Android Chrome)
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _installPrompt = e;
});

const InstallHelper = {
  canNativePrompt() {
    return !!_installPrompt;
  },

  async triggerInstall() {
    if (_installPrompt) {
      _installPrompt.prompt();
      await _installPrompt.userChoice;
      _installPrompt = null;
      return;
    }
    // iOS: 팝업 안내
    this._showIOSGuide();
  },

  _showIOSGuide() {
    if (document.getElementById('ios-install-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'ios-install-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);
      display:flex;align-items:flex-end;justify-content:center;
    `;
    modal.innerHTML = `
      <div style="background:var(--surface,#fff);border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:480px;position:relative">
        <button onclick="document.getElementById('ios-install-modal').remove()"
                style="position:absolute;top:16px;right:16px;background:var(--surface-container,#f5f5f5);border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;color:var(--secondary,#666)">✕</button>
        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:6px;text-align:center">홈 화면에 추가하기</h3>
        <p style="font-size:0.8125rem;color:var(--secondary,#666);text-align:center;margin-bottom:24px">아래 3단계만 따라하세요!</p>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;align-items:center;gap:14px;background:var(--surface-container,#f5f5f5);border-radius:14px;padding:14px">
            <div style="background:#007AFF;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0">1</div>
            <div>
              <div style="font-weight:600;font-size:0.9375rem">하단 공유 버튼 터치</div>
              <div style="color:var(--secondary,#666);font-size:0.8125rem;margin-top:2px">화면 아래 가운데 <strong style="font-size:1.1em">⬆</strong> 버튼을 누르세요</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;background:var(--surface-container,#f5f5f5);border-radius:14px;padding:14px">
            <div style="background:#007AFF;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0">2</div>
            <div>
              <div style="font-weight:600;font-size:0.9375rem">"홈 화면에 추가" 선택</div>
              <div style="color:var(--secondary,#666);font-size:0.8125rem;margin-top:2px">아래로 스크롤해서 찾으세요</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;background:var(--surface-container,#f5f5f5);border-radius:14px;padding:14px">
            <div style="background:#007AFF;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0">3</div>
            <div>
              <div style="font-weight:600;font-size:0.9375rem">오른쪽 위 "추가" 터치</div>
              <div style="color:var(--secondary,#666);font-size:0.8125rem;margin-top:2px">완료! 홈 화면에 앱이 생겨요</div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;text-align:center;font-size:0.75rem;color:var(--secondary,#999)">
          ※ 사파리(Safari) 브라우저에서만 가능합니다
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  }
};

// 인앱 브라우저 감지 → 크롬/사파리 유도
const BrowserGuard = {
  init() {
    if (sessionStorage.getItem('browser-banner-dismissed')) return;
    const ua = navigator.userAgent;
    const isAndroid = /Android/.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS/.test(ua);
    const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|Line|NaverApp|DaumApps|Snapchat/.test(ua);

    if (isAndroid && (!isChrome || isInApp)) {
      // 안드로이드 인앱브라우저 → 크롬 intent로 자동 이동
      if (isInApp) {
        window.location.href = `intent://${location.host}${location.pathname}${location.hash}#Intent;scheme=https;package=com.android.chrome;end`;
        return;
      }
      this._showBanner('android');
    } else if (isIOS && (!isSafari || isInApp)) {
      this._showBanner('ios');
    }
  },

  _showBanner(os) {
    const banner = document.createElement('div');
    banner.id = 'browser-banner';
    const isTop = os === 'ios';
    banner.style.cssText = `
      position:fixed;${isTop ? 'top:16px' : 'bottom:80px'};left:16px;right:16px;z-index:9998;
      background:#1a1a1a;color:white;border-radius:16px;
      padding:14px 16px;display:flex;align-items:center;gap:12px;
      box-shadow:0 4px 24px rgba(0,0,0,0.3);animation:slideUp 0.3s ease;
    `;

    if (os === 'android') {
      banner.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:24px;color:#8B7355;flex-shrink:0">open_in_new</span>
        <div style="flex:1;font-size:0.8125rem">
          <div style="font-weight:600;margin-bottom:2px">크롬으로 여시면 설치 가능해요</div>
          <div style="color:rgba(255,255,255,0.6);font-size:0.75rem">앱처럼 홈 화면에 추가할 수 있습니다</div>
        </div>
        <a href="intent://${location.host}${location.pathname}${location.hash}#Intent;scheme=https;package=com.android.chrome;end"
           style="background:#8B7355;color:white;padding:8px 14px;border-radius:10px;font-size:0.8125rem;font-weight:600;white-space:nowrap;text-decoration:none">
          크롬으로 열기
        </a>
        <button onclick="sessionStorage.setItem('browser-banner-dismissed','1');document.getElementById('browser-banner').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;flex-shrink:0;padding:0">✕</button>
      `;
    } else {
      banner.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:24px;color:#8B7355;flex-shrink:0">phone_iphone</span>
        <div style="flex:1;font-size:0.8125rem">
          <div style="font-weight:600;margin-bottom:2px">사파리(Safari)에서 열어주세요</div>
          <div style="color:rgba(255,255,255,0.6);font-size:0.75rem">주소 복사 → 사파리 앱 열기 → 붙여넣기</div>
        </div>
        <button onclick="BrowserGuard._copyAndGuide()" style="background:#8B7355;color:white;padding:8px 14px;border-radius:10px;font-size:0.8125rem;font-weight:600;white-space:nowrap;border:none;cursor:pointer">
          주소 복사
        </button>
        <button onclick="sessionStorage.setItem('browser-banner-dismissed','1');document.getElementById('browser-banner').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px;flex-shrink:0;padding:0">✕</button>
      `;
    }
    document.body.appendChild(banner);
  },

  _copyAndGuide() {
    navigator.clipboard.writeText('https://hana-store.com').then(() => {
      Toast.show('주소 복사 완료! 사파리에서 붙여넣기 하세요.', 'success');
    });
    sessionStorage.setItem('browser-banner-dismissed', '1');
    document.getElementById('browser-banner')?.remove();
  }
};

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  BrowserGuard.init();
  App.init();
});
