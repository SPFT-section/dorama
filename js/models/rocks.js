/* rocks & forest floor — อิงโครงสร้างจริง:
 * rock: หินผุมีมอส + ฐานแบน
 * ore: หินแม่ + สายแร่/ผลึกฝัง (copper=ก้อนโลหะ, iron=เงิน, crystal=แท่งหกเหลี่ยมยาว)
 * stump: ตอตัดมีวงปี + รากแผ่ + รอยบาก
 * log_pile: เรียงพีระมิด 3-2-1 + วงปีหัวไม้
 * mushroom (fly agaric): ก้าน + หมวก + ครีบ + วงแหวน + ถ้วยโคน + จุดขาว
 */
import * as THREE from 'three';
import { M, BOX, CYL, ICO, OCT, std, glow, palette, ringsMat } from './core.js';

function rockReal() {
  const g = new THREE.Group();
  const main = M(ICO(0.4), std(palette.stone, [palette.stoneDark]), 0, 0.28, 0);
  main.scale.y = 0.82; // ฐานแบนติดดิน
  g.add(main);
  const s2 = M(ICO(0.24), std(palette.stoneDark, [palette.stone]), 0.32, 0.16, 0.12);
  s2.scale.y = 0.8; g.add(s2);
  g.add(M(ICO(0.16), std(palette.stone, [0xffffff]), -0.28, 0.12, -0.1));
  // มอสเกาะด้านชื้น
  const moss = M(BOX(0.25, 0.04, 0.2), std(palette.moss, [palette.leaf]), -0.05, 0.58, 0.05);
  moss.rotation.y = 0.4; moss.castShadow = false; g.add(moss);
  return g;
}

function oreReal(kind) {
  const g = rockReal();
  if (kind === 'copper') {
    const c = glow(palette.copper);
    [[0.15, 0.45, 0.15], [-0.1, 0.5, -0.05], [0.3, 0.25, 0.1]].forEach(([x, y, z]) => {
      const s = M(OCT(0.09), c, x, y, z); s.castShadow = false; g.add(s);
    });
    // สายแร่ (vein)
    const vein = M(BOX(0.3, 0.03, 0.05), c, 0, 0.35, 0.28); vein.rotation.y = 0.5; vein.castShadow = false; g.add(vein);
  } else if (kind === 'iron') {
    const c = glow(0xd8dee6);
    [[0.12, 0.48, 0.12], [-0.14, 0.42, 0], [0.28, 0.28, -0.05]].forEach(([x, y, z]) => {
      const s = M(OCT(0.09), c, x, y, z); s.castShadow = false; g.add(s);
    });
  } else {
    // crystal: แท่งควอตซ์หกเหลี่ยมยาวแทงออกจากหิน (hexagonal prism)
    const c1 = glow(0x4c9aff), c2 = glow(0x9fd4ff);
    const spots = [[0.15, 0.55, 0.1, c1, 0.3], [-0.12, 0.5, -0.08, c2, -0.25], [0.28, 0.35, 0, c1, 0.5]];
    spots.forEach(([x, y, z, m, tilt]) => {
      const s = M(CYL(0.05, 0.07, 0.28, 6), m, x, y, z);
      s.rotation.z = tilt; s.rotation.x = tilt * 0.5; s.castShadow = false; g.add(s);
      const tip = M(CYL(0, 0.05, 0.09, 6), m, x + tilt * 0.12, y + 0.17, z);
      tip.castShadow = false; g.add(tip);
    });
    const l = new THREE.PointLight(0x4c9aff, 0.8, 3.5, 2); l.position.set(0, 0.8, 0); g.add(l);
  }
  return g;
}

function stumpReal() {
  const g = new THREE.Group();
  const trunkSide = std(palette.trunk), top = ringsMat(0xc9a06a, palette.wood);
  const body = M(CYL(0.28, 0.34, 0.34, 9), [trunkSide, top, trunkSide], 0, 0.17, 0);
  g.add(body);
  // รากแผ่ 4 แฉก
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const r = M(BOX(0.24, 0.1, 0.12), std(palette.trunk), Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3, -a);
    g.add(r);
  }
  // รอยบากขวาน + เศษขี้เลื่อย
  g.add(M(BOX(0.1, 0.06, 0.02), std(palette.woodLight), 0.2, 0.22, 0.18));
  g.add(M(BOX(0.12, 0.02, 0.12), std(0xc9a06a), 0.35, 0.01, -0.2));
  return g;
}

function logPileReal() {
  const g = new THREE.Group();
  const side = std(0xc9a06a, [palette.wood]), bark = std(palette.trunk);
  const endM = ringsMat(0xc9a06a, palette.wood);
  // พีระมิด 3-2-1 (real stacking)
  const rows = [
    { y: 0.1, xs: [-0.22, 0, 0.22] },
    { y: 0.28, xs: [-0.11, 0.11] },
    { y: 0.45, xs: [0] },
  ];
  rows.forEach(row => {
    row.xs.forEach(x => {
      const l = M(CYL(0.1, 0.1, 0.9, 8), [endM, bark, bark], x, row.y, 0);
      l.rotation.z = Math.PI / 2; g.add(l);
    });
  });
  return g;
}

function mushroomReal() {
  const g = new THREE.Group();
  const mk = (x, big) => {
    const s = big ? 1 : 0.65;
    // ก้าน + วงแหวน + ถ้วยโคน
    g.add(M(CYL(0.05 * s, 0.065 * s, 0.2 * s, 7), std(palette.bone), x, 0.1 * s, 0));
    g.add(M(CYL(0.07 * s, 0.07 * s, 0.02 * s, 7), std(0xd8cba8), x, 0.14 * s, 0));
    g.add(M(CYL(0.07 * s, 0.05 * s, 0.05 * s, 7), std(palette.bone), x, 0.025 * s, 0));
    // หมวก + ครีบใต้หมวก
    g.add(M(CYL(0, 0.2 * s, 0.16 * s, 8), glow(palette.berry), x, 0.24 * s, 0));
    const gills = M(CYL(0.16 * s, 0.16 * s, 0.015 * s, 8), std(0xe8d8b0), x, 0.165 * s, 0);
    gills.castShadow = false; g.add(gills);
    if (big) {
      const d = glow(0xffffff);
      [[0.06, 0.29, 0.05], [-0.05, 0.28, -0.04], [0, 0.31, -0.08]].forEach(([dx, y, dz]) => {
        const q = M(BOX(0.045, 0.035, 0.045), d, x + dx, y * s, dz); q.castShadow = false; g.add(q);
      });
    }
  };
  mk(-0.15, true); mk(0.16, false);
  // เส้นใยไมซีเลียม
  g.add(M(BOX(0.4, 0.015, 0.2), std(0xd8cba8), 0, 0.008, 0.05));
  return g;
}

export const rockBuilders = {
  rock: () => rockReal(),
  ore_copper: () => oreReal('copper'),
  ore_iron: () => oreReal('iron'),
  ore_crystal: () => oreReal('crystal'),
  stump: () => stumpReal(),
  log_pile: () => logPileReal(),
  mushroom: () => mushroomReal(),
};
