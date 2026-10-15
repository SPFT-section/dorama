/* sedan — รถเก๋งซีดาน D-Segment สเกลจริง (1 unit = 1 เมตร)
 * อ้างอิง: L 4.88m / W 1.84m / H 1.445m / WB 2.825m / Track 1.59m / ล้อ 668mm
 * โครงสร้าง: Unibody + Subframe หน้า/หลัง, เสา A/B/C, เครื่องวางขวางขับหน้า FF
 * แกน: X = ยาวรถ (หน้า +X), Y = สูง, Z = กว้าง, origin = กลางฐานล้อที่พื้น y=0
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow } from './core.js';

export const SEDAN_DIM = {
  L: 4.88, W: 1.84, H: 1.445,
  WB: 2.825, trackF: 1.59, trackR: 1.595,
  frontOverhang: 0.92, rearOverhang: 1.135,
  wheelD: 0.668, wheelR: 0.334, wheelW: 0.215,
  groundClearance: 0.14,
  frontAxleX: 1.4125, rearAxleX: -1.4125,
  frontBumperX: 2.3325, rearBumperX: -2.5475,
  beltlineY: 0.96, roofY: 1.42, rockerY: 0.16,
};

const matCache = new Map();
export function carPaint(color = 0x2e6f9e) {
  const k = 'car' + color;
  if (matCache.has(k)) return matCache.get(k);
  const m = new THREE.MeshStandardMaterial({
    color, roughness: 0.38, metalness: 0.55, flatShading: false,
  });
  matCache.set(k, m); return m;
}
function glassMat() {
  const k = 'sedanGlass';
  if (matCache.has(k)) return matCache.get(k);
  const m = new THREE.MeshStandardMaterial({
    color: 0x9fc8dd, roughness: 0.12, metalness: 0.1,
    transparent: true, opacity: 0.62, flatShading: false,
  });
  matCache.set(k, m); return m;
}
function darkGlassMat() {
  const k = 'sedanDarkGlass';
  if (matCache.has(k)) return matCache.get(k);
  const m = new THREE.MeshStandardMaterial({
    color: 0x2a3a44, roughness: 0.2, metalness: 0.2,
    transparent: true, opacity: 0.85,
  });
  matCache.set(k, m); return m;
}
function chromeMat() {
  if (matCache.has('chrome')) return matCache.get('chrome');
  const m = new THREE.MeshStandardMaterial({ color: 0xd7dde3, roughness: 0.25, metalness: 0.9 });
  matCache.set('chrome', m); return m;
}
function tireMat() {
  if (matCache.has('tire')) return matCache.get('tire');
  const m = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.92, metalness: 0 });
  matCache.set('tire', m); return m;
}
function blackMat() {
  if (matCache.has('sblack')) return matCache.get('sblack');
  const m = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.9 });
  matCache.set('sblack', m); return m;
}

/* ---------- ล้อ ---------- */
function makeWheel() {
  const g = new THREE.Group();
  const R = SEDAN_DIM.wheelR, W = SEDAN_DIM.wheelW;
  const tire = M(new THREE.CylinderGeometry(R, R, W, 20), tireMat(), 0, 0, 0);
  tire.rotation.x = Math.PI / 2; g.add(tire);
  // แก้มยางด้านนอก 2 ฝั่งให้ดูมีมิติ
  const rim = M(new THREE.CylinderGeometry(0.212, 0.212, W + 0.002, 12), std(0x9aa2ad), 0, 0, 0);
  rim.rotation.x = Math.PI / 2; g.add(rim);
  const hubM = chromeMat();
  const hub = M(new THREE.CylinderGeometry(0.06, 0.06, W + 0.02, 8), hubM, 0, 0, 0);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  // ก้านแม็ก 5 ก้าน (ทำทั้ง 2 ฝั่ง)
  for (const zoff of [W / 2 + 0.001, -W / 2 - 0.001]) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const sp = M(BOX(0.055, 0.17, 0.012), std(0x6b7280), Math.cos(a) * 0.12, Math.sin(a) * 0.12, zoff);
      sp.rotation.z = a + Math.PI / 2; g.add(sp);
    }
    const lip = M(new THREE.TorusGeometry(0.205, 0.012, 6, 20), hubM, 0, 0, zoff);
    g.add(lip);
  }
  // จานเบรก + คาลิปเปอร์ (เห็นลอดก้าน)
  const disc = M(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 12), std(0x62666d), 0, 0, 0);
  disc.rotation.x = Math.PI / 2; disc.castShadow = false; g.add(disc);
  g.userData.spin = [tire, rim, hub];
  return g;
}

