/**
 * 매장 상세 페이지 (Firebase 비동기)
 */
const DetailPage = {
  _store: null,

  async render(container, params) {
    const storeId = params[0];
    if (!storeId) { App.navigate('#/'); return; }

    const store = await StoreService.getById(storeId);
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

    // 사진
    const allPhotos = store.photos || [];
    const photos = allPhotos.length > 0
      ? allPhotos.map(url => `<img class="detail-slider__item" src="${Utils.escapeHtml(url)}" alt="매장 사진">`).join('')
      : `<div class="detail-slider__item" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--surface-dim),var(--surface-variant))">
           <span class="material-symbols-outlined" style="font-size:4rem;color:var(--outline)">${categoryIcon}</span>
         </div>`;
    const dots = allPhotos.length > 1
      ? `<div class="detail-slider__dots">${allPhotos.map((_, i) => `<div class="detail-slider__dot ${i === 0 ? 'detail-slider__dot--active' : ''}"></div>`).join('')}</div>` : '';
    const photoCounter = allPhotos.length > 1
      ? `<div class="detail-photo-counter"><span class="material-symbols-outlined" style="font-size:14px">photo_library</span> 1 / ${allPhotos.length}</div>` : '';

    // 메뉴
    let menuSection = '';
    if (store.menu && store.menu.length > 0) {
      menuSection = `<div class="detail-section"><h3 class="detail-section__title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">menu_book</span>${store.menuTitle || 'Menu & Services'}</h3><div class="menu-list">${store.menu.map(item => `<div class="menu-item"><div class="menu-item__info"><div class="menu-item__name">${Utils.escapeHtml(item.name)}</div>${item.desc ? `<div class="menu-item__desc">${Utils.escapeHtml(item.desc)}</div>` : ''}</div>${item.price ? `<div class="menu-item__price">${Utils.escapeHtml(item.price)}</div>` : ''}</div>`).join('')}</div></div>`;
    }

    // 시설
    let facilitiesSection = '';
    if (store.facilities && store.facilities.length > 0) {
      facilitiesSection = `<div class="detail-section"><h3 class="detail-section__title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">stars</span>Facilities & Features</h3><div class="facility-tags">${store.facilities.map(f => `<div class="facility-tag"><span class="material-symbols-outlined" style="font-size:16px">${f.icon || 'check_circle'}</span><span>${Utils.escapeHtml(f.label)}</span></div>`).join('')}</div></div>`;
    }

    // 혜택
    let benefitSection = '';
    if (store.memberBenefit) {
      benefitSection = `<div class="detail-section"><div class="benefit-card"><div class="benefit-card__icon"><span class="material-symbols-outlined icon-filled" style="color:var(--accent)">church</span></div><div class="benefit-card__content"><div class="benefit-card__title">성도 특별 혜택</div><div class="benefit-card__desc">${Utils.escapeHtml(store.memberBenefit)}</div></div></div></div>`;
    }

    // 갤러리
    let gallerySection = '';
    if (store.interiorPhotos && store.interiorPhotos.length > 0) {
      gallerySection = `<div class="detail-section"><h3 class="detail-section__title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">photo_library</span>Interior & Gallery</h3><div class="gallery-grid">${store.interiorPhotos.map(p => `<div class="gallery-item" onclick="DetailPage.openPhoto('${Utils.escapeHtml(p.url)}')"><img src="${Utils.escapeHtml(p.url)}" loading="lazy">${p.caption ? `<div class="gallery-item__caption">${Utils.escapeHtml(p.caption)}</div>` : ''}</div>`).join('')}</div></div>`;
    }

    // 사장님 한마디
    let ownerMessageSection = '';
    if (store.ownerMessage) {
      ownerMessageSection = `<div class="detail-section"><div class="owner-message"><div class="owner-message__quote">"</div><p class="owner-message__text">${Utils.escapeHtml(store.ownerMessage)}</p><p class="owner-message__name">— ${Utils.escapeHtml(store.ownerName || '')} 사장님</p></div></div>`;
    }

    // 연락처
    const contactRows = [];
    if (store.contact?.phone) contactRows.push(`<div class="detail-info-row"><span class="material-symbols-outlined detail-info-row__icon">call</span><div class="detail-info-row__content"><a href="tel:${Utils.escapeHtml(store.contact.phone)}">${Utils.escapeHtml(store.contact.phone)}</a></div></div>`);
    if (store.contact?.kakao) contactRows.push(`<div class="detail-info-row"><span class="material-symbols-outlined detail-info-row__icon">chat</span><div class="detail-info-row__content">카카오톡: ${Utils.escapeHtml(store.contact.kakao)}</div></div>`);
    if (store.contact?.instagram) contactRows.push(`<div class="detail-info-row"><span class="material-symbols-outlined detail-info-row__icon">photo_camera</span><div class="detail-info-row__content"><a href="https://instagram.com/${Utils.escapeHtml(store.contact.instagram)}" target="_blank" rel="noopener">@${Utils.escapeHtml(store.contact.instagram)}</a></div></div>`);
    if (store.address) contactRows.push(`<div class="detail-info-row"><span class="material-symbols-outlined detail-info-row__icon">location_on</span><div class="detail-info-row__content">${Utils.escapeHtml(store.address)}</div></div>`);
    if (store.hours) contactRows.push(`<div class="detail-info-row"><span class="material-symbols-outlined detail-info-row__icon">schedule</span><div class="detail-info-row__content" style="white-space:pre-line">${Utils.escapeHtml(store.hours)}</div></div>`);

    container.innerHTML = `
      <div class="page">
        <div class="detail-hero"><div class="detail-slider" id="detail-slider">${photos}</div>${dots}${photoCounter}</div>
        <div style="margin-bottom:20px"><p class="label-caps" style="color:var(--accent);margin-bottom:8px">${Utils.escapeHtml(store.category || '기타')}</p><h2 style="font-family:var(--font-display);font-size:1.75rem;font-weight:600">${Utils.escapeHtml(store.name)}</h2></div>
        ${benefitSection}
        <div class="detail-section"><div class="detail-owner"><div class="detail-owner__photo">${store.ownerPhoto ? `<img src="${Utils.escapeHtml(store.ownerPhoto)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `<span class="material-symbols-outlined" style="font-size:1.5rem;color:var(--outline)">person</span>`}</div><div><div class="detail-owner__name">${Utils.escapeHtml(store.ownerName || '')}</div><div class="detail-owner__label">Owner</div></div></div></div>
        ${ownerMessageSection}
        ${store.description ? `<div class="detail-section"><h3 class="detail-section__title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">info</span>About</h3><p style="font-size:0.9375rem;line-height:1.8;color:var(--on-surface-variant);white-space:pre-line">${Utils.escapeHtml(store.description)}</p></div>` : ''}
        ${menuSection}${facilitiesSection}${gallerySection}
        <div class="detail-section"><h3 class="detail-section__title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">contact_phone</span>Contact & Info</h3>${contactRows.join('')}</div>
        <div class="detail-actions">
          ${store.contact?.phone ? `<a href="tel:${Utils.escapeHtml(store.contact.phone)}" class="btn btn--primary"><span class="material-symbols-outlined" style="font-size:18px">call</span> Call</a>` : ''}
          ${store.location?.lat ? `<button class="btn btn--secondary" onclick="DetailPage.openNaverMap()"><span class="material-symbols-outlined" style="font-size:18px">directions</span> Navigate</button>` : ''}
        </div>
      </div>`;
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
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:pageIn 0.3s ease';
    overlay.innerHTML = `<img src="${url}" style="max-width:95%;max-height:90vh;object-fit:contain;border-radius:8px">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  },

  openNaverMap() {
    if (!this._store?.location?.lat) return;
    const { lat, lng } = this._store.location;
    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(this._store.name)}?c=${lng},${lat},15,0,0,0,dh`, '_blank');
  },

  destroy() { this._store = null; }
};
