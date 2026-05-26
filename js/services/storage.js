/**
 * Firebase Storage - 사진 업로드 서비스
 */
const StorageService = {
  /**
   * 이미지 업로드 (File 또는 dataURL)
   * @returns {string} 다운로드 URL
   */
  async upload(input, path) {
    const fileName = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const ref = storage.ref().child(`${path}/${fileName}.jpg`);

    if (typeof input === 'string' && input.startsWith('data:')) {
      // dataURL → blob
      const res = await fetch(input);
      const blob = await res.blob();
      await ref.put(blob);
    } else if (input instanceof File) {
      // 이미지 리사이즈 후 업로드
      const resized = await this._resize(input, 1200);
      await ref.put(resized);
    } else {
      throw new Error('지원하지 않는 파일 형식');
    }

    return await ref.getDownloadURL();
  },

  /**
   * 여러 이미지 업로드 (dataURL 배열에서 새 것만 업로드)
   * 기존 Firebase URL은 그대로 유지, dataURL만 새로 업로드
   */
  async uploadPhotos(urls, path) {
    const result = [];
    for (const url of urls) {
      if (url.startsWith('data:')) {
        const downloadUrl = await this.upload(url, path);
        result.push(downloadUrl);
      } else {
        // 이미 업로드된 URL은 그대로
        result.push(url);
      }
    }
    return result;
  },

  /**
   * 이미지 리사이즈
   */
  _resize(file, maxSize) {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) { resolve(file); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width <= maxSize && img.height <= maxSize) { resolve(file); return; }
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
          else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob(resolve, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
};
