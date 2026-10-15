/* FORGE 3D — core (แยกจาก forge3d_fixed.html เดิมไฟล์เดียว)
 * หน่วยเมตร, Y-up, เงา PCFSoft, วัสดุ PBR
 */
import * as THREE from 'three';

export const MAT_PRESETS = {
  wood:     { color:0x8b5a2b, roughness:.75, metalness:0 },
  stone:    { color:0x8a8a8a, roughness:.85, metalness:0 },
  metal:    { color:0xaaaaaa, roughness:.3,  metalness:.9 },
  foliage:  { color:0x4a8f3a, roughness:.9,  metalness:0 },
  glass:    { color:0xaaddff, roughness:.05, metalness:.1, transparent:true, opacity:.35 },
  concrete: { color:0x999999, roughness:.9,  metalness:0 },
  dirt:     { color:0x6b4f2e, roughness:.95, metalness:0 },
  grass:    { color:0x5fa83a, roughness:.9,  metalness:0 },
  rubber:   { color:0x1a1a1a, roughness:.9,  metalness:0 },
  brick:    { color:0xa05038, roughness:.85, metalness:0 },
  bark:     { color:0x5a3a1e, roughness:.95, metalness:0 },
  emissive: { color:0x222222, roughness:.4,  metalness:0, emissive:0xff8800, emissiveIntensity:1.5 }
};
export function getMat(name, overrides) {
  const p = MAT_PRESETS[name] || MAT_PRESETS.concrete;
  return new THREE.MeshStandardMaterial(Object.assign({}, p, overrides || {}));
}
export function M(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const CYL = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
export const CONE = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
export const SPH = (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
