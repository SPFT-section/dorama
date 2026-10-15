/* shelter — อิงโครงสร้างจริง:
 * tent (A-frame): เสา A 2 ชุด + คานสัน + ผ้าใบ + เชือก guy + สมอบก + กราวด์ชีท + ประตู
 * tent_ridge: ridge เต็ม + ผนังเตี้ย + หน้าต่าง
 * tent_dome: โครงโค้งไขว้ 2 เส้น + ผ้า +  vestibule
 * shelter_tarp: ผ้าใบขึง + เสา + เชือก / hammock: ผ้าห้อย + เชือก + เสา
 * bedroll: แผ่นรอง + ถุงนอน + หมอน + สายรัด
 */
import * as THREE from 'three';
import { M, BOX, CYL, std, glow, palette } from './core.js';

function pegs(g, pts) {
  pts.forEach(([x, z]) => {
    g.add(M(CYL(0.015, 0.02, 0.12, 5), std(palette.woodDark), x, 0.06, z));
    // เชือก guy จากมุมเต็นท์ไปสมอ
  });
}
function guy(g, from, to) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const rope = M(CYL(0.008, 0.008, len, 4), std(palette.rope), 0, 0, 0);
  rope.position.copy(from).addScaledVector(dir, 0.5);
  rope.lookAt(to); rope.rotateX(Math.PI / 2);
  rope.castShadow = false; g.add(rope);
}

