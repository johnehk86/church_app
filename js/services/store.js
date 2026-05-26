/**
 * Firestore 매장 서비스
 */
const StoreService = {
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL: 15000, // 15초 캐시

  // 전체 매장 (캐시 활용)
  async getAll() {
    const now = Date.now();
    if (this._cache && (now - this._cacheTime) < this.CACHE_TTL) {
      return this._cache;
    }
    try {
      const snapshot = await db.collection('stores').orderBy('createdAt', 'desc').get();
      this._cache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.error('매장 목록 실패:', e);
      return this._cache || [];
    }
  },

  async getByCategory(category) {
    const all = await this.getAll();
    if (!category || category === '전체') return all;
    return all.filter(s => s.category === category);
  },

  async search(query) {
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q))
    );
  },

  async getById(storeId) {
    // 캐시에서 먼저 찾기
    if (this._cache) {
      const found = this._cache.find(s => s.id === storeId);
      if (found) return found;
    }
    try {
      const doc = await db.collection('stores').doc(storeId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (e) {
      console.error('매장 조회 실패:', e);
      return null;
    }
  },

  async getByOwnerId(ownerId) {
    try {
      const snapshot = await db.collection('stores').where('ownerId', '==', ownerId).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (e) {
      console.error('내 매장 조회 실패:', e);
      return null;
    }
  },

  async create(storeData) {
    try {
      const docRef = await db.collection('stores').add({
        ...storeData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._cache = null;
      return docRef.id;
    } catch (e) {
      console.error('매장 생성 실패:', e);
      throw e;
    }
  },

  async update(storeId, storeData) {
    try {
      await db.collection('stores').doc(storeId).update({
        ...storeData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._cache = null;
    } catch (e) {
      console.error('매장 수정 실패:', e);
      throw e;
    }
  },

  async delete(storeId) {
    try {
      await db.collection('stores').doc(storeId).delete();
      this._cache = null;
    } catch (e) {
      console.error('매장 삭제 실패:', e);
      throw e;
    }
  }
};
