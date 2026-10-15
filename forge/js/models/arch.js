/* FORGE props & modular — อิงงานไม้/ก่อสร้างจริง:
 * crate: กล่อง + ตีกรอบ + มุม / barrel: ถังไม้ + ห่วงเหล็ก 3 เส้น
 * lamp: เสา + แขน + โคม + หลอด + ไฟส่อง / fence: เสา 4 + ราว 2
 * bench: นั่ง 3 แผ่น + พนัก + ขาเหล็ก / sign: เสา + บอร์ด + กรอบ
 * modular: 1m snap — floor/wall/door(0.9×2.1)/window( sill 0.9)/stairs(ลูกตั้ง18cm)/pillar/roof
 */
import * as THREE from 'three';
import { M, BOX, CYL, SPH, getMat } from './core.js';
let count = 0;

export function buildProp(type) {
  const g = new THREE.Group(); g.name = type + '_' + (++count);
  const woodMat = getMat('wood'), metalMat = getMat('metal');
  if (type === 'crate') {
    g.add(M(BOX(1, 1, 1), woodMat, 0, 0.5, 0));
    const edgeM = getMat('bark');
    [[0, 0.03], [0, 0.97]].forEach(([x, y]) => {
      g.add(M(BOX(1.04, 0.08, 1.04), edgeM, x, y, 0));
    });
    [[0.48, 0.48], [-0.48, 0.48], [0.48, -0.48], [-0.48, -0.48]].forEach(([x, z]) => {
      g.add(M(BOX(0.09, 1.0, 0.09), edgeM, x, 0.5, z));
    });
    const diag = M(BOX(0.07, 1.2, 0.02), edgeM, 0, 0.5, 0.51); diag.rotation.z = 0.7; g.add(diag);
  } else if (type === 'barrel') {
    // ถังไม้เอวป่อง + ห่วง 3 เส้น
    g.add(M(CYL(0.32, 0.3, 0.9, 12), woodMat, 0, 0.45, 0));
    g.children[0].scale.set(1.12, 1, 1.12);
    [0.15, 0.45, 0.75].forEach(y => {
      const ring = M(new THREE.TorusGeometry(0.345, 0.018, 6, 18), metalMat, 0, y, 0);
      ring.rotation.x = Math.PI / 2; g.add(ring);
    });
    g.add(M(CYL(0.3, 0.3, 0.03, 12), getMat('concrete'), 0, 0.9, 0)); // ฝา
  } else if (type === 'lamp') {
    g.add(M(CYL(0.06, 0.09, 4, 8), metalMat, 0, 2, 0));
    g.add(M(CYL(0.12, 0.12, 0.1, 8), metalMat, 0, 0.05, 0)); // ฐาน
    g.add(M(BOX(0.8, 0.07, 0.07), metalMat, 0.4, 3.98, 0));
    g.add(M(BOX(0.32, 0.12, 0.22), getMat('emissive'), 0.8, 3.9, 0));
    const bulb = M(SPH(0.08, 8, 6), getMat('emissive', { emissive: 0xffd98a, emissiveIntensity: 2 }), 0.8, 3.8, 0);
    bulb.castShadow = false; g.add(bulb);
    const li = new THREE.PointLight(0xffc46b, 1.4, 11, 2); li.position.set(0.8, 3.7, 0); g.add(li);
  } else if (type === 'fence') {
    for (let i = 0; i < 4; i++) {
      g.add(M(BOX(0.09, 1.0, 0.09), woodMat, -0.9 + i * 0.6, 0.5, 0));
      g.add(M(CYL(0, 0.065, 0.09, 4), woodMat, -0.9 + i * 0.6, 1.04, 0));
    }
    g.add(M(BOX(2.0, 0.08, 0.05), woodMat, 0, 0.72, 0));
    g.add(M(BOX(2.0, 0.08, 0.05), woodMat, 0, 0.32, 0));
  } else if (type === 'bench') {
    for (let i = -1; i <= 1; i++) g.add(M(BOX(1.7, 0.05, 0.14), woodMat, 0, 0.45, i * 0.16));
    for (let i = 0; i < 3; i++) g.add(M(BOX(1.7, 0.4, 0.04), woodMat, 0, 0.72 + i * 0.12, -0.26 - i * 0.02));
    [[-0.7], [0.7]].forEach(([x]) => {
      g.add(M(BOX(0.07, 0.45, 0.5), metalMat, x, 0.22, 0));
      g.add(M(BOX(0.07, 0.5, 0.07), metalMat, x, 0.6, -0.28));
    });
  } else if (type === 'sign') {
    g.add(M(CYL(0.045, 0.05, 2.1, 7), metalMat, 0, 1.05, 0));
    g.add(M(BOX(0.7, 0.42, 0.04), new THREE.MeshStandardMaterial({ color: 0x2e6f73, roughness: .6 }), 0, 1.75, 0));
    g.add(M(BOX(0.74, 0.05, 0.05), woodMat, 0, 1.98, 0));
    g.add(M(BOX(0.74, 0.05, 0.05), woodMat, 0, 1.52, 0));
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.assetType = 'prop';
  return g;
}

export function makeModular(type, height = 3) {
  const g = new THREE.Group(); g.name = type + '_' + (++count);
  const fMat = getMat('concrete'), wMat = getMat('brick'), woodMat = getMat('wood'), metalMat = getMat('metal');
  const T = 0.15; // ความหนาผนังจริง
  if (type === 'floor') {
    g.add(M(BOX(1, 0.1, 1), fMat, 0, 0.05, 0));
    g.add(M(BOX(0.96, 0.005, 0.96), getMat('stone'), 0, 0.102, 0)); // ผิว
  } else if (type === 'wall') {
    g.add(M(BOX(1, height, T), wMat, 0, height / 2, 0));
    g.add(M(BOX(1.02, 0.12, 0.18), fMat, 0, height + 0.06, 0)); // คานทับหลัง
    g.add(M(BOX(1.02, 0.08, 0.18), fMat, 0, 0.04, 0));
  } else if (type === 'corner') {
    g.add(M(BOX(1, height, T), wMat, 0.425, height / 2, 0));
    g.add(M(BOX(T, height, 1), wMat, 0, height / 2, 0.425));
    g.add(M(BOX(0.2, height, 0.2), fMat, 0, height / 2, 0)); // เสามุม
  } else if (type === 'door') {
    const doorW = 0.9, doorH = Math.min(2.1, height - 0.2);
    const sideW = (1 - doorW) / 2;
    g.add(M(BOX(sideW, height, T), wMat, -(doorW / 2 + sideW / 2), height / 2, 0));
    g.add(M(BOX(sideW, height, T), wMat, (doorW / 2 + sideW / 2), height / 2, 0));
    g.add(M(BOX(doorW, height - doorH, T), wMat, 0, doorH + (height - doorH) / 2, 0));
    g.add(M(BOX(doorW + 0.06, 0.08, T + 0.04), woodMat, 0, doorH + 0.04, 0)); // วงกบ
    const leaf = M(BOX(doorW - 0.06, doorH - 0.04, 0.05), woodMat, 0, doorH / 2, 0);
    leaf.position.x = 0.05; g.add(leaf);
    g.add(M(SPH(0.03, 6, 5), metalMat, 0.3, 1.0, 0.05)); // ลูกบิด
  } else if (type === 'window') {
    const winW = 0.6, winH = 0.8, sillY = height * 0.45;
    const sideW = (1 - winW) / 2;
    g.add(M(BOX(sideW, height, T), wMat, -(winW / 2 + sideW / 2), height / 2, 0));
    g.add(M(BOX(sideW, height, T), wMat, (winW / 2 + sideW / 2), height / 2, 0));
    g.add(M(BOX(winW, sillY - winH / 2, T), wMat, 0, (sillY - winH / 2) / 2, 0));
    g.add(M(BOX(winW, height - sillY - winH / 2, T), wMat, 0, sillY + winH / 2 + (height - sillY - winH / 2) / 2, 0));
    g.add(M(BOX(winW, winH, 0.02), getMat('glass'), 0, sillY, 0));
    // กรอบ + ลูกกรง
    g.add(M(BOX(winW + 0.08, 0.06, T + 0.02), woodMat, 0, sillY + winH / 2, 0));
    g.add(M(BOX(winW + 0.1, 0.06, T + 0.04), fMat, 0, sillY - winH / 2, 0)); // ขอบปูน
    g.add(M(BOX(0.03, winH, 0.03), woodMat, 0, sillY, 0));
  } else if (type === 'stairs') {
    const riser = 0.18, tread = 0.28, n = Math.floor(height / riser); // มาตรฐาน 18/28cm → ชัน 32.7°
    for (let i = 0; i < n; i++) g.add(M(BOX(1, riser, tread), fMat, 0, riser / 2 + i * riser, i * tread));
    // ราวตามความชันจริง atan(height/run)
    const slope = Math.atan2(height, n * tread);
    const rail = M(BOX(0.05, 0.05, Math.hypot(height, n * tread)), woodMat, 0.5, height / 2 + 0.5, n * tread / 2);
    rail.rotation.x = -slope; g.add(rail);
    const rail2 = M(BOX(0.05, 0.05, Math.hypot(height, n * tread)), woodMat, -0.5, height / 2 + 0.5, n * tread / 2);
    rail2.rotation.x = -slope; g.add(rail2);
  } else if (type === 'pillar') {
    g.add(M(BOX(0.4, 0.12, 0.4), fMat, 0, 0.06, 0));
    g.add(M(BOX(0.28, height - 0.24, 0.28), fMat, 0, height / 2, 0));
    g.add(M(BOX(0.4, 0.12, 0.4), fMat, 0, height - 0.06, 0));
  } else if (type === 'roof') {
    g.add(M(BOX(1.2, 0.08, 1.2), wMat, 0, 0.3, 0));
    const r1 = M(BOX(0.75, 0.06, 1.2), wMat, -0.28, 0.55, 0); r1.rotation.z = 0.6; g.add(r1);
    const r2 = M(BOX(0.75, 0.06, 1.2), wMat, 0.28, 0.55, 0); r2.rotation.z = -0.6; g.add(r2);
    g.add(M(BOX(0.12, 0.08, 1.2), getMat('bark'), 0, 0.82, 0)); // สัน
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.assetType = 'modular';
  return g;
}
