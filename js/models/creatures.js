/* creatures — อิงกายวิภาคจริง:
 * wolf (Canis lupus): 105-160cm ยาว, ไหล่ 80-85cm, อกแคบ ขายาว,
 *   หัวใหญ่หน้าผากกว้าง ปากแคบยาว หูสามเหลี่ยมเล็ก, หางพุ่มปลายดำ, หลังลาด
 * chicken: ตัว + หัว + หงอน + ปาก + ปีก + หาง + ขามีนิ้ว
 * slime: วุ้น (เยลลี่) + แกนใน + ตา — squash & stretch
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow, palette, pixelTexture } from './core.js';
import { WOLF, CHICKEN } from './scale.js';

export const creatureBuilders = {
  slime: () => {
    const g = new THREE.Group();
    const body = M(BOX(0.68, 0.52, 0.68), new THREE.MeshStandardMaterial({
      map: pixelTexture(palette.slime, [palette.slimeDark, 0xbfffd4]),
      roughness: 0.6, metalness: 0, flatShading: true, transparent: true, opacity: 0.92,
    }), 0, 0.3, 0);
    // ยอดโค้ง (dome) + เงาใต้
    g.add(body);
    const top = M(BOX(0.5, 0.18, 0.5), body.material, 0, 0.6, 0);
    g.add(top);
    const inner = M(BOX(0.28, 0.24, 0.28), new THREE.MeshStandardMaterial({
      map: pixelTexture(0xbfffd4, [0xffffff]), roughness: 1, metalness: 0, flatShading: true, transparent: true, opacity: 0.9,
    }), 0, 0.28, 0.05);
    inner.castShadow = false; g.add(inner);
    // ไฮไลต์ + ตา + ปาก
    const hl = M(BOX(0.1, 0.1, 0.02), glow(0xffffff), -0.18, 0.48, 0.35); hl.castShadow = false; g.add(hl);
    const eye = glow(0x1c2a20);
    g.add(M(BOX(0.07, 0.1, 0.02), eye, -0.12, 0.4, 0.36));
    g.add(M(BOX(0.07, 0.1, 0.02), eye, 0.12, 0.4, 0.36));
    g.add(M(BOX(0.08, 0.02, 0.02), eye, 0, 0.3, 0.36));
    g.userData.update = (t) => {
      if (g.userData.baseY === undefined) g.userData.baseY = g.position.y;
      const s = 1 + Math.sin(t * 6) * 0.08;
      body.scale.set(1 / s, s, 1 / s);
      top.scale.set(1 / s, s, 1 / s);
      g.position.y = g.userData.baseY + Math.abs(Math.sin(t * 6)) * 0.12;
    };
    return g;
  },
  wolf: () => {
    const g = new THREE.Group();
    const fur = std(palette.wolfFur, [palette.wolfDark]), dark = std(palette.wolfDark);
    const SH = WOLF.SHOULDER_H; // 0.8 — ไหล่สูงตามจริง
    // ลำตัว: อกแคบลึก (0.45-0.85) + เอวคอด + หลังลาดไหล่สูงกว่าสะโพก 5cm
    g.add(M(BOX(0.32, 0.4, 0.45), fur, 0, SH - 0.15, 0.12));
    g.add(M(BOX(0.27, 0.32, 0.4), fur, 0, SH - 0.2, -0.3));
    // คอหนา
    g.add(M(BOX(0.24, 0.26, 0.22), fur, 0, SH + 0.02, 0.38));
    const head = new THREE.Group(); head.position.set(0, SH + 0.1, 0.52); // หัวระดับหลัง
    head.add(M(BOX(0.26, 0.24, 0.24), fur, 0, 0, 0));
    // ปากยาวปลายทู่ + จมูก
    head.add(M(BOX(0.13, 0.1, 0.18), dark, 0, -0.05, 0.19));
    head.add(M(BOX(0.06, 0.05, 0.03), std(0x1a1a1a), 0, -0.02, 0.29));
    // ตาสีเหลืองมองหน้า + หูสามเหลี่ยมเล็ก
    const eyeM = glow(0xd9a83a);
    const e1 = M(BOX(0.05, 0.04, 0.02), eyeM, -0.08, 0.04, 0.13); e1.castShadow = false;
    const e2 = M(BOX(0.05, 0.04, 0.02), eyeM, 0.08, 0.04, 0.13); e2.castShadow = false;
    head.add(e1, e2);
    const earM = fur;
    const earL = M(CYL(0, 0.055, 0.13, 4), earM, -0.09, 0.17, -0.02); head.add(earL);
    const earR = M(CYL(0, 0.055, 0.13, 4), earM, 0.09, 0.17, -0.02); head.add(earR);
    head.add(M(BOX(0.05, 0.08, 0.04), dark, -0.09, 0.12, -0.02));
    head.add(M(BOX(0.05, 0.08, 0.04), dark, 0.09, 0.12, -0.02));
    g.add(head); g.userData.head = head;
    // ขาเรียวยาว 0.55 + เท้า — ตีนติดพื้น y=0
    const legPos = [[-0.1, 0.3], [0.1, 0.3], [-0.09, -0.34], [0.09, -0.34]];
    const legs = [];
    legPos.forEach(([x, z], i) => {
      const leg = new THREE.Group(); leg.position.set(x, SH - 0.25, z);
      leg.add(M(BOX(0.09, 0.45, 0.1), i < 2 ? fur : dark, 0, -0.225, 0));
      leg.add(M(BOX(0.1, 0.1, 0.17), dark, 0, -0.5, 0.03)); // เท้า 0-0.1
      g.add(leg); legs.push(leg);
    });
    g.userData.legs = legs;
    // หางพุ่มห้อย 45° + ปลายดำ
    const tail = new THREE.Group(); tail.position.set(0, SH - 0.05, -0.5);
    tail.add(M(BOX(0.09, 0.09, 0.3), fur, 0, -0.06, -0.13, 0));
    tail.add(M(BOX(0.07, 0.07, 0.1), dark, 0, -0.12, -0.3));
    tail.rotation.x = 0.6; g.add(tail); g.userData.tail = tail;
    const ph = Math.random() * 10;
    g.userData.update = (t) => {
      head.position.y = SH + 0.1 + Math.sin(t * 3 + ph) * 0.02;
      head.rotation.y = Math.sin(t * 0.8 + ph) * 0.2;
      tail.rotation.x = 0.6 + Math.sin(t * 2 + ph) * 0.15;
      // วิ่ง: ขาแกว่งสลับ
      if (g.userData.running) {
        const s = Math.sin(t * 10 + ph);
        legs[0].rotation.x = s * 0.7; legs[3].rotation.x = s * 0.7;
        legs[1].rotation.x = -s * 0.7; legs[2].rotation.x = -s * 0.7;
      }
    };
    return g;
  },
  chicken: () => {
    const g = new THREE.Group();
    const S = CHICKEN.H / 0.72; // สเกลจากของเดิม 0.72 → 0.45m จริง
    // ตัวรูปไข่ + อก
    g.add(M(BOX(0.3 * S, 0.28 * S, 0.38 * S), std(palette.chick, [0xc9b183]), 0, 0.32 * S, 0));
    g.add(M(BOX(0.24 * S, 0.2 * S, 0.12 * S), std(0xf2e8d0), 0, 0.28 * S, 0.2 * S));
    const head = new THREE.Group(); head.position.set(0, 0.54 * S, 0.18 * S);
    const HB = 0.62; // สเกลหัวแยก (คงรายละเอียด)
    head.add(M(BOX(0.18 * S, 0.2 * S, 0.18 * S), std(palette.chick), 0, 0, 0));
    // หงอน + เหนียง + ปาก 2 ชั้น
    head.add(M(BOX(0.05 * S, 0.09 * S, 0.12 * S), glow(palette.berry), 0, 0.14 * S, -0.02));
    head.add(M(BOX(0.04 * S, 0.06 * S, 0.04 * S), glow(palette.berry), 0, -0.12 * S, 0.08 * S));
    head.add(M(BOX(0.05 * S, 0.04 * S, 0.08 * S), glow(palette.beak), 0, -0.02 * S, 0.13 * S));
    head.add(M(BOX(0.04 * S, 0.02 * S, 0.06 * S), std(0xc96a33), 0, -0.05 * S, 0.12 * S));
    const eye = glow(0x222222);
    head.add(M(BOX(0.035 * S, 0.05 * S, 0.02), eye, -0.08 * S, 0.04 * S, 0.09 * S));
    head.add(M(BOX(0.035 * S, 0.05 * S, 0.02), eye, 0.08 * S, 0.04 * S, 0.09 * S));
    g.add(head); g.userData.head = head;
    void HB;
    // ปีกแนบลำตัว + หางตั้ง 50°
    g.add(M(BOX(0.04 * S, 0.16 * S, 0.24 * S), std(palette.beak, [palette.berry]), -0.17 * S, 0.32 * S, -0.02));
    g.add(M(BOX(0.04 * S, 0.16 * S, 0.24 * S), std(palette.beak, [palette.berry]), 0.17 * S, 0.32 * S, -0.02));
    const tail1 = M(BOX(0.16 * S, 0.14 * S, 0.04 * S), std(palette.beak, [0x8a4a22]), 0, 0.46 * S, -0.2 * S); tail1.rotation.x = -0.5; g.add(tail1);
    const tail2 = M(BOX(0.12 * S, 0.12 * S, 0.04 * S), std(palette.beak), 0, 0.52 * S, -0.24 * S); tail2.rotation.x = -0.6; g.add(tail2);
    // ขา + นิ้ว 3 นิ้ว (ตีนติดพื้น)
    [[-0.08 * S], [0.08 * S]].forEach(([x]) => {
      g.add(M(BOX(0.03 * S, 0.1 * S, 0.03 * S), glow(palette.beak), x, 0.05 * S, 0));
      g.add(M(BOX(0.025 * S, 0.015 * S, 0.09 * S), glow(palette.beak), x, 0.008 * S, 0.03 * S));
      g.add(M(BOX(0.07 * S, 0.015 * S, 0.025 * S), glow(palette.beak), x, 0.008 * S, 0.02 * S));
    });
    const baseHeadY = 0.54 * S;
    g.userData.update = (t) => {
      head.position.y = baseHeadY + Math.sin(t * 8) * 0.01;
      head.rotation.x = Math.sin(t * 5) * 0.08;
    };
    return g;
  },
};
