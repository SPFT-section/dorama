/* survivor — สเกลจริง: สูง 1.7m (HUMAN.H)
 * สะโพก 0.85 / ไหล่ 1.32 / หัว 0.3 (1.37-1.67) / เท้าติดพื้น y=0
 * หมวก: straw (ปีก+ทรง), iron/hard (หมวกนิรภัย), beanie (ไหมพรม+พู่)
 * off-hand: shield (ไม้กลม+บอสเหล็ก) / lantern
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow, palette } from './core.js';
import { HUMAN } from './scale.js';
import { buildTool } from './tools.js';

export function createSurvivor(opts = {}) {
  const { tool = 'sword', off = null, hat = null, armor = null, walk = false } = opts;
  const g = new THREE.Group();
  const skinM = std(palette.skin, [0xc98f66]);
  const shirtM = std(armor === 'iron' ? palette.iron : 0x7a8a99, [0x2e3338]);
  const pantsM = std(palette.pants, [0x2e2620]);
  const HIP = HUMAN.HIP_Y, SHO = HUMAN.SHOULDER_Y; // 0.85 / 1.32
  // ตัว (0.85-1.35) + เข็มขัด + กระดุม
  g.add(M(BOX(0.38, 0.5, 0.24), shirtM, 0, (HIP + 1.35) / 2, 0));
  g.add(M(BOX(0.39, 0.06, 0.25), std(0x2e2620), 0, HIP + 0.02, 0));
  g.add(M(BOX(0.05, 0.05, 0.01), std(0xd9c28a), 0, 1.1, 0.125));
  const head = new THREE.Group(); head.position.set(0, 1.52, 0); // หัว 1.37-1.67
  head.add(M(BOX(0.3, HUMAN.HEAD_H, 0.28), skinM, 0, 0, 0));
  // ผม + จมูก + หู
  head.add(M(BOX(0.36, 0.1, 0.34), std(0x3a2c1c, [0x222222]), 0, 0.12, -0.01));
  head.add(M(BOX(0.05, 0.06, 0.03), skinM, 0, -0.02, 0.17));
  head.add(M(BOX(0.04, 0.06, 0.04), skinM, -0.18, 0, 0));
  head.add(M(BOX(0.04, 0.06, 0.04), skinM, 0.18, 0, 0));
  head.add(M(BOX(0.05, 0.06, 0.02), glow(0x222222), -0.08, 0.0, 0.17));
  head.add(M(BOX(0.05, 0.06, 0.02), glow(0x222222), 0.08, 0.0, 0.17));
  // แก้ม
  head.add(M(BOX(0.05, 0.03, 0.01), glow(0xe89a8a), -0.11, -0.06, 0.165));
  head.add(M(BOX(0.05, 0.03, 0.01), glow(0xe89a8a), 0.11, -0.06, 0.165));
  g.add(head); g.userData.head = head;
  if (hat === 'iron' || hat === 'hard') {
    head.add(M(BOX(0.4, 0.2, 0.4), std(hat === 'iron' ? palette.iron : 0xd9c28a), 0, 0.22, 0));
    head.add(M(BOX(0.42, 0.04, 0.42), std(palette.stoneDark), 0, 0.13, 0));
    head.add(M(BOX(0.08, 0.06, 0.08), std(palette.stoneDark), 0, 0.34, 0));
  } else if (hat === 'straw') {
    const brim = M(CYL(0.34, 0.34, 0.03, 10), std(0xd9c28a, [0xbfa76f]), 0, 0.17, 0); head.add(brim);
    head.add(M(CYL(0.15, 0.18, 0.16, 8), std(0xc9a86a), 0, 0.26, 0));
    head.add(M(CYL(0.155, 0.155, 0.03, 8), std(palette.berry), 0, 0.21, 0));
  } else if (hat === 'beanie') {
    head.add(M(BOX(0.36, 0.16, 0.34), std(palette.berry, [0x7a2a22]), 0, 0.22, 0));
    head.add(M(BOX(0.38, 0.04, 0.36), std(0x7a2a22), 0, 0.15, 0));
    head.add(M(BOX(0.1, 0.1, 0.1), std(palette.bone), 0, 0.34, 0));
  }
  const armL = new THREE.Group(); armL.position.set(-0.26, SHO, 0);
  armL.add(M(BOX(0.11, 0.32, 0.12), shirtM, 0, -0.14, 0));
  armL.add(M(BOX(0.1, 0.12, 0.11), skinM, 0, -0.36, 0)); // มือ → 0.90
  const armR = new THREE.Group(); armR.position.set(0.26, SHO, 0);
  armR.add(M(BOX(0.11, 0.32, 0.12), shirtM, 0, -0.14, 0));
  armR.add(M(BOX(0.1, 0.12, 0.11), skinM, 0, -0.36, 0));
  g.add(armL, armR);
  const legL = new THREE.Group(); legL.position.set(-0.11, HIP, 0); // ขายาว 0.85 ถึงพื้น
  legL.add(M(BOX(0.14, 0.55, 0.16), pantsM, 0, -0.275, 0));
  legL.add(M(BOX(0.15, 0.15, 0.24), std(0x2e2620), 0, -0.775, 0.04)); // บูท 0-0.15
  const legR = new THREE.Group(); legR.position.set(0.11, HIP, 0);
  legR.add(M(BOX(0.14, 0.55, 0.16), pantsM, 0, -0.275, 0));
  legR.add(M(BOX(0.15, 0.15, 0.24), std(0x2e2620), 0, -0.775, 0.04));
  g.add(legL, legR);
  const toolG = buildTool(tool); toolG.position.set(0, -0.38, 0.1); toolG.rotation.x = 0.4; armR.add(toolG);
  g.userData.armR = armR; g.userData.armL = armL; g.userData.handTool = toolG;
  g.userData.legL = legL; g.userData.legR = legR;
  if (off === 'shield') {
    const sh = new THREE.Group();
    // โล่ไม้ 7 แผ่น + ขอบเหล็ก + บอส
    sh.add(M(CYL(0.3, 0.3, 0.04, 9), std(palette.wood, [palette.woodDark]), 0, 0, 0));
    sh.children[0].rotation.x = Math.PI / 2;
    sh.add(M(new THREE.TorusGeometry(0.3, 0.02, 5, 14), std(palette.iron), 0, 0, 0));
    const boss = M(CYL(0.08, 0.1, 0.06, 8), std(palette.iron), 0, 0, 0.04);
    boss.rotation.x = Math.PI / 2; sh.add(boss);
    // หมุด 4 เม็ด
    [[0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]].forEach(([x, y]) => {
      const r = M(CYL(0.02, 0.02, 0.02, 6), std(palette.iron), x, y, 0.03);
      r.rotation.x = Math.PI / 2; sh.add(r);
    });
    sh.position.set(0, -0.33, 0.06); armL.add(sh);
  } else if (off === 'lantern') {
    // ต้อง import แบบ lazy เพื่อเลี่ยงวงจร — สร้างตะเกียงมินิตรงนี้
    const lg = new THREE.Group();
    lg.add(M(BOX(0.14, 0.03, 0.14), std(0x3a2c1c), 0, 0, 0));
    lg.add(M(BOX(0.1, 0.14, 0.1), glow(0xffd98a), 0, 0.09, 0));
    lg.scale.setScalar(0.8); lg.position.set(0, -0.42, 0.08); armL.add(lg);
  }
  const ph = Math.random() * 10;
  g.userData.update = (t) => {
    if (g.userData.baseY === undefined) g.userData.baseY = g.position.y;
    if (walk || g.userData.walking) {
      const s = Math.sin(t * 10 + ph);
      legL.rotation.x = s * 0.7; legR.rotation.x = -s * 0.7;
      armL.rotation.x = -s * 0.5; armR.rotation.x = s * 0.5 - 0.3;
      g.position.y = g.userData.baseY + Math.abs(Math.cos(t * 10 + ph)) * 0.06;
    } else {
      const b = Math.sin(t * 2 + ph) * 0.03;
      armL.rotation.x *= 0.9; armR.rotation.x = armR.rotation.x * 0.9 - 0.02;
      legL.rotation.x *= 0.9; legR.rotation.x *= 0.9;
      g.position.y = g.userData.baseY + b;
      head.rotation.y = Math.sin(t * 0.7 + ph) * 0.25;
    }
  };
  return g;
}
