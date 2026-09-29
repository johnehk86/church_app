/**
 * 관리자 페이지 (Firebase 비동기)
 */
const AdminPage = {
  _activeTab: 'users',

  async render(container) {
    container.innerHTML = `
      <div class="page">
        <div class="admin-tabs">
          <button class="admin-tab ${this._activeTab === 'users' ? 'admin-tab--active' : ''}" onclick="AdminPage.switchTab('users')">
            <span class="material-symbols-outlined" style="font-size:18px">group</span> 사용자
          </button>
          <button class="admin-tab ${this._activeTab === 'stores' ? 'admin-tab--active' : ''}" onclick="AdminPage.switchTab('stores')">
            <span class="material-symbols-outlined" style="font-size:18px">storefront</span> 매장
          </button>
        </div>
        <div id="admin-content"><div class="loading-screen"><div class="loading-spinner"></div></div></div>
        <div class="divider"></div>
        <button class="btn btn--ghost" onclick="AuthService.signOut()" style="width:100%">
          <span class="material-symbols-outlined" style="font-size:18px">logout</span> Sign Out
        </button>
      </div>`;

    if (this._activeTab === 'users') await this._loadUsers();
    else await this._loadStores();
  },

  switchTab(tab) {
    this._activeTab = tab;
    this.render(document.getElementById('app-content'));
  },

  async _loadUsers() {
    const users = await AuthService.getAllUsers();
    const el = document.getElementById('admin-content');
    if (!el) return;
    if (users.length === 0) {
      el.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">group</span><h3 class="empty-state__title">등록된 사용자가 없습니다</h3></div>`;
      return;
    }
    el.innerHTML = `
      <p style="font-size:0.8125rem;color:var(--secondary);margin-bottom:12px">총 ${users.length}명</p>
      ${users.map(user => `
        <div class="user-list-item">
          <div class="user-list-item__info">
            <div class="user-list-item__name">${Utils.escapeHtml(user.name || '이름 없음')}</div>
            <div class="user-list-item__email">${Utils.escapeHtml(user.email || '')}</div>
          </div>
          <select class="form-select" style="width:auto;padding:6px 32px 6px 10px;font-size:0.8125rem"
                  onchange="AdminPage.changeRole('${user.id}', this.value)">
            <option value="member" ${user.role === 'member' ? 'selected' : ''}>일반 성도</option>
            <option value="business" ${user.role === 'business' ? 'selected' : ''}>사업자</option>
            <option value="master" ${user.role === 'master' ? 'selected' : ''}>관리자</option>
          </select>
        </div>
      `).join('')}`;
  },

  async _loadStores() {
    const stores = await StoreService.getAll();
    const el = document.getElementById('admin-content');
    if (!el) return;
    if (stores.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">storefront</span>
          <h3 class="empty-state__title">등록된 매장이 없습니다</h3>
          <button class="btn btn--primary btn--small" onclick="AdminPage.addSampleStores()" style="margin-top:16px;width:auto">
            <span class="material-symbols-outlined" style="font-size:18px">auto_awesome</span> 샘플 매장 추가
          </button>
        </div>`;
      return;
    }
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <p style="font-size:0.8125rem;color:var(--secondary)">총 ${stores.length}개</p>
        <div style="display:flex;gap:6px">
          <button class="btn btn--secondary btn--small" onclick="AdminPage.addSampleStores()" style="width:auto">
            <span class="material-symbols-outlined" style="font-size:16px">auto_awesome</span> 샘플 추가
          </button>
          <button class="btn btn--primary btn--small" onclick="App.navigate('#/new-store')" style="width:auto">
            <span class="material-symbols-outlined" style="font-size:16px">add</span> 새 매장
          </button>
        </div>
      </div>
      ${stores.map(store => `
        <div class="user-list-item">
          <div class="user-list-item__info" style="cursor:pointer" onclick="App.navigate('#/store/${store.id}')">
            <div class="user-list-item__name"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">${Utils.categoryIcons[store.category] || 'storefront'}</span> ${Utils.escapeHtml(store.name)}</div>
            <div class="user-list-item__email">${Utils.escapeHtml(store.ownerName || '')} | ${Utils.escapeHtml(store.category || '')}</div>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn btn--secondary btn--small" onclick="App.navigate('#/edit-store/${store.id}')">수정</button>
            <button class="btn btn--danger btn--small" onclick="AdminPage.deleteStore('${store.id}', '${Utils.escapeHtml(store.name).replace(/'/g, "\\'")}')">삭제</button>
          </div>
        </div>
      `).join('')}`;
  },

  async changeRole(userId, newRole) {
    await AuthService.updateUserRole(userId, newRole);
    await this._loadUsers();
  },

  async deleteStore(storeId, storeName) {
    if (!confirm(`"${storeName}" 매장을 정말 삭제하시겠습니까?`)) return;
    await StoreService.delete(storeId);
    Toast.show('매장이 삭제되었습니다.', 'success');
    await this._loadStores();
  },

  async addSampleStores() {
    if (!confirm('샘플 매장 8개를 추가하시겠습니까?')) return;

    const btn = event.target.closest('button');
    if (btn) { btn.disabled = true; btn.textContent = '추가 중...'; }

    const ownerId = AuthService.getCurrentUser()?.id || 'sample';
    const ownerName = AuthService.getCurrentUser()?.name || '관리자';

    const samples = [
      {
        name: '수원 행복 치과',
        category: '의료/건강',
        description: '성도님들의 건강한 미소를 위한 치과입니다. 임플란트, 교정, 충치 치료 전문.',
        address: '경기도 수원시 영통구 영통로 123',
        hours: '월~금 09:00~18:00\n토 09:00~13:00\n일 휴무',
        contact: { phone: '031-123-4567', kakao: '', instagram: '' },
        ownerName: '김성철',
        ownerMessage: '성도님들의 구강 건강을 정성껏 돌봐드리겠습니다!',
        memberBenefit: '성도님 초진 검사비 무료',
        menuTitle: '주요 진료',
        menu: [
          { name: '임플란트', desc: '최신 장비로 정밀 시술', price: '상담 후 결정' },
          { name: '스케일링', desc: '치석 제거 및 구강 관리', price: '30,000원' },
        ],
        facilities: [{ icon: 'local_parking', label: '주차 가능' }, { icon: 'payments', label: '카드 결제' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2636, lng: 127.0286 }
      },
      {
        name: '은혜 카페',
        category: '카페',
        description: '정성껏 내린 핸드드립 커피와 홈메이드 디저트를 즐길 수 있는 아늑한 공간입니다.',
        address: '경기도 수원시 팔달구 인계로 45',
        hours: '매일 09:00~21:00',
        contact: { phone: '031-234-5678', kakao: 'gracacafe', instagram: 'graca_cafe' },
        ownerName: '이은혜',
        ownerMessage: '따뜻한 커피 한 잔으로 하루를 시작하세요. 성도님 항상 환영합니다!',
        memberBenefit: '성도님 음료 10% 할인',
        menuTitle: '대표 메뉴',
        menu: [
          { name: '핸드드립 커피', desc: '당일 로스팅 원두 사용', price: '6,500원' },
          { name: '크로플', desc: '직접 만든 버터 크로플', price: '4,500원' },
          { name: '아메리카노', desc: '', price: '4,000원' },
        ],
        facilities: [{ icon: 'wifi', label: 'Wi-Fi' }, { icon: 'outlet', label: '콘센트' }, { icon: 'payments', label: '카드 결제' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2598, lng: 127.0317 }
      },
      {
        name: '헤어 블리스',
        category: '미용/뷰티',
        description: '트렌디한 헤어 스타일링 전문 살롱. 컷, 펌, 염색 전 분야 케어.',
        address: '경기도 수원시 권선구 권선로 200',
        hours: '화~일 10:00~20:00\n월 휴무',
        contact: { phone: '031-345-6789', kakao: 'hairbliss', instagram: 'hair_bliss_' },
        ownerName: '박지현',
        ownerMessage: '성도님들의 아름다움을 더욱 빛내드리겠습니다.',
        memberBenefit: '성도님 시술비 15% 할인',
        menuTitle: '시술 메뉴',
        menu: [
          { name: '커트', desc: '샴푸 포함', price: '18,000원' },
          { name: '펌', desc: '매직/일반 선택 가능', price: '60,000원~' },
          { name: '염색', desc: '뿌리/전체 선택', price: '50,000원~' },
        ],
        facilities: [{ icon: 'local_parking', label: '주차 가능' }, { icon: 'book_online', label: '온라인 예약' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2552, lng: 126.9997 }
      },
      {
        name: '참사랑 분식',
        category: '음식점',
        description: '어머니의 손맛 그대로! 떡볶이, 순대, 튀김 등 추억의 분식을 정성껏 만들어드립니다.',
        address: '경기도 수원시 장안구 장안로 88',
        hours: '월~토 11:00~20:00\n일 휴무',
        contact: { phone: '031-456-7890', kakao: '', instagram: '' },
        ownerName: '최순자',
        ownerMessage: '20년 전통의 맛으로 성도님들을 맞이합니다. 항상 감사합니다!',
        memberBenefit: '성도님 순대국 서비스',
        menuTitle: '메뉴',
        menu: [
          { name: '떡볶이', desc: '매운맛 조절 가능', price: '4,000원' },
          { name: '순대국밥', desc: '구수한 국물', price: '8,000원' },
          { name: '튀김 모듬', desc: '10개', price: '5,000원' },
        ],
        facilities: [{ icon: 'delivery_dining', label: '포장/배달' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2921, lng: 127.0136 }
      },
      {
        name: '빛나는 피부과',
        category: '의료/건강',
        description: '피부 트러블, 미백, 여드름 치료 전문. 최신 레이저 장비 보유.',
        address: '경기도 수원시 영통구 매탄로 55',
        hours: '월~금 10:00~19:00\n토 10:00~15:00',
        contact: { phone: '031-567-8901', kakao: 'glowskin', instagram: 'glow_skin_clinic' },
        ownerName: '정빛나',
        ownerMessage: '건강하고 빛나는 피부를 위해 최선을 다하겠습니다.',
        memberBenefit: '성도님 첫 방문 피부 진단 무료',
        menuTitle: '시술 안내',
        menu: [
          { name: '여드름 치료', desc: '맞춤형 트리트먼트', price: '상담 후 결정' },
          { name: '미백 레이저', desc: '토닝/화이트닝', price: '상담 후 결정' },
        ],
        facilities: [{ icon: 'local_parking', label: '주차 가능' }, { icon: 'payments', label: '카드 결제' }, { icon: 'book_online', label: '온라인 예약' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2588, lng: 127.0573 }
      },
      {
        name: '하나 영어 교육원',
        category: '교육',
        description: '유아부터 성인까지! 원어민 강사와 함께하는 체계적인 영어 교육.',
        address: '경기도 수원시 팔달구 화서로 110',
        hours: '월~금 09:00~21:00\n토 09:00~15:00',
        contact: { phone: '031-678-9012', kakao: 'hanaenglish', instagram: '' },
        ownerName: '한지민',
        ownerMessage: '영어가 즐거운 경험이 될 수 있도록 함께하겠습니다!',
        memberBenefit: '성도님 자녀 등록비 면제',
        menuTitle: '수강 프로그램',
        menu: [
          { name: '유아 영어 (5~7세)', desc: '놀이 중심 학습', price: '월 180,000원' },
          { name: '초등 영어', desc: '레벨별 맞춤 수업', price: '월 200,000원' },
          { name: '성인 회화', desc: '원어민 강사 1:1', price: '월 250,000원' },
        ],
        facilities: [{ icon: 'local_parking', label: '주차 가능' }, { icon: 'ac_unit', label: '냉난방 완비' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2777, lng: 127.0094 }
      },
      {
        name: '행복 세탁소',
        category: '생활서비스',
        description: '드라이클리닝, 이불 세탁, 구두 수선까지. 20년 경력의 꼼꼼한 세탁 서비스.',
        address: '경기도 수원시 권선구 세화로 33',
        hours: '월~토 08:00~19:00\n일 휴무',
        contact: { phone: '031-789-0123', kakao: '', instagram: '' },
        ownerName: '강복순',
        ownerMessage: '소중한 옷을 새것처럼 돌려드리겠습니다. 감사합니다!',
        memberBenefit: '성도님 이불 세탁 10% 할인',
        menuTitle: '서비스',
        menu: [
          { name: '드라이클리닝', desc: '정장/코트', price: '9,000원~' },
          { name: '이불 세탁', desc: '싱글/더블', price: '15,000원~' },
          { name: '구두 수선', desc: '굽 교체 등', price: '5,000원~' },
        ],
        facilities: [{ icon: 'speed', label: '당일 서비스' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2501, lng: 127.0021 }
      },
      {
        name: '아이뜰 안경원',
        category: '안경/광학',
        description: '정밀 시력 검사부터 맞춤 안경 제작까지. 다양한 국내외 브랜드 보유.',
        address: '경기도 수원시 영통구 봉영로 77',
        hours: '매일 10:00~20:00',
        contact: { phone: '031-890-1234', kakao: 'eyeddle', instagram: 'eyeddle_optical' },
        ownerName: '윤재원',
        ownerMessage: '눈이 편안해야 하루가 행복합니다. 성도님께 맞는 안경을 찾아드리겠습니다.',
        memberBenefit: '성도님 렌즈 구매 시 안경테 20% 할인',
        menuTitle: '서비스',
        menu: [
          { name: '시력 검사', desc: '정밀 검사', price: '무료' },
          { name: '안경 제작', desc: '당일 제작 가능', price: '30,000원~' },
          { name: '콘택트렌즈', desc: '월/일 다양', price: '20,000원~' },
        ],
        facilities: [{ icon: 'local_parking', label: '주차 가능' }, { icon: 'payments', label: '카드 결제' }, { icon: 'verified', label: '자격증 보유' }],
        photos: [], interiorPhotos: [], location: { lat: 37.2631, lng: 127.0459 }
      },
    ];

    let count = 0;
    for (const sample of samples) {
      try {
        await db.collection('stores').add({
          ...sample,
          ownerId,
          ownerPhoto: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        count++;
      } catch (e) {
        console.error('샘플 추가 실패:', sample.name, e);
      }
    }

    StoreService._cache = null;
    Toast.show(`샘플 매장 ${count}개가 추가됐습니다!`, 'success');
    await this._loadStores();
  },

  destroy() {}
};