/* ---------- ตัวถังล่าง: side-profile extrude + เว้าซุ้มล้อ ---------- */
function lowerBodyMesh(paint) {
  const fx = SEDAN_DIM.frontAxleX, rx = SEDAN_DIM.rearAxleX;
  const s = new THREE.Shape();
  // เริ่มกันชนหน้าล่าง -> ขึ้นหน้า -> ยาวไปท้าย -> ลงหลัง -> กลับมาหน้าพร้อมเว้าซุ้มล้อ
  s.moveTo(2.3325, 0.14);
  s.lineTo(2.3325, 0.52);
  s.quadraticCurveTo(2.33, 0.62, 2.20, 0.68);   // จมูกหน้า
  s.lineTo(1.95, 0.78);                          // ขอบฝากระโปรงหน้า
  s.lineTo(0.78, 0.96);                          // ฝากระโปรงหลัง / cowl
  s.lineTo(0.20, 1.02);                          // โคนกระจก (เผื่อ glass ทับ)
  s.lineTo(-0.90, 1.02);                         // แนว beltline ไปท้าย
  s.lineTo(-1.78, 0.95);                         // ฝาท้าย
  s.quadraticCurveTo(-2.30, 0.92, -2.50, 0.82);  // สันท้าย
  s.lineTo(-2.5475, 0.80);
  s.lineTo(-2.5475, 0.16);                       // กันชนหลังลงล่าง
  s.lineTo(-1.02, 0.14);
  // เว้าซุ้มล้อหลัง r=0.40
  s.lineTo(rx + 0.40, 0.14);
  s.lineTo(rx + 0.40, 0.30);
  s.absarc(rx, 0.33, 0.40, 0, Math.PI, false);
  s.lineTo(rx - 0.40, 0.14);
  s.lineTo(fx - 0.40, 0.14);
  // เว้าซุ้มล้อหน้า (PI -> 0 ผ่านด้านบน ต้อง clockwise=true)
  s.lineTo(fx - 0.40, 0.14);
  s.lineTo(fx - 0.40, 0.30);
  s.absarc(fx, 0.33, 0.40, Math.PI, 0, true);
  s.lineTo(fx + 0.40, 0.14);
  s.lineTo(2.3325, 0.14);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 1.66, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, steps: 1,
  });
  geo.translate(0, 0, -0.83);
  const mesh = new THREE.Mesh(geo, paint);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function greenhouseMesh() {
  // กระจกรวม: บังลมหน้า + ข้าง + หลัง เป็นก้อนเดียว (เสาจะทับอีกที)
  const s = new THREE.Shape();
  s.moveTo(0.78, 0.96);
  s.quadraticCurveTo(0.45, 1.22, 0.15, 1.40);   // กระจกหน้า
  s.lineTo(-0.90, 1.40);                          // หลังคากระจก / ขอบ
  s.quadraticCurveTo(-1.35, 1.22, -1.75, 0.95);  // กระจกหลัง
  s.lineTo(-1.70, 0.92);
  s.lineTo(0.70, 0.92);
  s.lineTo(0.78, 0.96);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 1.44, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1, steps: 1,
  });
  geo.translate(0, 0, -0.72);
  const mesh = new THREE.Mesh(geo, glassMat());
  mesh.castShadow = false; mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = M(BOX(w, h, d), mat, x, y, z);
  m.rotation.set(rx, ry, rz); return m;
}

