/**
 * LocalStorage 기반 데이터베이스
 * Firebase 없이 브라우저에서 바로 동작합니다.
 * 나중에 Firebase로 전환할 때 이 파일만 교체하면 됩니다.
 */
const DB = {
  _get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // --- Users ---
  getUser(id) {
    const users = this._get('church_users') || {};
    return users[id] || null;
  },

  saveUser(id, data) {
    const users = this._get('church_users') || {};
    users[id] = { ...data, id };
    this._set('church_users', users);
  },

  getAllUsers() {
    const users = this._get('church_users') || {};
    return Object.values(users);
  },

  // --- Stores ---
  getStore(id) {
    const stores = this._get('church_stores') || {};
    return stores[id] || null;
  },

  getAllStores() {
    const stores = this._get('church_stores') || {};
    return Object.values(stores).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  saveStore(id, data) {
    const stores = this._get('church_stores') || {};
    stores[id] = { ...data, id };
    this._set('church_stores', stores);
  },

  deleteStore(id) {
    const stores = this._get('church_stores') || {};
    delete stores[id];
    this._set('church_stores', stores);
  },

  generateId() {
    return 'store_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // --- 데모 데이터 초기화 ---
  seedDemoData() {
    // 버전 체크: 이미지가 포함된 최신 데모 데이터로 갱신
    const currentVersion = this._get('church_demo_version');
    if (currentVersion === 3) return;
    // 기존 데이터 초기화 후 새 데이터 삽입
    this._set('church_stores', {});
    this._set('church_demo_version', 3);

    const demoStores = [
      {
        name: "은혜 식당",
        category: "음식점",
        description: "정성스런 한식을 준비합니다.\n집밥 같은 따뜻한 맛으로 성도님들을 모십니다.\n\n대표메뉴: 된장찌개, 김치찌개, 제육볶음",
        address: "서울시 강남구 역삼동 123-4",
        location: { lat: 37.5013, lng: 127.0396 },
        hours: "월~금 11:00~21:00\n토 11:00~15:00\n일 휴무",
        contact: { phone: "02-1234-5678", kakao: "grace_restaurant", instagram: "grace_food" },
        photos: [
          "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
        ],
        ownerName: "김은혜",
        ownerPhoto: "",
        ownerId: "demo_owner_1"
      },
      {
        name: "사랑 카페",
        category: "카페",
        description: "핸드드립 커피와 수제 디저트 전문점입니다.\n조용하고 편안한 공간에서 커피 한 잔의 여유를 즐기세요.\n\n성도님 10% 할인",
        address: "서울시 서초구 서초동 456-7",
        location: { lat: 37.4923, lng: 127.0292 },
        hours: "매일 09:00~22:00",
        contact: { phone: "02-2345-6789", kakao: "love_cafe", instagram: "love_cafe_kr" },
        photos: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop"
        ],
        ownerName: "박사랑",
        ownerPhoto: "",
        ownerId: "demo_owner_2"
      },
      {
        name: "믿음 헤어",
        category: "미용/뷰티",
        description: "20년 경력의 헤어 디자이너가 운영합니다.\n커트, 펌, 염색 전문\n\n성도님 10% 할인",
        address: "서울시 강남구 대치동 789-0",
        location: { lat: 37.4987, lng: 127.0587 },
        hours: "화~토 10:00~20:00\n일·월 휴무",
        contact: { phone: "02-3456-7890", kakao: "", instagram: "faith_hair" },
        photos: [
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop"
        ],
        ownerName: "이믿음",
        ownerPhoto: "",
        ownerId: "demo_owner_3"
      },
      {
        name: "소망 내과의원",
        category: "의료/건강",
        description: "내과 전문의 진료\n건강검진, 만성질환 관리\n예방접종, 영양상담",
        address: "서울시 송파구 잠실동 111-2",
        location: { lat: 37.5133, lng: 127.1001 },
        hours: "월~금 09:00~18:00\n토 09:00~13:00\n일 휴무",
        contact: { phone: "02-4567-8901", kakao: "", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop"
        ],
        ownerName: "최소망",
        ownerPhoto: "",
        ownerId: "demo_owner_4"
      },
      {
        name: "기쁨 학원",
        category: "교육",
        description: "초·중등 수학/영어 전문 학원\n소수정예 맞춤 교육\n내신+수능 완벽 대비",
        address: "서울시 강남구 개포동 222-3",
        location: { lat: 37.4845, lng: 127.0493 },
        hours: "월~금 14:00~22:00\n토 10:00~18:00",
        contact: { phone: "02-5678-9012", kakao: "joy_academy", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
        ],
        ownerName: "정기쁨",
        ownerPhoto: "",
        ownerId: "demo_owner_5"
      },
      {
        name: "평강 세탁소",
        category: "생활서비스",
        description: "의류 세탁, 수선, 드라이클리닝\n이불빨래, 운동화 세탁\n당일 세탁 가능",
        address: "서울시 강남구 일원동 333-4",
        location: { lat: 37.4912, lng: 127.0856 },
        hours: "월~토 08:00~20:00\n일 휴무",
        contact: { phone: "02-6789-0123", kakao: "peace_laundry", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=600&fit=crop"
        ],
        ownerName: "한평강",
        ownerPhoto: "",
        ownerId: "demo_owner_6"
      },
      {
        name: "감사 부동산",
        category: "부동산",
        description: "아파트 매매/전세/월세\n상가 임대\n성도님 중개수수료 할인",
        address: "서울시 서초구 반포동 444-5",
        location: { lat: 37.5067, lng: 127.0182 },
        hours: "월~토 09:00~19:00\n일 휴무",
        contact: { phone: "02-7890-1234", kakao: "thanks_realestate", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
        ],
        ownerName: "오감사",
        ownerPhoto: "",
        ownerId: "demo_owner_7"
      }
    ];

    demoStores.forEach(store => {
      const id = this.generateId();
      this.saveStore(id, {
        ...store,
        createdAt: Date.now() - Math.random() * 86400000 * 30
      });
    });

    // 데모 사용자 (마스터 계정)
    this.saveUser('admin', {
      name: '관리자',
      email: 'admin@church.com',
      role: 'master',
      password: 'admin'
    });

    // 데모 사업자 계정
    this.saveUser('business1', {
      name: '김은혜',
      email: 'grace@church.com',
      role: 'business',
      password: '1234'
    });
  }
};
