/* tools / items / gear / food — อิงของจริง:
 * axe: ด้าม + หัว + คม / pick: ด้าม + หัวโค้ง 2 ปลาย / sword: ใบ+สัน+การ์ด+ด้าม+พอมเมล
 * shovel: ด้าม D-grip + ใบ / hoe / spear / hammer / bow (คัน+สาย) / rod (คัน+ไกด์+รอก)
 * item_*: วางดรอปแนวนอน / gear_*: โล่ หมวก ฯลฯ / food_*: น่องไก่ ปลา
 */
import * as THREE from 'three';
import { M, BOX, CYL, CONE, std, glow, palette } from './core.js';

export function buildTool(kind) {
  const g = new THREE.Group();
  const wood = std(palette.wood, [palette.woodDark]), dark = std(palette.woodDark);
  const ironM = std(0xb9c1cb, [palette.stoneDark]), steelM = std(palette.iron, [0x5a6169]);
  const add = (m) => g.add(m);
  switch (kind) {
    case 'axe': {
      add(M(BOX(0.06, 0.72, 0.06), wood, 0, 0, 0));
      add(M(BOX(0.07, 0.07, 0.07), dark, 0, 0.28, 0)); // ลิ่ม
      add(M(BOX(0.2, 0.24, 0.045), ironM, 0.1, 0.28, 0)); // หัว
      add(M(BOX(0.03, 0.22, 0.05), glow(0xe8eef4), 0.2, 0.28, 0)); // คม
      add(M(BOX(0.05, 0.08, 0.05), dark, 0, -0.34, 0)); // ท้ายด้าม
      break;
    }
    case 'pick': {
      add(M(BOX(0.06, 0.72, 0.06), wood, 0, 0, 0));
      add(M(BOX(0.08, 0.1, 0.08), dark, 0, 0.3, 0));
      const bar = M(BOX(0.56, 0.07, 0.07), steelM, 0, 0.36, 0); bar.rotation.y = 0.1; add(bar);
      const t1 = M(CONE(0.045, 0.14, 4), steelM, -0.32, 0.32, 0); t1.rotation.z = Math.PI / 2; add(t1);
      const t2 = M(CONE(0.045, 0.14, 4), steelM, 0.32, 0.32, 0); t2.rotation.z = -Math.PI / 2; add(t2);
      break;
    }
    case 'sword': case 'sword2': {
      const bladeM = glow(0xdfe6ee);
      add(M(BOX(0.09, 0.48, 0.025), bladeM, 0, 0.32, 0)); // ใบ
      add(M(BOX(0.02, 0.46, 0.028), std(0x9aa2ad), 0, 0.32, 0)); // สัน
      add(M(CONE(0.045, 0.08, 4), bladeM, 0, 0.6, 0)); // ปลาย
      add(M(BOX(0.28, 0.05, 0.06), std(0x8a6b3f, [palette.woodDark]), 0, 0.06, 0)); // การ์ด
      add(M(BOX(0.06, 0.16, 0.06), wood, 0, -0.05, 0)); // ด้าม
      add(M(BOX(0.08, 0.06, 0.08), std(palette.iron), 0, -0.15, 0)); // พอมเมล
      break;
    }
    case 'shovel': {
      add(M(BOX(0.05, 0.5, 0.05), wood, 0, 0.15, 0));
      add(M(BOX(0.12, 0.05, 0.05), dark, 0, 0.42, 0)); // D-grip
      add(M(BOX(0.05, 0.12, 0.05), dark, -0.04, 0.37, 0));
      add(M(BOX(0.05, 0.12, 0.05), dark, 0.04, 0.37, 0));
      add(M(BOX(0.18, 0.24, 0.04), steelM, 0, -0.22, 0)); // ใบ
      add(M(BOX(0.1, 0.06, 0.045), steelM, 0, -0.08, 0));
      break;
    }
    case 'hoe': {
      add(M(BOX(0.05, 0.66, 0.05), wood, 0, 0.05, 0));
      add(M(BOX(0.06, 0.06, 0.06), dark, 0, 0.36, 0));
      const bl = M(BOX(0.2, 0.03, 0.14), steelM, 0.1, 0.34, 0.05); bl.rotation.x = 0.3; add(bl);
      break;
    }
    case 'spear': {
      add(M(BOX(0.04, 1.0, 0.04), wood, 0, 0, 0));
      add(M(CONE(0.06, 0.2, 6), glow(0xdfe6ee), 0, 0.6, 0));
      add(M(CYL(0.05, 0.05, 0.04, 6), dark, 0, 0.48, 0));
      break;
    }
    case 'hammer': {
      add(M(BOX(0.06, 0.5, 0.06), wood, 0, -0.05, 0));
      add(M(BOX(0.24, 0.13, 0.12), steelM, 0, 0.24, 0));
      add(M(BOX(0.04, 0.1, 0.1), std(0x6a7076), -0.13, 0.24, 0)); // ง่ามถอนตะปู
      break;
    }
    case 'bow': {
      const l1 = M(BOX(0.04, 0.4, 0.04), wood, -0.05, 0.15, 0); l1.rotation.z = 0.25; add(l1);
      const l2 = M(BOX(0.04, 0.4, 0.04), wood, 0.05, 0.15, 0); l2.rotation.z = -0.25; add(l2);
      add(M(BOX(0.04, 0.12, 0.05), dark, 0, 0.0, 0)); // กริป
      add(M(BOX(0.008, 0.7, 0.008), std(0xe8d8b0), 0, 0.15, 0)); // สาย
      break;
    }
    case 'rod': {
      add(M(BOX(0.025, 1.1, 0.025), wood, 0, 0.2, 0));
      add(M(BOX(0.06, 0.06, 0.06), dark, 0, -0.3, 0)); // ด้ามจับ
      for (let i = 0; i < 3; i++) add(M(new THREE.TorusGeometry(0.025, 0.006, 4, 8), std(palette.iron), 0, 0.1 + i * 0.25, 0));
      add(M(CYL(0.04, 0.04, 0.03, 8), std(palette.iron), 0.05, -0.2, 0)); // รอก
      break;
    }
    default:
      add(M(BOX(0.06, 0.6, 0.06), wood, 0, 0, 0));
  }
  return g;
}