/* ---------- รถเต็มคัน ---------- */
function buildSedan(opts = {}) {
  const color = opts.color ?? 0x2e6f9e;
  const paint = carPaint(color);
  const g = new THREE.Group();
  const parts = []; // สำหรับ exploded view {o, base, dir}
  const reg = (o, dx = 0, dy = 0, dz = 0) => { parts.push({ o, base: o.position.clone(), dir: new THREE.Vector3(dx, dy, dz) }); g.add(o); return o; };

  /* ตัวถัง */
  const bodyG = new THREE.Group();
  bodyG.add(lowerBodyMesh(paint));
  // กันชนหน้า/หลัง + สเกิร์ต (ชิ้นแยกเผื่อระเบิดดู)
  const bumperM = paint;
  const bf = box(0.28, 0.34, 1.78, bumperM, 2.28, 0.33, 0); bodyG.add(bf);
  const bb = box(0.24, 0.42, 1.80, bumperM, -2.50, 0.38, 0); bodyG.add(bb);
  const skirtL = box(2.0, 0.10, 0.06, blackMat(), -0.05, 0.16, 0.88); bodyG.add(skirtL);
  const skirtR = box(2.0, 0.10, 0.06, blackMat(), -0.05, 0.16, -0.88); bodyG.add(skirtR);
  // ซุ้มล้อ inner ดำ 4 ข้าง
  for (const [wx, wz] of [[SEDAN_DIM.frontAxleX, 0.795], [SEDAN_DIM.frontAxleX, -0.795], [SEDAN_DIM.rearAxleX, 0.795], [SEDAN_DIM.rearAxleX, -0.795]]) {
    const well = M(new THREE.CylinderGeometry(0.395, 0.395, 0.20, 14), blackMat(), wx, SEDAN_DIM.wheelR, wz * 0.92);
    well.rotation.x = Math.PI / 2; well.castShadow = false; bodyG.add(well);
  }
  // ร่องประตู (เส้นดำบาง) + มือจับ
  const gapM = blackMat();
  for (const z of [0.895, -0.895]) {
    for (const gx of [0.62, -0.48, -1.38]) bodyG.add(box(0.018, 0.56, 0.006, gapM, gx, 0.62, z));
    bodyG.add(box(1.98, 0.016, 0.006, gapM, -0.38, 0.345, z)); // เส้นล่างประตู
    bodyG.add(box(0.16, 0.03, 0.02, chromeMat(), -0.30, 0.82, z * 1.005)); // มือจับหน้า
    bodyG.add(box(0.16, 0.03, 0.02, chromeMat(), -1.20, 0.82, z * 1.005)); // มือจับหลัง
  }
  // ฝาถังน้ำมันวงกลม
  const flap = M(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), paint, -1.75, 0.78, 0.90);
  flap.rotation.x = Math.PI / 2; bodyG.add(flap);
  reg(bodyG, 0, 0.15, 0);

  /* ห้องกระจก + เสา + หลังคา */
  const cabG = new THREE.Group();
  cabG.add(greenhouseMesh());
  // หลังคาเหล็ก
  const roof = box(1.12, 0.05, 1.50, paint, -0.375, 1.425, 0); cabG.add(roof);
  // เสา A/B/C 2 ฝั่ง (สัดส่วนจริง: A เอียง ~30°, B ตั้ง, C เอียง ~45°)
  for (const z of [0.74, -0.74]) {
    const a = box(0.09, 0.62, 0.07, paint, 0.42, 1.18, z, 0, 0, -0.55); cabG.add(a); // A
    const b = box(0.10, 0.50, 0.08, paint, -0.48, 1.16, z); cabG.add(b);              // B
    const c = box(0.20, 0.55, 0.09, paint, -1.22, 1.16, z, 0, 0, 0.72); cabG.add(c);  // C กว้าง
    cabG.add(box(1.55, 0.06, 0.07, paint, -0.40, 1.40, z)); // รางหลังคาข้าง
  }
  // ซันรูฟกระจก + เสาอากาศครีบฉลาม
  cabG.add(box(0.55, 0.015, 0.65, darkGlassMat(), -0.30, 1.455, 0));
  const fin = box(0.18, 0.07, 0.06, paint, -0.85, 1.48, 0, 0, 0, -0.15); cabG.add(fin);
  // ที่ปัดน้ำฝน 2 ก้านบน cowl
  for (const z of [0.25, -0.25]) {
    const w = box(0.42, 0.012, 0.025, blackMat(), 0.62, 0.975, z, 0, 0.35 * (z > 0 ? 1 : -1), 0);
    cabG.add(w);
  }
  reg(cabG, 0, 0.55, 0);

  /* หน้า: กระจัง + ไฟ */
  const faceG = new THREE.Group();
  faceG.add(box(0.06, 0.16, 0.95, blackMat(), 2.335, 0.44, 0)); // กระจังบน
  for (let i = 0; i < 3; i++) faceG.add(box(0.02, 0.015, 0.9, chromeMat(), 2.365, 0.40 + i * 0.045, 0));
  faceG.add(box(0.06, 0.10, 1.20, blackMat(), 2.32, 0.22, 0));   // ช่องลมล่าง
  faceG.add(box(0.04, 0.03, 0.30, chromeMat(), 2.34, 0.22, 0.45));
  faceG.add(box(0.04, 0.03, 0.30, chromeMat(), 2.34, 0.22, -0.45));
  for (const z of [0.58, -0.58]) {
    const hous = box(0.16, 0.15, 0.52, std(0x2b2f36), 2.24, 0.665, z, 0, z > 0 ? -0.25 : 0.25, 0);
    faceG.add(hous);
    const lens = box(0.04, 0.11, 0.44, glow(0xd8ecff), 2.30, 0.665, z, 0, z > 0 ? -0.25 : 0.25, 0);
    lens.castShadow = false; faceG.add(lens);
    const drl = box(0.02, 0.025, 0.40, glow(0xffffff), 2.325, 0.615, z, 0, z > 0 ? -0.25 : 0.25, 0);
    drl.castShadow = false; faceG.add(drl);
    faceG.add(box(0.03, 0.06, 0.18, glow(0xffc46a), 2.33, 0.50, z * 1.02)); // ไฟเลี้ยว
  }
  // โลโก้กลาง + ป้ายหน้า
  faceG.add(box(0.02, 0.07, 0.12, chromeMat(), 2.37, 0.55, 0));
  faceG.add(box(0.015, 0.11, 0.52, std(0xeef2f5), 2.345, 0.30, 0));
  reg(faceG, 0.55, 0, 0);

  /* ท้าย: ไฟพาดยาว + ท่อ */
  const tailG = new THREE.Group();
  tailG.add(box(0.06, 0.12, 1.44, glow(0xc22a2a), -2.56, 0.80, 0)); // light bar แดง
  const revL = box(0.02, 0.05, 0.30, glow(0xffffff), -2.595, 0.80, 0.40); tailG.add(revL);
  const revR = box(0.02, 0.05, 0.30, glow(0xffffff), -2.595, 0.80, -0.40); tailG.add(revR);
  tailG.add(box(0.02, 0.05, 1.0, chromeMat(), -2.585, 0.72, 0)); // คิ้วโครเมียม
  tailG.add(box(0.015, 0.11, 0.52, std(0xeef2f5), -2.585, 0.58, 0)); // ป้ายหลัง
  tailG.add(box(0.10, 0.10, 1.30, blackMat(), -2.52, 0.22, 0)); // diffuser
  for (const z of [0.45, -0.45]) {
    const tip = M(new THREE.CylinderGeometry(0.038, 0.042, 0.12, 10), chromeMat(), -2.55, 0.20, z);
    tip.rotation.z = Math.PI / 2; tailG.add(tip);
    tailG.add(box(0.04, 0.04, 0.16, glow(0xff5a3c), -2.545, 0.68, z * 1.55)); // reflectors
  }
  reg(tailG, -0.55, 0, 0);

  /* กระจกข้าง */
  const mirG = new THREE.Group();
  for (const z of [1, -1]) {
    mirG.add(box(0.08, 0.03, 0.12, paint, 0.62, 1.00, z * 0.92));
    mirG.add(box(0.14, 0.10, 0.10, paint, 0.62, 1.05, z * 1.00));
    const mg = box(0.02, 0.08, 0.08, chromeMat(), 0.545, 1.05, z * 1.00);
    mg.castShadow = false; mirG.add(mg);
    mirG.add(box(0.02, 0.02, 0.06, glow(0xffc46a), 0.62, 1.02, z * 1.055)); // ไฟเลี้ยวกระจก
  }
  reg(mirG, 0, 0.25, 0);

  /* ล้อ 4 วง */
  const wheels = [];
  // แยกซ้าย/ขวาเพื่อระเบิด
  const wl = new THREE.Group(), wr = new THREE.Group();
  for (const [wx, wz] of [[SEDAN_DIM.frontAxleX, 0.80], [SEDAN_DIM.frontAxleX, -0.80], [SEDAN_DIM.rearAxleX, 0.80], [SEDAN_DIM.rearAxleX, -0.80]]) {
    const w = makeWheel();
    w.position.set(wx, SEDAN_DIM.wheelR, wz);
    wheels.push(w);
    (wz > 0 ? wl : wr).add(w);
  }
  reg(wl, 0, 0, 0.55); reg(wr, 0, 0, -0.55);

  /* ภายใน (เห็นผ่านกระจก + ตอนระเบิด) */
  const inG = new THREE.Group();
  const dashM = std(0x2b2f36), seatM = std(0x3a3f45), seatM2 = std(0x4a4642);
  inG.add(box(2.1, 0.06, 1.55, std(0x1d1f24), -0.35, 0.28, 0)); // พื้นใน
  inG.add(box(0.55, 0.28, 1.55, dashM, 0.62, 0.72, 0));          // แดชบอร์ดล่าง
  inG.add(box(0.45, 0.12, 1.55, dashM, 0.58, 0.90, 0));          // แดชบน
  inG.add(box(0.04, 0.14, 0.32, glow(0x7fd4ff), 0.42, 0.90, 0));  // จอกลางเรืองแสง
  inG.add(box(0.04, 0.08, 0.45, darkGlassMat(), 0.42, 0.88, 0)); // มาตรวัด
  // พวงมาลัยซ้าย (torus + ก้าน + คอ)
  const sw = M(new THREE.TorusGeometry(0.185, 0.022, 6, 18), dashM, 0.35, 0.85, 0.38);
  sw.rotation.y = Math.PI / 2 - 0.4; inG.add(sw);
  inG.add(box(0.22, 0.04, 0.04, dashM, 0.45, 0.78, 0.38, 0, 0, 0.4));
  // คอนโซลกลาง + เกียร์ + เบรกมือ
  inG.add(box(0.85, 0.18, 0.28, dashM, -0.05, 0.50, 0));
  inG.add(box(0.08, 0.12, 0.06, chromeMat(), 0.05, 0.62, 0));
  // เบาะ 5 ที่นั่ง: ฐาน + พนัก + หมอน
  const seats = [[0.05, 0.42], [0.05, -0.42], [-0.95, 0.42], [-0.95, -0.42], [-0.95, 0]];
  seats.forEach(([sx, sz], idx) => {
    const isF = idx < 2;
    inG.add(box(0.52, 0.14, 0.52, idx === 4 ? seatM2 : seatM, sx, 0.45, sz));
    const back = box(0.14, 0.55, 0.52, idx === 4 ? seatM2 : seatM, sx - (isF ? 0.28 : 0.30), 0.75, sz, 0, 0, isF ? 0.12 : 0.18);
    inG.add(back);
    inG.add(box(0.12, 0.12, 0.22, seatM2, sx - (isF ? 0.33 : 0.37), 1.08, sz));
  });
  inG.add(box(0.30, 0.06, 1.45, std(0x2b2f36), -1.55, 0.86, 0)); // parcel shelf หลัง
  reg(inG, 0, 0.28, 0);

  /* ไฟหน้า spot (เปิด/ปิดได้) */
  const beams = [];
  for (const z of [0.58, -0.58]) {
    const sp = new THREE.SpotLight(0xd8ecff, 0, 12, 0.5, 0.5, 1.2);
    sp.position.set(2.3, 0.66, z);
    sp.target.position.set(7, 0, z * 1.2);
    g.add(sp, sp.target); beams.push(sp);
  }

  // เก็บชิ้นสีตัวถังทั้งหมดไว้เปลี่ยนสีรอบหลังๆ ได้
  const paintMeshes = [];
  [bodyG, cabG, mirG].forEach(grp => grp.traverse(o => {
    if (o.isMesh && o.material === paint) { o.userData.isPaint = true; paintMeshes.push(o); }
  }));

  g.userData = {
    ...g.userData, assetId: 'sedan', parts, wheels, beams,
    dimensions: SEDAN_DIM,
    headlights: false,
    moving: false,
    explode: 0,
    setColor(c) {
      const p = carPaint(c);
      paintMeshes.forEach(m => { m.material = p; });
    },
    setExplode(v) {
      g.userData.explode = v;
      parts.forEach(p => p.o.position.copy(p.base).addScaledVector(p.dir, v));
    },
    setHeadlights(on) {
      g.userData.headlights = on;
      beams.forEach(b => (b.intensity = on ? 60 : 0));
    },
    update(t, dt) {
      if (g.userData.moving) wheels.forEach(w => w.rotation.z -= dt * 6);
      // ไฟเลี้ยวกะพริบเบาๆ ตอนเปิดไฟหน้า (demo)
      const blink = g.userData.headlights ? (Math.sin(t * 6) > 0 ? 1 : 0.25) : 1;
      void blink;
    },
  };
  return g;
}

