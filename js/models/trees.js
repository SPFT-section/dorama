/* trees & shrubs — อิงโครงสร้างจริง (ค้นเพิ่ม):
 * pine (Pinus): ลำต้นตรงเปลือกแตก, กิ่งเป็นวงรอบ whorls ทีละชั้น,
 *   ใบเข็มเป็นกระจุก fascicle 2-5, โคน seed cone 4-8"
 * oak (Quercus robur): ลำต้นอ้วนเปลือกหนาแตก, กิ่งแผ่กว้าง,
 *   ใบlobed, ผล acorn เป็นกระจุก 2-3 มีถ้วย cup
 * bush: ลำต้นแตกหลายลำจากโคน + พุ่มใบ / berry: ผลติดผิวนอก
 */
import * as THREE from 'three';
import { M, BOX, CYL, ICO, std, glow, palette, ringsMat } from './core.js';

/* สน — วงรอบกิ่ง + ลำต้น + โคน */
function pineReal(snow = false) {
  const g = new THREE.Group();
  // รากโคน + ลำต้นตรง (taper) เปลือกแตก
  g.add(M(CYL(0.13, 0.16, 0.18, 7), std(palette.barkDark || palette.trunk), 0, 0.09, 0));
  g.add(M(CYL(0.09, 0.13, 0.55, 7), std(palette.trunk), 0, 0.4, 0));
  // ปมกิ่ง (branch collar) + กิ่ง whorl 4 ชั้น ตามอายุ (young conic → old rounded)
  const layers = [
    { r: 0.52, h: 0.55, y: 0.78 },
    { r: 0.42, h: 0.5, y: 1.14 },
    { r: 0.3, h: 0.45, y: 1.47 },
    { r: 0.15, h: 0.32, y: 1.73 },
  ];
  layers.forEach((L, i) => {
    const leafM = std(i % 2 ? palette.leafLight : palette.leaf, i % 2 ? [palette.leaf] : [palette.mossDark]);
    const cone = M(CYL(0, L.r, L.h, 6), leafM, 0, L.y, 0);
    cone.rotation.y = (i * Math.PI) / 6; // สลับมุมตาม Fibonacci
    g.add(cone);
    // กิ่งโผล่รอบลำต้น (whorl) — แท่งสั้น 5 กิ่งต่อชั้น
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + i * 0.5;
      const br = M(CYL(0.02, 0.03, 0.3, 5), std(palette.trunk), Math.cos(a) * 0.2, L.y - 0.18, Math.sin(a) * 0.2);
      br.rotation.z = Math.PI / 2.4; br.rotation.y = -a;
      g.add(br);
    }
    if (snow) {
      const cap = M(CYL(0, L.r * 0.55, 0.09, 6), std(palette.snow, [palette.snowDark]), 0, L.y + 0.2, 0);
      cap.castShadow = false; g.add(cap);
    }
  });
  // ยอด leader + เข็มอ่อน
  g.add(M(CYL(0.015, 0.03, 0.22, 5), std(palette.leafLight), 0, 1.95, 0));
  // โคนสน 2 ลูกห้อยใต้กิ่ง (seed cones 4-8")
  const coneM = std(0x6b4a2e, [0x4a3220]);
  g.add(M(CYL(0.05, 0.07, 0.14, 6), coneM, 0.18, 0.95, 0.1));
  g.add(M(CYL(0.04, 0.06, 0.11, 6), coneM, -0.15, 1.2, -0.08));
  return g;
}

/* โอ๊ค — ลำต้นอ้วน + กิ่งหลักแผ่ + เรือนยอด + acorn */
function oakReal() {
  const g = new THREE.Group();
  // ลำต้นอ้วนเปลือกหนาแตก (buttress)
  g.add(M(BOX(0.3, 0.2, 0.3), std(palette.trunk), 0, 0.1, 0));
  g.add(M(BOX(0.22, 0.65, 0.22), std(palette.trunk, [0x3a2a18]), 0, 0.42, 0));
  // กิ่งหลัก 3 กิ่งแผ่ออก (primary limbs)
  const limbM = std(palette.trunk);
  const limbs = [
    { x: 0.3, y: 0.85, z: 0.1, rz: -0.7 },
    { x: -0.28, y: 0.88, z: -0.05, rz: 0.7 },
    { x: 0.05, y: 0.9, z: -0.3, rx: 0.7 },
  ];
  limbs.forEach(L => {
    const b = M(BOX(0.1, 0.5, 0.1), limbM, L.x, L.y, L.z || 0);
    if (L.rz) b.rotation.z = L.rz;
    if (L.rx) b.rotation.x = L.rx;
    g.add(b);
  });
  // เรือนยอดกว้าง 3 ชั้นใบ lobed (ใช้กล่องซ้อนมีช่องว่างให้ลมผ่าน)
  g.add(M(BOX(1.05, 0.42, 1.0), std(palette.leaf, [palette.leafLight, palette.mossDark]), 0, 1.08, 0));
  g.add(M(BOX(0.82, 0.42, 0.8), std(palette.leafLight, [palette.leaf]), 0.1, 1.36, -0.06));
  g.add(M(BOX(0.52, 0.3, 0.52), std(palette.moss, [palette.leaf]), -0.14, 1.58, 0.1));
  // acorn กระจุก 2-3 ลูก: nut + cup
  const nutM = std(0x8a6238, [0x5a3d24]);
  const cupM = std(0x5a6b35, [0x42572f]);
  [[0.35, 0.9, 0.3], [0.42, 0.86, 0.22], [-0.3, 0.92, 0.25]].forEach(([x, y, z]) => {
    g.add(M(BOX(0.06, 0.07, 0.06), nutM, x, y, z));
    g.add(M(BOX(0.08, 0.03, 0.08), cupM, x, y + 0.05, z));
  });
  return g;
}

function bushReal() {
  const g = new THREE.Group();
  // ลำต้นแตกหลายลำจากโคน (multi-stem)
  const stemM = std(palette.trunk);
  [[0.08, 0.05], [-0.09, 0.02], [0, -0.09]].forEach(([x, z]) => {
    const s = M(CYL(0.03, 0.045, 0.4, 5), stemM, x, 0.2, z);
    s.rotation.z = x * 1.2; s.rotation.x = -z * 1.2;
    g.add(s);
  });
  g.add(M(ICO(0.32), std(palette.leaf, [palette.leafLight]), 0, 0.42, 0));
  g.add(M(ICO(0.22), std(palette.leafLight, [palette.leaf]), 0.22, 0.52, 0.1));
  g.add(M(ICO(0.2), std(palette.moss, [palette.leaf]), -0.2, 0.48, -0.08));
  return g;
}

function bushBerryReal() {
  const g = bushReal();
  const b = glow(palette.berry);
  const hl = glow(0xffffff);
  // ผลติดผิวนอก + ใบรอง — 6 ลูก
  [[0.18, 0.5, 0.22], [-0.14, 0.48, 0.24], [0.02, 0.62, -0.16], [-0.22, 0.36, -0.12], [0.26, 0.4, -0.05], [0, 0.42, 0.3]].forEach(([x, y, z]) => {
    const s = M(BOX(0.08, 0.08, 0.08), b, x, y, z); s.castShadow = false; g.add(s);
    const h = M(BOX(0.025, 0.025, 0.01), hl, x, y + 0.02, z + 0.045); h.castShadow = false; g.add(h);
  });
  return g;
}

export const treeBuilders = {
  pine: () => pineReal(false),
  pine_snow: () => pineReal(true),
  oak: () => oakReal(),
  bush: () => bushReal(),
  bush_berry: () => bushBerryReal(),
};
