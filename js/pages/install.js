/**
 * 앱 설치 가이드 페이지
 */
const InstallPage = {
  render(container) {
    container.innerHTML = `
      <div class="page" style="max-width:480px">
        <!-- 로고 -->
        <div style="text-align:center;margin-bottom:32px">
          <img src="assets/icons/church-logo.png" alt="수원하나교회 상점" style="width:80px;height:80px;margin:0 auto 16px">
          <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:600">앱 설치하기</h2>
          <p style="font-size:0.875rem;color:var(--secondary);margin-top:8px">홈 화면에 추가하면 앱처럼 사용할 수 있어요!</p>
        </div>

        <!-- QR 코드 -->
        <div class="install-section">
          <h3 class="install-section__title">
            <span class="material-symbols-outlined" style="font-size:20px">qr_code_2</span>
            QR 코드로 접속
          </h3>
          <div style="text-align:center;padding:20px;background:white;border-radius:16px;box-shadow:var(--shadow-sm)">
            <div id="qr-code" style="display:inline-block"></div>
            <p style="font-size:0.8125rem;color:var(--secondary);margin-top:12px">카메라로 스캔하면 바로 접속됩니다</p>
            <p style="font-size:0.875rem;font-weight:600;color:var(--primary);margin-top:4px">hana-store.com</p>
          </div>
        </div>

        <!-- 안드로이드 설치 -->
        <div class="install-section">
          <h3 class="install-section__title">
            <span class="material-symbols-outlined" style="font-size:20px">android</span>
            안드로이드 (크롬)
          </h3>
          <div class="install-steps">
            <div class="install-step">
              <div class="install-step__number">1</div>
              <div class="install-step__text">크롬 브라우저로 <strong>hana-store.com</strong> 접속</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">2</div>
              <div class="install-step__text">오른쪽 상단 <strong>메뉴(⋮)</strong> 터치</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">3</div>
              <div class="install-step__text"><strong>"홈 화면에 추가"</strong> 또는 <strong>"앱 설치"</strong> 선택</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">4</div>
              <div class="install-step__text"><strong>"설치"</strong> 터치하면 완료!</div>
            </div>
          </div>
        </div>

        <!-- 아이폰 설치 -->
        <div class="install-section">
          <h3 class="install-section__title">
            <span class="material-symbols-outlined" style="font-size:20px">phone_iphone</span>
            아이폰 (사파리)
          </h3>
          <div class="install-steps">
            <div class="install-step">
              <div class="install-step__number">1</div>
              <div class="install-step__text"><strong>사파리</strong> 브라우저로 <strong>hana-store.com</strong> 접속</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">2</div>
              <div class="install-step__text">하단 <strong>공유 버튼(↑)</strong> 터치</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">3</div>
              <div class="install-step__text">스크롤하여 <strong>"홈 화면에 추가"</strong> 선택</div>
            </div>
            <div class="install-step">
              <div class="install-step__number">4</div>
              <div class="install-step__text">오른쪽 상단 <strong>"추가"</strong> 터치하면 완료!</div>
            </div>
          </div>
        </div>

        <!-- 링크 공유 -->
        <div class="install-section">
          <h3 class="install-section__title">
            <span class="material-symbols-outlined" style="font-size:20px">share</span>
            링크 공유
          </h3>
          <div style="display:flex;gap:8px">
            <input class="form-input" value="https://hana-store.com" readonly id="share-url"
                   style="flex:1;padding:12px;border:1px solid var(--outline-variant);border-radius:12px;background:white;font-size:0.875rem">
            <button class="btn btn--primary btn--small" onclick="InstallPage.copyLink()" style="width:auto;white-space:nowrap">
              <span class="material-symbols-outlined" style="font-size:16px">content_copy</span> 복사
            </button>
          </div>
        </div>

        <!-- 홈으로 -->
        <div style="margin-top:24px">
          <button class="btn btn--secondary" onclick="App.navigate('#/')">
            <span class="material-symbols-outlined" style="font-size:18px">home</span> 홈으로 돌아가기
          </button>
        </div>
      </div>
    `;

    // QR 코드 생성
    this._generateQR();
  },

  _generateQR() {
    const qrEl = document.getElementById('qr-code');
    if (!qrEl) return;

    // QR 코드를 Canvas로 직접 생성 (외부 라이브러리 없이)
    const url = 'https://hana-store.com';
    // Google Charts API로 QR 생성 (간단한 방법)
    qrEl.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1a1a1a"
                           alt="QR Code" style="width:200px;height:200px;border-radius:8px">`;
  },

  copyLink() {
    const input = document.getElementById('share-url');
    navigator.clipboard.writeText(input.value).then(() => {
      Toast.show('링크가 복사되었습니다!', 'success');
    }).catch(() => {
      input.select();
      document.execCommand('copy');
      Toast.show('링크가 복사되었습니다!', 'success');
    });
  },

  destroy() {}
};
