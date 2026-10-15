/* FORGE vehicles — อิงขนาดจริง (ม.):
 * car 4.5×1.8×1.5 วีลเบส ~2.7 / SUV สูงกว่า / truck หัว+กระบะ 6 ล้อ
 * bike: เฟรม+เบาะ+แฮนด์+2 ล้อ / boat: ท้อง+หัวแหลม+ห้องโดยสาร
 * ล้อ: ยาง + กระทะ + ดุม, ไฟหน้า/ท้าย, กระจกเอียง
 */
import * as THREE from 'three';
import { M, BOX, CYL, SPH, getMat } from './core.js';
let count = 0;

function buildWheel(g, r, w) {
  const tire = M(CYL(r, r, w, 16), getMat('rubber'), 0, 0, 0);
  tire.rotation.x = Math.PI / 2; g.add(tire);
  const rim = M(CYL(r * 0.55, r * 0.55, w + 0.02, 10), getMat('metal'), 0, 0, 0);
  rim.rotation.x = Math.PI / 2; g.add(rim);
  const hub = M(CYL(r * 0.15, r * 0.15, w + 0.04, 8), getMat('metal'), 0, 0, 0);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  return g;
}

export function buildVehicle(type, L, W, H, wheelR, colorHex) {
  const g = new THREE.Group();
  g.name = 'Vehicle_' + type + '_' + (++count);
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: .35, metalness: .35 });
  const glassMat = getMat('glass');
  const darkM = getMat('rubber');

  const addWheels = (positions) => {
    positions.forEach(([x, z]) => {
      const wg = new THREE.Group();
      buildWheel(wg, wheelR, 0.2);
      wg.position.set(x, wheelR, z); // จุดศูนย์ล้อ = wheelR → ยางแตะพื้น y=0
      g.add(wg);
    });
  };
  const headlight = (x, z) => {
    const h = M(BOX(0.08, 0.1, 0.12), getMat('emissive', { emissive: 0xfff2c0, emissiveIntensity: 1.2 }), x, 0.55, z);
    h.castShadow = false; g.add(h);
  };

  if (type === 'bike') {
    // เฟรมสามเหลี่ยม + โช้ค + เบาะ + แฮนด์
    g.add(M(BOX(L * 0.55, 0.08, 0.06), bodyMat, 0, H * 0.55, 0));
    const fork = M(CYL(0.025, 0.025, 0.6, 6), getMat('metal'), L * 0.32, H * 0.55, 0);
    fork.rotation.z = -0.4; g.add(fork);
    g.add(M(BOX(L * 0.28, 0.08, 0.22), bodyMat, -L * 0.15, H * 0.78, 0)); // เบาะ
    g.add(M(BOX(0.06, 0.06, W * 0.8), getMat('metal'), L * 0.38, H * 0.95, 0)); // แฮนด์
    [[L * 0.38], [-L * 0.38]].forEach(([x]) => {
      const wg = new THREE.Group(); buildWheel(wg, wheelR, 0.08);
      wg.position.set(x, wheelR, 0); g.add(wg);
    });
  } else if (type === 'boat') {
    const hull = M(BOX(L, H * 0.45, W), bodyMat, 0, H * 0.28, 0); g.add(hull);
    const bow = M(CYL(0.01, W * 0.5, L * 0.18, 4), bodyMat, L / 2 + L * 0.08, H * 0.28, 0);
    bow.rotation.z = -Math.PI / 2; bow.rotation.y = Math.PI / 4; g.add(bow);
    g.add(M(BOX(L * 0.4, H * 0.4, W * 0.7), bodyMat, -L * 0.1, H * 0.7, 0)); // ห้อง
    g.add(M(BOX(L * 0.3, H * 0.25, W * 0.6), glassMat, -L * 0.1, H * 0.72, 0));
    g.add(M(BOX(0.06, 0.3, 0.06), getMat('wood'), -L * 0.35, H * 0.9, 0)); // เสา
  } else if (type === 'truck') {
    g.add(M(BOX(L * 0.28, H * 0.9, W), bodyMat, L * 0.32, H * 0.5 + wheelR, 0)); // หัวเก๋ง
    g.add(M(BOX(L * 0.28, H * 0.4, W * 0.9), glassMat, L * 0.32, H * 0.75 + wheelR, 0.02));
    g.add(M(BOX(L * 0.62, H * 0.8, W), bodyMat, -L * 0.16, H * 0.42 + wheelR, 0)); // ตู้บรรทุก
    // กันชน + ไฟ
    g.add(M(BOX(0.15, 0.18, W + 0.05), darkM, L * 0.5, 0.35, 0));
    headlight(L * 0.47, -W * 0.3); headlight(L * 0.47, W * 0.3);
    // รอยล้อ = ความกว้างรถ (ขอบยางนอกเสมอกับตัวถัง)
    const tz = W / 2 - 0.11;
    addWheels([[L * 0.32, -tz], [L * 0.32, tz], [-L * 0.28, -tz], [-L * 0.28, tz], [-L * 0.48, -tz], [-L * 0.48, tz]]);
  } else {
    // car / suv: ตัวถัง + ห้องโดยสารลาด + กระจก + ไฟ
    const bodyH = type === 'suv' ? H * 0.68 : H * 0.5;
    g.add(M(BOX(L, bodyH, W), bodyMat, 0, bodyH * 0.55 + wheelR * 0.5, 0));
    const cabH = bodyH * 0.72;
    g.add(M(BOX(L * 0.52, cabH, W * 0.84), bodyMat, -L * 0.04, bodyH + cabH * 0.5 + wheelR * 0.5, 0));
    // กระจกเอียง 30° จากแนวดิ่ง (0.5 rad) ตามรถเก๋งจริง
    const ws = M(BOX(0.06, cabH * 0.75, W * 0.78), glassMat, L * 0.23, bodyH + cabH * 0.5 + wheelR * 0.5, 0);
    ws.rotation.z = -0.5; g.add(ws);
    const rw = M(BOX(0.06, cabH * 0.7, W * 0.78), glassMat, -L * 0.3, bodyH + cabH * 0.5 + wheelR * 0.5, 0);
    rw.rotation.z = 0.5; g.add(rw);
    headlight(L * 0.5, -W * 0.32); headlight(L * 0.5, W * 0.32);
    g.add(M(BOX(0.06, 0.08, W * 0.7), getMat('emissive', { emissive: 0xff2222, emissiveIntensity: 1 }), -L * 0.5, 0.6, 0));
    const cz = W / 2 - 0.11;
    addWheels([[L * 0.32, -cz], [L * 0.32, cz], [-L * 0.32, -cz], [-L * 0.32, cz]]);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.assetType = 'vehicle';
  return g;
}
