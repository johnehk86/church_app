/**
 * Firebase Authentication 서비스
 */
const AuthService = {
  _currentUser: null,
  _userData: null,
  _ready: false,
  _readyCallbacks: [],
  _signingUp: false,
  BUSINESS_SECRET_CODE: '0316',

  init() {
    return new Promise(async (resolve) => {
      // 모바일 리다이렉트 로그인 결과 처리
      try {
        const result = await auth.getRedirectResult();
        if (result && result.user) {
          console.log('리다이렉트 로그인 성공:', result.user.email);
        }
      } catch (e) {
        console.warn('리다이렉트 결과:', e.code || e);
      }

      auth.onAuthStateChanged(async (user) => {
        const wasLoggedOut = !this._currentUser;
        this._currentUser = user;
        if (user) {
          await this._loadUserData(user.uid);
        } else {
          this._userData = null;
        }

        if (!this._ready) {
          // 첫 초기화
          this._ready = true;
          resolve();
        } else if (user && wasLoggedOut) {
          // 로그인 상태 변경 감지 → 홈으로 이동
          window.location.hash = '#/';
          App.navigate();
        }
      });
    });
  },

  // 사용자 데이터 로드/생성
  async _loadUserData(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        this._userData = doc.data();
      } else if (!this._signingUp) {
        // 첫 Google 로그인 - 사업자 코드 입력 기회 제공
        let role = 'member';
        const bizCode = prompt('사장님이시면 사업자 코드를 입력하세요.\n일반 성도는 그냥 취소를 누르세요.');
        if (bizCode) {
          if (bizCode.trim() === '0316') {
            role = 'business';
            Toast.show('사장님 가입 완료!', 'success');
          } else {
            Toast.show('사업자 코드가 올바르지 않습니다. 일반 성도로 가입됩니다.', 'error');
          }
        }
        const newUser = {
          email: this._currentUser.email || '',
          name: this._currentUser.displayName || '성도',
          role,
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
  signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(function(result) {
      Toast.show('로그인 성공!', 'success');
      App.navigate('#/');
    }).catch(function(e) {
      console.error('Google 로그인 실패:', e);
      if (e.code !== 'auth/popup-closed-by-user') {
        Toast.show('로그인에 실패했습니다.', 'error');
      }
    });
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
  async signUp(email, password, name, bizCode) {
    try {
      // 사업자 코드 확인
      let role = 'member';
      if (bizCode) {
        if (bizCode.trim() === '0316') {
          role = 'business';
        } else {
          Toast.show('사업자 코드가 올바르지 않습니다.', 'error');
          return false;
        }
      }

      this._signingUp = true;
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      await db.collection('users').doc(result.user.uid).set({
        email,
        name,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._userData = { email, name, role };
      this._signingUp = false;
      Toast.show(role === 'business' ? '사장님 가입이 완료되었습니다!' : '가입이 완료되었습니다!', 'success');
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

  // --- 회원탈퇴 ---
  async deleteAccount() {
    if (!confirm('정말 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 되돌릴 수 없습니다.')) return;

    try {
      const uid = this._currentUser.uid;

      // 사업자인 경우 매장 데이터도 삭제
      const storeSnapshot = await db.collection('stores').where('ownerId', '==', uid).get();
      for (const doc of storeSnapshot.docs) {
        await doc.ref.delete();
      }

      // Firestore 사용자 문서 삭제
      await db.collection('users').doc(uid).delete();

      // Firebase Auth 계정 삭제
      await this._currentUser.delete();

      this._userData = null;
      this._currentUser = null;
      Toast.show('탈퇴가 완료되었습니다.', 'info');
      App.navigate('#/');
    } catch (e) {
      console.error('회원탈퇴 실패:', e);
      if (e.code === 'auth/requires-recent-login') {
        Toast.show('보안을 위해 다시 로그인 후 탈퇴해주세요.', 'error');
        await auth.signOut();
        App.navigate('#/login');
      } else {
        Toast.show('탈퇴에 실패했습니다.', 'error');
      }
    }
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
