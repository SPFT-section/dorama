/* Campfire Diorama — core helpers
 * 1 unit = 1 tile, top of tile y = TILE_H (0.8)
 * low-poly blocky, flatShading, roughness 1, 16px pixel textures
 */
import * as THREE from 'three';

export const TILE_H = 0.8;

export const palette = {
  night: 0x0f1720, pine: 0x1e2a24, moss: 0x5f7a4a, mossDark: 0x42572f,
  wood: 0x6b4a2e, woodDark: 0x4a3220, woodLight: 0x8a6238,
  parchment: 0xe8d8b0, amber: 0xf2a65a, ember: 0xe86a33,
  teal: 0x2e6f73, danger: 0xc44536, hp: 0x6fbf73, stamina: 0xf2c14e,
  hunger: 0xd98c4a, rare: 0x4c9aff, epic: 0xa66cff,
  grass: 0x5f7a4a, grassDark: 0x4c6339, dirt: 0x7a5a38, dirtDark: 0x5e4429,
  sand: 0xd9c28a, sandDark: 0xbfa76f, stone: 0x8a8f96, stoneDark: 0x62666d,
  snow: 0xeef2f5, snowDark: 0xc9d4dc, water: 0x2e6f73, waterDark: 0x1d4a4e,
  leaf: 0x4a6b35, leafLight: 0x6b8f4a, trunk: 0x5a3d24,
  skin: 0xe0b08a, shirt: 0x7a8a99, pants: 0x4a3f35, iron: 0x9aa2ad,
  copper: 0xd9884a, crystal: 0x7fd4ff, berry: 0xc44536, bone: 0xe8d8b0,
  wolfFur: 0x6b6560, wolfDark: 0x4a4642, slime: 0x6fbf73, slimeDark: 0x4a8f52,
  chick: 0xe8d8b0, beak: 0xe86a33, canvas: 0xb08954, canvasDark: 0x8a6b3f,
  // extra for new assets
  straw: 0xd9c28a, rope: 0xb08954, charcoal: 0x2b2b2b, ash: 0x9a9a9a,
  barkDark: 0x3a2a18, mossLight: 0x7a9a5a, reed: 0x6b8f4a,
  plume: 0xe8d8b0, cattail: 0x5a3d24, grain: 0xd9b86a,
};

const texCache = new Map();
export function pixelTexture(base, flecks = [], size = 16) {
  const key = base + '|' + flecks.join(',');
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const col = '#' + base.toString(16).padStart(6, '0');
  g.fillStyle = col; g.fillRect(0, 0, size, size);
  let seed = base % 9973;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rnd() * size), y = Math.floor(rnd() * size);
    const f = flecks.length ? flecks[Math.floor(rnd() * flecks.length)] : 0x000000;
    g.fillStyle = '#' + f.toString(16).padStart(6, '0');
    g.globalAlpha = 0.35 + rnd() * 0.4;
    g.fillRect(x, y, rnd() > 0.7 ? 2 : 1, 1);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

const matCache = new Map();
export function std(color, flecks) {
  const key = 's' + color + '|' + (flecks ? flecks.join(',') : 'default');
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    map: pixelTexture(color, flecks || [0x000000, 0xffffff]),
    roughness: 1, metalness: 0, flatShading: true,
  });
  matCache.set(key, m); return m;
}
export function glow(color) {
  const key = 'g' + color;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshBasicMaterial({ color });
  matCache.set(key, m); return m;
}

let _waterMat = null;
export function waterMaterial() {
  if (!_waterMat) _waterMat = new THREE.MeshStandardMaterial({
    map: pixelTexture(palette.water, [palette.waterDark, 0xbfefff]),
    roughness: 1, metalness: 0, flatShading: true, transparent: true, opacity: 0.85,
  });
  return _waterMat;
}

export function M(geo, material, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z); if (ry) m.rotation.y = ry;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const CYL = (rt, rb, h, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s);
export const CONE = (r, h, s = 4) => new THREE.ConeGeometry(r, h, s);
export const ICO = (r) => new THREE.IcosahedronGeometry(r, 0);
export const OCT = (r) => new THREE.OctahedronGeometry(r, 0);

/* growth-rings texture for stump / log ends (real cross-section) */
export function ringsTexture(base = 0xc9a06a, ring = 0x8a6238) {
  const key = 'rings' + base;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = '#' + base.toString(16).padStart(6, '0');
  g.fillRect(0, 0, 32, 32);
  g.strokeStyle = '#' + ring.toString(16).padStart(6, '0');
  for (let r = 3; r < 16; r += 3) {
    g.beginPath(); g.arc(16, 16, r, 0, Math.PI * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}
export function ringsMat(base, ring) {
  const key = 'rm' + base;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    map: ringsTexture(base, ring), roughness: 1, metalness: 0, flatShading: true,
  });
  matCache.set(key, m); return m;
}
