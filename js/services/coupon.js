/**
 * 쿠폰 서비스
 */
const CouponService = {
  // 쿠폰 생성 (사장님)
  async create(data) {
    const ref = await db.collection('coupons').add({
      ...data,
      usedCount: 0,
      isActive: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },

  // 매장별 전체 쿠폰 (사장님 관리용)
  async getByStore(storeId) {
    const snap = await db.collection('coupons').where('storeId', '==', storeId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  // 매장별 활성 쿠폰 (회원용)
  async getActiveByStore(storeId) {
    const all = await this.getByStore(storeId);
    const now = new Date();
    return all.filter(c => {
      if (!c.isActive) return false;
      if (c.expiresAt && c.expiresAt.toDate() < now) return false;
      if (c.usedCount >= c.totalCount) return false;
      return true;
    });
  },

  // 쿠폰 받기 (트랜잭션 - 중복/한도 방지)
  async claim(couponId, userId) {
    const couponRef = db.collection('coupons').doc(couponId);
    const claimRef = db.collection('couponClaims').doc(`${couponId}_${userId}`);

    return db.runTransaction(async tx => {
      const [couponSnap, claimSnap] = await Promise.all([
        tx.get(couponRef),
        tx.get(claimRef)
      ]);

      if (!couponSnap.exists) throw new Error('쿠폰을 찾을 수 없습니다.');
      if (claimSnap.exists) throw new Error('already_claimed');

      const c = couponSnap.data();
      if (!c.isActive) throw new Error('비활성화된 쿠폰입니다.');
      if (c.usedCount >= c.totalCount) throw new Error('쿠폰이 모두 소진되었습니다.');
      if (c.expiresAt && c.expiresAt.toDate() < new Date()) throw new Error('만료된 쿠폰입니다.');

      tx.update(couponRef, { usedCount: firebase.firestore.FieldValue.increment(1) });
      tx.set(claimRef, {
        couponId,
        storeId: c.storeId,
        storeName: c.storeName,
        ownerId: c.ownerId,
        userId,
        couponTitle: c.title,
        discount: c.discount,
        expiresAt: c.expiresAt || null,
        claimedAt: firebase.firestore.FieldValue.serverTimestamp(),
        usedAt: null,
        isUsed: false
      });
    });
  },

  // 이미 받았는지 확인
  async hasClaimed(couponId, userId) {
    const doc = await db.collection('couponClaims').doc(`${couponId}_${userId}`).get();
    return doc.exists;
  },

  // 내 쿠폰 목록
  async getMyCoupons(userId) {
    const snap = await db.collection('couponClaims').where('userId', '==', userId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.claimedAt?.seconds || 0) - (a.claimedAt?.seconds || 0));
  },

  // 쿠폰 사용 처리
  async markUsed(claimId) {
    await db.collection('couponClaims').doc(claimId).update({
      isUsed: true,
      usedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // 쿠폰 활성화/비활성화
  async toggleActive(couponId, isActive) {
    await db.collection('coupons').doc(couponId).update({ isActive });
  },

  // 쿠폰 삭제
  async delete(couponId) {
    await db.collection('coupons').doc(couponId).delete();
  }
};
