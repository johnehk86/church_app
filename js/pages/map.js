/**
 * 지도(Discover) 페이지 - 매장 위치 목록
 */
const MapPage = {
  render(container) {
    const stores = StoreService.getAll();
    const storesWithLocation = stores.filter(s => s.location?.lat && s.location?.lng);

    container.innerHTML = `
      <div class="page">
        <header style="margin-bottom:24px">
          <p class="label-caps" style="margin-bottom:6px">FIND NEARBY</p>
          <h2 class="headline-md">Discover</h2>
        </header>

        ${storesWithLocation.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">location_off</span>
            <h3 class="empty-state__title">위치가 등록된 매장이 없습니다</h3>
          </div>
        ` : `
          ${storesWithLocation.map(store => {
            const icon = Utils.categoryIcons[store.category] || 'storefront';
            return `
              <div class="map-list-card" onclick="MapPage.openMap('${store.location.lat}', '${store.location.lng}', '${Utils.escapeHtml(store.name).replace(/'/g, "\\'")}')">
                <div class="map-list-card__icon">
                  <span class="material-symbols-outlined" style="color:var(--accent)">${icon}</span>
                </div>
                <div class="map-list-card__info">
                  <div class="map-list-card__name">${Utils.escapeHtml(store.name)}</div>
                  <div class="map-list-card__address">${Utils.escapeHtml(store.address || '주소 미등록')}</div>
                </div>
                <span class="material-symbols-outlined map-list-card__arrow">arrow_forward_ios</span>
              </div>
            `;
          }).join('')}
        `}
      </div>
    `;
  },

  openMap(lat, lng, name) {
    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(name)}?c=${lng},${lat},15,0,0,0,dh`, '_blank');
  },

  destroy() {}
};
