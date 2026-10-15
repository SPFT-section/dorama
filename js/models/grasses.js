/* grasses — อิงสัณฐานวิทยาจริงของหญ้าแต่ละชนิด
 * โครง: เหง้า/กอ + ใบแคบยาว + ช่อดอก/รวง ตามชนิด
 * ใช้ BOX/Plane บาง + CYL ก้าน, เก็บ draw call ต่ำ (5-12 ชิ้น/กอ)
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow, palette } from './core.js';

function blade(x, z, h, lean = 0, mat) {
  const b = M(BOX(0.05, h, 0.015), mat || std(palette.grass, [palette.grassDark]), x, h / 2, z);
  b.rotation.z = lean; b.rotation.y = Math.random() * 0.6;
  return b;
}
function clump(n, h, mat, spread = 0.16) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const r = Math.random() * spread;
    g.add(blade(Math.cos(a) * r, Math.sin(a) * r, h * (0.7 + Math.random() * 0.6), (Math.random() - 0.5) * 0.5, mat));
  }
  // เหง้า/โคนกอ
  g.add(M(BOX(0.14, 0.06, 0.14), std(palette.dirtDark), 0, 0.03, 0));
  return g;
}

const G = palette.grass, GD = palette.grassDark;

export const grassBuilders = {
  // หญ้าเบอร์มิวด้า: เลื้อยต่ำ ใบละเอียด มีไหล stolon
  grass_bermuda: () => {
    const g = clump(9, 0.18, std(G, [GD]));
    const st = std(GD);
    g.add(M(BOX(0.4, 0.02, 0.02), st, 0.15, 0.02, 0.1));
    g.add(M(BOX(0.02, 0.02, 0.35), st, -0.12, 0.02, -0.05));
    return g;
  },
  // หญ้าคา: ใบคมยาว + ช่อปุยขาว
  grass_cogon: () => {
    const g = clump(7, 0.65, std(0x8aa05a, [GD]));
    for (let i = 0; i < 3; i++) {
      const st = M(CYL(0.012, 0.018, 0.8, 5), std(0xb0a06a), (i - 1) * 0.12, 0.4, 0);
      g.add(st);
      const plume = M(CYL(0.035, 0.05, 0.3, 6), glow(0xf2ead8), (i - 1) * 0.12, 0.9, 0);
      plume.castShadow = false; g.add(plume);
    }
    return g;
  },
  // ตะไคร้: กอตั้ง ใบโค้ง + โคนอวบ
  grass_lemongrass: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.09, 0.12, 0.18, 7), std(0xc9d8a0, [0x8aa05a]), 0, 0.09, 0));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const b = blade(Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.75, (Math.random() - 0.5) * 0.9, std(0x7aa05a, [GD]));
      g.add(b);
    }
    return g;
  },
  // หญ้าหางจิ้งจอก: ใบ + รวงขนฟูทรงกระบอก
  grass_foxtail: () => {
    const g = clump(6, 0.5, std(G, [GD]));
    for (let i = 0; i < 4; i++) {
      const x = (Math.random() - 0.5) * 0.2;
      g.add(M(CYL(0.008, 0.012, 0.5, 4), std(GD), x, 0.3, 0));
      const head = M(CYL(0.045, 0.035, 0.22, 6), std(0xc9b183, [0x8a6b3f]), x, 0.62, 0);
      g.add(head);
    }
    return g;
  },
  // หญ้าปามปัส: กอใหญ่ + ช่อขนนกสูง
  grass_pampas: () => {
    const g = clump(12, 0.7, std(0x8a9a6a, [GD]));
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.1;
      g.add(M(CYL(0.015, 0.02, 1.1, 5), std(0xb0a080), x, 0.55, 0));
      const pl = M(CYL(0.06, 0.09, 0.42, 7), glow(0xefe8d0), x, 1.25, 0);
      pl.castShadow = false; g.add(pl);
    }
    return g;
  },
  // กก/อ้อริมน้ำ: ลำต้นกลม + ช่อ
  grass_reed: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 0.3;
      g.add(M(CYL(0.02, 0.025, 0.9, 6), std(0x5a7a4a), x, 0.45, 0));
      if (i < 2) {
        const h = M(CYL(0.04, 0.04, 0.25, 6), std(0x6b4a2e), x, 0.95, 0);
        g.add(h);
      }
      g.add(blade(x + 0.05, 0.05, 0.5, 0.4, std(G, [GD])));
    }
    // รากเปียก
    g.add(M(BOX(0.35, 0.05, 0.3), std(palette.dirtDark), 0, 0.025, 0));
    return g;
  },
  // ข้าว: แถว + รวงโน้มมีเมล็ด
  grass_rice: () => {
    const g = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      const z = (r - 1) * 0.18;
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * 0.2;
        g.add(M(CYL(0.01, 0.015, 0.5, 4), std(0x7aa05a), x, 0.25, z));
        const pan = M(BOX(0.03, 0.18, 0.03), std(palette.grain, [0xb0904a]), x + 0.03, 0.5, z);
        pan.rotation.z = -0.35; g.add(pan);
        for (let k = 0; k < 3; k++) g.add(M(BOX(0.025, 0.025, 0.025), std(palette.grain), x + 0.05, 0.44 + k * 0.05, z));
      }
    }
    g.add(M(BOX(0.7, 0.04, 0.6), std(0x4a5a3a), 0, 0.02, 0)); // น้ำตม
    return g;
  },
  // ไผ่: ลำปล้อง + ข้อ + ใบหอก
  grass_bamboo: () => {
    const g = new THREE.Group();
    const culmM = std(0x7aa05a, [0x4a6b35]);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.16;
      const h = 0.9 + (i % 2) * 0.25;
      g.add(M(CYL(0.035, 0.04, h, 7), culmM, x, h / 2, 0));
      // ข้อปล้อง
      g.add(M(CYL(0.045, 0.045, 0.025, 7), std(0x9ab06a), x, h * 0.5, 0));
      g.add(M(CYL(0.045, 0.045, 0.025, 7), std(0x9ab06a), x, h * 0.75, 0));
      // ใบหอก 2 ใบ
      const l1 = M(BOX(0.22, 0.04, 0.06), std(G, [GD]), x + 0.12, h * 0.8, 0);
      l1.rotation.z = 0.4; g.add(l1);
      const l2 = M(BOX(0.2, 0.04, 0.06), std(G, [GD]), x - 0.1, h * 0.6, 0.05);
      l2.rotation.z = -0.4; g.add(l2);
    }
    return g;
  },
  // อ้อย: ลำต้นหนาเป็นข้อ + ใบยาว
  grass_sugarcane: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 0.14;
      const h = 1.0 + Math.random() * 0.2;
      g.add(M(CYL(0.045, 0.05, h, 7), std(0x9ab06a, [0x6b8f4a]), x, h / 2, 0));
      for (let n = 1; n <= 3; n++) g.add(M(CYL(0.055, 0.055, 0.02, 7), std(0x7a8f4a), x, (h / 4) * n, 0));
      const lf = M(BOX(0.3, 0.03, 0.07), std(G, [GD]), x + 0.12, h * 0.9, 0);
      lf.rotation.z = 0.5; g.add(lf);
    }
    return g;
  },
  // กกธูป/พาไพรัส: ก้านสามเหลี่ยม + ร่มเส้น
  grass_papyrus: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const x = (Math.random() - 0.5) * 0.3, h = 0.85 + Math.random() * 0.2;
      g.add(M(CYL(0.018, 0.022, h, 5), std(0x5a7a4a), x, h / 2, 0));
      // ร่ม 8 เส้น
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const ray = M(BOX(0.015, 0.015, 0.22), std(0x7aa05a), x + Math.cos(a) * 0.1, h + 0.02, Math.sin(a) * 0.1, -a);
        g.add(ray);
        g.add(M(BOX(0.03, 0.06, 0.03), std(0x8a6b3f), x + Math.cos(a) * 0.2, h - 0.02, Math.sin(a) * 0.2));
      }
    }
    return g;
  },
  // ธูปฤๅษี cattail: ใบแถบ + แท่งสีน้ำตาล + เกสรเหลือง
  grass_cattail: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * 0.3;
      const lf = M(BOX(0.05, 0.8 + Math.random() * 0.2, 0.01), std(0x5a7a4a, [GD]), x, 0.4, 0);
      lf.rotation.z = (Math.random() - 0.5) * 0.25; g.add(lf);
    }
    for (let i = 0; i < 2; i++) {
      const x = (i - 0.5) * 0.15;
      g.add(M(CYL(0.012, 0.012, 0.7, 5), std(0x6b8f4a), x, 0.35, 0));
      g.add(M(CYL(0.035, 0.035, 0.28, 7), std(palette.cattail, [0x3a2a18]), x, 0.75, 0));
      g.add(M(CYL(0.012, 0.012, 0.1, 5), glow(0xf2d86a), x, 0.94, 0));
    }
    return g;
  },
  // หญ้าแฝก vetiver: กอแน่นตั้งตรง รากลึก
  grass_vetiver: () => clump(14, 0.8, std(0x5a7a3a, [GD]), 0.12),
  // หญ้าน้ำพุ fountain: ใบโค้งเป็นน้ำพุ + ช่อขวด
  grass_fountain: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const b = M(BOX(0.04, 0.7, 0.015), std(0x7aa05a, [GD]), Math.cos(a) * 0.05, 0.3, Math.sin(a) * 0.05);
      b.rotation.z = Math.cos(a) * 0.55; b.rotation.x = Math.sin(a) * 0.55;
      g.add(b);
    }
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2;
      g.add(M(CYL(0.01, 0.014, 0.6, 4), std(0x8a9a6a), Math.cos(a) * 0.08, 0.35, Math.sin(a) * 0.08));
      const f = M(CYL(0.035, 0.02, 0.2, 6), std(0xc9a0a0, [0x8a6b6b]), Math.cos(a) * 0.15, 0.68, Math.sin(a) * 0.15);
      f.rotation.z = Math.cos(a) * 0.4; g.add(f);
    }
    return g;
  },
  // หญ้าแห้ง: กอสีฟาง ล้มบางส่วน
  grass_dry: () => {
    const g = clump(8, 0.4, std(0xb0a06a, [0x8a7a4a]), 0.15);
    g.children.forEach(c => { if (c.geometry && c.geometry.parameters && c.geometry.parameters.height > 0.2) c.rotation.z += 0.25; });
    return g;
  },
};
