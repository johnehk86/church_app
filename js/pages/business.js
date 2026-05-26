/**
 * 사업자(사장님) 매장 관리 페이지 - 풀 에디터
 */
const BusinessPage = {
  _store: null,
  _isNew: false,
  _photoDataUrls: [],
  _interiorPhotos: [], // { url, caption }
  _menuItems: [],      // { name, desc, price }
  _facilities: [],     // { icon, label }

  // 선택 가능한 시설 목록
  _facilityOptions: [
    { icon: "local_parking", label: "주차 가능" },
    { icon: "wifi", label: "Wi-Fi" },
    { icon: "group", label: "단체석" },
    { icon: "delivery_dining", label: "포장/배달" },
    { icon: "payments", label: "카드 결제" },
    { icon: "child_care", label: "유아 시설" },
    { icon: "pets", label: "반려동물" },
    { icon: "outlet", label: "콘센트" },
    { icon: "deck", label: "테라스" },
    { icon: "local_cafe", label: "음료 제공" },
    { icon: "book_online", label: "온라인 예약" },
    { icon: "accessible", label: "장애인 편의" },
    { icon: "elevator", label: "엘리베이터" },
    { icon: "ac_unit", label: "냉난방 완비" },
    { icon: "videocam", label: "CCTV" },
    { icon: "event_seat", label: "프라이빗 룸" },
    { icon: "local_shipping", label: "수거/배달" },
    { icon: "speed", label: "당일 서비스" },
    { icon: "verified", label: "자격증 보유" },
    { icon: "support_agent", label: "사후 관리" }
  ],

  render(container) {
    const user = AuthService.getCurrentUser();
    if (!user) { App.navigate('#/login'); return; }

    // 기존 매장 로드
    this._store = StoreService.getByOwnerId(user.id);
    this._isNew = !this._store;

    if (this._isNew) {
      this._store = {
        ownerId: user.id,
        name: '', category: '기타', description: '',
        address: '', location: { lat: '', lng: '' },
        hours: '', contact: { phone: '', kakao: '', instagram: '' },
        photos: [], ownerName: user.name || '', ownerPhoto: '',
        ownerMessage: '', memberBenefit: '', menuTitle: '',
        menu: [], facilities: [], interiorPhotos: []
      };
    }

    this._photoDataUrls = [...(this._store.photos || [])];
    this._interiorPhotos = (this._store.interiorPhotos || []).map(p => ({...p}));
    this._menuItems = (this._store.menu || []).map(m => ({...m}));
    this._facilities = (this._store.facilities || []).map(f => ({...f}));

    this._renderForm(container);
  },

  _renderForm(container) {
    const s = this._store;
    const categoryOptions = Utils.categories.filter(c => c !== '전체')
      .map(c => `<option value="${c}" ${s.category === c ? 'selected' : ''}>${c}</option>`)
      .join('');

    // 대표 사진 미리보기
    const mainPhotoPreviews = this._photoDataUrls.map((url, i) => `
      <div class="image-preview-item">
        <img src="${url}" alt="사진 ${i+1}">
        <button type="button" class="image-preview-item__remove" onclick="BusinessPage.removeMainPhoto(${i})">&times;</button>
      </div>
    `).join('');

    // 인테리어 사진 미리보기
    const interiorPreviews = this._interiorPhotos.map((photo, i) => `
      <div class="image-preview-item" style="position:relative">
        <img src="${photo.url}" alt="내부 ${i+1}">
        <button type="button" class="image-preview-item__remove" onclick="BusinessPage.removeInteriorPhoto(${i})">&times;</button>
        <input type="text" class="form-input" placeholder="설명 (예: 홀 좌석)"
               value="${Utils.escapeHtml(photo.caption || '')}"
               onchange="BusinessPage.updateInteriorCaption(${i}, this.value)"
               style="padding:6px 8px;font-size:0.75rem;border:1px solid var(--outline-variant);border-radius:4px;margin-top:4px">
      </div>
    `).join('');

    // 메뉴 목록
    const menuListHtml = this._menuItems.map((item, i) => `
      <div class="menu-edit-item">
        <div class="menu-edit-item__fields">
          <input type="text" class="form-input" placeholder="메뉴명" value="${Utils.escapeHtml(item.name)}"
                 onchange="BusinessPage.updateMenu(${i}, 'name', this.value)" style="font-weight:600">
          <input type="text" class="form-input" placeholder="설명" value="${Utils.escapeHtml(item.desc || '')}"
                 onchange="BusinessPage.updateMenu(${i}, 'desc', this.value)" style="font-size:0.875rem">
          <input type="text" class="form-input" placeholder="가격 (예: 9,000원)" value="${Utils.escapeHtml(item.price || '')}"
                 onchange="BusinessPage.updateMenu(${i}, 'price', this.value)" style="font-size:0.875rem;color:var(--accent)">
        </div>
        <button type="button" class="btn--icon-remove" onclick="BusinessPage.removeMenu(${i})">
          <span class="material-symbols-outlined" style="font-size:18px">close</span>
        </button>
      </div>
    `).join('');

    // 시설 체크박스
    const facilitiesHtml = this._facilityOptions.map(opt => {
      const isChecked = this._facilities.some(f => f.icon === opt.icon);
      return `
        <label class="facility-check ${isChecked ? 'facility-check--active' : ''}">
          <input type="checkbox" ${isChecked ? 'checked' : ''}
                 onchange="BusinessPage.toggleFacility('${opt.icon}', '${opt.label}', this.checked)">
          <span class="material-symbols-outlined" style="font-size:16px">${opt.icon}</span>
          <span>${opt.label}</span>
        </label>
      `;
    }).join('');

    container.innerHTML = `
      <div class="page">
        <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;margin-bottom:8px">
          ${this._isNew ? 'New Store' : 'Edit Store'}
        </h2>
        <p style="font-size:0.875rem;color:var(--secondary);margin-bottom:28px">
          ${this._isNew ? '매장 정보를 입력하고 등록하세요' : '매장 정보를 자유롭게 수정하세요'}
        </p>

        <form id="store-form" onsubmit="BusinessPage.onSubmit(event)">

          <!-- ===== 1. 기본 정보 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">storefront</span> 기본 정보
            </h3>
            <div class="form-group">
              <label class="form-label">상호명 *</label>
              <input class="form-input" name="name" value="${Utils.escapeHtml(s.name)}" placeholder="매장 이름" required>
            </div>
            <div class="form-group">
              <label class="form-label">업종 *</label>
              <select class="form-select" name="category">${categoryOptions}</select>
            </div>
            <div class="form-group">
              <label class="form-label">매장 소개</label>
              <textarea class="form-textarea" name="description" placeholder="매장을 소개해주세요. 어떤 곳인지, 어떤 것을 하는지...">${Utils.escapeHtml(s.description || '')}</textarea>
            </div>
          </div>

          <!-- ===== 2. 대표 사진 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">photo_camera</span> 대표 사진
            </h3>
            <p class="editor-hint">매장 외관, 간판 등 대표 사진을 올려주세요</p>
            <div class="image-upload" onclick="document.getElementById('main-photo-input').click()">
              <span class="material-symbols-outlined" style="font-size:2rem;color:var(--outline)">add_photo_alternate</span>
              <div class="image-upload__text">사진 추가</div>
              <input type="file" id="main-photo-input" accept="image/*" multiple
                     style="display:none" onchange="BusinessPage.onMainPhotoSelect(event)">
            </div>
            ${mainPhotoPreviews ? `<div class="image-preview-grid">${mainPhotoPreviews}</div>` : ''}
          </div>

          <!-- ===== 3. 사장님 정보 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">person</span> 사장님 정보
            </h3>
            <div class="form-group">
              <label class="form-label">성함</label>
              <input class="form-input" name="ownerName" value="${Utils.escapeHtml(s.ownerName || '')}" placeholder="사장님 이름">
            </div>
            <div class="form-group">
              <label class="form-label">사장님 한마디</label>
              <textarea class="form-textarea" name="ownerMessage" placeholder="성도님들께 전하고 싶은 인사말을 적어주세요">${Utils.escapeHtml(s.ownerMessage || '')}</textarea>
            </div>
          </div>

          <!-- ===== 4. 성도 혜택 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">church</span> 성도 특별 혜택
            </h3>
            <p class="editor-hint">교회 성도님들에게 제공하는 할인이나 특별 혜택이 있으면 적어주세요</p>
            <div class="form-group">
              <input class="form-input" name="memberBenefit" value="${Utils.escapeHtml(s.memberBenefit || '')}"
                     placeholder="예: 성도님 10% 할인, 첫 방문 음료 서비스 등">
            </div>
          </div>

          <!-- ===== 5. 메뉴 / 서비스 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">menu_book</span> 메뉴 / 서비스
            </h3>
            <div class="form-group">
              <label class="form-label">섹션 제목</label>
              <input class="form-input" name="menuTitle" value="${Utils.escapeHtml(s.menuTitle || '')}"
                     placeholder="예: 대표 메뉴, Service Menu, 수강 프로그램...">
            </div>
            <div id="menu-list">${menuListHtml}</div>
            <button type="button" class="btn btn--secondary" onclick="BusinessPage.addMenu()" style="margin-top:12px">
              <span class="material-symbols-outlined" style="font-size:18px">add</span> 메뉴 추가
            </button>
          </div>

          <!-- ===== 6. 시설 / 특징 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">stars</span> 시설 / 특징
            </h3>
            <p class="editor-hint">해당하는 항목을 선택하세요</p>
            <div class="facility-check-grid">${facilitiesHtml}</div>
          </div>

          <!-- ===== 7. 인테리어 사진 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">photo_library</span> 인테리어 / 내부 사진
            </h3>
            <p class="editor-hint">매장 내부, 시설, 제품 사진 등을 올려주세요</p>
            <div class="image-upload" onclick="document.getElementById('interior-photo-input').click()">
              <span class="material-symbols-outlined" style="font-size:2rem;color:var(--outline)">add_photo_alternate</span>
              <div class="image-upload__text">내부 사진 추가</div>
              <input type="file" id="interior-photo-input" accept="image/*" multiple
                     style="display:none" onchange="BusinessPage.onInteriorPhotoSelect(event)">
            </div>
            ${interiorPreviews ? `<div class="image-preview-grid">${interiorPreviews}</div>` : ''}
          </div>

          <!-- ===== 8. 위치 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">location_on</span> 위치 정보
            </h3>
            <div class="form-group">
              <label class="form-label">주소</label>
              <input class="form-input" name="address" value="${Utils.escapeHtml(s.address || '')}" placeholder="매장 주소">
            </div>
            <div style="display:flex;gap:12px">
              <div class="form-group" style="flex:1">
                <label class="form-label">위도</label>
                <input class="form-input" name="lat" type="number" step="any" value="${s.location?.lat || ''}" placeholder="37.5665">
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">경도</label>
                <input class="form-input" name="lng" type="number" step="any" value="${s.location?.lng || ''}" placeholder="126.9780">
              </div>
            </div>
            <p class="editor-hint">네이버 지도에서 매장 검색 후 좌표를 입력하세요</p>
          </div>

          <!-- ===== 9. 운영시간 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">schedule</span> 운영시간
            </h3>
            <div class="form-group">
              <textarea class="form-textarea" name="hours" placeholder="월~금 09:00~18:00&#10;토 10:00~15:00&#10;일 휴무" style="min-height:80px">${Utils.escapeHtml(s.hours || '')}</textarea>
            </div>
          </div>

          <!-- ===== 10. 연락처 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">contact_phone</span> 연락처
            </h3>
            <div class="form-group">
              <label class="form-label">전화번호</label>
              <input class="form-input" name="phone" type="tel" value="${Utils.escapeHtml(s.contact?.phone || '')}" placeholder="02-0000-0000">
            </div>
            <div class="form-group">
              <label class="form-label">카카오톡</label>
              <input class="form-input" name="kakao" value="${Utils.escapeHtml(s.contact?.kakao || '')}" placeholder="카카오톡 ID 또는 오픈채팅 링크">
            </div>
            <div class="form-group">
              <label class="form-label">인스타그램</label>
              <input class="form-input" name="instagram" value="${Utils.escapeHtml(s.contact?.instagram || '')}" placeholder="@ 제외한 아이디">
            </div>
          </div>

          <!-- 저장 버튼 -->
          <div style="margin-top:32px;padding-bottom:20px">
            <button type="submit" class="btn btn--primary" id="submit-btn">
              <span class="material-symbols-outlined" style="font-size:18px">save</span>
              ${this._isNew ? '매장 등록하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  // --- 대표 사진 ---
  onMainPhotoSelect(event) {
    Array.from(event.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._photoDataUrls.push(e.target.result);
        this._renderForm(document.getElementById('app-content'));
      };
      reader.readAsDataURL(file);
    });
  },

  removeMainPhoto(i) {
    this._photoDataUrls.splice(i, 1);
    this._renderForm(document.getElementById('app-content'));
  },

  // --- 인테리어 사진 ---
  onInteriorPhotoSelect(event) {
    Array.from(event.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._interiorPhotos.push({ url: e.target.result, caption: '' });
        this._renderForm(document.getElementById('app-content'));
      };
      reader.readAsDataURL(file);
    });
  },

  removeInteriorPhoto(i) {
    this._interiorPhotos.splice(i, 1);
    this._renderForm(document.getElementById('app-content'));
  },

  updateInteriorCaption(i, value) {
    this._interiorPhotos[i].caption = value;
  },

  // --- 메뉴 ---
  addMenu() {
    this._menuItems.push({ name: '', desc: '', price: '' });
    this._renderForm(document.getElementById('app-content'));
    // 스크롤을 메뉴 섹션으로
    setTimeout(() => {
      const items = document.querySelectorAll('.menu-edit-item');
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  },

  removeMenu(i) {
    this._menuItems.splice(i, 1);
    this._renderForm(document.getElementById('app-content'));
  },

  updateMenu(i, field, value) {
    this._menuItems[i][field] = value;
  },

  // --- 시설 ---
  toggleFacility(icon, label, checked) {
    if (checked) {
      if (!this._facilities.some(f => f.icon === icon)) {
        this._facilities.push({ icon, label });
      }
    } else {
      this._facilities = this._facilities.filter(f => f.icon !== icon);
    }
  },

  // --- 저장 ---
  onSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('store-form');
    const user = AuthService.getCurrentUser();

    // 빈 메뉴 항목 제거
    const cleanMenu = this._menuItems.filter(m => m.name.trim());

    const storeData = {
      ownerId: user.id,
      name: form.name.value.trim(),
      category: form.category.value,
      description: form.description.value.trim(),
      address: form.address.value.trim(),
      location: {
        lat: parseFloat(form.lat.value) || null,
        lng: parseFloat(form.lng.value) || null
      },
      hours: form.hours.value.trim(),
      contact: {
        phone: form.phone.value.trim(),
        kakao: form.kakao.value.trim(),
        instagram: form.instagram.value.trim()
      },
      photos: this._photoDataUrls,
      ownerName: form.ownerName.value.trim(),
      ownerPhoto: this._store.ownerPhoto || '',
      ownerMessage: form.ownerMessage.value.trim(),
      memberBenefit: form.memberBenefit.value.trim(),
      menuTitle: form.menuTitle.value.trim(),
      menu: cleanMenu,
      facilities: this._facilities,
      interiorPhotos: this._interiorPhotos
    };

    if (this._isNew) {
      StoreService.create(storeData);
      Toast.show('매장이 등록되었습니다!', 'success');
    } else {
      StoreService.update(this._store.id, storeData);
      Toast.show('저장되었습니다!', 'success');
    }

    App.navigate('#/');
  },

  destroy() {
    this._store = null;
    this._photoDataUrls = [];
    this._interiorPhotos = [];
    this._menuItems = [];
    this._facilities = [];
  }
};