/* ---------- โครงสร้าง Unibody แบบเปลือย ---------- */
function buildChassis() {
  const g = new THREE.Group();
  const frameM = std(0x8a8f96, [0x62666d]);
  const hssM = std(0xc44536, [0x8a2f26]);   // เหล็ก HSLA แดง
  const boronM = std(0xf2c14e, [0xb08a2e]); // โบรอนเสา B เหลือง
  const darkM = std(0x2b2f36);

  // พื้น + อุโมงค์กลาง + firewall
  g.add(box(3.9, 0.06, 1.62, frameM, -0.1, 0.28, 0));
  g.add(box(2.6, 0.16, 0.28, frameM, -0.2, 0.36, 0)); // tunnel
  g.add(box(0.06, 0.62, 1.62, frameM, 0.72, 0.60, 0)); // firewall
  g.add(box(0.08, 0.08, 1.50, darkM, 0.68, 0.88, 0));  // dash cross beam

  // คานหน้าคู่ + crush box + subframe หน้า H
  for (const z of [0.42, -0.42]) {
    g.add(box(1.05, 0.12, 0.12, hssM, 1.55, 0.42, z));
    g.add(box(0.22, 0.10, 0.14, std(0xf2a65a), 2.18, 0.42, z)); // crush can
    g.add(box(1.30, 0.12, 0.12, hssM, -1.75, 0.42, z)); // คานหลัง
  }
  g.add(box(0.70, 0.10, 1.00, darkM, 1.35, 0.30, 0)); // subframe หน้า
  g.add(box(0.70, 0.10, 1.00, darkM, -1.45, 0.30, 0)); // subframe หลัง
  // rocker 2 ฝั่ง (แข็งสุด)
  for (const z of [0.81, -0.81]) g.add(box(2.05, 0.15, 0.12, hssM, -0.35, 0.32, z));

  // เสา A/B/C + รางหลังคา + คานหลังคา 3 เส้น (โครงกรงนิรภัย)
  for (const z of [0.74, -0.74]) {
    g.add(box(0.09, 0.62, 0.07, frameM, 0.42, 1.18, z, 0, 0, -0.55));
    g.add(box(0.10, 0.62, 0.08, boronM, -0.48, 1.16, z)); // B โบรอน
    g.add(box(0.20, 0.60, 0.09, frameM, -1.22, 1.16, z, 0, 0, 0.72));
    g.add(box(1.65, 0.07, 0.07, frameM, -0.40, 1.42, z)); // roof rail
  }
  for (const x of [0.10, -0.40, -0.88]) g.add(box(0.07, 0.05, 1.50, frameM, x, 1.43, 0));
  // หลุมยางอะไหล่ + ถังน้ำมัน + ท่อไอเสีย
  const spare = M(new THREE.CylinderGeometry(0.31, 0.31, 0.16, 14), darkM, -1.95, 0.40, 0);
  g.add(spare);
  g.add(box(0.65, 0.22, 0.55, std(0x2e6f73), -0.90, 0.24, 0)); // ถังน้ำมัน
  const exh = M(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 8), std(0x9aa2ad), -0.9, 0.18, 0.25);
  exh.rotation.z = Math.PI / 2; g.add(exh);

  // เครื่องวางขวาง + เกียร์ (FF)
  g.add(box(0.62, 0.55, 0.60, std(0x4a4642), 1.45, 0.62, 0));
  for (let i = 0; i < 4; i++) g.add(box(0.12, 0.10, 0.12, darkM, 1.30 + i * 0.11, 0.94, 0));
  g.add(box(0.35, 0.35, 0.40, darkM, 1.42, 0.55, -0.55)); // เกียร์ข้างเครื่อง

  // ช่วงล่าง: สตรัทหน้า 2 + ปีกนก, มัลติลิงก์หลัง
  for (const [sx, sz] of [[1.4125, 0.65], [1.4125, -0.65]]) {
    const strut = M(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), chromeMat(), sx, 0.55, sz);
    strut.rotation.z = -0.12; g.add(strut);
    g.add(box(0.45, 0.05, 0.08, darkM, sx - 0.1, 0.32, sz));
    g.add(M(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 10), darkM, sx, 0.33, sz));
  }
  for (const [sx, sz] of [[-1.4125, 0.65], [-1.4125, -0.65]]) {
    for (let i = 0; i < 3; i++) g.add(box(0.06, 0.04, 0.45, darkM, sx - 0.15 + i * 0.15, 0.35 + i * 0.03, sz));
    g.add(M(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), darkM, sx, 0.33, sz));
  }
  g.userData.assetId = 'sedan_chassis';
  return g;
}

export const sedanBuilders = {
  sedan: (opts) => buildSedan(opts),
  sedan_chassis: () => buildChassis(),
  sedan_frame: () => buildChassis(),
};