/* item วางพื้น (แนวนอน) */
function lying(tool) {
  const g = buildTool(tool === 'log' || tool === 'plank' || tool === 'stone' ? 'axe' : tool);
  g.clear();
  return g;
}

export const toolBuilders = {
  // tools ถือ — ใช้ buildTool ผ่าน create()
  item_axe: () => { const g = new THREE.Group(); const t = buildTool('axe'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_pickaxe: () => { const g = new THREE.Group(); const t = buildTool('pick'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_sword: () => { const g = new THREE.Group(); const t = buildTool('sword'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_shovel: () => { const g = new THREE.Group(); const t = buildTool('shovel'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_hoe: () => { const g = new THREE.Group(); const t = buildTool('hoe'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_hammer: () => { const g = new THREE.Group(); const t = buildTool('hammer'); t.rotation.z = Math.PI / 2; t.position.y = 0.1; g.add(t); return g; },
  item_knife: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.2, 0.03, 0.04), glow(0xdfe6ee), 0, 0.08, 0));
    g.add(M(BOX(0.12, 0.04, 0.05), std(palette.wood), -0.16, 0.08, 0));
    return g;
  },
  item_spear: () => { const g = new THREE.Group(); const t = buildTool('spear'); t.rotation.z = Math.PI / 2; t.position.y = 0.12; g.add(t); return g; },
  item_bow: () => { const g = new THREE.Group(); const t = buildTool('bow'); t.rotation.x = Math.PI / 2; t.position.y = 0.08; g.add(t); return g; },
  item_rod: () => { const g = new THREE.Group(); const t = buildTool('rod'); t.rotation.z = Math.PI / 2; t.position.y = 0.08; g.add(t); return g; },
  item_log: () => {
    const g = new THREE.Group();
    const l = M(CYL(0.09, 0.09, 0.5, 8), std(palette.trunk), 0, 0.1, 0);
    l.rotation.z = Math.PI / 2; g.add(l);
    return g;
  },
  item_plank: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.5, 0.05, 0.14), std(palette.woodLight, [palette.wood]), 0, 0.06, 0));
    return g;
  },
  item_stone: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.22, 0.14, 0.18), std(palette.stone, [palette.stoneDark]), 0, 0.08, 0));
    return g;
  },
  item_berries: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.2, 0.08, 0.14), std(palette.woodLight), 0, 0.05, 0)); // ตะกร้า
    [[-0.05, 0], [0.05, 0.02], [0, -0.03]].forEach(([x, z]) => g.add(M(BOX(0.06, 0.06, 0.06), glow(palette.berry), x, 0.12, z)));
    return g;
  },
  item_seeds: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.16, 0.1, 0.1), std(palette.parchment), 0, 0.06, 0)); // ซอง
    g.add(M(BOX(0.12, 0.04, 0.06), std(palette.grassDark), 0, 0.12, 0));
    return g;
  },
  item_can: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.08, 0.08, 0.14, 8), std(palette.iron), 0, 0.08, 0));
    g.add(M(BOX(0.04, 0.04, 0.04), std(palette.woodDark), 0, 0.17, 0));
    return g;
  },
  gear_shield: () => {
    const g = new THREE.Group();
    const s = M(CYL(0.3, 0.3, 0.04, 10), std(palette.wood, [palette.woodDark]), 0, 0.32, 0);
    s.rotation.x = 0.2; g.add(s);
    const b = M(CYL(0.08, 0.1, 0.06, 8), std(palette.iron), 0, 0.34, 0.02);
    b.rotation.x = Math.PI / 2 + 0.2; g.add(b);
    return g;
  },
  gear_helmet: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.16, 0.18, 0.14, 8), std(palette.iron, [palette.stoneDark]), 0, 0.1, 0));
    g.add(M(BOX(0.34, 0.03, 0.34), std(palette.iron), 0, 0.03, 0));
    return g;
  },
  gear_straw: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.3, 0.3, 0.025, 10), std(palette.straw || 0xd9c28a), 0, 0.05, 0));
    g.add(M(CYL(0.13, 0.15, 0.12, 8), std(0xc9a86a), 0, 0.12, 0));
    return g;
  },
  gear_hard: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.16, 0.18, 0.16, 8), std(0xd9c28a), 0, 0.1, 0));
    g.add(M(BOX(0.36, 0.03, 0.36), std(0xd9c28a), 0, 0.03, 0));
    return g;
  },
  gear_beanie: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.14, 0.15, 0.12, 8), std(palette.berry), 0, 0.07, 0));
    g.add(M(BOX(0.08, 0.08, 0.08), std(palette.bone), 0, 0.16, 0));
    return g;
  },
  gear_armor: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.34, 0.36, 0.22), std(palette.iron, [0x5a6169]), 0, 0.25, 0));
    g.add(M(BOX(0.36, 0.06, 0.24), std(0x5a6169), 0, 0.08, 0));
    return g;
  },
  gear_pack: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.3, 0.36, 0.2), std(0x6b4a2e, [0x4a3220]), 0, 0.2, 0));
    g.add(M(BOX(0.32, 0.08, 0.22), std(0x4a3220), 0, 0.4, 0));
    g.add(M(BOX(0.1, 0.12, 0.02), std(palette.parchment), 0, 0.22, 0.11));
    return g;
  },
  gear_canteen: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.09, 0.09, 0.06, 8), std(0x4a6b5a), 0, 0.08, 0));
    g.add(M(BOX(0.04, 0.06, 0.04), std(palette.woodDark), 0, 0.14, 0));
    return g;
  },
  gear_compass: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.08, 0.08, 0.03, 10), std(0xd9c28a), 0, 0.04, 0));
    g.add(M(BOX(0.1, 0.01, 0.02), glow(0xc44536), 0, 0.06, 0));
    return g;
  },
  gear_map: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.28, 0.01, 0.2), std(palette.parchment, [0xc9b183]), 0, 0.05, 0, 0.3));
    g.add(M(CYL(0.025, 0.025, 0.3, 6), std(palette.wood), 0, 0.05, 0));
    return g;
  },
  gear_rope: () => {
    const g = new THREE.Group();
    g.add(M(new THREE.TorusGeometry(0.1, 0.03, 6, 12), std(palette.rope || 0xb08954), 0, 0.08, 0));
    return g;
  },
  gear_bandage: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.07, 0.07, 0.06, 8), std(0xe8e0d0), 0, 0.05, 0, 0.4));
    g.add(M(BOX(0.1, 0.02, 0.1), glow(0xc44536), 0, 0.09, 0));
    return g;
  },
  food_meat: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.18, 0.14, 0.14), std(0x8a4a3a, [0x5e3227]), 0, 0.1, 0));
    g.add(M(CYL(0.02, 0.02, 0.12, 6), std(palette.bone), 0.14, 0.1, 0));
    g.children[g.children.length - 1].rotation.z = Math.PI / 2;
    g.add(M(BOX(0.05, 0.05, 0.05), std(palette.bone), 0.2, 0.1, 0));
    return g;
  },
  food_fish: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.26, 0.1, 0.08), std(0x7aa0b0, [0x4a6a7a]), 0, 0.08, 0));
    const tail = M(CYL(0, 0.06, 0.08, 4), std(0x5a7a8a), -0.17, 0.08, 0);
    tail.rotation.z = Math.PI / 2; g.add(tail);
    g.add(M(BOX(0.03, 0.03, 0.01), glow(0x222222), 0.09, 0.1, 0.045));
    return g;
  },
};
