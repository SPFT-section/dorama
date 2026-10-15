/* furniture & farm — อิงโครงสร้างจริง:
 * chest: ตัว+ฝาโค้ง+สายรัด+กุญแจ / crate: โครงไม้ระแนง
 * workbench: ท็อปหนา+ขา+คาน+ปากกาจับ+เครื่องมือ
 * fence: เสาปลายแหลม+ราว 2 เส้น / signpost: เสา+ป้ายลูกศร
 * plot: กรอบยก+ดิน 3 ร่อง (plot_0..3 = ระยะโต)
 * scarecrow: โครง T + เสื้อฟาง + หัว + หมวก
 * barrel_water/table_camp/stool_fold/cot_fold/bench_log/rack_drying/sawbuck
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow, palette } from './core.js';
import { FURNITURE } from './scale.js';

export const furnitureBuilders = {
  chest: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.7, 0.34, 0.46), std(palette.wood, [palette.woodDark]), 0, 0.17, 0));
    g.add(M(BOX(0.72, 0.14, 0.48), std(palette.woodDark, [palette.wood]), 0, 0.41, 0));
    g.add(M(BOX(0.72, 0.06, 0.38), std(palette.wood, [palette.woodLight]), 0, 0.51, 0.02));
    const band = std(0x3a3f45, [0x222528]);
    [-0.25, 0.25].forEach(x => { g.add(M(BOX(0.08, 0.38, 0.5), band, x, 0.26, 0)); });
    // กุญแจ + หูหิ้ว
    g.add(M(BOX(0.12, 0.12, 0.04), glow(palette.amber), 0, 0.3, 0.25));
    g.add(M(BOX(0.04, 0.06, 0.02), std(0x222222), 0, 0.3, 0.27));
    return g;
  },
  crate: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.56, 0.56, 0.56), std(palette.woodLight, [palette.wood]), 0, 0.3, 0));
    const edge = std(palette.wood, [palette.woodDark]);
    g.add(M(BOX(0.62, 0.07, 0.62), edge, 0, 0.56, 0));
    g.add(M(BOX(0.62, 0.07, 0.62), edge, 0, 0.04, 0));
    [[-0.27, 0.27], [0.27, 0.27], [-0.27, -0.27], [0.27, -0.27]].forEach(([x, z]) => g.add(M(BOX(0.07, 0.6, 0.07), edge, x, 0.3, z)));
    // ไม้ทแยง
    const d = M(BOX(0.05, 0.7, 0.02), edge, 0, 0.3, 0.29); d.rotation.z = 0.6; g.add(d);
    return g;
  },
  workbench: () => {
    const g = new THREE.Group();
    const leg = std(palette.trunk);
    const TOP = FURNITURE.WORKBENCH_TOP; // 0.85 — โต๊ะงานจริง
    g.add(M(BOX(1.1, 0.1, 0.6), std(palette.wood, [palette.woodDark]), 0, TOP - 0.05, 0)); // ท็อป 0.8-0.9
    [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]].forEach(([x, z]) => g.add(M(BOX(0.1, TOP - 0.1, 0.1), leg, x, (TOP - 0.1) / 2, z)));
    // คานล่าง + ชั้นวาง
    g.add(M(BOX(0.9, 0.06, 0.05), leg, 0, 0.15, 0.2));
    g.add(M(BOX(0.9, 0.06, 0.05), leg, 0, 0.15, -0.2));
    g.add(M(BOX(1, 0.05, 0.5), std(palette.woodDark), 0, 0.2, 0));
    // ปากกาจับงาน (vice) + สกรู — บนท็อป 0.9
    g.add(M(BOX(0.12, 0.14, 0.2), std(palette.iron, [palette.stoneDark]), -0.55, TOP + 0.05, 0.1));
    const screw = M(CYL(0.02, 0.02, 0.2, 6), std(palette.iron), -0.6, TOP + 0.05, 0.1);
    screw.rotation.z = Math.PI / 2; g.add(screw);
    g.add(M(BOX(0.2, 0.06, 0.16), std(palette.woodLight), 0.2, TOP + 0.05, 0.05));
    g.add(M(BOX(0.4, 0.012, 0.28), std(palette.parchment, [0xc9b183]), 0.05, TOP + 0.03, -0.1));
    return g;
  },
  fence: () => {
    const g = new THREE.Group();
    const post = std(palette.trunk);
    const H = FURNITURE.FENCE_H; // 1.0 — รั้วสวนจริง
    [[-0.4], [0.4]].forEach(([x]) => {
      g.add(M(BOX(0.1, H - 0.06, 0.1), post, x, (H - 0.06) / 2, 0));
      g.add(M(CYL(0, 0.07, 0.08, 4), std(palette.woodLight), x, H - 0.02, 0)); // หัวแหลมกันน้ำ
    });
    const rail = std(palette.wood, [palette.woodDark]);
    g.add(M(BOX(1, 0.07, 0.05), rail, 0, H - 0.3, 0));
    g.add(M(BOX(1, 0.07, 0.05), rail, 0, H - 0.6, 0));
    // ตะปู
    const nailM = std(0x222222);
    [[-0.4, H - 0.3], [0.4, H - 0.3], [-0.4, H - 0.6], [0.4, H - 0.6]].forEach(([x, y]) => g.add(M(BOX(0.02, 0.02, 0.01), nailM, x, y, 0.03)));
    return g;
  },
  signpost: () => {
    const g = new THREE.Group();
    const H = FURNITURE.SIGN_POST_H; // 1.6 — เสาป้ายจริง
    const [B1, B2] = FURNITURE.SIGN_BOARD_Y; // 1.35 / 1.05 ระดับสายตา
    g.add(M(BOX(0.1, H, 0.1), std(palette.trunk), 0, H / 2, 0));
    g.add(M(CYL(0, 0.08, 0.1, 4), std(palette.woodLight), 0, H + 0.03, 0));
    // ป้ายลูกศร 2 ป้าย
    g.add(M(BOX(0.55, 0.18, 0.04), std(palette.sand, [palette.wood]), -0.05, B1, 0));
    g.add(M(CYL(0, 0.09, 0.04, 4), std(palette.sand), 0.25, B1, 0));
    g.add(M(BOX(0.45, 0.16, 0.04), std(palette.sand, [palette.wood]), 0.05, B2, 0));
    g.add(M(CYL(0, 0.08, 0.04, 4), std(palette.sand), -0.2, B2, 0));
    g.children[g.children.length - 1].rotation.y = Math.PI;
    // กรอบ
    g.add(M(BOX(0.6, 0.03, 0.05), std(palette.woodDark), -0.05, B1 + 0.11, 0));
    g.add(M(BOX(0.5, 0.03, 0.05), std(palette.woodDark), 0.05, B2 - 0.1, 0));
    return g;
  },
  plot: () => {
    const g = new THREE.Group();
    const soil = std(0x4a3220, [0x2e1f14]);
    // กรอบไม้ยก + เสามุม
    g.add(M(BOX(1, 0.12, 1), std(palette.wood, [palette.woodDark]), 0, 0.06, 0));
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => g.add(M(BOX(0.08, 0.2, 0.08), std(palette.trunk), x, 0.1, z)));
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, -0.3));
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, 0));
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, 0.3));
    return g;
  },
  plot_0: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1, 0.12, 1), std(palette.wood, [palette.woodDark]), 0, 0.06, 0));
    g.add(M(BOX(0.9, 0.03, 0.9), std(0x4a3220, [0x2e1f14]), 0, 0.13, 0));
    return g;
  },
  plot_1: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1, 0.12, 1), std(palette.wood, [palette.woodDark]), 0, 0.06, 0));
    const soil = std(0x4a3220, [0x2e1f14]);
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, -0.3));
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, 0));
    g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, 0.3));
    return g;
  },
  plot_2: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1, 0.12, 1), std(palette.wood, [palette.woodDark]), 0, 0.06, 0));
    const soil = std(0x4a3220, [0x2e1f14]);
    for (let r = -1; r <= 1; r++) {
      g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, r * 0.3));
      for (let i = -1; i <= 1; i++) g.add(M(BOX(0.06, 0.14, 0.06), std(palette.grass, [palette.grassDark]), i * 0.25, 0.24, r * 0.3));
    }
    return g;
  },
  plot_3: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1, 0.12, 1), std(palette.wood, [palette.woodDark]), 0, 0.06, 0));
    const soil = std(0x4a3220, [0x2e1f14]);
    for (let r = -1; r <= 1; r++) {
      g.add(M(BOX(0.9, 0.05, 0.14), soil, 0, 0.15, r * 0.3));
      for (let i = -1; i <= 1; i++) {
        g.add(M(BOX(0.08, 0.22, 0.08), std(palette.leaf, [palette.leafLight]), i * 0.25, 0.28, r * 0.3));
        g.add(M(BOX(0.06, 0.06, 0.06), glow(palette.berry), i * 0.25, 0.4, r * 0.3));
      }
    }
    return g;
  },
  scarecrow: () => {
    const g = new THREE.Group();
    const H = FURNITURE.SCARECROW_H; // 1.7 — เท่าคนจริง
    g.add(M(BOX(0.08, H - 0.2, 0.08), std(palette.trunk), 0, (H - 0.2) / 2, 0));
    g.add(M(BOX(0.9, 0.07, 0.07), std(palette.trunk), 0, H - 0.55, 0));
    // ตัวเสื้อ + ฟางโผล่
    g.add(M(BOX(0.36, 0.44, 0.16), std(0x8a4a3a, [0x5e3227]), 0, H - 0.85, 0));
    const strawM = std(palette.straw, [0xbfa76f]);
    const crossY = H - 0.55, bodyY = H - 0.85;
    [[-0.42, crossY], [0.42, crossY], [-0.15, bodyY - 0.2], [0.15, bodyY - 0.2]].forEach(([x, y]) => {
      const s = M(BOX(0.1, 0.04, 0.04), strawM, x, y, 0); s.rotation.z = x > 0 ? 0.4 : -0.4; g.add(s);
    });
    // กระดุม + ปะ
    g.add(M(BOX(0.04, 0.04, 0.02), std(0x222222), 0, bodyY + 0.08, 0.09));
    g.add(M(BOX(0.04, 0.04, 0.02), std(0x222222), 0, bodyY - 0.04, 0.09));
    g.add(M(BOX(0.1, 0.08, 0.01), std(0x4a6b8a), 0.08, bodyY, 0.085));
    // หัว + ตา + หมวกฟาง
    const headY = H - 0.2;
    g.add(M(BOX(0.22, 0.04, 0.02), std(palette.bone), 0, headY - 0.16, 0.08)); // ปาก
    g.add(M(new THREE.BoxGeometry(0.3, 0.28, 0.26), std(palette.sand, [palette.wood]), 0, headY, 0));
    g.add(M(BOX(0.04, 0.04, 0.02), std(0x222222), -0.05, headY + 0.02, 0.14));
    g.add(M(BOX(0.04, 0.04, 0.02), std(0x222222), 0.05, headY + 0.02, 0.14));
    g.add(M(CYL(0.26, 0.26, 0.025, 8), std(palette.straw), 0, headY + 0.14, 0));
    g.add(M(CYL(0.13, 0.15, 0.14, 8), std(0xc9a86a), 0, headY + 0.22, 0));
    return g;
  },
  barrel_water: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.26, 0.22, 0.5, 10), std(palette.wood, [palette.woodDark]), 0, 0.25, 0));
    const hoopM = std(palette.iron);
    [0.12, 0.38].forEach(y => {
      const h = M(new THREE.TorusGeometry(0.25, 0.015, 5, 14), hoopM, 0, y, 0);
      h.rotation.x = Math.PI / 2; g.add(h);
    });
    const w = M(CYL(0.22, 0.22, 0.02, 10), glow(palette.teal), 0, 0.48, 0);
    w.castShadow = false; g.add(w);
    g.add(M(BOX(0.2, 0.03, 0.08), std(palette.woodLight), 0, 0.51, 0)); // กระบวย
    return g;
  },
  table_camp: () => {
    const g = new THREE.Group();
    const TOP = FURNITURE.TABLE_CAMP_H; // 0.6 — โต๊ะแคมป์จริง
    g.add(M(BOX(1.2, 0.06, 0.7), std(palette.wood, [palette.woodDark]), 0, TOP - 0.03, 0));
    // ขาพับ X (ปลายแตะพื้น y=0)
    [[-0.5], [0.5]].forEach(([x]) => {
      const a = M(BOX(0.06, 0.6, 0.06), std(palette.trunk), x, 0.29, 0.1); a.rotation.x = 0.4; g.add(a);
      const b = M(BOX(0.06, 0.6, 0.06), std(palette.trunk), x, 0.29, -0.1); b.rotation.x = -0.4; g.add(b);
    });
    g.add(M(BOX(0.9, 0.04, 0.05), std(palette.trunk), 0, 0.15, 0));
    // ของบนโต๊ะ: แผนที่ + มีด
    g.add(M(BOX(0.35, 0.012, 0.25), std(palette.parchment), -0.2, TOP + 0.01, 0));
    g.add(M(BOX(0.2, 0.02, 0.05), std(palette.iron), 0.25, TOP + 0.01, 0.1));
    return g;
  },
  stool_fold: () => {
    const g = new THREE.Group();
    const H = FURNITURE.STOOL_H; // 0.45
    g.add(M(BOX(0.35, 0.05, 0.3), std(palette.canvas, [palette.canvasDark]), 0, H - 0.025, 0));
    [[-0.12, 0.1], [0.12, 0.1], [-0.12, -0.1], [0.12, -0.1]].forEach(([x, z]) => {
      const l = M(BOX(0.04, 0.45, 0.04), std(palette.trunk), x, 0.225, z);
      l.rotation.z = x > 0 ? -0.25 : 0.25; g.add(l);
    });
    return g;
  },
  cot_fold: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1.6, 0.06, 0.6), std(0x4a6b5a, [0x2c4a3e]), 0, 0.35, 0));
    [[-0.7], [0.7]].forEach(([x]) => {
      const a = M(BOX(0.05, 0.38, 0.55), std(palette.iron), x, 0.19, 0); a.rotation.z = x > 0 ? 0.2 : -0.2; g.add(a);
    });
    g.add(M(BOX(0.3, 0.1, 0.5), std(palette.bone), -0.6, 0.42, 0)); // หมอน
    return g;
  },
  bench_log: () => {
    const g = new THREE.Group();
    const log = M(CYL(0.14, 0.14, 1.4, 8), std(palette.trunk), 0, 0.32, 0);
    log.rotation.z = Math.PI / 2; g.add(log);
    const top = M(BOX(1.4, 0.04, 0.24), std(0xc9a06a, [palette.wood]), 0, 0.45, 0); g.add(top);
    [[-0.5], [0.5]].forEach(([x]) => g.add(M(BOX(0.16, 0.3, 0.24), std(palette.woodDark), x, 0.15, 0)));
    return g;
  },
  rack_drying: () => {
    const g = new THREE.Group();
    [[-0.5], [0.5]].forEach(([x]) => {
      g.add(M(BOX(0.05, 1.0, 0.05), std(palette.trunk), x, 0.5, -0.2));
      g.add(M(BOX(0.05, 1.0, 0.05), std(palette.trunk), x, 0.5, 0.2));
      g.add(M(BOX(0.05, 0.05, 0.5), std(palette.trunk), x, 0.95, 0));
    });
    for (let i = 0; i < 3; i++) {
      const bar = M(CYL(0.015, 0.015, 1.1, 5), std(palette.trunk), 0, 0.9 - i * 0.15, 0);
      bar.rotation.z = Math.PI / 2; g.add(bar);
    }
    // เนื้อตาก 3 ชิ้น
    for (let i = 0; i < 3; i++) g.add(M(BOX(0.12, 0.16, 0.03), std(0x8a4a3a), -0.2 + i * 0.2, 0.78, 0));
    return g;
  },
  sawbuck: () => {
    const g = new THREE.Group();
    // กากบาท X 2 ชุด + ท่อนไม้
    [[-0.35], [0.35]].forEach(([x]) => {
      const a = M(BOX(0.06, 0.7, 0.06), std(palette.trunk), x, 0.3, 0); a.rotation.x = 0.5; g.add(a);
      const b = M(BOX(0.06, 0.7, 0.06), std(palette.trunk), x, 0.3, 0); b.rotation.x = -0.5; g.add(b);
    });
    const log = M(CYL(0.09, 0.09, 1.0, 8), std(palette.trunk), 0, 0.55, 0);
    log.rotation.z = Math.PI / 2; g.add(log);
    return g;
  },
};
