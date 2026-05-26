/**
 * 매장 상세 페이지 - 에디토리얼 스타일
 */
const DetailPage = {
  _store: null,

  render(container, params) {
    const storeId = params[0];
    if (!storeId) { App.navigate('#/'); return; }

    const store = StoreService.getById(storeId);
    if (!store) {
      container.innerHTML = `
        <div class="page empty-state">
          <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">error</span>
          <h3 class="empty-state__title">매장을 찾을 수 없습니다</h3>
          <button class="btn btn--primary btn--small" onclick="App.navigate('#/')" style="margin-top:20px;width:auto">홈으로</button>
        </div>
      `;
      return;
    }

    this._store = store;
    const categoryIcon = Utils.categoryIcons[store.category] || 'storefront';

    // 사진 슬라이더
    const photos = store.photos && store.photos.length > 0
      ? store.photos.map(url => `<img class="detail-slider__item" src="${Utils.escapeHtml(url)}" alt="매장 사진">`).join('')
      : `<div class="detail-slider__item" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--surface-dim),var(--surface-variant))">
           <span class="material-symbols-outlined" style="font-size:4rem;color:var(--outline)">${categoryIcon}</span>
         </div>`;

    const dots = store.photos && store.photos.length > 1
      ? `<div class="detail-slider__dots">${store.photos.map((_, i) =>
          `<div class="detail-slider__dot ${i === 0 ? 'detail-slider__dot--active' : ''}"></div>`).join('')}</div>`
      : '';

    // 연락처
    const contactRows = [];
    if (store.contact?.phone) {
      contactRows.push(`
        <div class="detail-info-row">
          <span class="material-symbols-outlined detail-info-row__icon">call</span>
          <div class="detail-info-row__content"><a href="tel:${Utils.escapeHtml(store.contact.phone)}">${Utils.escapeHtml(store.contact.phone)}</a></div>
        </div>`);
    }
    if (store.contact?.kakao) {
      contactRows.push(`
        <div class="detail-info-row">
          <span class="material-symbols-outlined detail-info-row__icon">chat</span>
          <div class="detail-info-row__content">카카오톡: ${Utils.escapeHtml(store.contact.kakao)}</div>
        </div>`);
    }
    if (store.contact?.instagram) {
      contactRows.push(`
        <div class="detail-info-row">
          <span class="material-symbols-outlined detail-info-row__icon">photo_camera</span>
          <div class="detail-info-row__content"><a href="https://instagram.com/${Utils.escapeHtml(store.contact.instagram)}" target="_blank" rel="noopener">@${Utils.escapeHtml(store.contact.instagram)}</a></div>
        </div>`);
    }
    if (store.address) {
      contactRows.push(`
        <div class="detail-info-row">
          <span class="material-symbols-outlined detail-info-row__icon">location_on</span>
          <div class="detail-info-row__content">${Utils.escapeHtml(store.address)}</div>
        </div>`);
    }
    if (store.hours) {
      contactRows.push(`
        <div class="detail-info-row">
          <span class="material-symbols-outlined detail-info-row__icon">schedule</span>
          <div class="detail-info-row__content" style="white-space:pre-line">${Utils.escapeHtml(store.hours)}</div>
        </div>`);
    }

    container.innerHTML = `
      <div class="page">
        <!-- 사진 -->
        <div class="detail-hero">
          <div class="detail-slider" id="detail-slider">${photos}</div>
          ${dots}
        </div>

        <!-- 카테고리 & 이름 -->
        <div style="margin-bottom:24px">
          <p class="label-caps" style="color:var(--accent);margin-bottom:8px">${Utils.escapeHtml(store.category || '기타')}</p>
          <h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:600;letter-spacing:-0.01em">${Utils.escapeHtml(store.name)}</h2>
        </div>

        <!-- 사장님 -->
        <div class="detail-section">
          <div class="detail-owner">
            <div class="detail-owner__photo">
              ${store.ownerPhoto
                ? `<img src="${Utils.escapeHtml(store.ownerPhoto)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
                : `<span class="material-symbols-outlined" style="font-size:1.5rem;color:var(--outline)">person</span>`}
            </div>
            <div>
              <div class="detail-owner__name">${Utils.escapeHtml(store.ownerName || '')}</div>
              <div class="detail-owner__label">Owner</div>
            </div>
          </div>
        </div>

        <!-- 소개 -->
        ${store.description ? `
          <div class="detail-section">
            <h3 class="detail-section__title">About</h3>
            <p style="font-size:0.9375rem;line-height:1.8;color:var(--on-surface-variant);white-space:pre-line">${Utils.escapeHtml(store.description)}</p>
          </div>
        ` : ''}

        <!-- 정보 -->
        <div class="detail-section">
          <h3 class="detail-section__title">Contact & Info</h3>
          ${contactRows.join('')}
        </div>

        <!-- 액션 -->
        <div class="detail-actions">
          ${store.contact?.phone ? `
            <a href="tel:${Utils.escapeHtml(store.contact.phone)}" class="btn btn--primary">
              <span class="material-symbols-outlined" style="font-size:18px">call</span> Call
            </a>
          ` : ''}
          ${store.location?.lat ? `
            <button class="btn btn--secondary" onclick="DetailPage.openNaverMap()">
              <span class="material-symbols-outlined" style="font-size:18px">directions</span> Navigate
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this._initSlider();
  },

  _initSlider() {
    const slider = document.getElementById('detail-slider');
    if (!slider) return;
    const dots = slider.parentElement.querySelectorAll('.detail-slider__dot');
    if (dots.length <= 1) return;
    slider.addEventListener('scroll', () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      dots.forEach((dot, i) => dot.classList.toggle('detail-slider__dot--active', i === index));
    });
  },

  openNaverMap() {
    if (!this._store?.location?.lat) return;
    const { lat, lng } = this._store.location;
    const name = encodeURIComponent(this._store.name);
    window.open(`https://map.naver.com/v5/search/${name}?c=${lng},${lat},15,0,0,0,dh`, '_blank');
  },

  destroy() { this._store = null; }
};