export const shelterBuilders = {
  tent: () => {
    const g = new THREE.Group();
    const canvasM = std(palette.canvas, [palette.canvasDark]);
    // ผ้าใบ A-frame: สองแผ่นเอียง + สัน
    const shape = new THREE.Shape([new THREE.Vector2(-0.55, 0), new THREE.Vector2(0.55, 0), new THREE.Vector2(0, 0.85)]);
    const prism = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: false });
    prism.translate(0, 0, -0.55);
    const t = new THREE.Mesh(prism, canvasM); t.castShadow = t.receiveShadow = true; t.rotation.y = Math.PI / 2; g.add(t);
    // ตะเข็บผ้า
    g.add(M(BOX(0.02, 0.8, 0.02), std(palette.canvasDark), 0, 0.42, 0));
    // โครง A หน้า-หลัง + คานสัน
    const poleM = std(palette.trunk);
    [[0.55], [-0.55]].forEach(([z]) => {
      const l1 = M(CYL(0.025, 0.03, 1.0, 5), poleM, -0.25, 0.45, z); l1.rotation.z = 0.5; g.add(l1);
      const l2 = M(CYL(0.025, 0.03, 1.0, 5), poleM, 0.25, 0.45, z); l2.rotation.z = -0.5; g.add(l2);
    });
    g.add(M(CYL(0.03, 0.03, 1.25, 6), poleM, 0, 0.86, 0));
    g.children[g.children.length - 1].rotation.x = Math.PI / 2;
    // ประตูหลังมืด + ประตูหน้าม้วน
    const dark = std(palette.canvasDark);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.17, 0), new THREE.Vector2(0.17, 0), new THREE.Vector2(0, 0.48)]), { depth: 0.04, bevelEnabled: false }), dark);
    back.position.set(-0.56, 0, 0); back.rotation.y = Math.PI / 2; back.castShadow = true; g.add(back);
    g.add(M(BOX(0.3, 0.25, 0.04), std(0x6b4a3a), 0.56, 0.25, 0)); // ผ้าม้วนประตูหน้า
    // กราวด์ชีท + สมอบก + เชือก
    g.add(M(BOX(1.15, 0.02, 1.2), std(0x3a3f45), 0, 0.01, 0));
    pegs(g, [[0.8, 0.7], [0.8, -0.7], [-0.8, 0.7], [-0.8, -0.7]]);
    guy(g, new THREE.Vector3(0, 0.85, 0.55), new THREE.Vector3(0.8, 0.05, 0.7));
    guy(g, new THREE.Vector3(0, 0.85, -0.55), new THREE.Vector3(0.8, 0.05, -0.7));
    return g;
  },
  tent_ridge: () => {
    const g = new THREE.Group();
    const canvasM = std(palette.canvas, [palette.canvasDark]);
    // ผนังเตี้ย 0.3 + หลังคาชัน
    g.add(M(BOX(1.2, 0.3, 1.4), canvasM, 0, 0.15, 0));
    const roofL = M(BOX(0.85, 0.04, 1.45), canvasM, -0.32, 0.62, 0); roofL.rotation.z = 0.6; g.add(roofL);
    const roofR = M(BOX(0.85, 0.04, 1.45), canvasM, 0.32, 0.62, 0); roofR.rotation.z = -0.6; g.add(roofR);
    g.add(M(CYL(0.03, 0.03, 1.5, 6), std(palette.trunk), 0, 0.88, 0));
    g.children[g.children.length - 1].rotation.x = Math.PI / 2;
    // เสา A + ประตู + หน้าต่างตาข่าย
    [[0.7], [-0.7]].forEach(([z]) => {
      const a = M(CYL(0.025, 0.03, 1.0, 5), std(palette.trunk), -0.25, 0.45, z); a.rotation.z = 0.5; g.add(a);
      const b = M(CYL(0.025, 0.03, 1.0, 5), std(palette.trunk), 0.25, 0.45, z); b.rotation.z = -0.5; g.add(b);
    });
    g.add(M(BOX(0.4, 0.5, 0.03), std(palette.canvasDark), 0, 0.35, 0.71));
    const win = M(BOX(0.3, 0.2, 0.02), glow(0xbfd4ff), -0.3, 0.2, 0.71); win.castShadow = false; g.add(win);
    pegs(g, [[0.9, 0.9], [0.9, -0.9], [-0.9, 0.9], [-0.9, -0.9]]);
    return g;
  },
  tent_dome: () => {
    const g = new THREE.Group();
    const fabM = std(0x4a7a8a, [0x2e4a55]);
    // ตัวโดม (ครึ่งทรงกลมตัด)
    const dome = M(new THREE.SphereGeometry(0.75, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), fabM, 0, 0, 0);
    dome.scale.set(1, 0.85, 1.15); g.add(dome);
    // โครงโค้งไขว้ 2 เส้น
    const poleM = std(0xd0d0d0);
    const arc1 = M(new THREE.TorusGeometry(0.78, 0.02, 5, 16, Math.PI), poleM, 0, 0.02, 0);
    g.add(arc1);
    const arc2 = M(new THREE.TorusGeometry(0.78, 0.02, 5, 16, Math.PI), poleM, 0, 0.02, 0);
    arc2.rotation.y = Math.PI / 2; g.add(arc2);
    // ประตู + vestibule
    g.add(M(BOX(0.4, 0.5, 0.06), std(palette.canvasDark), 0, 0.3, 0.82));
    g.add(M(BOX(0.5, 0.02, 0.4), std(0x3a3f45), 0, 0.01, 1.0));
    pegs(g, [[0.9, 0.9], [-0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]]);
    return g;
  },
  shelter_tarp: () => {
    const g = new THREE.Group();
    // เสา 2 ต้น + ผ้าใบขึงเอียง
    g.add(M(CYL(0.03, 0.035, 1.4, 6), std(palette.trunk), -0.6, 0.7, 0));
    g.add(M(CYL(0.03, 0.035, 1.0, 6), std(palette.trunk), 0.6, 0.5, 0));
    const tarp = M(BOX(1.5, 0.03, 1.2), std(palette.canvas, [palette.canvasDark]), 0, 1.15, 0);
    tarp.rotation.z = 0.25; g.add(tarp);
    pegs(g, [[1.0, 0.6], [1.0, -0.6], [-1.0, 0.6], [-1.0, -0.6]]);
    guy(g, new THREE.Vector3(-0.6, 1.3, 0), new THREE.Vector3(-1.0, 0.05, 0.6));
    guy(g, new THREE.Vector3(0.6, 0.95, 0), new THREE.Vector3(1.0, 0.05, -0.6));
    g.add(M(BOX(1.0, 0.04, 0.8), std(0x3f6b5a), 0, 0.02, 0)); // กราวด์ชีท
    return g;
  },
  hammock: () => {
    const g = new THREE.Group();
    // เสา 2 ต้น
    g.add(M(CYL(0.05, 0.06, 1.4, 7), std(palette.trunk), -0.9, 0.7, 0));
    g.add(M(CYL(0.05, 0.06, 1.4, 7), std(palette.trunk), 0.9, 0.7, 0));
    // ผ้าห้อยโค้ง (3 แผ่นต่อกันให้โค้ง)
    const fab = std(0x8a4a3a, [0x5e3227]);
    const m1 = M(BOX(0.6, 0.04, 0.5), fab, -0.35, 0.65, 0); m1.rotation.z = -0.3; g.add(m1);
    const m2 = M(BOX(0.6, 0.04, 0.5), fab, 0, 0.55, 0); g.add(m2);
    const m3 = M(BOX(0.6, 0.04, 0.5), fab, 0.35, 0.65, 0); m3.rotation.z = 0.3; g.add(m3);
    // เชือก
    guy(g, new THREE.Vector3(-0.9, 1.2, 0), new THREE.Vector3(-0.6, 0.65, 0));
    guy(g, new THREE.Vector3(0.9, 1.2, 0), new THREE.Vector3(0.6, 0.65, 0));
    return g;
  },
  bedroll: () => {
    const g = new THREE.Group();
    g.add(M(BOX(0.55, 0.08, 0.95), std(0x3f6b5a, [0x2c4a3e]), 0, 0.04, 0)); // แผ่นรอง
    g.add(M(BOX(0.5, 0.1, 0.55), std(0x8a4a3a, [0x5e3227]), 0, 0.08, 0.18)); // ถุงนอนพับ
    g.add(M(BOX(0.38, 0.1, 0.2), std(palette.bone, [0xc9bda0]), 0, 0.1, -0.32)); // หมอน
    // สายรัด 2 เส้น
    g.add(M(BOX(0.56, 0.085, 0.04), std(0x2e2620), 0, 0.08, 0.1));
    g.add(M(BOX(0.56, 0.085, 0.04), std(0x2e2620), 0, 0.08, 0.3));
    return g;
  },
};
