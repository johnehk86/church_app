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
    if (currentVersion === 4) return;
    // 기존 데이터 초기화 후 새 데이터 삽입
    this._set('church_stores', {});
    this._set('church_demo_version', 4);

    const demoStores = [
      {
        name: "은혜 식당",
        category: "음식점",
        description: "3대째 이어온 전통 한식의 맛을 정성껏 준비합니다.\n매일 아침 직접 끓이는 사골육수와 국내산 재료만을 사용하여\n집밥 같은 따뜻한 한 끼를 선사합니다.",
        address: "서울시 강남구 역삼동 123-4",
        location: { lat: 37.5013, lng: 127.0396 },
        hours: "월~금 11:00~21:00\n토 11:00~15:00\n일 휴무\n\n브레이크타임: 14:30~17:00",
        contact: { phone: "02-1234-5678", kakao: "grace_restaurant", instagram: "grace_food" },
        photos: [
          "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
        ],
        ownerName: "김은혜",
        ownerPhoto: "",
        ownerId: "demo_owner_1",
        ownerMessage: "매일 새벽 5시에 일어나 육수를 끓입니다.\n성도님들께 정성을 다해 따뜻한 한 끼를 대접하고 싶습니다.\n언제든 편하게 오세요!",
        memberBenefit: "성도님 방문 시 음료 서비스 + 10% 할인",
        menuTitle: "대표 메뉴",
        menu: [
          { name: "된장찌개 정식", desc: "국내산 한우 사골육수 + 직접 담근 된장", price: "9,000원" },
          { name: "김치찌개 정식", desc: "3년 숙성 묵은지 사용", price: "9,000원" },
          { name: "제육볶음 정식", desc: "국내산 돼지고기 + 매콤달콤 특제소스", price: "10,000원" },
          { name: "불고기 정식", desc: "한우 등심 + 배즙 양념", price: "13,000원" },
          { name: "비빔밥", desc: "신선한 나물 7종 + 고추장", price: "8,000원" }
        ],
        facilities: [
          { icon: "local_parking", label: "주차 가능" },
          { icon: "group", label: "단체석 20인" },
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "delivery_dining", label: "포장 가능" },
          { icon: "payments", label: "카드 결제" },
          { icon: "child_care", label: "유아의자" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop", caption: "넓은 홀 좌석" },
          { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=450&fit=crop", caption: "프라이빗 룸" },
          { url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=450&fit=crop", caption: "오픈 키친" }
        ]
      },
      {
        name: "사랑 카페",
        category: "카페",
        description: "스페셜티 원두를 직접 로스팅하는 핸드드립 전문 카페입니다.\n바리스타가 직접 내리는 커피와 매일 아침 구워내는 수제 디저트로\n조용하고 편안한 공간에서 여유로운 시간을 보내세요.",
        address: "서울시 서초구 서초동 456-7",
        location: { lat: 37.4923, lng: 127.0292 },
        hours: "매일 09:00~22:00\n\n라스트오더: 21:30",
        contact: { phone: "02-2345-6789", kakao: "love_cafe", instagram: "love_cafe_kr" },
        photos: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop"
        ],
        ownerName: "박사랑",
        ownerPhoto: "",
        ownerId: "demo_owner_2",
        ownerMessage: "좋은 원두, 좋은 사람들과 함께하는 따뜻한 공간을 만들고 싶었습니다.\n커피 한 잔으로 하루의 위로가 되길 바랍니다.",
        memberBenefit: "성도님 전 음료 10% 할인 + 생일 케이크 서비스",
        menuTitle: "Coffee & Dessert",
        menu: [
          { name: "시그니처 핸드드립", desc: "에티오피아 예가체프 싱글오리진", price: "6,500원" },
          { name: "카페 라떼", desc: "부드러운 우유 거품 + 에스프레소", price: "5,500원" },
          { name: "아인슈페너", desc: "비엔나 스타일 생크림 커피", price: "6,000원" },
          { name: "수제 티라미수", desc: "마스카포네 치즈 + 에스프레소", price: "7,000원" },
          { name: "당근 케이크", desc: "크림치즈 프로스팅 + 호두", price: "6,500원" },
          { name: "스콘 세트", desc: "클로티드 크림 + 잼 + 음료", price: "9,500원" }
        ],
        facilities: [
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "outlet", label: "콘센트" },
          { icon: "pets", label: "반려동물 동반" },
          { icon: "local_parking", label: "주차 2대" },
          { icon: "deck", label: "테라스" },
          { icon: "auto_stories", label: "북코너" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop", caption: "따뜻한 인테리어" },
          { url: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=450&fit=crop", caption: "핸드드립 바" },
          { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=450&fit=crop", caption: "시그니처 라떼" }
        ]
      },
      {
        name: "믿음 헤어",
        category: "미용/뷰티",
        description: "20년 경력의 수석 디자이너가 운영하는 프리미엄 헤어살롱입니다.\n트렌디한 스타일부터 클래식한 스타일까지,\n고객 한 분 한 분에게 맞춤 상담을 진행합니다.",
        address: "서울시 강남구 대치동 789-0",
        location: { lat: 37.4987, lng: 127.0587 },
        hours: "화~토 10:00~20:00\n일·월 휴무\n\n예약제 운영 (당일 예약 가능)",
        contact: { phone: "02-3456-7890", kakao: "", instagram: "faith_hair" },
        photos: [
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop"
        ],
        ownerName: "이믿음",
        ownerPhoto: "",
        ownerId: "demo_owner_3",
        ownerMessage: "아름다움은 자신감에서 시작됩니다.\n한 분 한 분의 개성을 살리는 스타일링을 약속드립니다.",
        memberBenefit: "성도님 커트 10% 할인 + 첫 방문 두피 진단 무료",
        menuTitle: "Service Menu",
        menu: [
          { name: "커트 (여성)", desc: "샴푸 + 커트 + 드라이", price: "35,000원" },
          { name: "커트 (남성)", desc: "샴푸 + 커트 + 스타일링", price: "20,000원" },
          { name: "디자인 펌", desc: "모질 상담 후 맞춤 시술", price: "80,000원~" },
          { name: "컬러 (전체)", desc: "두피 보호제 + 컬러 + 트리트먼트", price: "70,000원~" },
          { name: "클리닉 트리트먼트", desc: "케라틴 집중 영양 관리", price: "40,000원" },
          { name: "두피 스케일링", desc: "전문 기기 두피 클렌징", price: "30,000원" }
        ],
        facilities: [
          { icon: "local_parking", label: "건물 내 주차" },
          { icon: "event_seat", label: "프라이빗 룸" },
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "local_cafe", label: "음료 제공" },
          { icon: "book_online", label: "온라인 예약" },
          { icon: "child_care", label: "키즈 커트 가능" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=500&fit=crop", caption: "스타일링 공간" },
          { url: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=600&h=450&fit=crop", caption: "샴푸 부스" },
          { url: "https://images.unsplash.com/photo-1562322140-8baeacacf07d?w=600&h=450&fit=crop", caption: "프리미엄 제품 사용" }
        ]
      },
      {
        name: "소망 내과의원",
        category: "의료/건강",
        description: "내과 전문의 원장이 직접 진료합니다.\n일반 진료부터 건강검진, 만성질환 관리까지\n체계적인 의료 서비스를 제공합니다.",
        address: "서울시 송파구 잠실동 111-2",
        location: { lat: 37.5133, lng: 127.1001 },
        hours: "월~금 09:00~18:00\n토 09:00~13:00\n일·공휴일 휴진\n\n점심시간: 13:00~14:00",
        contact: { phone: "02-4567-8901", kakao: "", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop"
        ],
        ownerName: "최소망",
        ownerPhoto: "",
        ownerId: "demo_owner_4",
        ownerMessage: "건강은 하나님이 주신 소중한 선물입니다.\n성도님들의 건강을 지키는 것이 저의 사명이라 생각합니다.",
        memberBenefit: "성도님 건강검진 20% 할인 + 독감 예방접종 할인",
        menuTitle: "진료 안내",
        menu: [
          { name: "일반 내과 진료", desc: "감기, 소화불량, 두통 등 일반 질환", price: "" },
          { name: "건강검진 (기본)", desc: "혈액검사 + 소변검사 + 흉부 X-ray", price: "50,000원" },
          { name: "건강검진 (정밀)", desc: "기본 + 초음파 + 심전도 + 골밀도", price: "150,000원" },
          { name: "만성질환 관리", desc: "고혈압, 당뇨, 고지혈증 정기 관리", price: "" },
          { name: "예방접종", desc: "독감, 폐렴, 대상포진 등", price: "" },
          { name: "비타민 수액", desc: "피로회복 + 면역력 강화", price: "50,000원" }
        ],
        facilities: [
          { icon: "local_parking", label: "건물 주차" },
          { icon: "accessible", label: "장애인 편의" },
          { icon: "elevator", label: "엘리베이터" },
          { icon: "medication", label: "원내 약국" },
          { icon: "book_online", label: "온라인 예약" },
          { icon: "credit_card", label: "카드 결제" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=500&fit=crop", caption: "깨끗한 진료실" },
          { url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600&h=450&fit=crop", caption: "대기 공간" },
          { url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=450&fit=crop", caption: "최신 의료 장비" }
        ]
      },
      {
        name: "기쁨 학원",
        category: "교육",
        description: "소수정예 맞춤 교육으로 학생 한 명 한 명의 성장을 돕습니다.\n수학/영어 전문 강사진이 내신과 수능을 완벽 대비하며,\n자기주도학습 습관까지 잡아드립니다.",
        address: "서울시 강남구 개포동 222-3",
        location: { lat: 37.4845, lng: 127.0493 },
        hours: "월~금 14:00~22:00\n토 10:00~18:00\n일 휴원",
        contact: { phone: "02-5678-9012", kakao: "joy_academy", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
        ],
        ownerName: "정기쁨",
        ownerPhoto: "",
        ownerId: "demo_owner_5",
        ownerMessage: "성적도 중요하지만, 아이들이 배움의 기쁨을 느끼는 것이\n더 중요하다고 생각합니다. 신앙 위에 실력을 쌓아가는\n아이들을 응원합니다.",
        memberBenefit: "성도님 자녀 수강료 15% 할인 + 레벨테스트 무료",
        menuTitle: "수강 프로그램",
        menu: [
          { name: "초등 수학", desc: "교과 심화 + 사고력 수학 (주 3회)", price: "250,000원/월" },
          { name: "초등 영어", desc: "파닉스 ~ 리딩 레벨업 (주 3회)", price: "250,000원/월" },
          { name: "중등 수학", desc: "내신 대비 + 선행 (주 3회)", price: "300,000원/월" },
          { name: "중등 영어", desc: "문법 + 독해 + 듣기 (주 3회)", price: "300,000원/월" },
          { name: "자기주도학습반", desc: "학습 관리 + 질문 코칭 (주 5회)", price: "200,000원/월" }
        ],
        facilities: [
          { icon: "menu_book", label: "자습실 완비" },
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "local_parking", label: "학원 앞 주차" },
          { icon: "videocam", label: "CCTV 안전관리" },
          { icon: "ac_unit", label: "냉난방 완비" },
          { icon: "school", label: "1:4 소수정예" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop", caption: "밝은 강의실" },
          { url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=450&fit=crop", caption: "자습실" },
          { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=450&fit=crop", caption: "상담 공간" }
        ]
      },
      {
        name: "평강 세탁소",
        category: "생활서비스",
        description: "30년 경력의 세탁 장인이 운영하는 전문 세탁소입니다.\n일반 세탁부터 명품 케어, 웨딩드레스 세탁까지\n소중한 옷을 정성껏 관리합니다.",
        address: "서울시 강남구 일원동 333-4",
        location: { lat: 37.4912, lng: 127.0856 },
        hours: "월~토 08:00~20:00\n일 휴무\n\n익일 수령 가능 (급행 당일 가능)",
        contact: { phone: "02-6789-0123", kakao: "peace_laundry", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=600&fit=crop"
        ],
        ownerName: "한평강",
        ownerPhoto: "",
        ownerId: "demo_owner_6",
        ownerMessage: "옷 한 벌에도 추억과 소중함이 담겨 있습니다.\n30년간 쌓은 노하우로 정성껏 관리해 드리겠습니다.",
        memberBenefit: "성도님 드라이클리닝 20% 할인",
        menuTitle: "서비스 & 가격",
        menu: [
          { name: "와이셔츠", desc: "세탁 + 다림질", price: "2,500원" },
          { name: "정장 (상의)", desc: "드라이클리닝", price: "5,000원" },
          { name: "코트/패딩", desc: "드라이클리닝 + 방수 처리", price: "12,000원~" },
          { name: "이불 세탁", desc: "솜이불 / 극세사 / 오리털", price: "15,000원~" },
          { name: "운동화 세탁", desc: "전문 세척 + 건조", price: "8,000원" },
          { name: "명품 케어", desc: "브랜드별 맞춤 세탁", price: "문의" }
        ],
        facilities: [
          { icon: "local_shipping", label: "수거/배달" },
          { icon: "speed", label: "당일 급행" },
          { icon: "dry_cleaning", label: "친환경 세제" },
          { icon: "local_parking", label: "매장 앞 주차" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=500&fit=crop", caption: "깔끔한 매장" },
          { url: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&h=450&fit=crop", caption: "전문 장비" }
        ]
      },
      {
        name: "감사 부동산",
        category: "부동산",
        description: "강남/서초 지역 20년 전문 공인중개사입니다.\n아파트 매매/전세/월세, 상가 임대까지\n성도님들의 든든한 부동산 파트너가 되어드립니다.",
        address: "서울시 서초구 반포동 444-5",
        location: { lat: 37.5067, lng: 127.0182 },
        hours: "월~토 09:00~19:00\n일 휴무\n\n사전 예약 시 일요일 상담 가능",
        contact: { phone: "02-7890-1234", kakao: "thanks_realestate", instagram: "" },
        photos: [
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
        ],
        ownerName: "오감사",
        ownerPhoto: "",
        ownerId: "demo_owner_7",
        ownerMessage: "집은 가족의 보금자리입니다.\n성도님들께 정직하고 투명한 중개를 약속드립니다.\n언제든 편하게 상담 문의 주세요.",
        memberBenefit: "성도님 중개수수료 30% 할인 + 무료 시세 상담",
        menuTitle: "전문 서비스",
        menu: [
          { name: "아파트 매매", desc: "강남/서초/송파 전 단지", price: "" },
          { name: "아파트 전세/월세", desc: "실시간 매물 확인 가능", price: "" },
          { name: "오피스텔/원룸", desc: "직장인/학생 맞춤 추천", price: "" },
          { name: "상가 임대", desc: "창업 컨설팅 + 상권 분석", price: "" },
          { name: "재건축/재개발 상담", desc: "투자 가치 분석", price: "" },
          { name: "무료 시세 상담", desc: "내 집 시세 무료 감정", price: "무료" }
        ],
        facilities: [
          { icon: "verified", label: "공인중개사" },
          { icon: "description", label: "계약서 검토" },
          { icon: "directions_car", label: "현장 동행" },
          { icon: "support_agent", label: "사후 관리" },
          { icon: "local_parking", label: "주차 가능" }
        ],
        interiorPhotos: [
          { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop", caption: "상담 사무실" },
          { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=450&fit=crop", caption: "매물 안내" }
        ]
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
