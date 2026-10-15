/* fire & heat — อิงโครงสร้างจริง:
 * campfire: วงหิน + หลุมเถ้า + เชื้อ tinder + ฟืน kindling teepee + ฟืนใหญ่ log-cabin + เปลว 3 ชั้น + สะเก็ด + แสง
 * fire_teepee: เชื้อกลาง + ไม้พิงเป็นกระโจม + ช่องลม
 * fire_logcabin: ไม้เรียงตาราง Lincoln-logs + แกน teepee กลาง
 * torch: ด้าม + หัวพัน + น้ำมัน + เปลว / lantern: ฐาน+กระจก+โครง+หูหิ้ว+ไส้
 * furnace: ตัวหิน + ช่องไฟโค้ง + ปล่อง + แท่น / cooking (tripod_pot): 3 ขา + โซ่ + หม้อ / spit_roast: ง่าม + ไม้เสียบ + เนื้อ
 */
import * as THREE from 'three';
import { M, BOX, CYL, CONE, std, glow, palette } from './core.js';

function stoneRing(g, n = 7, r = 0.42) {
  const stoneM = std(palette.stoneDark);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const s = M(BOX(0.2, 0.14, 0.16), i % 2 ? std(palette.stone) : stoneM, Math.cos(a) * r, 0.07, Math.sin(a) * r, -a);
    s.scale.setScalar(0.9 + Math.random() * 0.25);
    g.add(s);
  }
  g.add(M(CYL(0.45, 0.45, 0.03, 10), std(palette.charcoal, [0x111111]), 0, 0.03, 0)); // ถ่าน/เถ้า
  g.add(M(CYL(0.3, 0.3, 0.015, 10), std(palette.ash, [0x6a6a6a]), 0, 0.05, 0));
}

function flames(g, scale = 1) {
  const f1 = M(CONE(0.2 * scale, 0.55 * scale, 5), glow(palette.ember), 0, 0.42 * scale, 0);
  const f2 = M(CONE(0.14 * scale, 0.42 * scale, 5), glow(0xf2c14e), 0, 0.38 * scale, 0);
  const f3 = M(CONE(0.08 * scale, 0.28 * scale, 5), glow(0xfff2c9), 0, 0.34 * scale, 0);
  f1.castShadow = f2.castShadow = f3.castShadow = false;
  f1.rotation.y = Math.PI / 4; g.add(f1, f2, f3);
  const embers = [];
  for (let i = 0; i < 5; i++) {
    const e = M(BOX(0.04, 0.04, 0.04), glow(i % 2 ? palette.ember : 0xf2c14e), (Math.random() - 0.5) * 0.5, 0.1 + Math.random() * 0.4, (Math.random() - 0.5) * 0.5);
    e.castShadow = false; embers.push(e); g.add(e);
  }
  const light = new THREE.PointLight(0xff9a3c, 1.6, 8, 2); light.position.set(0, 1.0, 0); g.add(light);
  g.userData.update = (t) => {
    const s = 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.06;
    f1.scale.set(s, 1 + Math.sin(t * 11) * 0.15, s);
    f2.scale.set(1 / s, 1 + Math.cos(t * 13) * 0.18, 1 / s);
    f1.rotation.y += 0.02; f2.rotation.y -= 0.03;
    light.intensity = 1.4 + Math.sin(t * 10) * 0.25 + Math.sin(t * 27) * 0.12;
    embers.forEach((e) => {
      e.position.y += 0.012; e.rotation.y += 0.05;
      if (e.position.y > 1.2) { e.position.y = 0.15; e.position.x = (Math.random() - 0.5) * 0.4; e.position.z = (Math.random() - 0.5) * 0.4; }
    });
    const fuel = g.userData.fuel ?? 1;
    const vis = fuel > 0.02;
    f1.visible = f2.visible = f3.visible = vis;
    light.intensity = vis ? light.intensity * (0.35 + fuel * 0.65) : 0;
  };
  g.userData.fuel = 1;
  return g;
}

