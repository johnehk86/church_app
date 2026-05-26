/**
 * 지도 페이지 - Leaflet.js + OpenStreetMap (무료, API 키 불필요)
 * 전체 매장을 핀으로 표시, 클릭 시 네이버 지도 연동
 */
const MapPage = {
  _map: null,
  _markers: [],

  render(container) {
    const stores = StoreService.getAll();
    const storesWithLocation = stores.filter(s => s.location?.lat && s.location?.lng);

    container.innerHTML = `
      <div class="page" style="padding:0;max-width:none">
        <!-- 상단 바 -->
        <div style="padding:16px 24px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <p class="label-caps" style="margin-bottom:4px">ALL STORES ON MAP</p>
            <h2 style="font-family:var(--font-display);font-size:1.25rem;font-weight:600">${storesWithLocation.length}개 매장</h2>
          </div>
          <button class="btn btn--secondary btn--small" onclick="MapPage.openAllInNaver()" style="width:auto">
            <span class="material-symbols-outlined" style="font-size:16px">open_in_new</span>
            네이버 지도
          </button>
        </div>

        ${storesWithLocation.length === 0 ? `
          <div class="empty-state" style="padding:60px 24px">
            <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3">location_off</span>
            <h3 class="empty-state__title">위치가 등록된 매장이 없습니다</h3>
          </div>
        ` : `
          <!-- 지도 -->
          <div id="leaflet-map" style="height:calc(100dvh - var(--header-height) - var(--bottom-nav-height) - 70px);width:100%"></div>
        `}
      </div>
    `;

    if (storesWithLocation.length > 0) {
      this._initMap(storesWithLocation);
    }
  },

  _initMap(stores) {
    // 지도 생성
    this._map = L.map('leaflet-map', {
      zoomControl: false
    });

    // 줌 컨트롤 우측 배치
    L.control.zoom({ position: 'bottomright' }).addTo(this._map);

    // OpenStreetMap 타일 (무료)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19
    }).addTo(this._map);

    // 커스텀 마커 아이콘
    const createIcon = (category) => {
      const iconName = Utils.categoryIcons[category] || 'storefront';
      return L.divIcon({
        className: 'custom-marker',
        html: `<div class="map-pin">
                 <span class="material-symbols-outlined icon-filled" style="font-size:16px;color:white">${iconName}</span>
               </div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -48]
      });
    };

    // 마커 추가
    const bounds = [];
    stores.forEach(store => {
      const pos = [store.location.lat, store.location.lng];
      bounds.push(pos);

      const marker = L.marker(pos, {
        icon: createIcon(store.category)
      }).addTo(this._map);

      // 팝업 내용
      const hasPhoto = store.photos && store.photos.length > 0;
      const popupContent = `
        <div class="map-popup">
          ${hasPhoto ? `<img class="map-popup__image" src="${Utils.escapeHtml(store.photos[0])}" alt="">` : ''}
          <div class="map-popup__body">
            <div class="map-popup__category">${Utils.escapeHtml(store.category || '')}</div>
            <div class="map-popup__name">${Utils.escapeHtml(store.name)}</div>
            <div class="map-popup__address">${Utils.escapeHtml(store.address || '')}</div>
            <div class="map-popup__actions">
              <a href="#/store/${store.id}" class="map-popup__btn">
                <span class="material-symbols-outlined" style="font-size:14px">info</span> 상세보기
              </a>
              <a href="https://map.naver.com/v5/search/${encodeURIComponent(store.name)}?c=${store.location.lng},${store.location.lat},15,0,0,0,dh"
                 target="_blank" rel="noopener" class="map-popup__btn map-popup__btn--naver">
                <span class="material-symbols-outlined" style="font-size:14px">directions</span> 길찾기
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        minWidth: 240,
        className: 'map-popup-container'
      });

      this._markers.push(marker);
    });

    // 모든 마커가 보이도록 범위 조정
    if (bounds.length > 1) {
      this._map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      this._map.setView(bounds[0], 15);
    }
  },

  // 네이버 지도에서 전체 매장 보기 (중심 좌표로)
  openAllInNaver() {
    const stores = StoreService.getAll().filter(s => s.location?.lat && s.location?.lng);
    if (stores.length === 0) return;

    // 중심 좌표 계산
    let totalLat = 0, totalLng = 0;
    stores.forEach(s => {
      totalLat += s.location.lat;
      totalLng += s.location.lng;
    });
    const centerLat = totalLat / stores.length;
    const centerLng = totalLng / stores.length;

    // 네이버 지도 검색으로 열기
    window.open(
      `https://map.naver.com/v5/?c=${centerLng},${centerLat},13,0,0,0,dh`,
      '_blank'
    );
  },

  destroy() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    this._markers = [];
  }
};
