/**
 * 로그인 / 회원가입 / 프로필 페이지 (Firebase Auth)
 */
const LoginPage = {
  _mode: 'login',

  render(container) {
    const user = AuthService.getCurrentUser();
    if (user) {
      this._renderProfile(container, user);
    } else {
      this._renderLoginForm(container);
    }
  },

  _renderProfile(container, user) {
    const userData = AuthService.getUserData();
    const roleLabels = { master: 'Administrator', business: 'Store Owner', member: 'Member' };
    const roleClass = userData?.role || 'member';

    container.innerHTML = `
      <div class="page login-page">
        <div class="login-page__logo">
          <span class="material-symbols-outlined icon-filled" style="font-size:3rem;color:var(--primary)">person</span>
        </div>
        <h2 class="login-page__title">${Utils.escapeHtml(user.name)}</h2>
        <p class="login-page__subtitle">${Utils.escapeHtml(user.email)}</p>
        <div style="margin-bottom:32px">
          <span class="badge">${roleLabels[roleClass] || 'Member'}</span>
        </div>
        <div class="login-buttons">
          ${roleClass === 'business' || roleClass === 'master' ? `
            <button class="btn btn--primary" onclick="App.navigate('#/my-store')">
              <span class="material-symbols-outlined" style="font-size:18px">storefront</span> My Store
            </button>
          ` : ''}
          ${roleClass === 'master' ? `
            <button class="btn btn--secondary" onclick="App.navigate('#/admin')">
              <span class="material-symbols-outlined" style="font-size:18px">settings</span> Admin Panel
            </button>
          ` : ''}
          <button class="btn btn--ghost" onclick="AuthService.signOut()" style="margin-top:8px">
            Sign Out
          </button>
        </div>
      </div>
    `;
  },

  _renderLoginForm(container) {
    const isSignup = this._mode === 'signup';

    container.innerHTML = `
      <div class="page login-page">
        <div class="login-page__logo" style="font-family:var(--font-display);letter-spacing:0.05em">C</div>
        <h2 class="login-page__title">우리교회 상점</h2>
        <p class="login-page__subtitle">${isSignup ? '새 계정을 만들어보세요' : '로그인하여 더 많은 기능을 이용하세요'}</p>

        <div class="login-buttons" style="max-width:320px">
          <!-- Google 로그인 -->
          <button class="btn btn--secondary" onclick="AuthService.signInWithGoogle()">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google로 로그인
          </button>

          <div style="display:flex;align-items:center;gap:12px;margin:4px 0">
            <div style="flex:1;height:1px;background:var(--outline-variant)"></div>
            <span style="font-size:0.75rem;color:var(--secondary)">또는</span>
            <div style="flex:1;height:1px;background:var(--outline-variant)"></div>
          </div>

          <!-- 이메일 로그인 -->
          <form onsubmit="LoginPage.onSubmit(event)">
            ${isSignup ? `
              <div class="form-group" style="text-align:left">
                <label class="form-label">이름</label>
                <input class="form-input" name="name" placeholder="이름 입력" required>
              </div>
            ` : ''}
            <div class="form-group" style="text-align:left">
              <label class="form-label">이메일</label>
              <input class="form-input" name="email" type="email" placeholder="email@example.com" required>
            </div>
            <div class="form-group" style="text-align:left">
              <label class="form-label">비밀번호 ${isSignup ? '(6자 이상)' : ''}</label>
              <input class="form-input" name="password" type="password" placeholder="비밀번호 입력" required ${isSignup ? 'minlength="6"' : ''}>
            </div>
            <button type="submit" class="btn btn--primary">
              ${isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button type="button" class="btn btn--ghost" onclick="LoginPage.toggleMode()">
            ${isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>

        <div class="divider" style="max-width:320px"></div>
        <p style="font-size:0.8125rem;color:var(--outline)">로그인하지 않아도 매장 정보를 볼 수 있습니다</p>
        <button class="btn btn--secondary" style="max-width:320px;margin-top:8px" onclick="App.navigate('#/')">
          Browse Stores
        </button>
      </div>
    `;
  },

  async onSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (this._mode === 'signup') {
      const name = form.name.value.trim();
      if (await AuthService.signUp(email, password, name)) App.navigate('#/');
    } else {
      if (await AuthService.signIn(email, password)) App.navigate('#/');
    }
  },

  toggleMode() {
    this._mode = this._mode === 'login' ? 'signup' : 'login';
    this.render(document.getElementById('app-content'));
  }
};
