/* FORGE trees — อิงพฤกษศาสตร์จริง:
 * round: ลำต้นตรง + กิ่งแผ่ + เรือนยอดกลม 3-5 ก้อน (oak-like)
 * cone (conifer): ลำต้น + ชั้นใบ 4-6 ชั้นเล็กลงขึ้นบน + ยอดแหลม + โคน
 * palm: ลำต้นโค้งข้อปล้อง + ทางใบ 8-10 ทางมีแกนกลาง + ลูก 3 ลูก
 * bush: ลำต้นแตกหลายลำ + พุ่มเตี้ย
 */
import * as THREE from 'three';
import { M, CYL, CONE, SPH, BOX, getMat } from './core.js';

let count = 0;

export function buildTree(shape, height, width, density, colorHex) {
  const g = new THREE.Group();
  g.name = 'Tree_' + shape + '_' + (++count);
  // width = ความกว้างทรงพุ่มเต็ม (m) → รัศมี = width/2
  const R = width / 2;
  const trunkH = shape === 'palm' ? height * 0.85 : shape === 'bush' ? height * 0.25 : height * 0.45;
  const trunkR = Math.max(0.05, width * 0.09);
  const trunkMat = getMat('bark');
  const leafMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: .85, flatShading: true });

  if (shape === 'palm') {
    // ลำต้นข้อปล้องโค้งเล็กน้อย (โคนแตะพื้น y=0)
    const segs = 5, sh = trunkH / segs;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const s = M(CYL(trunkR * (1 - t * 0.25), trunkR * (1 - t * 0.2), sh, 7), trunkMat, t * 0.25, sh * (i + 0.5) + 0.012, 0);
      s.rotation.z = -0.08; g.add(s);
    }
    const topX = 0.25, topY = trunkH;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const frond = new THREE.Group();
      const mid = M(BOX(0.04, 0.03, R * 1.1), trunkMat, 0, 0, R * 0.55);
      frond.add(mid);
      for (let k = 1; k <= 5; k++) {
        const leaf = M(new THREE.PlaneGeometry(0.16, R * 0.32), new THREE.MeshStandardMaterial({ color: colorHex, roughness: .9, side: THREE.DoubleSide }));
        leaf.position.set(0.12, -0.02 * k, R * 0.3 * k);
        leaf.rotation.y = 0.5; frond.add(leaf);
        const leaf2 = leaf.clone(); leaf2.position.x = -0.12; leaf2.rotation.y = -0.5; frond.add(leaf2);
      }
      frond.position.set(topX, topY, 0);
      frond.rotation.y = a;
      // ชั้นบนชู -20° ชั้นล่างห้อย -50° (ทางปาล์มจริง)
      frond.rotation.x = (i % 2 === 0) ? -0.35 : -0.85;
      g.add(frond);
    }
    // ทะลาย + ลูกมะพร้าว 3 ลูก
    const nutM = getMat('wood');
    [[0.15, 0, 0.1], [-0.1, 0, 0.15], [0, 0, -0.15]].forEach(([dx, dy, dz]) => {
      g.add(M(SPH(0.11, 8, 6), nutM, topX + dx, topY - 0.12, dz));
    });
  } else if (shape === 'cone') {
    g.add(M(CYL(trunkR, trunkR * 1.25, trunkH, 7), trunkMat, 0, trunkH / 2, 0));
    const layers = Math.max(4, density + 2);
    const ch = height * 0.28; // สูงชั้นใบ
    for (let i = 0; i < layers; i++) {
      const t = i / layers;
      const r = R * (1 - t * 0.75); // ฐานกว้าง = width ปลายแหลม
      const y = trunkH + t * height * 0.5;
      const cone = M(CONE(r, ch, 9), leafMat, 0, y, 0);
      cone.rotation.y = (i * Math.PI) / 5; // สลับมุมตาม Fibonacci
      g.add(cone);
    }
    g.add(M(CONE(0.07, height * 0.14, 7), leafMat, 0, trunkH + height * 0.47, 0)); // ยอด leader → รวม ≈ height
    const coneM = getMat('wood');
    g.add(M(CYL(0.05, 0.07, 0.14, 6), coneM, R * 0.3, trunkH + 0.25, 0.1)); // โคนสนห้อย
  } else if (shape === 'bush') {
    // โคนแตกหลายลำ + พุ่มเตี้ยรี (สูง ≈ height)
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const st = M(CYL(0.03, 0.045, height * 0.4, 5), trunkMat, Math.cos(a) * 0.15, height * 0.2, Math.sin(a) * 0.15);
      st.rotation.z = Math.cos(a) * 0.3; g.add(st);
    }
    for (let i = 0; i < density + 2; i++) {
      const r = R * (0.5 + Math.random() * 0.3);
      const ball = M(SPH(r, 8, 6), leafMat, (Math.random() - 0.5) * R, r * 0.7 + Math.random() * height * 0.3, (Math.random() - 0.5) * R);
      ball.scale.y = 0.8; g.add(ball);
    }
  } else {
    // round: ลำต้น + กิ่งหลัก 3 (มุม 50° จากแนวดิ่ง) + เรือนยอดถึง height
    g.add(M(CYL(trunkR, trunkR * 1.35, trunkH, 8), trunkMat, 0, trunkH / 2, 0));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const br = M(CYL(0.04, 0.06, R * 0.9, 6), trunkMat, Math.cos(a) * R * 0.35, trunkH + 0.2, Math.sin(a) * R * 0.35);
      br.rotation.z = Math.cos(a) * 0.9; br.rotation.x = -Math.sin(a) * 0.9; g.add(br);
    }
    const n = Math.max(4, density + 2);
    const rMax = R * 0.62;
    for (let i = 0; i < n; i++) {
      const r = rMax * (0.65 + Math.random() * 0.5);
      const y = trunkH + 0.2 + (i / Math.max(1, n - 1)) * Math.max(0.2, height - trunkH - 0.2 - r);
      const ball = M(SPH(r, 9, 7), leafMat, (Math.random() - 0.5) * R * 0.7, y, (Math.random() - 0.5) * R * 0.7);
      g.add(ball);
    }
  }
  g.userData.assetType = 'foliage';
  g.userData.treeShape = shape;
  return g;
}
