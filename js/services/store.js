/**
 * 매장 서비스 - LocalStorage 기반
 */
const StoreService = {
  getAll() {
    return DB.getAllStores();
  },

  getByCategory(category) {
    const all = this.getAll();
    if (!category || category === '전체') return all;
    return all.filter(s => s.category === category);
  },

  search(query) {
    const all = this.getAll();
    const q = query.toLowerCase();
    return all.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q))
    );
  },

  getById(storeId) {
    return DB.getStore(storeId);
  },

  getByOwnerId(ownerId) {
    const all = this.getAll();
    return all.find(s => s.ownerId === ownerId) || null;
  },

  create(storeData) {
    const id = DB.generateId();
    DB.saveStore(id, {
      ...storeData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return id;
  },

  update(storeId, storeData) {
    const existing = DB.getStore(storeId);
    DB.saveStore(storeId, {
      ...existing,
      ...storeData,
      updatedAt: Date.now()
    });
  },

  delete(storeId) {
    DB.deleteStore(storeId);
  }
};
