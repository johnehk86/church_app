/**
 * 매장 카드 컴포넌트 - 럭셔리 에디토리얼 스타일
 */
const StoreCard = {
  // 기본 카드 (목록용)
  render(store) {
    const hasPhoto = store.photos && store.photos.length > 0;
    const categoryIcon = Utils.categoryIcons[store.category] || 'storefront';

    const imageSection = hasPhoto
      ? `<div class="store-card__image-wrap">
           <img class="store-card__image" src="${Utils.escapeHtml(store.photos[0])}" alt="${Utils.escapeHtml(store.name)}" loading="lazy">
         </div>`
      : `<div class="store-card__image-wrap">
           <div class="store-card__image--placeholder">
             <span class="material-symbols-outlined" style="font-size:2.5rem">${categoryIcon}</span>
           </div>
         </div>`;

    return `
      <div class="store-card" onclick="App.navigate('#/store/${store.id}')">
        ${imageSection}
        <div class="store-card__info">
          <div class="store-card__category">${Utils.escapeHtml(store.category || '기타')}</div>
          <h3 class="store-card__name">${Utils.escapeHtml(store.name)}</h3>
          <p class="store-card__desc">${Utils.escapeHtml(store.description || '')}</p>
          <span class="store-card__owner">${Utils.escapeHtml(store.ownerName || '')} 사장님</span>
        </div>
      </div>
    `;
  },

  // 피처드 카드 (글래스 라벨 오버레이)
  renderFeatured(store) {
    const hasPhoto = store.photos && store.photos.length > 0;
    const categoryIcon = Utils.categoryIcons[store.category] || 'storefront';

    const imageContent = hasPhoto
      ? `<img class="store-card__image" src="${Utils.escapeHtml(store.photos[0])}" alt="${Utils.escapeHtml(store.name)}" loading="lazy">`
      : `<div class="store-card__image--placeholder">
           <span class="material-symbols-outlined" style="font-size:3rem">${categoryIcon}</span>
         </div>`;

    return `
      <div class="store-card store-card--featured" onclick="App.navigate('#/store/${store.id}')">
        <div class="store-card__image-wrap">
          ${imageContent}
          <div class="store-card__overlay"></div>
        </div>
        <div class="store-card__overlay"></div>
        <div class="store-card__info">
          <div class="store-card__category">${Utils.escapeHtml(store.category || '기타')}</div>
          <h3 class="store-card__name">${Utils.escapeHtml(store.name)}</h3>
        </div>
      </div>
    `;
  }
};
