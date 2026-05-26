/**
 * 인증 서비스 - LocalStorage 기반 (Firebase 없이 독립 실행)
 */
const AuthService = {
  _currentUser: null,

  init() {
    // 저장된 로그인 상태 복원
    const savedUser = localStorage.getItem('church_current_user');
    if (savedUser) {
      this._currentUser = JSON.parse(savedUser);
    }
  },

  getCurrentUser() {
    return this._currentUser;
  },

  getUserData() {
    if (!this._currentUser) return null;
    return DB.getUser(this._currentUser.id);
  },

  getUserRole() {
    const data = this.getUserData();
    return data?.role || 'member';
  },

  isLoggedIn() {
    return !!this._currentUser;
  },

  // 로그인 (이름 + 비밀번호 간단 인증)
  signIn(userId, password) {
    const user = DB.getUser(userId);
    if (!user) {
      Toast.show('존재하지 않는 계정입니다.', 'error');
      return false;
    }
    if (user.password !== password) {
      Toast.show('비밀번호가 틀렸습니다.', 'error');
      return false;
    }
    this._currentUser = { id: userId, name: user.name, email: user.email };
    localStorage.setItem('church_current_user', JSON.stringify(this._currentUser));
    Toast.show(`${user.name}님 환영합니다!`, 'success');
    return true;
  },

  // 회원가입
  signUp(userId, name, email, password) {
    const existing = DB.getUser(userId);
    if (existing) {
      Toast.show('이미 사용 중인 아이디입니다.', 'error');
      return false;
    }
    DB.saveUser(userId, {
      name,
      email,
      password,
      role: 'member',
      createdAt: Date.now()
    });
    this._currentUser = { id: userId, name, email };
    localStorage.setItem('church_current_user', JSON.stringify(this._currentUser));
    Toast.show('가입이 완료되었습니다!', 'success');
    return true;
  },

  // 로그아웃
  signOut() {
    this._currentUser = null;
    localStorage.removeItem('church_current_user');
    Toast.show('로그아웃 되었습니다.', 'info');
    App.navigate('#/');
  },

  // 역할 변경 (관리자 전용)
  updateUserRole(userId, newRole) {
    if (this.getUserRole() !== 'master') {
      Toast.show('권한이 없습니다.', 'error');
      return;
    }
    const user = DB.getUser(userId);
    if (user) {
      user.role = newRole;
      DB.saveUser(userId, user);
      Toast.show('역할이 변경되었습니다.', 'success');
    }
  },

  getAllUsers() {
    return DB.getAllUsers();
  }
};
