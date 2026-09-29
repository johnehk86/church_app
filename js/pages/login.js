/**
 * 로그인 / 회원가입 / 프로필 페이지 (Firebase Auth)
 */
const LoginPage = {
  _mode: 'login',
  _myCoupons: [],

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
    // 쿠폰 비동기 로드 (렌더 후)
    setTimeout(() => this._loadMyCoupons(user.id), 0);

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
          <button class="btn btn--ghost" onclick="AuthService.deleteAccount()" style="margin-top:4px;color:var(--error);font-size:0.8125rem">
            회원탈퇴
          </button>
        </div>

        <!-- 내 쿠폰 -->
        <div id="my-coupons-section" style="margin-top:28px;width:100%;max-width:320px;text-align:left">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span class="material-symbols-outlined" style="font-size:20px;color:var(--accent)">local_offer</span>
            <h3 style="font-size:1rem;font-weight:600">내 쿠폰</h3>
          </div>
          <div style="display:flex;justify-content:center"><div class="loading-spinner" style="width:24px;height:24px;border-width:2px"></div></div>
        </div>
      </div>
    `;
  },

  _renderLoginForm(container) {
    const isSignup = this._mode === 'signup';

    container.innerHTML = `
      <div class="page login-page">
        <div class="login-page__logo" style="padding:0;background:none">
          <img src="assets/icons/church-logo.png" alt="수원하나교회" style="width:80px;height:80px;object-fit:contain">
        </div>
        <h2 class="login-page__title">수원하나교회 상점</h2>
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
            ${isSignup ? `
              <div class="form-group" style="text-align:left">
                <label class="form-label">사업자 코드 (선택)</label>
                <input class="form-input" name="bizCode" placeholder="사장님만 입력하세요">
                <p style="font-size:0.75rem;color:var(--secondary);margin-top:4px">사장님은 관리자에게 받은 코드를 입력하세요. 일반 성도는 비워두세요.</p>
              </div>
            ` : ''}
            <button type="submit" class="btn btn--primary">
              ${isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          ${!isSignup ? `
            <button type="button" class="btn btn--ghost" onclick="LoginPage.resetPassword()" style="font-size:0.8125rem;color:var(--secondary)">
              비밀번호를 잊으셨나요?
            </button>
          ` : ''}
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
      const bizCode = form.bizCode?.value.trim() || '';
      if (await AuthService.signUp(email, password, name, bizCode)) App.navigate('#/');
    } else {
      if (await AuthService.signIn(email, password)) App.navigate('#/');
    }
  },

  async resetPassword() {
    const email = prompt('비밀번호를 재설정할 이메일을 입력하세요');
    if (!email) return;
    try {
      await auth.sendPasswordResetEmail(email.trim());
      Toast.show('비밀번호 재설정 메일을 보냈습니다. 이메일을 확인하세요!', 'success');
    } catch (e) {
      if (e.code === 'auth/user-not-found') Toast.show('등록되지 않은 이메일입니다.', 'error');
      else if (e.code === 'auth/invalid-email') Toast.show('올바른 이메일 형식이 아닙니다.', 'error');
      else Toast.show('메일 발송에 실패했습니다.', 'error');
    }
  },

  toggleMode() {
    this._mode = this._mode === 'login' ? 'signup' : 'login';
    this.render(document.getElementById('app-content'));
  },

  async _loadMyCoupons(userId) {
    const section = document.getElementById('my-coupons-section');
    if (!section) return;
    try {
      this._myCoupons = await CouponService.getMyCoupons(userId);
    } catch (e) {
      this._myCoupons = [];
    }
    const now = new Date();
    const header = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span class="material-symbols-outlined" style="font-size:20px;color:var(--accent)">local_offer</span>
        <h3 style="font-size:1rem;font-weight:600">내 쿠폰</h3>
      </div>
    `;
    if (this._myCoupons.length === 0) {
      section.innerHTML = header + '<p style="font-size:0.875rem;color:var(--secondary)">받은 쿠폰이 없습니다.</p>';
      return;
    }
    const html = this._myCoupons.map((c, i) => {
      const expired = c.expiresAt && c.expiresAt.toDate() < now;
      const inactive = c.isUsed || expired;
      return `
        <div style="border:1px solid ${inactive ? 'var(--outline-variant)' : 'var(--accent)'};border-radius:12px;padding:14px;margin-bottom:8px;opacity:${inactive ? '0.6' : '1'}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-size:0.8125rem;color:var(--secondary);margin-bottom:2px">${Utils.escapeHtml(c.storeName || '')}</div>
              <div style="font-weight:600;font-size:0.9375rem;margin-bottom:6px">${Utils.escapeHtml(c.couponTitle || '')}</div>
              <span style="background:var(--accent);color:white;padding:2px 8px;border-radius:20px;font-size:0.75rem;font-weight:600">${c.discount}% 할인</span>
              ${c.expiresAt ? `<span style="font-size:0.75rem;color:var(--secondary);margin-left:6px">~ ${c.expiresAt.toDate().toLocaleDateString('ko-KR')}</span>` : ''}
            </div>
            <div style="flex-shrink:0">
              ${c.isUsed
                ? '<span style="font-size:0.75rem;color:var(--secondary);background:var(--surface-dim);padding:5px 10px;border-radius:8px;white-space:nowrap">사용완료</span>'
                : expired
                  ? '<span style="font-size:0.75rem;color:var(--secondary);background:var(--surface-dim);padding:5px 10px;border-radius:8px">만료됨</span>'
                  : `<button class="btn btn--primary btn--small" onclick="LoginPage.showCouponModal(${i})" style="width:auto;font-size:0.8125rem">사용하기</button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
    section.innerHTML = header + html;
  },

  showCouponModal(index) {
    const c = this._myCoupons[index];
    if (!c) return;
    const existing = document.getElementById('coupon-use-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'coupon-use-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    overlay.innerHTML = `
      <div style="background:white;border-radius:24px;padding:32px 24px;max-width:320px;width:100%;text-align:center">
        <span class="material-symbols-outlined icon-filled" style="font-size:3.5rem;color:var(--accent)">local_offer</span>
        <div style="font-size:0.875rem;color:var(--secondary);margin-top:8px">${Utils.escapeHtml(c.storeName || '')}</div>
        <h2 style="font-family:var(--font-display);font-size:1.375rem;font-weight:700;margin:8px 0 16px">${Utils.escapeHtml(c.couponTitle || '')}</h2>
        <div style="font-size:4rem;font-weight:900;color:var(--accent);line-height:1">${c.discount}%</div>
        <div style="font-size:1rem;color:var(--secondary);margin:4px 0 20px">할인 쿠폰</div>
        <div style="background:var(--surface-container);border-radius:12px;padding:12px 16px;margin-bottom:24px">
          <p style="font-size:0.875rem;color:var(--on-surface-variant)">📱 사장님께 이 화면을 보여주세요</p>
        </div>
        <button class="btn btn--primary" onclick="LoginPage.useCoupon('${c.id}')" style="margin-bottom:8px">사용 완료 처리</button>
        <button class="btn btn--ghost" onclick="document.getElementById('coupon-use-modal').remove()">닫기</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async useCoupon(claimId) {
    if (!confirm('쿠폰을 사용하시겠습니까?\n사용 후에는 취소할 수 없습니다.')) return;
    try {
      await CouponService.markUsed(claimId);
      const modal = document.getElementById('coupon-use-modal');
      if (modal) modal.remove();
      Toast.show('쿠폰이 사용되었습니다!', 'success');
      this.render(document.getElementById('app-content'));
    } catch (e) {
      Toast.show('처리에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  }
};
