/**
 * 이미지 업로드 컴포넌트
 */
const ImageUpload = {
  _files: [],
  _existingUrls: [],
  _onChangeCallback: null,

  init(containerId, existingUrls = [], onChange) {
    this._files = [];
    this._existingUrls = [...existingUrls];
    this._onChangeCallback = onChange;
    this._render(containerId);
  },

  _render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const previews = [
      ...this._existingUrls.map((url, i) => `
        <div class="image-preview-item">
          <img src="${Utils.escapeHtml(url)}" alt="사진 ${i + 1}">
          <button class="image-preview-item__remove" onclick="ImageUpload._removeExisting(${i}, '${containerId}')">&times;</button>
        </div>
      `),
      ...this._files.map((file, i) => `
        <div class="image-preview-item">
          <img src="${URL.createObjectURL(file)}" alt="새 사진 ${i + 1}">
          <button class="image-preview-item__remove" onclick="ImageUpload._removeNew(${i}, '${containerId}')">&times;</button>
        </div>
      `)
    ].join('');

    container.innerHTML = `
      <div class="image-upload" id="${containerId}-dropzone"
           onclick="document.getElementById('${containerId}-input').click()">
        <div class="image-upload__icon">&#128247;</div>
        <div class="image-upload__text">사진을 선택하거나 여기에 끌어놓으세요</div>
        <input type="file" id="${containerId}-input" accept="image/*" multiple
               style="display:none" onchange="ImageUpload._onFileSelect(event, '${containerId}')">
      </div>
      ${previews ? `<div class="image-preview-grid">${previews}</div>` : ''}
    `;

    // 드래그 앤 드롭
    const dropzone = document.getElementById(`${containerId}-dropzone`);
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('image-upload--dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('image-upload--dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('image-upload--dragover');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      this._files.push(...files);
      this._render(containerId);
      this._notifyChange();
    });
  },

  _onFileSelect(event, containerId) {
    const files = Array.from(event.target.files).filter(f => f.type.startsWith('image/'));
    this._files.push(...files);
    this._render(containerId);
    this._notifyChange();
  },

  _removeExisting(index, containerId) {
    this._existingUrls.splice(index, 1);
    this._render(containerId);
    this._notifyChange();
  },

  _removeNew(index, containerId) {
    this._files.splice(index, 1);
    this._render(containerId);
    this._notifyChange();
  },

  _notifyChange() {
    if (this._onChangeCallback) {
      this._onChangeCallback({
        existingUrls: this._existingUrls,
        newFiles: this._files
      });
    }
  },

  getFiles() {
    return this._files;
  },

  getExistingUrls() {
    return this._existingUrls;
  }
};
