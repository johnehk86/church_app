// Cloudflare Pages Function: GET /api/naver-place?url=<네이버 지도 공유 링크>
// 브라우저는 CORS 때문에 네이버에 직접 요청할 수 없어 서버에서 대신 조회한다.
// 주의: map.naver.com/p/api/place/summary 는 비공식 엔드포인트라 네이버 변경 시 깨질 수 있음.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

const isNaverHost = (h) => h === 'naver.me' || h === 'naver.com' || h.endsWith('.naver.com');

// pinId=123, /place/123, m.place.naver.com/restaurant/123 등에서 장소 번호 추출
const findPlaceId = (s) => {
  const m = (s || '').match(/(?:pinId=|placeId=|\/(?:entry\/)?[a-z]+\/)(\d{5,})/);
  return m ? m[1] : null;
};

export async function onRequestGet({ request }) {
  const target = new URL(request.url).searchParams.get('url') || '';
  let u;
  try { u = new URL(target); } catch (_) { return json({ error: 'bad_url' }, 400); }
  if (u.protocol !== 'https:' || !isNaverHost(u.hostname)) return json({ error: 'not_naver' }, 400);

  let placeId = findPlaceId(u.href);
  if (!placeId && u.hostname === 'naver.me') {
    const r = await fetch(u.href, { redirect: 'manual', headers: { 'User-Agent': UA } });
    placeId = findPlaceId(r.headers.get('location'));
  }
  if (!placeId) return json({ error: 'no_place' }, 404);

  const r = await fetch(`https://map.naver.com/p/api/place/summary/${placeId}`, {
    headers: { 'User-Agent': UA, 'Referer': 'https://map.naver.com/' }
  });
  if (!r.ok) return json({ error: 'lookup_failed' }, 502);

  const d = (await r.json())?.data?.placeDetail;
  const lat = d?.coordinate?.latitude;
  const lng = d?.coordinate?.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') return json({ error: 'no_coordinate' }, 502);

  return json({
    placeId,
    name: d.name || '',
    lat,
    lng,
    roadAddress: d.address?.roadAddress || '',
    address: d.address?.address || ''
  });
}
