/* FORGE foliage / rocks / terrain — อิงของจริง */
import * as THREE from 'three';
import { M, BOX, CYL, SPH, CONE, getMat } from './core.js';
let count = 0;

/* หญ้า/ใบไม้: กอ + ใบ + ดอก/ช่อตามชนิด */
export function buildFoliage(type, leafCount, height, colorHex) {
  const g = new THREE.Group();
  g.name = 'Foliage_' + type + '_' + (++count);
  const leafMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: .9, side: THREE.DoubleSide });
  if (type === 'flower') {
    for (let i = 0; i < leafCount; i++) {
      const x = (Math.random() - 0.5) * 0.35, z = (Math.random() - 0.5) * 0.35;
      g.add(M(CYL(0.012, 0.018, height, 5), leafMat, x, height / 2, z));
      // กลีบ 5 + เกสร
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        g.add(M(SPH(0.045, 6, 5), new THREE.MeshStandardMaterial({ color: 0xff88aa, roughness: .7 }), x + Math.cos(a) * 0.05, height, z + Math.sin(a) * 0.05));
      }
      g.add(M(SPH(0.035, 6, 5), new THREE.MeshStandardMaterial({ color: 0xf2c14e }), x, height + 0.02, z));
    }
  } else if (type === 'fern') {
    // เฟิร์น: ก้านกลาง + ใบย่อยขนนก 2 ข้าง
    for (let i = 0; i < leafCount; i++) {
      const a = (i / leafCount) * Math.PI * 2;
      const fr = new THREE.Group();
      fr.add(M(BOX(0.02, 0.02, height * 0.9), leafMat, 0, 0, height * 0.3));
      for (let k = 1; k <= 5; k++) {
        const s1 = M(new THREE.PlaneGeometry(height * 0.16, height * 0.1), leafMat, 0.06, 0, height * 0.12 * k);
        s1.rotation.y = 0.6; fr.add(s1);
        const s2 = s1.clone(); s2.position.x = -0.06; s2.rotation.y = -0.6; fr.add(s2);
      }
      fr.position.set(Math.cos(a) * 0.06, height * 0.15, Math.sin(a) * 0.06);
      fr.rotation.y = a; fr.rotation.x = -0.5;
      g.add(fr);
    }
  } else if (type === 'bush') {
    const n = Math.max(3, Math.floor(leafCount / 2));
    for (let i = 0; i < n; i++) {
      const r = height * (0.35 + Math.random() * 0.25);
      const b = M(SPH(r, 7, 6), leafMat, (Math.random() - 0.5) * height * 0.7, r * 0.8, (Math.random() - 0.5) * height * 0.7);
      b.scale.y = 0.85; g.add(b);
    }
  } else {
    // grass: ใบเรียวปลายแหลมโค้ง
    for (let i = 0; i < leafCount; i++) {
      const h = height * (0.7 + Math.random() * 0.6);
      const bl = M(new THREE.PlaneGeometry(0.07, h, 1, 3), leafMat, (Math.random() - 0.5) * 0.45, h / 2, (Math.random() - 0.5) * 0.45);
      bl.rotation.y = Math.random() * Math.PI;
      bl.rotation.z = (Math.random() - 0.5) * 0.35;
      g.add(bl);
    }
  }
  g.userData.assetType = 'foliage';
  return g;
}

/* หิน: ฐานแบน + รอยชั้น + มอส / terrain: คลื่น + สุ่ม */
export function buildRock(size, roughness) {
  const geo = new THREE.IcosahedronGeometry(size, 2);
  const pos = geo.attributes.position, arr = pos.array;
  for (let i = 0; i < arr.length; i += 3) {
    const n = (Math.random() - 0.5) * roughness * 0.7;
    arr[i] *= 1 + n; arr[i + 1] *= 1 + n * 0.7; arr[i + 2] *= 1 + n;
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  const m = M(geo, new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: .9, flatShading: true }), 0, size * 0.42, 0);
  m.scale.y = 0.85;
  const g = new THREE.Group(); g.name = 'Rock_' + (++count); g.add(m);
  const moss = M(BOX(size * 0.5, size * 0.06, size * 0.4), getMat('grass'), -size * 0.1, size * 0.78, size * 0.05);
  moss.rotation.y = 0.5; g.add(moss);
  g.userData.assetType = 'environment';
  return g;
}
export function buildTerrain(size = 10) {
  const geo = new THREE.PlaneGeometry(size, size, 28, 28);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.4) * Math.cos(y * 0.35) * 0.5 + Math.sin(x * 1.3) * 0.08 + (Math.random() - 0.5) * 0.1);
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: .95, flatShading: true }));
  m.rotation.x = -Math.PI / 2; m.name = 'Terrain_' + (++count);
  m.receiveShadow = true; m.castShadow = true;
  m.userData.assetType = 'environment';
  return m;
}
