/**
 * 로그인 / 프로필 페이지 - 미니멀 스타일
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
        <p class="login-page__subtitle">${Utils.escapeHtml(user.email || user.id)}</p>
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
        <div class="login-page__logo" style="font-family:var(--font-display);letter-spacing:0.05em">
          C
        </div>
        <h2 class="login-page__title">우리교회 상점</h2>
        <p class="login-page__subtitle">${isSignup ? '새 계정을 만들어보세요' : '로그인하여 더 많은 기능을 이용하세요'}</p>

        <form class="login-buttons" onsubmit="LoginPage.onSubmit(event)" style="max-width:320px">
          <div class="form-group" style="text-align:left">
            <label class="form-label">ID</label>
            <input class="form-input" name="userId" placeholder="아이디 입력" required autocomplete="username">
          </div>

          ${isSignup ? `
            <div class="form-group" style="text-align:left">
              <label class="form-label">Name</label>
              <input class="form-input" name="name" placeholder="이름 입력" required>
            </div>
            <div class="form-group" style="text-align:left">
              <label class="form-label">Email (Optional)</label>
              <input class="form-input" name="email" type="email" placeholder="email@example.com">
            </div>
          ` : ''}

          <div class="form-group" style="text-align:left">
            <label class="form-label">Password</label>
            <input class="form-input" name="password" type="password" placeholder="비밀번호 입력" required autocomplete="current-password">
          </div>

          <button type="submit" class="btn btn--primary" style="margin-top:8px">
            ${isSignup ? 'Create Account' : 'Sign In'}
          </button>

          <button type="button" class="btn btn--ghost" onclick="LoginPage.toggleMode()">
            ${isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </form>

        <div class="divider" style="max-width:320px"></div>

        <p style="font-size:0.8125rem;color:var(--outline)">
          로그인하지 않아도 매장 정보를 볼 수 있습니다
        </p>
        <button class="btn btn--secondary" style="max-width:320px;margin-top:8px"
                onclick="App.navigate('#/')">
          Browse Stores
        </button>

        <div class="test-account-box">
          <p class="label-caps" style="color:var(--accent);margin-bottom:8px">Test Accounts</p>
          <p style="font-size:0.8125rem;color:var(--secondary);line-height:1.8">
            Admin: admin / admin<br>
            Owner: business1 / 1234
          </p>
        </div>
      </div>
    `;
  },

  onSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const userId = form.userId.value.trim();
    const password = form.password.value;

    if (this._mode === 'signup') {
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      if (AuthService.signUp(userId, name, email, password)) App.navigate('#/');
    } else {
      if (AuthService.signIn(userId, password)) App.navigate('#/');
    }
  },

  toggleMode() {
    this._mode = this._mode === 'login' ? 'signup' : 'login';
    this.render(document.getElementById('app-content'));
  }
};
