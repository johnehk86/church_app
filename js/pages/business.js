/**
 * 사업자(사장님) 매장 관리 페이지
 */
const BusinessPage = {
  _store: null,
  _isNew: false,
  _photoDataUrls: [],

  render(container) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      App.navigate('#/login');
      return;
    }

    // 기존 매장 정보 로드
    this._store = StoreService.getByOwnerId(user.id);
    this._isNew = !this._store;

    if (this._isNew) {
      this._store = {
        ownerId: user.id,
        name: '',
        category: '기타',
        description: '',
        address: '',
        location: { lat: '', lng: '' },
        hours: '',
        contact: { phone: '', kakao: '', instagram: '' },
        photos: [],
        ownerName: user.name || '',
        ownerPhoto: ''
      };
    }

    this._photoDataUrls = [...(this._store.photos || [])];
    this._renderForm(container);
  },

  _renderForm(container) {
    const s = this._store;
    const categoryOptions = Utils.categories.filter(c => c !== '전체')
      .map(c => `<option value="${c}" ${s.category === c ? 'selected' : ''}>${c}</option>`)
      .join('');

    const photoPreviews = this._photoDataUrls.map((url, i) => `
      <div class="image-preview-item">
        <img src="${url}" alt="사진 ${i + 1}">
        <button type="button" class="image-preview-item__remove" onclick="BusinessPage.removePhoto(${i})">&times;</button>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="page">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:20px">
          ${this._isNew ? '&#127978; 새 매장 등록' : '&#9998; 매장 정보 수정'}
        </h2>

        <form id="store-form" onsubmit="BusinessPage.onSubmit(event)">
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
            <textarea class="form-textarea" name="description" placeholder="어떤 매장인지 소개해주세요">${Utils.escapeHtml(s.description || '')}</textarea>
          </div>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">사장님 성함</label>
            <input class="form-input" name="ownerName" value="${Utils.escapeHtml(s.ownerName || '')}" placeholder="성도 이름">
          </div>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">매장 사진</label>
            <div class="image-upload" onclick="document.getElementById('photo-input').click()">
              <div class="image-upload__icon">&#128247;</div>
              <div class="image-upload__text">사진을 선택하세요</div>
              <input type="file" id="photo-input" accept="image/*" multiple
                     style="display:none" onchange="BusinessPage.onPhotoSelect(event)">
            </div>
            ${photoPreviews ? `<div class="image-preview-grid">${photoPreviews}</div>` : ''}
          </div>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">주소</label>
            <input class="form-input" name="address" value="${Utils.escapeHtml(s.address || '')}" placeholder="매장 주소">
          </div>

          <div style="display:flex;gap:8px">
            <div class="form-group" style="flex:1">
              <label class="form-label">위도</label>
              <input class="form-input" name="lat" type="number" step="any" value="${s.location?.lat || ''}" placeholder="37.5665">
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">경도</label>
              <input class="form-input" name="lng" type="number" step="any" value="${s.location?.lng || ''}" placeholder="126.9780">
            </div>
          </div>
          <p style="font-size:0.75rem;color:var(--text-light);margin-top:-8px;margin-bottom:16px">
            네이버 지도에서 매장 위치의 좌표를 입력해주세요
          </p>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">운영시간</label>
            <textarea class="form-textarea" name="hours" placeholder="월~금 09:00~18:00&#10;토 10:00~15:00&#10;일 휴무" style="min-height:80px">${Utils.escapeHtml(s.hours || '')}</textarea>
          </div>

          <div class="divider"></div>

          <div class="form-group">
            <label class="form-label">전화번호</label>
            <input class="form-input" name="phone" type="tel" value="${Utils.escapeHtml(s.contact?.phone || '')}" placeholder="010-0000-0000">
          </div>

          <div class="form-group">
            <label class="form-label">카카오톡 ID</label>
            <input class="form-input" name="kakao" value="${Utils.escapeHtml(s.contact?.kakao || '')}" placeholder="카카오톡 ID 또는 오픈채팅 링크">
          </div>

          <div class="form-group">
            <label class="form-label">인스타그램</label>
            <input class="form-input" name="instagram" value="${Utils.escapeHtml(s.contact?.instagram || '')}" placeholder="인스타그램 아이디 (@제외)">
          </div>

          <div style="margin-top:24px">
            <button type="submit" class="btn btn--primary" id="submit-btn">
              ${this._isNew ? '매장 등록하기' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  onPhotoSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._photoDataUrls.push(e.target.result);
        // 미리보기 업데이트
        const content = document.getElementById('app-content');
        this.render(content);
      };
      reader.readAsDataURL(file);
    });
  },

  removePhoto(index) {
    this._photoDataUrls.splice(index, 1);
    const content = document.getElementById('app-content');
    this.render(content);
  },

  onSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('store-form');
    const user = AuthService.getCurrentUser();

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
      ownerPhoto: ''
    };

    if (this._isNew) {
      StoreService.create(storeData);
      Toast.show('매장이 등록되었습니다!', 'success');
    } else {
      StoreService.update(this._store.id, storeData);
      Toast.show('매장 정보가 수정되었습니다!', 'success');
    }

    App.navigate('#/');
  },

  destroy() {
    this._store = null;
    this._photoDataUrls = [];
  }
};
