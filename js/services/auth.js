/**
 * Firebase Authentication 서비스
 */
const AuthService = {
  _currentUser: null,  // Firebase User
  _userData: null,     // Firestore 사용자 데이터 (role 등)
  _ready: false,
  _readyCallbacks: [],

  init() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        this._currentUser = user;
        if (user) {
          await this._loadUserData(user.uid);
        } else {
          this._userData = null;
        }
        this._ready = true;
        this._readyCallbacks.forEach(cb => cb());
        this._readyCallbacks = [];
        resolve();
      });
    });
  },

  // 사용자 데이터 로드/생성
  async _loadUserData(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        this._userData = doc.data();
      } else {
        // 첫 로그인 - 사용자 문서 자동 생성
        const newUser = {
          email: this._currentUser.email || '',
          name: this._currentUser.displayName || '성도',
          role: 'member',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('users').doc(uid).set(newUser);
        this._userData = newUser;
      }
    } catch (e) {
      console.error('사용자 데이터 로드 실패:', e);
      this._userData = { role: 'member' };
    }
  },

  onReady(cb) {
    if (this._ready) cb();
    else this._readyCallbacks.push(cb);
  },

  getCurrentUser() {
    if (!this._currentUser) return null;
    return {
      id: this._currentUser.uid,
      name: this._userData?.name || this._currentUser.displayName || '성도',
      email: this._currentUser.email || ''
    };
  },

  getUserData() {
    return this._userData;
  },

  getUserRole() {
    return this._userData?.role || 'member';
  },

  isLoggedIn() {
    return !!this._currentUser;
  },

  // --- Google 로그인 ---
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      Toast.show('로그인 성공!', 'success');
      App.navigate('#/');
    } catch (e) {
      console.error('Google 로그인 실패:', e);
      if (e.code !== 'auth/popup-closed-by-user') {
        Toast.show('로그인에 실패했습니다.', 'error');
      }
    }
  },

  // --- 이메일/비밀번호 로그인 ---
  async signIn(email, password) {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      Toast.show('로그인 성공!', 'success');
      return true;
    } catch (e) {
      console.error('로그인 실패:', e);
      if (e.code === 'auth/user-not-found') Toast.show('존재하지 않는 계정입니다.', 'error');
      else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') Toast.show('비밀번호가 틀렸습니다.', 'error');
      else if (e.code === 'auth/invalid-email') Toast.show('올바른 이메일 형식이 아닙니다.', 'error');
      else Toast.show('로그인에 실패했습니다.', 'error');
      return false;
    }
  },

  // --- 이메일/비밀번호 회원가입 ---
  async signUp(email, password, name) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      // Firestore 사용자 문서 생성
      await db.collection('users').doc(result.user.uid).set({
        email,
        name,
        role: 'member',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._userData = { email, name, role: 'member' };
      Toast.show('가입이 완료되었습니다!', 'success');
      return true;
    } catch (e) {
      console.error('회원가입 실패:', e);
      if (e.code === 'auth/email-already-in-use') Toast.show('이미 사용 중인 이메일입니다.', 'error');
      else if (e.code === 'auth/weak-password') Toast.show('비밀번호는 6자 이상이어야 합니다.', 'error');
      else if (e.code === 'auth/invalid-email') Toast.show('올바른 이메일 형식이 아닙니다.', 'error');
      else Toast.show('가입에 실패했습니다.', 'error');
      return false;
    }
  },

  // --- 로그아웃 ---
  async signOut() {
    await auth.signOut();
    this._userData = null;
    Toast.show('로그아웃 되었습니다.', 'info');
    App.navigate('#/');
  },

  // --- 역할 변경 (마스터 전용) ---
  async updateUserRole(userId, newRole) {
    if (this.getUserRole() !== 'master') {
      Toast.show('권한이 없습니다.', 'error');
      return;
    }
    try {
      await db.collection('users').doc(userId).update({ role: newRole });
      Toast.show('역할이 변경되었습니다.', 'success');
    } catch (e) {
      console.error('역할 변경 실패:', e);
      Toast.show('역할 변경에 실패했습니다.', 'error');
    }
  },

  // --- 전체 사용자 목록 (마스터 전용) ---
  async getAllUsers() {
    try {
      const snapshot = await db.collection('users').orderBy('name').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('사용자 목록 실패:', e);
      return [];
    }
  }
};
