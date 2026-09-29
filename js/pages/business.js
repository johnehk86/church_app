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
  _coupons: [],        // 쿠폰 목록

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

  async render(container, params) {
    const user = AuthService.getCurrentUser();
    if (!user) { App.navigate('#/login'); return; }

    const role = AuthService.getUserRole();
    const editStoreId = params && params[0];

    // 매장 로드 (비동기)
    const isNewRoute = App.currentRoute === 'new-store';
    if (isNewRoute) {
      this._store = null; // 항상 새 매장 생성
    } else if (editStoreId && role === 'master') {
      this._store = await StoreService.getById(editStoreId);
    } else {
      this._store = await StoreService.getByOwnerId(user.id);
    }
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

    if (this._store.id) {
      this._coupons = await CouponService.getByStore(this._store.id);
    } else {
      this._coupons = [];
    }

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
                 onchange="BusinessPage.toggleFacility('${opt.icon}', '${opt.label}', this.checked, this.parentElement)">
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

          <!-- ===== 6.5 쿠폰 / 이벤트 ===== -->
          <div class="editor-section">
            <h3 class="editor-section__title">
              <span class="material-symbols-outlined">local_offer</span> 쿠폰 / 이벤트
            </h3>
            ${this._isNew ? `
              <p class="editor-hint">매장을 먼저 등록하면 쿠폰을 추가할 수 있습니다.</p>
            ` : `
              <div id="business-coupon-list">
                ${this._renderCouponList()}
              </div>
              <div id="business-coupon-form" style="display:none;border:1px solid var(--accent);border-radius:12px;padding:16px;margin-bottom:12px;background:var(--surface-container)">
                <div class="form-group">
                  <label class="form-label">쿠폰 제목</label>
                  <input class="form-input" id="coupon-title-input" placeholder="예: 첫 방문 10% 할인, 성도 특별 혜택">
                </div>
                <div style="display:flex;gap:12px">
                  <div class="form-group" style="flex:1">
                    <label class="form-label">할인율 (%)</label>
                    <input class="form-input" id="coupon-discount-input" type="number" min="1" max="100" placeholder="10">
                  </div>
                  <div class="form-group" style="flex:1">
                    <label class="form-label">발행 매수</label>
                    <input class="form-input" id="coupon-count-input" type="number" min="1" placeholder="10">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">유효기간 (선택)</label>
                  <input class="form-input" id="coupon-expires-input" type="date">
                </div>
                <div style="display:flex;gap:8px">
                  <button type="button" class="btn btn--primary" onclick="BusinessPage.saveCoupon()" style="flex:1">저장</button>
                  <button type="button" class="btn btn--ghost" onclick="BusinessPage.hideCouponForm()" style="flex:1">취소</button>
                </div>
              </div>
              <button type="button" class="btn btn--secondary" id="show-coupon-form-btn"
                      onclick="BusinessPage.showCouponForm()" style="margin-top:4px">
                <span class="material-symbols-outlined" style="font-size:18px">add</span> 쿠폰 추가
              </button>
            `}
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
              <div style="display:flex;gap:8px;align-items:flex-end">
                <input class="form-input" name="address" value="${Utils.escapeHtml(s.address || '')}" placeholder="매장 주소를 입력하세요" style="flex:1">
                <button type="button" class="btn btn--primary btn--small" onclick="BusinessPage.findCoords()" id="find-coords-btn" style="width:auto;white-space:nowrap;flex-shrink:0;margin-bottom:2px">
                  <span class="material-symbols-outlined" style="font-size:16px">search</span> 좌표 찾기
                </button>
              </div>
            </div>
            <div id="coords-result"></div>
            <div style="display:flex;gap:12px">
              <div class="form-group" style="flex:1">
                <label class="form-label">위도</label>
                <input class="form-input" name="lat" type="number" step="any" value="${s.location?.lat || ''}" placeholder="자동 입력됩니다">
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">경도</label>
                <input class="form-input" name="lng" type="number" step="any" value="${s.location?.lng || ''}" placeholder="자동 입력됩니다">
              </div>
            </div>
            <p class="editor-hint">주소 입력 후 "좌표 찾기"를 누르면 자동으로 위도/경도가 입력됩니다</p>
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

  // --- 폼 값 저장/복원 (사진 추가 시 입력값 유지) ---
  _saveFormValues() {
    const form = document.getElementById('store-form');
    if (!form) return;
    this._formCache = {
      name: form.name?.value || '',
      category: form.category?.value || '',
      description: form.description?.value || '',
      ownerName: form.ownerName?.value || '',
      ownerMessage: form.ownerMessage?.value || '',
      memberBenefit: form.memberBenefit?.value || '',
      menuTitle: form.menuTitle?.value || '',
      address: form.address?.value || '',
      lat: form.lat?.value || '',
      lng: form.lng?.value || '',
      hours: form.hours?.value || '',
      phone: form.phone?.value || '',
      kakao: form.kakao?.value || '',
      instagram: form.instagram?.value || ''
    };
  },

  _restoreFormValues() {
    if (!this._formCache) return;
    const form = document.getElementById('store-form');
    if (!form) return;
    Object.keys(this._formCache).forEach(key => {
      if (form[key]) form[key].value = this._formCache[key];
    });
  },

  _reRenderForm() {
    this._saveFormValues();
    // _store에 캐시된 폼 값 반영
    if (this._formCache) {
      this._store = { ...this._store, ...this._formCache,
        contact: { phone: this._formCache.phone, kakao: this._formCache.kakao, instagram: this._formCache.instagram },
        location: { lat: this._formCache.lat, lng: this._formCache.lng }
      };
    }
    this._renderForm(document.getElementById('app-content'));
  },

  // --- 대표 사진 ---
  onMainPhotoSelect(event) {
    Array.from(event.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._photoDataUrls.push(e.target.result);
        this._reRenderForm();
      };
      reader.readAsDataURL(file);
    });
  },

  removeMainPhoto(i) {
    this._photoDataUrls.splice(i, 1);
    this._reRenderForm();
  },

  // --- 인테리어 사진 ---
  onInteriorPhotoSelect(event) {
    Array.from(event.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._interiorPhotos.push({ url: e.target.result, caption: '' });
        this._reRenderForm();
      };
      reader.readAsDataURL(file);
    });
  },

  removeInteriorPhoto(i) {
    this._interiorPhotos.splice(i, 1);
    this._reRenderForm();
  },

  updateInteriorCaption(i, value) {
    this._interiorPhotos[i].caption = value;
  },

  // --- 메뉴 ---
  addMenu() {
    this._menuItems.push({ name: '', desc: '', price: '' });
    this._reRenderForm();
    setTimeout(() => {
      const items = document.querySelectorAll('.menu-edit-item');
      if (items.length) items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  },

  removeMenu(i) {
    this._menuItems.splice(i, 1);
    this._reRenderForm();
  },

  updateMenu(i, field, value) {
    this._menuItems[i][field] = value;
  },

  // --- 시설 ---
  toggleFacility(icon, label, checked, el) {
    if (checked) {
      if (!this._facilities.some(f => f.icon === icon)) {
        this._facilities.push({ icon, label });
      }
      el.classList.add('facility-check--active');
    } else {
      this._facilities = this._facilities.filter(f => f.icon !== icon);
      el.classList.remove('facility-check--active');
    }
  },

  // --- 주소 → 좌표 자동 변환 ---
  async findCoords() {
    const form = document.getElementById('store-form');
    const address = form.address.value.trim();
    const btn = document.getElementById('find-coords-btn');
    const resultEl = document.getElementById('coords-result');

    if (!address) {
      Toast.show('주소를 먼저 입력해주세요.', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px"></div>';
    resultEl.innerHTML = '';

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=kr`,
        { headers: { 'Accept-Language': 'ko' } }
      );
      const results = await res.json();

      if (results.length === 0) {
        resultEl.innerHTML = `
          <div style="padding:12px;background:var(--surface-container);border-radius:8px;margin-bottom:12px">
            <p style="font-size:0.8125rem;color:var(--error)">주소를 찾을 수 없습니다. 더 자세한 주소를 입력해보세요.</p>
          </div>`;
      } else if (results.length === 1) {
        // 결과가 하나면 바로 적용
        form.lat.value = parseFloat(results[0].lat).toFixed(6);
        form.lng.value = parseFloat(results[0].lon).toFixed(6);
        resultEl.innerHTML = `
          <div style="padding:12px;background:#f0f8f0;border-radius:8px;margin-bottom:12px">
            <p style="font-size:0.8125rem;color:var(--success);font-weight:600">좌표를 찾았습니다!</p>
            <p style="font-size:0.8125rem;color:var(--secondary);margin-top:4px">${Utils.escapeHtml(results[0].display_name)}</p>
          </div>`;
      } else {
        // 여러 결과면 선택
        resultEl.innerHTML = `
          <div style="padding:12px;background:var(--surface-container);border-radius:8px;margin-bottom:12px">
            <p style="font-size:0.8125rem;font-weight:600;margin-bottom:8px">검색 결과에서 선택하세요:</p>
            ${results.map((r, i) => `
              <button type="button" onclick="BusinessPage.selectCoords(${r.lat}, ${r.lon}, '${Utils.escapeHtml(r.display_name).replace(/'/g, "\\'")}')"
                      style="display:block;width:100%;text-align:left;padding:10px;margin-bottom:4px;border:1px solid var(--outline-variant);border-radius:8px;background:white;cursor:pointer;font-size:0.8125rem;color:var(--on-surface)">
                ${Utils.escapeHtml(r.display_name)}
              </button>
            `).join('')}
          </div>`;
      }
    } catch (e) {
      console.error('좌표 검색 실패:', e);
      resultEl.innerHTML = `
        <div style="padding:12px;background:var(--surface-container);border-radius:8px;margin-bottom:12px">
          <p style="font-size:0.8125rem;color:var(--error)">좌표 검색에 실패했습니다. 다시 시도해주세요.</p>
        </div>`;
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">search</span> 좌표 찾기';
  },

  selectCoords(lat, lon, displayName) {
    const form = document.getElementById('store-form');
    form.lat.value = parseFloat(lat).toFixed(6);
    form.lng.value = parseFloat(lon).toFixed(6);
    document.getElementById('coords-result').innerHTML = `
      <div style="padding:12px;background:#f0f8f0;border-radius:8px;margin-bottom:12px">
        <p style="font-size:0.8125rem;color:var(--success);font-weight:600">좌표가 입력되었습니다!</p>
        <p style="font-size:0.8125rem;color:var(--secondary);margin-top:4px">${displayName}</p>
      </div>`;
  },

  // --- 저장 ---
  async onSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('store-form');
    const btn = document.getElementById('submit-btn');
    const user = AuthService.getCurrentUser();

    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px"></div> 저장 중...';

    try {
      const storeOwnerId = this._store.ownerId || user.id;

      // 대표 사진 업로드 (새 dataURL만 Firebase Storage에 업로드)
      const uploadedPhotos = await StorageService.uploadPhotos(
        this._photoDataUrls, `stores/${storeOwnerId}/main`
      );

      // 인테리어 사진 업로드
      const uploadedInterior = [];
      for (const photo of this._interiorPhotos) {
        if (photo.url.startsWith('data:')) {
          const url = await StorageService.upload(photo.url, `stores/${storeOwnerId}/interior`);
          uploadedInterior.push({ url, caption: photo.caption });
        } else {
          uploadedInterior.push(photo);
        }
      }

      const cleanMenu = this._menuItems.filter(m => m.name.trim());

      const storeData = {
        ownerId: storeOwnerId,
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
        photos: uploadedPhotos,
        ownerName: form.ownerName.value.trim(),
        ownerPhoto: this._store.ownerPhoto || '',
        ownerMessage: form.ownerMessage.value.trim(),
        memberBenefit: form.memberBenefit.value.trim(),
        menuTitle: form.menuTitle.value.trim(),
        menu: cleanMenu,
        facilities: this._facilities,
        interiorPhotos: uploadedInterior
      };

      if (this._isNew) {
        await StoreService.create(storeData);
        Toast.show('매장이 등록되었습니다!', 'success');
      } else {
        await StoreService.update(this._store.id, storeData);
        Toast.show('저장되었습니다!', 'success');
      }

      App.navigate('#/');
    } catch (e) {
      console.error('저장 실패:', e);
      Toast.show('저장에 실패했습니다. 다시 시도해주세요.', 'error');
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">save</span> ${this._isNew ? '매장 등록하기' : '저장하기'}`;
    }
  },

  // --- 쿠폰 ---
  _renderCouponList() {
    if (this._coupons.length === 0) {
      return '<p class="editor-hint" style="margin-bottom:12px">등록된 쿠폰이 없습니다.</p>';
    }
    return this._coupons.map(c => {
      const remaining = c.totalCount - (c.usedCount || 0);
      const expired = c.expiresAt && c.expiresAt.toDate() < new Date();
      const dim = !c.isActive || expired;
      return `
        <div style="border:1px solid var(--outline-variant);border-radius:12px;padding:14px;margin-bottom:10px;background:${dim ? 'var(--surface-dim)' : 'white'}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:0.9375rem;margin-bottom:4px">${Utils.escapeHtml(c.title)}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
                <span style="background:var(--accent);color:white;padding:2px 8px;border-radius:20px;font-size:0.75rem;font-weight:600">${c.discount}% 할인</span>
                <span style="font-size:0.8125rem;color:var(--secondary)">잔여 ${remaining}/${c.totalCount}장</span>
                ${expired ? '<span style="font-size:0.75rem;color:var(--error)">만료</span>' : ''}
                ${!c.isActive ? '<span style="font-size:0.75rem;color:var(--secondary)">비활성</span>' : ''}
              </div>
              ${c.expiresAt ? `<div style="font-size:0.75rem;color:var(--secondary);margin-top:4px">~ ${c.expiresAt.toDate().toLocaleDateString('ko-KR')}</div>` : ''}
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button type="button" onclick="BusinessPage.toggleCoupon('${c.id}', ${!c.isActive})"
                      style="padding:4px 10px;border:1px solid var(--outline-variant);border-radius:8px;background:white;font-size:0.75rem;cursor:pointer">
                ${c.isActive ? '끄기' : '켜기'}
              </button>
              <button type="button" onclick="BusinessPage.deleteCoupon('${c.id}')"
                      style="padding:4px 10px;border:1px solid var(--error);border-radius:8px;background:white;font-size:0.75rem;color:var(--error);cursor:pointer">
                삭제
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  showCouponForm() {
    document.getElementById('business-coupon-form').style.display = 'block';
    document.getElementById('show-coupon-form-btn').style.display = 'none';
  },

  hideCouponForm() {
    document.getElementById('business-coupon-form').style.display = 'none';
    document.getElementById('show-coupon-form-btn').style.display = 'flex';
  },

  async saveCoupon() {
    const title = document.getElementById('coupon-title-input')?.value?.trim();
    const discount = parseInt(document.getElementById('coupon-discount-input')?.value);
    const totalCount = parseInt(document.getElementById('coupon-count-input')?.value);
    const expiresStr = document.getElementById('coupon-expires-input')?.value;

    if (!title) { Toast.show('쿠폰 제목을 입력하세요.', 'error'); return; }
    if (!discount || discount < 1 || discount > 100) { Toast.show('할인율을 1~100 사이로 입력하세요.', 'error'); return; }
    if (!totalCount || totalCount < 1) { Toast.show('발행 매수를 입력하세요.', 'error'); return; }

    const user = AuthService.getCurrentUser();
    const couponData = {
      storeId: this._store.id,
      storeName: this._store.name || '',
      ownerId: user?.id,
      title, discount, totalCount,
      expiresAt: expiresStr ? firebase.firestore.Timestamp.fromDate(new Date(expiresStr + 'T23:59:59')) : null
    };

    try {
      await CouponService.create(couponData);
      Toast.show('쿠폰이 등록되었습니다!', 'success');
      this._coupons = await CouponService.getByStore(this._store.id);
      this._reRenderForm();
    } catch (e) {
      console.error('쿠폰 등록 실패:', e);
      Toast.show('쿠폰 등록에 실패했습니다.', 'error');
    }
  },

  async toggleCoupon(couponId, isActive) {
    try {
      await CouponService.toggleActive(couponId, isActive);
      this._coupons = await CouponService.getByStore(this._store.id);
      this._reRenderForm();
    } catch (e) {
      Toast.show('변경에 실패했습니다.', 'error');
    }
  },

  async deleteCoupon(couponId) {
    if (!confirm('이 쿠폰을 삭제하시겠습니까?')) return;
    try {
      await CouponService.delete(couponId);
      this._coupons = this._coupons.filter(c => c.id !== couponId);
      this._reRenderForm();
      Toast.show('삭제되었습니다.', 'info');
    } catch (e) {
      Toast.show('삭제에 실패했습니다.', 'error');
    }
  },

  destroy() {
    this._store = null;
    this._photoDataUrls = [];
    this._interiorPhotos = [];
    this._menuItems = [];
    this._facilities = [];
    this._coupons = [];
  }
};
