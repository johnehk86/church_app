/**
 * 매장 상세 페이지 - 풍성한 정보 표시
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
        </div>`;
      return;
    }

    this._store = store;
    const categoryIcon = Utils.categoryIcons[store.category] || 'storefront';

    // --- 사진 슬라이더 ---
    const allPhotos = store.photos || [];
    const photos = allPhotos.length > 0
      ? allPhotos.map(url => `<img class="detail-slider__item" src="${Utils.escapeHtml(url)}" alt="매장 사진">`).join('')
      : `<div class="detail-slider__item" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--surface-dim),var(--surface-variant))">
           <span class="material-symbols-outlined" style="font-size:4rem;color:var(--outline)">${categoryIcon}</span>
         </div>`;

    const photoCount = allPhotos.length;
    const dots = photoCount > 1
      ? `<div class="detail-slider__dots">${allPhotos.map((_, i) =>
          `<div class="detail-slider__dot ${i === 0 ? 'detail-slider__dot--active' : ''}"></div>`).join('')}</div>`
      : '';
    const photoCounter = photoCount > 1
      ? `<div class="detail-photo-counter"><span class="material-symbols-outlined" style="font-size:14px">photo_library</span> 1 / ${photoCount}</div>`
      : '';

    // --- 메뉴/서비스 ---
    let menuSection = '';
    if (store.menu && store.menu.length > 0) {
      const menuItems = store.menu.map(item => `
        <div class="menu-item">
          <div class="menu-item__info">
            <div class="menu-item__name">${Utils.escapeHtml(item.name)}</div>
            ${item.desc ? `<div class="menu-item__desc">${Utils.escapeHtml(item.desc)}</div>` : ''}
          </div>
          ${item.price ? `<div class="menu-item__price">${Utils.escapeHtml(item.price)}</div>` : ''}
        </div>
      `).join('');

      menuSection = `
        <div class="detail-section">
          <h3 class="detail-section__title">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">menu_book</span>
            ${store.menuTitle || 'Menu & Services'}
          </h3>
          <div class="menu-list">${menuItems}</div>
        </div>`;
    }

    // --- 시설/특징 태그 ---
    let facilitiesSection = '';
    if (store.facilities && store.facilities.length > 0) {
      const tags = store.facilities.map(f => `
        <div class="facility-tag">
          <span class="material-symbols-outlined" style="font-size:16px">${f.icon || 'check_circle'}</span>
          <span>${Utils.escapeHtml(f.label)}</span>
        </div>
      `).join('');

      facilitiesSection = `
        <div class="detail-section">
          <h3 class="detail-section__title">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">stars</span>
            Facilities & Features
          </h3>
          <div class="facility-tags">${tags}</div>
        </div>`;
    }

    // --- 성도 혜택 ---
    let benefitSection = '';
    if (store.memberBenefit) {
      benefitSection = `
        <div class="detail-section">
          <div class="benefit-card">
            <div class="benefit-card__icon">
              <span class="material-symbols-outlined icon-filled" style="color:var(--accent)">church</span>
            </div>
            <div class="benefit-card__content">
              <div class="benefit-card__title">성도 특별 혜택</div>
              <div class="benefit-card__desc">${Utils.escapeHtml(store.memberBenefit)}</div>
            </div>
          </div>
        </div>`;
    }

    // --- 인테리어/내부 사진 갤러리 ---
    let gallerySection = '';
    if (store.interiorPhotos && store.interiorPhotos.length > 0) {
      const galleryItems = store.interiorPhotos.map((photo, i) => `
        <div class="gallery-item" onclick="DetailPage.openPhoto('${Utils.escapeHtml(photo.url)}')">
          <img src="${Utils.escapeHtml(photo.url)}" alt="${Utils.escapeHtml(photo.caption || '')}" loading="lazy">
          ${photo.caption ? `<div class="gallery-item__caption">${Utils.escapeHtml(photo.caption)}</div>` : ''}
        </div>
      `).join('');

      gallerySection = `
        <div class="detail-section">
          <h3 class="detail-section__title">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">photo_library</span>
            Interior & Gallery
          </h3>
          <div class="gallery-grid">${galleryItems}</div>
        </div>`;
    }

    // --- 사장님 한마디 ---
    let ownerMessageSection = '';
    if (store.ownerMessage) {
      ownerMessageSection = `
        <div class="detail-section">
          <div class="owner-message">
            <div class="owner-message__quote">"</div>
            <p class="owner-message__text">${Utils.escapeHtml(store.ownerMessage)}</p>
            <p class="owner-message__name">— ${Utils.escapeHtml(store.ownerName || '')} 사장님</p>
          </div>
        </div>`;
    }

    // --- 연락처 ---
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

    // --- 렌더링 ---
    container.innerHTML = `
      <div class="page">
        <!-- 사진 슬라이더 -->
        <div class="detail-hero">
          <div class="detail-slider" id="detail-slider">${photos}</div>
          ${dots}
          ${photoCounter}
        </div>

        <!-- 카테고리 & 이름 -->
        <div style="margin-bottom:20px">
          <p class="label-caps" style="color:var(--accent);margin-bottom:8px">${Utils.escapeHtml(store.category || '기타')}</p>
          <h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:600;letter-spacing:-0.01em">${Utils.escapeHtml(store.name)}</h2>
        </div>

        <!-- 성도 혜택 배너 -->
        ${benefitSection}

        <!-- 사장님 정보 -->
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

        <!-- 사장님 한마디 -->
        ${ownerMessageSection}

        <!-- 매장 소개 -->
        ${store.description ? `
          <div class="detail-section">
            <h3 class="detail-section__title">
              <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">info</span>
              About
            </h3>
            <p style="font-size:0.9375rem;line-height:1.8;color:var(--on-surface-variant);white-space:pre-line">${Utils.escapeHtml(store.description)}</p>
          </div>
        ` : ''}

        <!-- 메뉴/서비스 -->
        ${menuSection}

        <!-- 시설/특징 -->
        ${facilitiesSection}

        <!-- 인테리어 갤러리 -->
        ${gallerySection}

        <!-- 연락처 & 정보 -->
        <div class="detail-section">
          <h3 class="detail-section__title">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">contact_phone</span>
            Contact & Info
          </h3>
          ${contactRows.join('')}
        </div>

        <!-- 액션 버튼 -->
        <div class="detail-actions">
          ${store.contact?.phone ? `
            <a href="tel:${Utils.escapeHtml(store.contact.phone)}" class="btn btn--primary">
              <span class="material-symbols-outlined" style="font-size:18px">call</span> Call
            </a>` : ''}
          ${store.location?.lat ? `
            <button class="btn btn--secondary" onclick="DetailPage.openNaverMap()">
              <span class="material-symbols-outlined" style="font-size:18px">directions</span> Navigate
            </button>` : ''}
        </div>
      </div>
    `;

    this._initSlider();
  },

  _initSlider() {
    const slider = document.getElementById('detail-slider');
    if (!slider) return;
    const dots = slider.parentElement.querySelectorAll('.detail-slider__dot');
    const counter = slider.parentElement.querySelector('.detail-photo-counter');
    if (dots.length <= 1 && !counter) return;

    slider.addEventListener('scroll', () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      dots.forEach((dot, i) => dot.classList.toggle('detail-slider__dot--active', i === index));
      if (counter) counter.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px">photo_library</span> ${index + 1} / ${dots.length}`;
    });
  },

  openPhoto(url) {
    // 사진 확대 보기
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:pageIn 0.3s ease';
    overlay.innerHTML = `<img src="${url}" style="max-width:95%;max-height:90vh;object-fit:contain;border-radius:8px">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  },

  openNaverMap() {
    if (!this._store?.location?.lat) return;
    const { lat, lng } = this._store.location;
    const name = encodeURIComponent(this._store.name);
    window.open(`https://map.naver.com/v5/search/${name}?c=${lng},${lat},15,0,0,0,dh`, '_blank');
  },

  destroy() { this._store = null; }
};