function teepeeLogs(g, h = 0.55) {
  const logM = std(palette.trunk);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    // ปลายแตะพื้นพอดี: จุดศูนย์ h*0.45+0.03 ชดเชยความเอียง 26° + รัศมีไม้
    const l = M(CYL(0.035, 0.045, h, 6), logM, Math.cos(a) * 0.14, h * 0.45 + 0.03, Math.sin(a) * 0.14);
    l.rotation.z = Math.cos(a) * 0.45; l.rotation.x = -Math.sin(a) * 0.45;
    g.add(l);
  }
  // เชื้อกลาง (tinder bundle)
  g.add(M(BOX(0.16, 0.1, 0.16), std(0xd9c28a, [0x8a6b3f]), 0, 0.08, 0));
}

export const fireBuilders = {
  campfire: () => {
    const g = new THREE.Group();
    stoneRing(g);
    // ฟืน kindling teepee กลาง + ฟืนใหญ่ log-cabin รอบนอก
    teepeeLogs(g, 0.5);
    const logM = std(palette.trunk);
    [[0.35, 0], [-0.35, 0]].forEach(([x]) => {});
    const big = [[0.3, 0, 0], [-0.3, 0, 0], [0, 0.14, 0.3], [0, 0.14, -0.3]];
    // วางแบบ log-cabin 2 ชั้นเตี้ยรอบ teepee
    const l1 = M(CYL(0.06, 0.06, 0.6, 6), logM, 0, 0.1, 0.22); l1.rotation.z = Math.PI / 2; g.add(l1);
    const l2 = M(CYL(0.06, 0.06, 0.6, 6), logM, 0, 0.1, -0.22); l2.rotation.z = Math.PI / 2; g.add(l2);
    const l3 = M(CYL(0.06, 0.06, 0.6, 6), logM, 0.22, 0.2, 0); l3.rotation.x = Math.PI / 2; g.add(l3);
    const l4 = M(CYL(0.06, 0.06, 0.6, 6), logM, -0.22, 0.2, 0); l4.rotation.x = Math.PI / 2; g.add(l4);
    return flames(g, 1);
  },
  fire_teepee: () => {
    const g = new THREE.Group();
    stoneRing(g, 6, 0.36);
    teepeeLogs(g, 0.62);
    return flames(g, 0.9);
  },
  fire_logcabin: () => {
    const g = new THREE.Group();
    stoneRing(g, 8, 0.5);
    const logM = std(palette.trunk);
    // Lincoln-logs 3 ชั้น
    for (let layer = 0; layer < 3; layer++) {
      const y = 0.08 + layer * 0.11;
      if (layer % 2 === 0) {
        const a = M(CYL(0.055, 0.055, 0.7, 6), logM, 0, y, 0.28); a.rotation.z = Math.PI / 2; g.add(a);
        const b = M(CYL(0.055, 0.055, 0.7, 6), logM, 0, y, -0.28); b.rotation.z = Math.PI / 2; g.add(b);
      } else {
        const a = M(CYL(0.055, 0.055, 0.7, 6), logM, 0.28, y, 0); a.rotation.x = Math.PI / 2; g.add(a);
        const b = M(CYL(0.055, 0.055, 0.7, 6), logM, -0.28, y, 0); b.rotation.x = Math.PI / 2; g.add(b);
      }
    }
    // แกน teepee เล็กกลาง
    teepeeLogs(g, 0.4);
    return flames(g, 1.05);
  },
  torch: () => {
    const g = new THREE.Group();
    // เสาคบเพลิงจริง ~1.2m ปักพื้น
    g.add(M(CYL(0.035, 0.05, 1.2, 6), std(palette.trunk), 0, 0.6, 0));
    // รอยพันเชือก + หัวชุบน้ำมัน
    g.add(M(CYL(0.055, 0.055, 0.08, 6), std(palette.rope), 0, 1.18, 0));
    g.add(M(CYL(0.07, 0.06, 0.16, 6), std(0x3a2c1c), 0, 1.28, 0));
    const fl = M(CONE(0.09, 0.26, 5), glow(palette.ember), 0, 1.45, 0);
    const fl2 = M(CONE(0.05, 0.18, 5), glow(0xf2c14e), 0, 1.43, 0);
    fl.castShadow = fl2.castShadow = false; g.add(fl, fl2);
    const l = new THREE.PointLight(0xff9a3c, 0.9, 4, 2); l.position.set(0, 1.5, 0); g.add(l);
    g.userData.update = (t) => {
      fl.scale.set(1 + Math.sin(t * 12) * 0.15, 1 + Math.cos(t * 15) * 0.2, 1 + Math.sin(t * 12) * 0.15);
      l.intensity = 0.8 + Math.sin(t * 11) * 0.15;
    };
    return g;
  },
  lantern: () => {
    const g = new THREE.Group();
    const frame = std(0x3a2c1c);
    g.add(M(BOX(0.24, 0.05, 0.24), frame, 0, 0.025, 0)); // ฐาน + ถังน้ำมัน
    g.add(M(CYL(0.05, 0.06, 0.04, 6), std(palette.iron), 0, 0.06, 0));
    g.add(M(BOX(0.22, 0.04, 0.22), frame, 0, 0.36, 0)); // ฝาบน
    [[0.09, 0.09], [-0.09, 0.09], [0.09, -0.09], [-0.09, -0.09]].forEach(([x, z]) => g.add(M(BOX(0.025, 0.3, 0.025), frame, x, 0.19, z)));
    // กระจก 4 ด้านโปร่ง
    const glassM = new THREE.MeshStandardMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.3, roughness: 0.2 });
    const gl = M(BOX(0.16, 0.24, 0.16), glassM, 0, 0.19, 0); gl.castShadow = false; g.add(gl);
    const core = M(BOX(0.07, 0.12, 0.07), glow(0xffd98a), 0, 0.16, 0); core.castShadow = false; g.add(core);
    // หูหิ้วโค้ง
    const handle = M(new THREE.TorusGeometry(0.09, 0.012, 5, 12, Math.PI), frame, 0, 0.38, 0);
    g.add(handle);
    const l = new THREE.PointLight(0xffc46b, 1, 5, 2); l.position.set(0, 0.3, 0); g.add(l);
    g.userData.update = (t) => { l.intensity = 0.9 + Math.sin(t * 7) * 0.1; };
    return g;
  },
  furnace: () => {
    const g = new THREE.Group();
    // ตัวเตาหิน + ฐาน + หลังคา
    g.add(M(BOX(0.9, 0.9, 0.7), std(palette.stoneDark, [palette.stone]), 0, 0.45, -0.05));
    g.add(M(BOX(0.94, 0.1, 0.74), std(palette.stone, [0xffffff]), 0, 0.93, -0.05));
    g.add(M(BOX(0.94, 0.1, 0.74), std(palette.stoneDark), 0, 0.05, -0.05));
    // ช่องไฟโค้ง: กรอบ 2 ข้าง + ทับหลัง + ผนังดำ
    g.add(M(BOX(0.1, 0.4, 0.06), std(palette.stone, [0xffffff]), -0.24, 0.3, 0.31));
    g.add(M(BOX(0.1, 0.4, 0.06), std(palette.stone, [0xffffff]), 0.24, 0.3, 0.31));
    g.add(M(BOX(0.58, 0.1, 0.06), std(palette.stone, [0xffffff]), 0, 0.52, 0.31));
    g.add(M(BOX(0.38, 0.36, 0.04), std(0x1c1c1c), 0, 0.28, 0.3));
    const fire = M(BOX(0.3, 0.2, 0.02), glow(palette.ember), 0, 0.24, 0.32);
    fire.castShadow = false; g.add(fire);
    // ตะแกรง + ฟืนในช่อง
    g.add(M(BOX(0.32, 0.02, 0.1), std(0x111111), 0, 0.12, 0.32));
    // ปล่อง + หมวก
    g.add(M(BOX(0.3, 0.45, 0.3), std(palette.stone, [palette.stoneDark]), 0, 1.18, -0.1));
    g.add(M(BOX(0.38, 0.07, 0.38), std(palette.stoneDark), 0, 1.43, -0.1));
    const l = new THREE.PointLight(0xff7a2a, 0.8, 3.5, 2); l.position.set(0, 0.5, 0.6); g.add(l);
    g.userData.update = (t) => { l.intensity = 0.7 + Math.sin(t * 9) * 0.15; fire.material = glow(Math.sin(t * 8) > 0 ? palette.ember : 0xf2c14e); };
    return g;
  },
  cooking_pot: () => {
    const g = new THREE.Group();
    // tripod 3 ขามัดรวมยอด (real tripod)
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const p = M(CYL(0.025, 0.03, 1.1, 5), std(palette.trunk), Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3);
      p.rotation.z = -Math.cos(a) * 0.35; p.rotation.x = Math.sin(a) * 0.35;
      g.add(p);
    }
    g.add(M(BOX(0.08, 0.06, 0.08), std(palette.rope), 0, 0.95, 0)); // เชือกมัดยอด
    g.add(M(CYL(0.01, 0.01, 0.3, 4), std(0x222222), 0, 0.8, 0)); // โซ่
    g.add(M(CYL(0.2, 0.17, 0.2, 9), std(0x2b2f34, [0x111417]), 0, 0.55, 0));
    g.add(M(CYL(0.215, 0.215, 0.03, 9), std(palette.iron, [palette.stoneDark]), 0, 0.66, 0));
    const stew = M(CYL(0.18, 0.18, 0.012, 9), glow(0xd98c4a), 0, 0.668, 0);
    stew.castShadow = false; g.add(stew);
    // ฟืนใต้หม้อ
    const f = M(BOX(0.3, 0.06, 0.12), std(palette.trunk), 0, 0.03, 0); g.add(f);
    return g;
  },
  tripod_pot: () => {
    // alias คุณภาพเดียวกัน (เรียก cooking_pot)
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const p = M(CYL(0.025, 0.03, 1.1, 5), std(palette.trunk), Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3);
      p.rotation.z = -Math.cos(a) * 0.35; p.rotation.x = Math.sin(a) * 0.35;
      g.add(p);
    }
    g.add(M(CYL(0.2, 0.17, 0.2, 9), std(0x2b2f34, [0x111417]), 0, 0.55, 0));
    return g;
  },
  spit_roast: () => {
    const g = new THREE.Group();
    // ง่าม 2 ข้าง + ไม้เสียบ + เนื้อ
    [[-0.45], [0.45]].forEach(([x]) => {
      g.add(M(BOX(0.05, 0.7, 0.05), std(palette.trunk), x, 0.35, 0));
      g.add(M(BOX(0.05, 0.05, 0.05), std(palette.trunk), x, 0.62, 0));
    });
    const spit = M(CYL(0.02, 0.02, 1.1, 6), std(palette.woodDark), 0, 0.6, 0);
    spit.rotation.z = Math.PI / 2; g.add(spit);
    const meat = M(BOX(0.3, 0.22, 0.22), std(0x8a4a3a, [0x5e3227]), 0, 0.6, 0);
    g.add(meat);
    g.add(M(BOX(0.32, 0.05, 0.05), std(0xd9a06a), 0, 0.48, 0));
    stoneRing(g, 6, 0.4);
    return g;
  },
  bucket: () => {
    const g = new THREE.Group();
    g.add(M(CYL(0.16, 0.12, 0.24, 9), std(palette.wood, [palette.woodDark]), 0, 0.12, 0));
    // ห่วงเหล็ก 2 เส้น
    const hoopM = std(palette.iron);
    const h1 = M(new THREE.TorusGeometry(0.15, 0.012, 5, 14), hoopM, 0, 0.2, 0);
    h1.rotation.x = Math.PI / 2; g.add(h1);
    const h2 = M(new THREE.TorusGeometry(0.125, 0.012, 5, 14), hoopM, 0, 0.05, 0);
    h2.rotation.x = Math.PI / 2; g.add(h2);
    g.add(M(CYL(0.165, 0.165, 0.03, 9), std(palette.iron), 0, 0.24, 0));
    const w = M(CYL(0.14, 0.14, 0.01, 9), glow(palette.teal), 0, 0.22, 0);
    w.castShadow = false; g.add(w);
    // หูหิ้ว
    const hd = M(new THREE.TorusGeometry(0.12, 0.01, 4, 10, Math.PI), hoopM, 0, 0.26, 0);
    g.add(hd);
    return g;
  },
};
