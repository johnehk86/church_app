/**
 * 매장 카드 컴포넌트 - Yelp 스타일 가로형
 */
const StoreCard = {
  render(store) {
    const hasPhoto = store.photos && store.photos.length > 0;
    const categoryIcon = Utils.categoryIcons[store.category] || 'storefront';

    const thumb = hasPhoto
      ? `<div class="store-card__thumb">
           <img src="${Utils.escapeHtml(store.photos[0])}" alt="${Utils.escapeHtml(store.name)}" loading="lazy">
         </div>`
      : `<div class="store-card__thumb">
           <div class="store-card__thumb-placeholder">
             <span class="material-symbols-outlined" style="font-size:2rem">${categoryIcon}</span>
           </div>
         </div>`;

    const benefit = store.memberBenefit
      ? `<span class="store-card__benefit">
           <span class="material-symbols-outlined" style="font-size:12px">church</span>
           성도 혜택
         </span>`
      : '';

    const photoCount = store.photos && store.photos.length > 1
      ? `<span class="store-card__dot">·</span><span>${store.photos.length}장</span>`
      : '';

    return `
      <button class="store-card" onclick="App.navigate('#/store/${store.id}')">
        ${thumb}
        <div class="store-card__body">
          <h3 class="store-card__name">${Utils.escapeHtml(store.name)}</h3>
          <div class="store-card__meta">
            <span>${Utils.escapeHtml(store.category || '기타')}</span>
            <span class="store-card__dot">·</span>
            <span>${Utils.escapeHtml(store.ownerName || '')} 사장님</span>
            ${photoCount}
          </div>
          ${store.description
            ? `<p class="store-card__desc">${Utils.escapeHtml(store.description)}</p>`
            : ''}
          ${benefit}
        </div>
      </button>
    `;
  },

  renderFeatured(store) {
    return this.render(store);
  }
};
