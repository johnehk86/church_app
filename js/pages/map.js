/**
 * 지도 페이지 - Leaflet.js (Firebase 비동기)
 */
const MapPage = {
  _map: null,
  _markers: [],

  async render(container) {
    const stores = await StoreService.getAll();
    const storesWithLocation = stores.filter(s => s.location?.lat && s.location?.lng);

    container.innerHTML = `
      <div class="page" style="padding:0;max-width:none">
        <div style="padding:16px 24px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <p class="label-caps" style="margin-bottom:4px">ALL STORES ON MAP</p>
            <h2 style="font-family:var(--font-display);font-size:1.25rem;font-weight:600">${storesWithLocation.length}개 매장</h2>
          </div>
          <button class="btn btn--secondary btn--small" onclick="MapPage.openAllInNaver()" style="width:auto">
            <span class="material-symbols-outlined" style="font-size:16px">open_in_new</span> 네이버 지도
          </button>
        </div>
        ${storesWithLocation.length === 0 ? `
          <div class="empty-state" style="padding:60px 24px">
            <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">location_off</span>
            <h3 class="empty-state__title">위치가 등록된 매장이 없습니다</h3>
          </div>
        ` : `<div id="leaflet-map" style="height:calc(100dvh - var(--header-height) - var(--bottom-nav-height) - 70px);width:100%"></div>`}
      </div>`;

    if (storesWithLocation.length > 0) this._initMap(storesWithLocation);
  },

  _initMap(stores) {
    this._map = L.map('leaflet-map', { zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(this._map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this._map);

    const bounds = [];
    stores.forEach(store => {
      const pos = [store.location.lat, store.location.lng];
      bounds.push(pos);
      const iconName = Utils.categoryIcons[store.category] || 'storefront';
      const marker = L.marker(pos, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="map-pin"><span class="material-symbols-outlined icon-filled" style="font-size:16px;color:white">${iconName}</span></div>`,
          iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -48]
        })
      }).addTo(this._map);

      const hasPhoto = store.photos && store.photos.length > 0;
      marker.bindPopup(`
        <div class="map-popup">
          ${hasPhoto ? `<img class="map-popup__image" src="${Utils.escapeHtml(store.photos[0])}" alt="">` : ''}
          <div class="map-popup__body">
            <div class="map-popup__category">${Utils.escapeHtml(store.category || '')}</div>
            <div class="map-popup__name">${Utils.escapeHtml(store.name)}</div>
            <div class="map-popup__address">${Utils.escapeHtml(store.address || '')}</div>
            <div class="map-popup__actions">
              <a href="#/store/${store.id}" class="map-popup__btn"><span class="material-symbols-outlined" style="font-size:14px">info</span> 상세보기</a>
              <a href="https://map.naver.com/v5/search/${encodeURIComponent(store.name)}?c=${store.location.lng},${store.location.lat},15,0,0,0,dh" target="_blank" rel="noopener" class="map-popup__btn map-popup__btn--naver"><span class="material-symbols-outlined" style="font-size:14px">directions</span> 길찾기</a>
            </div>
          </div>
        </div>`, { maxWidth: 280, minWidth: 240, className: 'map-popup-container' });
      this._markers.push(marker);
    });

    if (bounds.length > 1) this._map.fitBounds(bounds, { padding: [40, 40] });
    else this._map.setView(bounds[0], 15);
  },

  async openAllInNaver() {
    const stores = (await StoreService.getAll()).filter(s => s.location?.lat && s.location?.lng);
    if (!stores.length) return;
    let tLat = 0, tLng = 0;
    stores.forEach(s => { tLat += s.location.lat; tLng += s.location.lng; });
    window.open(`https://map.naver.com/v5/?c=${tLng/stores.length},${tLat/stores.length},13,0,0,0,dh`, '_blank');
  },

  destroy() {
    if (this._map) { this._map.remove(); this._map = null; }
    this._markers = [];
  }
};
