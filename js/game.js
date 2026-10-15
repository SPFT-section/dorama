/* Campfire Diorama — survival game
 * Craft. Farm. Survive. | Pixel-Diorama 2.5D | Three.js
 */
import * as THREE from 'three';
import { create, createSurvivor, buildTool, TILE_H, std, palette } from './campfire-assets.js';

const $ = (id) => document.getElementById(id);
const loadV = $('loadV'), loadT = $('loadT');
const setLoad = (p, t) => { loadV.style.width = (p * 100) + '%'; if (t) loadT.textContent = t; };
const nextFrame = () => new Promise(r => requestAnimationFrame(r));

/* ---------------- audio (tiny synth, no assets) ---------------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } return AC; }
function beep(f = 440, d = 0.08, type = 'square', v = 0.12, slide = 0) {
  try {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, c.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), c.currentTime + d);
    g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + d);
  } catch {}
}
const sfx = {
  chop: () => beep(170, .09, 'square', .14, -60),
  mine: () => beep(240, .07, 'square', .12, -80),
  pickup: () => beep(660, .09, 'sine', .12, 220),
  eat: () => { beep(300, .1, 'triangle', .14); setTimeout(() => beep(380, .1, 'triangle', .12), 110); },
  hurt: () => beep(110, .2, 'sawtooth', .16, -40),
  craft: () => { beep(440, .08, 'square', .1); setTimeout(() => beep(880, .12, 'square', .1), 100); },
  plant: () => beep(520, .08, 'sine', .1, 100),
  splash: () => beep(300, .15, 'sine', .12, -150),
  win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .18, 'square', .1), i * 140)),
  die: () => [400, 300, 200, 120].forEach((f, i) => setTimeout(() => beep(f, .2, 'sawtooth', .12), i * 160)),
};

/* ---------------- state ---------------- */
const SIZE = 22;
const S = {
  started: false, over: false, win: false,
  day: 1, dayTime: 0.32, CYCLE: 180,
  hp: 100, st: 100, hu: 100, wa: 100, fuel: 100,
  inv: { wood: 3, stone: 2, berries: 2, mushroom: 1, meat: 0, fish: 0, seeds: 2, copper: 0, iron: 0, crystal: 0 },
  tools: { axe: true, sword: true, pick: false, hoe: false, rod: false, sword2: false },
  gear: { lantern: false, pot: false, bucket: false, tent: false, torches: 0 },
  equip: 'sword', kills: 0, built: 0,
};
const EMOJI = { wood: '🪵', stone: '🪨', berries: '🫐', mushroom: '🍄', meat: '🍖', fish: '🐟', seeds: '🌱', copper: '🟠', iron: '⚙️', crystal: '💎' };
const NAMES = { wood: 'ไม้', stone: 'หิน', berries: 'เบอร์รี่', mushroom: 'เห็ด', meat: 'เนื้อ', fish: 'ปลา', seeds: 'เมล็ด', copper: 'ทองแดง', iron: 'เหล็ก', crystal: 'คริสตัล' };

/* ---------------- three setup ---------------- */
const canvas = $('scene');
let renderer;
try {
  // antialias off: pixelated look doesn't need MSAA; big fill-rate saving
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
} catch (err) {
  console.error(err);
  setLoad(1, 'เบราว์เซอร์นี้สร้าง WebGL ไม่ได้ 😢 ลองใช้ Chrome/Edge/Firefox เวอร์ชันใหม่ แล้วเปิดใช้งาน hardware acceleration');
  throw err;
}
const qSteps = [1.5, 1.15, 1.0];
let qStep = (devicePixelRatio || 1) > 1.3 ? 0 : ((devicePixelRatio || 1) > 1.05 ? 1 : 2);
renderer.setPixelRatio(qSteps[qStep]);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.shadowMap.autoUpdate = false; // refreshed manually every 2nd frame (see loop)
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1720);
scene.fog = new THREE.Fog(0x0f1720, 18, 46);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
const CAM_OFF = new THREE.Vector3(7.5, 9.5, 7.5);

const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x2a2118, 0.7); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d9, 1.6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
scene.add(sun); scene.add(sun.target);
const moon = new THREE.DirectionalLight(0x4c9aff, 0.0); moon.position.set(-8, 12, -6); scene.add(moon);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------------- world ---------------- */
const world = new THREE.Group(); scene.add(world);
const grid = []; // grid[j][i] = type string
const interact = []; // {kind,mesh,x,z,r,hp,max,data,dead}
const enemies = [];
const plots = [];
const updatables = [];
const solids = []; // {x,z,r}
const crystalLights = []; // {li,x,z} — toggled by distance, see update()
let fireMesh, fireLightPos = new THREE.Vector3();
const tilePos = (i, j) => ({ x: (i - SIZE / 2 + 0.5), z: (j - SIZE / 2 + 0.5) });

function tileColor(t) {
  return { grass: '#5F7A4A', dirt: '#7a5a38', sand: '#d9c28a', stone: '#8a8f96', snow: '#eef2f5', water: '#2e6f73' }[t] || '#5F7A4A';
}
function isWater(i, j) { return grid[j] && grid[j][i] === 'water'; }

function addInteract(kind, mesh, x, z, r = 0.5, hp = 3) {
  mesh.position.x = x; mesh.position.z = z;
  world.add(mesh);
  if (mesh.userData.update) updatables.push(mesh);
  const o = { kind, mesh, x, z, r, hp, max: hp, dead: false, data: {} };
  interact.push(o); solids.push(o);
  return o;
}

async function buildWorld() {
  // biome grid
  for (let j = 0; j < SIZE; j++) {
    grid[j] = [];
    for (let i = 0; i < SIZE; i++) {
      const dx = i - SIZE / 2, dz = j - SIZE / 2, d = Math.hypot(dx, dz);
      let t = 'grass';
      const n = Math.sin(i * 0.7) * Math.cos(j * 0.6) + Math.sin((i + j) * 0.3);
      if (d > 8.5 && j < 5) t = 'snow';
      else if (i > SIZE - 6 && j > SIZE - 7) t = 'water';
      else if (Math.hypot(i - (SIZE - 5), j - (SIZE - 5)) < 2.6) t = 'sand';
      else if (n > 1.2) t = 'dirt';
      else if (n < -1.3) t = 'stone';
      if (d < 3.2) t = (i + j) % 2 ? 'grass' : 'dirt';
      grid[j][i] = t;
    }
  }
  setLoad(0.15, 'ปูพื้นไดโอรามา…'); await nextFrame();
  // ---- instanced ground: bases + tops + tufts in a handful of draw calls ----
  // (per-tile meshes would be ~1500 draw calls; pixel pattern lives in the texture)
  {
    const dummy = new THREE.Object3D();
    const waters = [];
    const byType = {};
    for (let j = 0; j < SIZE; j++) for (let i = 0; i < SIZE; i++) {
      const t = grid[j][i];
      if (t === 'water') { waters.push([i, j]); continue; }
      (byType[t] = byType[t] || []).push([i, j]);
    }
    const base = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.62, 1), std(palette.dirtDark), SIZE * SIZE - waters.length);
    base.receiveShadow = true; base.frustumCulled = false;
    let bi = 0;
    const topGeo = new THREE.BoxGeometry(1, 0.18, 1);
    const topMatFor = {
      grass: [palette.grass, [palette.grassDark, palette.leafLight]],
      dirt: [palette.dirt, [palette.dirtDark, palette.woodDark]],
      sand: [palette.sand, [palette.sandDark, 0xffffff]],
      stone: [palette.stone, [palette.stoneDark, 0xffffff]],
      snow: [palette.snow, [palette.snowDark, 0xffffff]],
    };
    const tuftSpots = [];
    for (const t of Object.keys(byType)) {
      const cells = byType[t];
      const top = new THREE.InstancedMesh(topGeo, std(topMatFor[t][0], topMatFor[t][1]), cells.length);
      top.receiveShadow = true; top.frustumCulled = false;
      cells.forEach(([i, j], k) => {
        const p = tilePos(i, j);
        dummy.position.set(p.x, 0.31, p.z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
        base.setMatrixAt(bi++, dummy.matrix);
        dummy.position.set(p.x, 0.71, p.z); dummy.updateMatrix();
        top.setMatrixAt(k, dummy.matrix);
        if (t === 'grass') tuftSpots.push(p);
      });
      top.instanceMatrix.needsUpdate = true;
      world.add(top);
    }
    base.instanceMatrix.needsUpdate = true;
    world.add(base);
    if (tuftSpots.length) {
      const tufts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.12, 0.06), std(palette.mossDark), tuftSpots.length * 4);
      tufts.frustumCulled = false;
      const offs = [[0.3, 0.3], [-0.3, 0.2], [0.1, -0.3], [-0.2, -0.25]];
      let q = 0;
      for (const p of tuftSpots) for (const [ox, oz] of offs) {
        dummy.position.set(p.x + ox, 0.86, p.z + oz); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        tufts.setMatrixAt(q++, dummy.matrix);
      }
      tufts.instanceMatrix.needsUpdate = true;
      world.add(tufts);
    }
    for (const [i, j] of waters) {
      const m = create('tile_water');
      const p = tilePos(i, j);
      m.position.set(p.x, 0, p.z);
      world.add(m);
      if (m.userData.update) updatables.push(m);
    }
  }
  // ground plane under (void safety)
  const gp = new THREE.Mesh(new THREE.BoxGeometry(SIZE + 4, 0.5, SIZE + 4),
    new THREE.MeshStandardMaterial({ color: 0x141a16, roughness: 1 }));
  gp.position.y = -0.3; gp.receiveShadow = true; world.add(gp);

  setLoad(0.35, 'สร้างค่าย…'); await nextFrame();
  // ---- camp at center ----
  const C = 0;
  fireMesh = create('campfire'); fireMesh.position.set(C, TILE_H, C);
  world.add(fireMesh); updatables.push(fireMesh);
  fireLightPos.set(C, TILE_H + 1, C);
  const tent = create('tent'); tent.position.set(-2.5, TILE_H, -1.5); tent.rotation.y = 0.5; world.add(tent);
  const wb = create('workbench'); wb.position.set(2.4, TILE_H, -1.2); wb.rotation.y = -0.4; world.add(wb);
  interact.push({ kind: 'workbench', mesh: wb, x: 2.4, z: -1.2, r: 0.9, hp: 1e9, max: 1e9, dead: false, data: {} }); solids.push(interact[interact.length - 1]);
  const fu = create('furnace'); fu.position.set(2.6, TILE_H, 1.6); fu.rotation.y = -Math.PI / 2; world.add(fu);
  if (fu.userData.update) updatables.push(fu);
  interact.push({ kind: 'furnace', mesh: fu, x: 2.6, z: 1.6, r: 0.9, hp: 1e9, max: 1e9, dead: false, data: {} }); solids.push(interact[interact.length - 1]);
  const ch = create('chest'); ch.position.set(-2.4, TILE_H, 1.8); world.add(ch);
  addInteract('chest', ch, -2.4, 1.8, 0.7, 1).data.loot = true;
  const t1 = create('torch'); t1.position.set(1.2, TILE_H, 1.2); world.add(t1); updatables.push(t1);
  const t2 = create('torch'); t2.position.set(-1.2, TILE_H, -1.2); world.add(t2); updatables.push(t2);
  const la = create('lantern'); la.position.set(0.9, TILE_H, -2.2); world.add(la); updatables.push(la);
  const pot = create('cooking_pot'); pot.position.set(-0.9, TILE_H, 0.9); world.add(pot);
  const bed = create('bedroll'); bed.position.set(-2.5, TILE_H, -0.2); bed.rotation.y = 0.3; world.add(bed);
  interact.push({ kind: 'bedroll', mesh: bed, x: -2.5, z: -0.2, r: 0.9, hp: 1e9, max: 1e9, dead: false, data: {} }); solids.push(interact[interact.length - 1]);
  const sc = create('scarecrow'); sc.position.set(4.6, TILE_H, -3.4); world.add(sc);
  const sign = create('signpost'); sign.position.set(1.8, TILE_H, 3.2); world.add(sign);
  // fences ring (decor, partial)
  [[-4, 0], [-4, 1], [4, 0], [4, 1], [0, -4], [1, -4]].forEach(([x, z]) => {
    const f = create('fence'); f.position.set(x, TILE_H, z); world.add(f);
  });
  // farm plots
  [[4.2, 2.6, 0], [5.4, 2.6, 1], [4.2, 3.8, 0], [5.4, 3.8, 0]].forEach(([x, z]) => {
    const p = create('plot'); p.position.set(x, TILE_H, z); world.add(p);
    plots.push({ mesh: p, x, z, state: 0, timer: 0, crop: null });
    solids.push({ x, z, r: 0.6 });
  });

  setLoad(0.55, 'ปลูกป่า…'); await nextFrame();
  // ---- nature scatter ----
  let placed = 0;
  for (let j = 0; j < SIZE && placed < 240; j++) for (let i = 0; i < SIZE; i++) {
    const p = tilePos(i, j);
    const d = Math.hypot(p.x, p.z);
    if (d < 4) continue;
    if (grid[j][i] === 'water') continue;
    const r = Math.random();
    if (r > 0.42) continue;
    const t = grid[j][i];
    let kind = null;
    if (t === 'snow') kind = r < 0.2 ? 'pine_snow' : (r < 0.3 ? 'rock' : null);
    else if (t === 'sand') kind = r < 0.12 ? 'rock' : (r < 0.2 ? 'bush' : null);
    else if (t === 'stone') kind = r < 0.16 ? 'rock' : r < 0.24 ? 'ore_iron' : r < 0.3 ? 'ore_copper' : null;
    else kind = r < 0.14 ? 'pine' : r < 0.22 ? 'oak' : r < 0.29 ? 'bush_berry' : r < 0.33 ? 'rock' : r < 0.355 ? 'ore_copper' : r < 0.375 ? 'mushroom' : r < 0.395 ? 'log_pile' : r < 0.41 ? 'stump' : null;
    if (!kind) continue;
    if (Math.random() < 0.06 && t !== 'snow') kind = 'ore_crystal';
    const m = create(kind);
    m.rotation.y = Math.floor(Math.random() * 4) * Math.PI / 2 + (Math.random() - 0.5) * 0.2;
    const jx = (Math.random() - 0.5) * 0.4, jz = (Math.random() - 0.5) * 0.4;
    m.position.set(p.x + jx, TILE_H, p.z + jz);
    let hp = 3;
    if (kind.startsWith('ore') || kind === 'rock') hp = 4;
    if (kind === 'bush_berry' || kind === 'bush' || kind === 'mushroom' || kind === 'log_pile' || kind === 'stump') hp = 1;
    if (kind === 'log_pile' || kind === 'stump') { addInteract(kind, m, p.x + jx, p.z + jz, 0.45, 1); placed++; continue; }
    addInteract(kind, m, p.x + jx, p.z + jz, kind === 'pine' || kind === 'oak' ? 0.45 : 0.4, hp);
    if (kind === 'ore_crystal') { // lights are shader-expensive: only the near ones stay on
      const li = m.children.find(c => c.isPointLight);
      if (li) crystalLights.push({ li, x: p.x + jx, z: p.z + jz });
    }
    placed++;
  }
  // starter chickens
  for (let k = 0; k < 3; k++) spawnCreature('chicken', (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, true);
  setLoad(0.75, 'ปล่อยสัตว์…'); await nextFrame();
}

/* ---------------- player ---------------- */
const player = createSurvivor({ tool: 'sword', hat: 'straw' });
player.position.set(0, TILE_H, 2.5);
scene.add(player); updatables.push(player);
const playerLight = new THREE.PointLight(0xffc46b, 0, 6, 2); playerLight.position.set(0, 2, 0); player.add(playerLight);
let px = 0, pz = 2.5, vx = 0, vz = 0, face = 0;
let sliding = 0, slideCD = 0, atkCD = 0, hurtCD = 0;
const SPEED = 4.2;

function unlist(mesh) { const i = updatables.indexOf(mesh); if (i >= 0) updatables.splice(i, 1); }

function setToolVisual() {
  // swap the tool held in the survivor's right hand (no floating duplicate)
  const arm = player.userData.armR;
  if (arm) {
    if (player.userData.handTool) arm.remove(player.userData.handTool);
    const t = buildTool(S.equip === 'sword2' ? 'sword' : S.equip);
    t.position.set(0, -0.4, 0.1); t.rotation.x = 0.4;
    arm.add(t); player.userData.handTool = t;
  } else {
    // fallback for older survivor objects without arm refs
    if (player.userData.toolMesh) player.remove(player.userData.toolMesh);
    const t = buildTool(S.equip === 'sword2' ? 'sword' : S.equip);
    t.position.set(0.45, 0.7, 0.35); t.rotation.set(0.5, 0, -0.4); t.scale.setScalar(1.1);
    player.add(t); player.userData.toolMesh = t;
  }
}
setToolVisual();

/* particles (pixel boxes pool) */
const P_MAX = 120;
const pGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07);
const pMesh = new THREE.InstancedMesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), P_MAX);
pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pMesh.frustumCulled = false; scene.add(pMesh);
const parts = [];
function puff(x, y, z, color, n = 8, spd = 2.2, life = 0.6) {
  for (let i = 0; i < n; i++) {
    if (parts.length >= P_MAX) parts.shift();
    parts.push({ x, y, z, vx: (Math.random() - 0.5) * spd, vy: Math.random() * spd, vz: (Math.random() - 0.5) * spd, life: life * (0.6 + Math.random() * 0.6), color });
  }
}
const dummy = new THREE.Object3D(); const tmpC = new THREE.Color();
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 4 * dt;
    if (p.life <= 0) parts.splice(i, 1);
  }
  for (let i = 0; i < P_MAX; i++) {
    if (i < parts.length) { const p = parts[i]; dummy.position.set(p.x, p.y, p.z); dummy.scale.setScalar(Math.max(0.01, p.life * 2)); }
    else { dummy.position.set(0, -10, 0); dummy.scale.setScalar(0.001); }
    dummy.updateMatrix(); pMesh.setMatrixAt(i, dummy.matrix);
    if (i < parts.length) pMesh.setColorAt(i, tmpC.set(parts[i].color));
  }
  pMesh.instanceMatrix.needsUpdate = true; if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;
}

/* ---------------- creatures ---------------- */
function spawnCreature(kind, x, z, passive = false) {
  // never spawn inside the pond — mirror to the opposite shore
  const ti0 = Math.floor(x + SIZE / 2), tj0 = Math.floor(z + SIZE / 2);
  if (grid.length && isWater(ti0, tj0)) { x = -x; z = -z; }
  const mesh = create(kind);
  mesh.position.set(x, TILE_H, z);
  scene.add(mesh); updatables.push(mesh);
  const e = {
    kind, mesh, x, z, vx: 0, vz: 0,
    hp: kind === 'wolf' ? 35 : kind === 'slime' ? 20 : 10,
    dmg: kind === 'wolf' ? 14 : kind === 'slime' ? 8 : 0,
    speed: kind === 'wolf' ? 2.8 : kind === 'slime' ? 1.4 : 1.0,
    wander: Math.random() * 10, atkCD: 0, passive, hop: Math.random() * 10,
  };
  enemies.push(e); return e;
}

/* ---------------- input ---------------- */
const keys = {};
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
  if (!S.started || S.over) return;
  if (e.code === 'KeyE') doInteract();
  if (e.code === 'KeyJ') doAttack();
  if (e.code === 'Space') doSlide();
  if (e.code === 'KeyF') doEat();
  if (e.code === 'KeyC') toggle('craftPanel');
  if (e.code === 'KeyI' || e.code === 'Tab') { e.preventDefault(); toggle('invPanel'); }
  if (e.code.startsWith('Digit')) { const n = +e.code.slice(5); selectSlot(n - 1); }
});
addEventListener('keyup', (e) => keys[e.code] = false);
// joystick
const joy = $('joy'), stick = $('stick');
let joyDX = 0, joyDZ = 0, joyOn = false;
function joyPos(ev) {
  const r = joy.getBoundingClientRect();
  const cx = r.left + 60, cy = r.top + 60;
  const t = ev.touches ? ev.touches[0] : ev;
  let dx = (t.clientX - cx) / 45, dy = (t.clientY - cy) / 45;
  const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
  joyDX = dx; joyDZ = dy; stick.style.transform = `translate(${dx * 32}px,${dy * 32}px)`;
}
joy.addEventListener('touchstart', (e) => { joyOn = true; joyPos(e); }, { passive: true });
joy.addEventListener('touchmove', (e) => { joyPos(e); }, { passive: true });
joy.addEventListener('touchend', () => { joyOn = false; joyDX = joyDZ = 0; stick.style.transform = ''; });
$('mAct').onclick = () => doInteract();
$('mAtk').onclick = () => doAttack();
$('mSlide').onclick = () => doSlide();
$('bAtk').onclick = () => doAttack();
$('bEat').onclick = () => doEat();
$('bInv').onclick = () => toggle('invPanel');
$('bCraft').onclick = () => toggle('craftPanel');
document.querySelectorAll('[data-x]').forEach(b => b.onclick = () => $(b.dataset.x).classList.remove('open'));
function toggle(id) { $(id).classList.toggle('open'); if (id === 'invPanel') renderInv(); if (id === 'craftPanel') renderCraft(); }
// mouse attack toward click (desktop)
canvas.addEventListener('pointerdown', (e) => { if (S.started && !S.over && e.pointerType === 'mouse') doAttack(); });

/* ---------------- UI ---------------- */
function toast(msg, cls = '') {
  const d = document.createElement('div'); d.className = 'msg ' + cls; d.textContent = msg;
  $('toast').appendChild(d);
  setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 300); }, 2200);
}
function prompt(html) { const p = $('prompt'); if (!html) { p.style.display = 'none'; return; } p.innerHTML = html; p.style.display = 'block'; }

const HOT = [
  { id: 'axe', e: '🪓', n: 'ขวาน' }, { id: 'pick', e: '⛏️', n: 'พลั่วขุด' },
  { id: 'sword', e: '🗡️', n: 'ดาบ' }, { id: 'hoe', e: '⛏', n: 'จอบ' },
  { id: 'rod', e: '🎣', n: 'เบ็ด' }, { id: 'sword2', e: '⚔️', n: 'ดาบเหล็ก' },
];
function renderHot() {
  const h = $('hotbar'); h.innerHTML = '';
  HOT.forEach((s, i) => {
    const owned = S.tools[s.id];
    const d = document.createElement('div');
    d.className = 'slot' + (S.equip === s.id ? ' sel' : '');
    d.innerHTML = `<span class="k">${i + 1}</span><span class="e" style="${owned ? '' : 'filter:grayscale(1);opacity:.35'}">${s.e}</span><span class="n">${s.n}</span>`;
    d.title = owned ? s.n + ' (พร้อมใช้)' : s.n + ' (ต้องคราฟต์)';
    d.onclick = () => selectSlot(i);
    h.appendChild(d);
  });
}
function selectSlot(i) {
  const s = HOT[i]; if (!s || !S.tools[s.id]) { toast('ยังไม่มีเครื่องมือนี้ — เปิดคราฟต์ (C)', 'warn'); return; }
  S.equip = s.id; setToolVisual(); renderHot(); beep(500, .06, 'square', .08);
}
function renderInv() {
  const g = $('invGrid'); g.innerHTML = '';
  Object.keys(S.inv).forEach(k => {
    const d = document.createElement('div'); d.className = 'invitem';
    d.innerHTML = `<div class="e">${EMOJI[k]}</div><div>${NAMES[k]}</div><b>×${S.inv[k]}</b>`;
    d.onclick = () => { if (['berries', 'mushroom', 'meat', 'fish'].includes(k)) eatItem(k); };
    g.appendChild(d);
  });
  const t = document.createElement('div'); t.className = 'invitem';
  t.innerHTML = `<div class="e">🔦</div><div>ตะเกียง ${S.gear.lantern ? '✅' : '❌'}</div><div style="font-size:11px">หม้อ:${S.gear.pot ? '✅' : '❌'} ถัง:${S.gear.bucket ? '✅' : '❌'}</div>`;
  g.appendChild(t);
}
const RECIPES = [
  { id: 'pick', n: '⛏️ พลั่วขุด', d: 'ขุดหิน/แร่แรง ×2', cost: { wood: 3, stone: 2 }, go: () => S.tools.pick = true },
  { id: 'hoe', n: '🌱 จอบ', d: 'พรวนดินในแปลงฟาร์ม', cost: { wood: 2, stone: 2 }, go: () => S.tools.hoe = true },
  { id: 'rod', n: '🎣 เบ็ดตกปลา', d: 'ตกปลาใกล้สระน้ำ (E)', cost: { wood: 3 }, go: () => S.tools.rod = true },
  { id: 'sword2', n: '⚔️ ดาบเหล็ก', d: 'โจมตี 18 (จาก 10)', cost: { wood: 2, stone: 2, iron: 2 }, go: () => S.tools.sword2 = true },
  { id: 'torch', n: '🔥 คบไฟพกพา', d: '+คบไฟปักพื้น 1 อัน (อบอุ่น)', cost: { wood: 2 }, go: () => placeTorch() },
  { id: 'lantern', n: '🏮 ตะเกียง', d: 'แสงติดตัว +อุ่นเล็กน้อย', cost: { stone: 4, crystal: 1 }, go: () => S.gear.lantern = true },
  { id: 'bucket', n: '🪣 ถังน้ำ', d: 'ผักโตไว ×2', cost: { iron: 3 }, go: () => S.gear.bucket = true },
  { id: 'pot', n: '🍲 หม้อต้ม', d: 'อาหารฟื้นหิว ×2', cost: { iron: 5 }, go: () => S.gear.pot = true },
  { id: 'bandage', n: '🩹 ผ้าพันแผล', d: 'ฮีล HP +40 ทันที', cost: { mushroom: 2, berries: 1 }, go: () => { S.hp = Math.min(100, S.hp + 40); } },
  { id: 'bedkit', n: '⛺ เต็นท์ซ่อม', d: 'หนาวลดครึ่งนึง + HP รีเจน', cost: { wood: 8, stone: 4 }, go: () => S.gear.tent = true },
];
function canPay(c) { return Object.entries(c).every(([k, v]) => (S.inv[k] || 0) >= v); }
function pay(c) { Object.entries(c).forEach(([k, v]) => S.inv[k] -= v); }
function renderCraft() {
  const l = $('craftList'); l.innerHTML = '';
  RECIPES.forEach(r => {
    const ok = canPay(r.cost) && !(r.id === 'pick' && S.tools.pick) && !(r.id === 'hoe' && S.tools.hoe) && !(r.id === 'rod' && S.tools.rod) && !(r.id === 'sword2' && S.tools.sword2) && !(r.id === 'lantern' && S.gear.lantern) && !(r.id === 'bucket' && S.gear.bucket) && !(r.id === 'pot' && S.gear.pot) && !(r.id === 'bedkit' && S.gear.tent);
    const cost = Object.entries(r.cost).map(([k, v]) => `${EMOJI[k]}${v}`).join(' ');
    const d = document.createElement('div'); d.className = 'recipe' + (ok ? ' can' : '');
    d.innerHTML = `<h4>${r.n}</h4><p>${r.d}</p><p>ต้นทุน: ${cost}</p>`;
    const b = document.createElement('button'); b.textContent = 'คราฟต์'; b.disabled = !ok;
    b.onclick = () => { pay(r.cost); r.go(); sfx.craft(); S.built++; puff(px, 1.6, pz, 0xf2c14e, 12); toast(`คราฟต์ ${r.n} แล้ว!`, 'good'); renderCraft(); renderHot(); renderInv(); updateSum(); };
    d.appendChild(b); l.appendChild(d);
  });
}
function updateSum() { $('invSum').textContent = `🪵${S.inv.wood} 🪨${S.inv.stone} 🫐${S.inv.berries} 🍖${S.inv.meat + S.inv.fish} 🌱${S.inv.seeds}`; }
function placeTorch() {
  const m = create('torch'); m.position.set(px + Math.sin(face) * 1.2, TILE_H, pz + Math.cos(face) * 1.2);
  scene.add(m); updatables.push(m); S.gear.torches++;
  interact.push({ kind: 'torch', mesh: m, x: m.position.x, z: m.position.z, r: 0.4, hp: 1e9, max: 1e9, dead: false, data: {} });
}

/* ---------------- actions ---------------- */
function nearestInteract(maxD = 2.0) {
  let best = null, bd = maxD;
  for (const o of interact) {
    if (o.dead || o.kind === 'torch') continue; // placed torches are decor, never swallow E
    const d = Math.hypot(o.x - px, o.z - pz);
    if (d < bd + o.r) { bd = d; best = o; }
  }
  // plots
  for (const p of plots) { const d = Math.hypot(p.x - px, p.z - pz); if (d < bd + 0.8) { bd = d; best = { kind: 'plot', plot: p, x: p.x, z: p.z, r: 0.8 }; } }
  // fire (only when nothing else is in range — it must not steal E from trees/plots)
  if (Math.hypot(px, pz) < 2.2 && !best) best = { kind: 'fire', x: 0, z: 0, r: 1 };
  // water fish spot
  return best;
}
function promptFor(o) {
  if (!o) return null;
  const K = o.plot ? 'plot' : o.kind;
  if (K === 'plot') return plotPrompt(o.plot); // lazy: plotPrompt(undefined) would throw
  const M = {
    pine: `<b>E</b> โค่นสน 🌲 (HP ${o.hp})`, oak: `<b>E</b> โค่นโอ๊ค 🌳 (HP ${o.hp})`,
    pine_snow: `<b>E</b> โค่นสนหิมะ 🌲 (HP ${o.hp})`, bush: `<b>E</b> เก็บพุ่มไม้ 🌿`,
    rock: `<b>E</b> ทุบหิน 🪨 (HP ${o.hp})`, ore_copper: `<b>E</b> ขุดทองแดง 🟠 (HP ${o.hp})`,
    ore_iron: `<b>E</b> ขุดเหล็ก ⚙️ (HP ${o.hp})`, ore_crystal: `<b>E</b> ขุดคริสตัล 💎 (HP ${o.hp})`,
    bush_berry: `<b>E</b> เก็บเบอร์รี่ 🫐`, mushroom: `<b>E</b> เก็บเห็ด 🍄`,
    log_pile: `<b>E</b> เก็บฟืน 🪵`, stump: `<b>E</b> ขุดตอไม้ 🪵`,
    chest: `<b>E</b> เปิดหีบ 🎁`, fire: `<b>E</b> เติมฟืน 🔥 (มีไม้ ${S.inv.wood}) / ย่างอาหาร`,
    workbench: `<b>C</b> เปิดโต๊ะคราฟต์ 🛠️`, furnace: `<b>E</b> หลอม: หิน3→เหล็ก1`,
    bedroll: `<b>E</b> นอนพัก 💤 (+HP)`,
  };
  return M[K] || null;
}
function plotPrompt(p) {
  if (p.state === 0) return S.tools.hoe ? `<b>E</b> พรวนดิน 🌱` : `ต้องมีจอบก่อน (คราฟต์ C)`;
  if (p.state === 1) return S.inv.seeds > 0 ? `<b>E</b> หว่านเมล็ด 🌱 (${S.inv.seeds})` : `ไม่มีเมล็ด — ตัดโอ๊ค/ตีสไลม์`;
  if (p.state === 2) return `🌱 กำลังโต… ${Math.ceil(p.timer)}s`;
  if (p.state === 3) return `<b>E</b> เก็บเกี่ยว 🧺`;
  return null;
}

function hit(o, dmg, isTool) {
  o.hp -= dmg;
  puff(o.x, 1.2, o.z, 0xe8d8b0, 6, 2, 0.4);
  if (['pine', 'oak'].includes(o.kind)) sfx.chop(); else if (o.kind.startsWith('ore') || o.kind === 'rock') sfx.mine(); else sfx.chop();
  if (o.hp > 0) return;
  o.dead = true; world.remove(o.mesh);
  const si = solids.indexOf(o); if (si >= 0) solids.splice(si, 1);
  const give = (k, n) => { S.inv[k] = (S.inv[k] || 0) + n; };
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  switch (o.kind) {
    case 'pine': give('wood', R(2, 3)); toast('+ไม้ 🪵', 'good'); break;
    case 'pine_snow': give('wood', R(2, 3)); toast('+ไม้ 🪵', 'good'); break;
    case 'bush': give('seeds', R(1, 2)); toast('+เมล็ด 🌱', 'good'); break;
    case 'oak': give('wood', R(3, 4)); give('seeds', 1); toast('+ไม้ 🪵 +เมล็ด 🌱', 'good'); break;
    case 'rock': give('stone', R(2, 3)); toast('+หิน 🪨', 'good'); break;
    case 'ore_copper': give('copper', 2); give('stone', 1); toast('+ทองแดง 🟠', 'good'); break;
    case 'ore_iron': give('iron', 2); toast('+เหล็ก ⚙️', 'good'); break;
    case 'ore_crystal': give('crystal', 1); give('stone', 1); toast('+คริสตัล 💎', 'good'); break;
    case 'bush_berry': give('berries', R(2, 3)); toast('+เบอร์รี่ 🫐', 'good');
      setTimeout(() => { if (!S.over) { o.dead = false; o.hp = 1; world.add(o.mesh); solids.push(o); } }, 60000); break;
    case 'mushroom': give('mushroom', 2); toast('+เห็ด 🍄', 'good'); break;
    case 'log_pile': give('wood', R(2, 3)); toast('+ฟืน 🪵', 'good'); break;
    case 'stump': give('wood', 2); give('seeds', 1); toast('+ไม้ 🪵 +เมล็ด 🌱', 'good'); break;
    case 'chest': give('wood', 5); give('stone', 3); give('iron', 2); give('seeds', 2); toast('เปิดหีบ! ได้ของเพียบ 🎁', 'good'); break;
  }
  sfx.pickup(); updateSum(); renderInv();
}

function doInteract() {
  if (!S.started || S.over) return;
  const o = nearestInteract();
  if (!o) {
    // try fish
    tryFish(); return;
  }
  const K = o.plot ? 'plot' : o.kind;
  if (K === 'fire') {
    if (S.inv.wood >= 2) { S.inv.wood -= 2; S.fuel = Math.min(100, S.fuel + 30); sfx.craft(); toast('เติมฟืน +30 🔥', 'good'); }
    else toast('ต้องใช้ไม้ 2 อันเพื่อเติมฟืน', 'warn');
    // auto cook
    if (S.inv.meat > 0 && S.fuel > 10) { S.inv.meat--; S.hu = Math.min(100, S.hu + (S.gear.pot ? 40 : 22)); sfx.eat(); toast('ย่างเนื้อ 🍖 อร่อย!', 'good'); }
    else if (S.inv.fish > 0 && S.fuel > 10) { S.inv.fish--; S.hu = Math.min(100, S.hu + (S.gear.pot ? 44 : 24)); sfx.eat(); toast('ย่างปลา 🐟 อร่อย!', 'good'); }
    updateSum(); return;
  }
  if (K === 'workbench') { $('craftPanel').classList.add('open'); renderCraft(); return; }
  if (K === 'bedroll') {
    if (isNight()) { S.hp = Math.min(100, S.hp + 25); S.st = Math.min(100, S.st + 30); toast('งีบหลับ… +HP 💤', 'good'); sfx.eat(); }
    else { S.hp = Math.min(100, S.hp + 8); toast('พักผ่อน +HP', 'good'); }
    return;
  }
  if (K === 'furnace') {
    if (S.inv.stone >= 3) { S.inv.stone -= 3; S.inv.iron++; sfx.craft(); toast('หลอมเหล็ก +1 ⚙️', 'good'); updateSum(); }
    else toast('ต้องใช้หิน 3 ก้อน', 'warn');
    return;
  }
  if (K === 'plot') {
    const p = o.plot;
    if (p.state === 0 && S.tools.hoe) { p.state = 1; sfx.plant(); toast('พรวนดินแล้ว หว่านเมล็ดได้ 🌱'); }
    else if (p.state === 1 && S.inv.seeds > 0) {
      S.inv.seeds--; p.state = 2; p.timer = S.gear.bucket ? 30 : 60; sfx.plant();
      const c = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x6b8f4a, roughness: 1, flatShading: true }));
        s.position.set((i - 1) * 0.25, 0.25, 0); s.castShadow = true; c.add(s);
      }
      c.position.set(p.x, TILE_H + 0.15, p.z); scene.add(c); p.crop = c;
      toast('ปลูกแล้ว! รอโต… 🌱'); updateSum();
    } else if (p.state === 3) {
      p.state = 0; if (p.crop) { scene.remove(p.crop); p.crop = null; }
      S.inv.berries += 3; S.inv.seeds += 2; sfx.pickup(); toast('เก็บเกี่ยว +🫐3 +🌱2', 'good'); updateSum();
    } else if (p.state === 0) toast('ต้องมีจอบ (คราฟต์ด้วย C)', 'warn');
    else if (p.state === 1) toast('ไม่มีเมล็ด', 'warn');
    return;
  }
  if (['pine', 'oak', 'pine_snow', 'bush', 'rock', 'ore_copper', 'ore_iron', 'ore_crystal', 'bush_berry', 'mushroom', 'chest', 'log_pile', 'stump'].includes(K)) {
    let dmg = 1;
    if ((K === 'pine' || K === 'oak' || K === 'pine_snow' || K === 'log_pile' || K === 'stump') && S.tools.axe) dmg = 2;
    if ((K === 'rock' || K.startsWith('ore')) && S.tools.pick) dmg = 2;
    if (S.equip === 'sword2') dmg += 1;
    hit(o, dmg);
    return;
  }
  tryFish();
}
function tryFish() {
  // near water?
  const ti = Math.floor(px + SIZE / 2), tj = Math.floor(pz + SIZE / 2);
  let near = false;
  for (let a = -2; a <= 2 && !near; a++) for (let b = -2; b <= 2 && !near; b++) if (isWater(ti + a, tj + b)) near = true;
  if (near && S.tools.rod) {
    if (Math.random() < 0.65) { S.inv.fish++; sfx.splash(); toast('+ปลา 🐟', 'good'); }
    else { toast('ปลาหลุด… 🎣'); sfx.splash(); }
    S.st = Math.max(0, S.st - 5); updateSum(); renderInv();
  } else if (near) toast('ต้องมีเบ็ดตกปลา (คราฟต์ C)', 'warn');
}

function doAttack() {
  if (!S.started || S.over || atkCD > 0) return;
  atkCD = 0.45;
  const dmg = S.equip === 'sword2' ? 18 : S.equip === 'axe' ? 10 : 10;
  puff(px + Math.sin(face) * 1, 1.3, pz + Math.cos(face) * 1, 0xffffff, 5, 3, 0.3);
  beep(220, .07, 'square', .1, 80);
  S.st = Math.max(0, S.st - 4);
  let hitAny = false;
  for (const e of enemies) {
    if (Math.hypot(e.x - px, e.z - pz) < 1.8) {
      e.hp -= dmg; hitAny = true;
      e.vx += (e.x - px) * 4; e.vz += (e.z - pz) * 4;
      puff(e.x, 1, e.z, 0xc44536, 8, 3, 0.5);
      if (e.hp <= 0) killEnemy(e); else sfx.hurt();
    }
  }
  // also damage harvestables in front
  for (const o of interact) {
    if (o.dead || o.hp > 900) continue;
    if (Math.hypot(o.x - px, o.z - pz) < 1.7) { hit(o, dmg >= 18 ? 2 : 1); hitAny = true; break; }
  }
  if (!hitAny) { /* whiff */ }
  // lunge
  vx += Math.sin(face) * 2; vz += Math.cos(face) * 2;
}
function killEnemy(e, silent = false) {
  e.dead = true; scene.remove(e.mesh); unlist(e.mesh);
  if (silent) return; // e.g. sun-burn: no loot, no toast
  S.kills++;
  if (e.kind === 'wolf') { S.inv.meat += 2; toast('ล่าหมาป่าได้ +🍖2 🐺', 'good'); }
  else if (e.kind === 'slime') { S.inv.mushroom += 1; S.inv.seeds += 1; toast('ตบสไลม์ +🍄 +🌱', 'good'); }
  else if (e.kind === 'chicken') { S.inv.meat += 2; toast('+เนื้อไก่ 🍖🍖', 'good'); }
  puff(e.x, 1, e.z, 0xf2a65a, 12, 3, 0.6);
  sfx.pickup(); updateSum(); renderInv();
}
function doSlide() {
  if (!S.started || S.over || slideCD > 0 || S.st < 12) return;
  slideCD = 1.1; sliding = 0.22; S.st -= 12;
  const dx = Math.sin(face), dz = Math.cos(face);
  vx += dx * 9; vz += dz * 9;
  puff(px, 1, pz, 0xc9bda0, 10, 2.5, 0.5);
  beep(500, .12, 'sine', .1, 300);
}
function eatItem(k) {
  if (S.inv[k] <= 0) { toast('หมดแล้ว', 'warn'); return; }
  const mult = S.gear.pot ? 2 : 1;
  const val = { berries: 12, mushroom: 10, meat: 22, fish: 24 }[k] || 8;
  S.inv[k]--; S.hu = Math.min(100, S.hu + val * mult);
  if (k === 'meat' || k === 'fish') S.hp = Math.min(100, S.hp + 5);
  sfx.eat(); updateSum(); renderInv();
}
function doEat() {
  const order = ['meat', 'fish', 'berries', 'mushroom'];
  for (const k of order) if (S.inv[k] > 0) { eatItem(k); return; }
  toast('ไม่มีอาหาร! หาเบอร์รี่/ล่าสัตว์ก่อน', 'warn');
}

/* ---------------- day/night ---------------- */
function isNight() { return S.dayTime < 0.24 || S.dayTime > 0.76; }
function updateSky() {
  const t = S.dayTime;
  const dayF = Math.max(0, Math.sin(t * Math.PI * 2 - Math.PI / 2) * -1 + 0.2);
  const night = isNight();
  const sunA = Math.sin(t * Math.PI * 2);
  sun.position.set(Math.cos(t * Math.PI * 2) * 14, Math.max(2, sunA * 14), 6);
  sun.intensity = night ? 0.12 : 1.5;
  sun.color.set(night ? 0x4c9aff : 0xfff2d9);
  moon.intensity = night ? 0.5 : 0;
  hemi.intensity = night ? 0.32 : 0.7;
  scene.background.set(night ? 0x0b1220 : 0x87b5d6);
  scene.fog.color.set(night ? 0x0b1220 : 0x87b5d6);
  const c = $('clock');
  if (c) c.textContent = night ? '🌙' : '☀️';
  $('dayT').textContent = 'DAY ' + S.day + (S.day >= 5 && !S.over ? ' (รอด!)' : '');
}

/* ---------------- minimap ---------------- */
const mm = $('minimap').getContext('2d');
function drawMap() {
  const s = 128 / SIZE;
  for (let j = 0; j < SIZE; j++) for (let i = 0; i < SIZE; i++) {
    mm.fillStyle = tileColor(grid[j][i]); mm.fillRect(i * s, j * s, s + 1, s + 1);
  }
  mm.fillStyle = '#F2A65A'; mm.fillRect(SIZE / 2 * s - 2, SIZE / 2 * s - 2, 5, 5);
  mm.fillStyle = '#fff';
  mm.fillRect((px + SIZE / 2) * s - 1.5, (pz + SIZE / 2) * s - 1.5, 3, 3);
  mm.fillStyle = '#C44536';
  for (const e of enemies) if (!e.dead && (e.kind === 'wolf' || e.kind === 'slime'))
    mm.fillRect((e.x + SIZE / 2) * s - 1, (e.z + SIZE / 2) * s - 1, 2, 2);
}

/* ---------------- loop ---------------- */
const clock = new THREE.Clock();
let nightSpawn = 0, mapT = 0, diffT = 0, lightT = 0;
let shadowTick = 0, emaMs = 16, qTimer = 0;

function collide(nx, nz) {
  // water + bounds + solids
  if (Math.abs(nx) > SIZE / 2 - 0.6 || Math.abs(nz) > SIZE / 2 - 0.6) return true;
  const ti = Math.floor(nx + SIZE / 2), tj = Math.floor(nz + SIZE / 2);
  if (isWater(ti, tj)) return true;
  for (const s of solids) {
    if (s.dead) continue;
    if (Math.hypot(s.x - nx, s.z - nz) < (s.r || 0.5) + 0.28) return true;
  }
  return false;
}

function update(dt, t) {
  // time
  const prev = S.dayTime;
  S.dayTime = (S.dayTime + dt / S.CYCLE) % 1;
  if (prev > 0.9 && S.dayTime < 0.1) {
    S.day++;
    toast(`— เช้าวันที่ ${S.day} —`, 'good');
    if (S.day > 5 && !S.over) { gameOver(true); return; }
  }
  updateSky();
  // fuel
  S.fuel = Math.max(0, S.fuel - dt * 0.45);
  fireMesh.userData.fuel = S.fuel / 100;
  $('fireT').textContent = `ฟืน ${Math.ceil(S.fuel)}%` + (S.fuel < 25 ? ' — เติมไม้ด่วน!' : '');
  const nearFire = Math.hypot(px, pz) < 4.5;
  const night = isNight();

  // input dir
  let dx = 0, dz = 0;
  if (keys.KeyW || keys.ArrowUp) dz -= 1;
  if (keys.KeyS || keys.ArrowDown) dz += 1;
  if (keys.KeyA || keys.ArrowLeft) dx -= 1;
  if (keys.KeyD || keys.ArrowRight) dx += 1;
  dx += joyDX; dz += joyDZ;
  const l = Math.hypot(dx, dz);
  if (l > 1) { dx /= l; dz /= l; }
  const sprint = (keys.ShiftLeft || keys.ShiftRight) && l > 0.1 && S.st > 1;
  const spd = SPEED * (sprint ? 1.5 : 1) * (sliding > 0 ? 1.8 : 1);
  if (S.started && !S.over && l > 0.05) {
    face = Math.atan2(dx, dz);
    if (sprint) S.st = Math.max(0, S.st - 10 * dt);
  }
  vx *= (1 - Math.min(1, dt * (sliding > 0 ? 2.5 : 10)));
  vz *= (1 - Math.min(1, dt * (sliding > 0 ? 2.5 : 10)));
  vx += dx * spd * dt * 8; vz += dz * spd * dt * 8;
  const vl = Math.hypot(vx, vz), vmax = spd * (sliding > 0 ? 1.6 : 1);
  if (vl > vmax) { vx = vx / vl * vmax; vz = vz / vl * vmax; }
  const nx = px + vx * dt, nz = pz + vz * dt;
  if (!collide(nx, pz)) px = nx; else vx *= -0.2;
  if (!collide(px, nz)) pz = nz; else vz *= -0.2;

  player.position.set(px, TILE_H, pz);
  player.rotation.y = face;
  player.userData.walking = vl > 0.6;
  if (sliding > 0) { sliding -= dt; if (Math.random() < 0.5) puff(px, 1, pz, 0xc9bda0, 1, 1.5, 0.4); }
  if (slideCD > 0) slideCD -= dt;
  if (atkCD > 0) atkCD -= dt;

  // needs
  S.hu = Math.max(0, S.hu - dt * 0.35);
  if (!sprint && l < 0.1) S.st = Math.min(100, S.st + dt * 8);
  else if (!sprint) S.st = Math.min(100, S.st + dt * 2);
  const shelter = S.gear.tent ? 0.5 : 1;
  if (nearFire && S.fuel > 2) S.wa = Math.min(100, S.wa + dt * 14);
  else if (S.gear.lantern) S.wa = Math.min(100, S.wa + dt * 1.5);
  else if (night) S.wa = Math.max(0, S.wa - dt * 3.2 * shelter);
  else S.wa = Math.min(100, S.wa + dt * 2);
  playerLight.intensity = S.gear.lantern ? 1.2 : 0;

  if (S.hu <= 0) S.hp -= dt * 2;
  if (S.wa <= 0) { S.hp -= dt * (night ? 4 : 1.5); if (Math.random() < dt) toast('หนาวมาก! กลับไปผิงไฟ 🔥', 'warn'); }
  if (nearFire && S.fuel > 2) S.hp = Math.min(100, S.hp + dt * 1.2);
  if (S.hu > 70 && S.hp < 100 && !night) S.hp = Math.min(100, S.hp + dt * 0.5);
  if (S.hp <= 0) { gameOver(false); return; }

  // enemies
  nightSpawn -= dt;
  const foes = enemies.filter(e => !e.dead && (e.kind === 'wolf' || e.kind === 'slime')).length;
  if (night && nightSpawn <= 0 && foes < 2 + S.day) {
    nightSpawn = Math.max(4, 12 - S.day);
    const a = Math.random() * Math.PI * 2, r = SIZE / 2 - 1.5;
    const kind = Math.random() < (S.day >= 3 ? 0.55 : 0.3) ? 'wolf' : 'slime';
    spawnCreature(kind, Math.cos(a) * r, Math.sin(a) * r);
    toast(kind === 'wolf' ? '🐺 หมาป่ามาแล้ว!' : '🟢 สไลม์มาแล้ว!', 'warn'); sfx.hurt();
  }
  if (!night) { // day burns slimes (no loot for sun-burn)
    for (const e of enemies) if (!e.dead && e.kind === 'slime' && Math.random() < dt * 0.1) { killEnemy(e, true); }
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) { enemies.splice(i, 1); continue; }
    const d = Math.hypot(px - e.x, pz - e.z);
    e.atkCD -= dt; e.wander += dt;
    if (e.kind === 'chicken') {
      if (d < 3) { e.vx += (e.x - px) * dt * 3; e.vz += (e.z - pz) * dt * 3; }
      else if (e.wander > 3) { e.wander = 0; e.vx = (Math.random() - 0.5) * 2; e.vz = (Math.random() - 0.5) * 2; }
    } else {
      const aggro = e.kind === 'wolf' ? 10 : 7;
      if (d < aggro) {
        e.vx += ((px - e.x) / (d + 0.01)) * dt * 10;
        e.vz += ((pz - e.z) / (d + 0.01)) * dt * 10;
      } else if (e.wander > 4) { e.wander = 0; e.vx = (Math.random() - 0.5) * 2; e.vz = (Math.random() - 0.5) * 2; }
      if (d < 1.0 && e.atkCD <= 0 && hurtCD <= 0) {
        e.atkCD = 1.2; hurtCD = 0.7;
        S.hp -= e.dmg; sfx.hurt();
        puff(px, 1.3, pz, 0xc44536, 10, 3, 0.5);
        toast(`โดน${e.kind === 'wolf' ? 'หมาป่ากัด' : 'สไลม์ชน'} -${e.dmg} ❤️`, 'warn');
        vx += (px - e.x) * 5; vz += (pz - e.z) * 5;
      }
    }
    e.vx *= (1 - Math.min(1, dt * 3)); e.vz *= (1 - Math.min(1, dt * 3));
    const sp = Math.min(e.speed, Math.hypot(e.vx, e.vz) + e.speed * 0.5);
    const dd = Math.hypot(e.vx, e.vz) || 1;
    let ex = e.x + (e.vx / dd) * Math.min(sp, dd) * dt, ez = e.z + (e.vz / dd) * Math.min(sp, dd) * dt;
    if (!collide(ex, e.z)) e.x = ex; if (!collide(e.x, ez)) e.z = ez;
    e.mesh.position.set(e.x, TILE_H, e.z); // hop bounce lives in the asset's own update()
    if (Math.hypot(e.vx, e.vz) > 0.2) e.mesh.rotation.y = Math.atan2(e.vx, e.vz);
  }
  if (hurtCD > 0) hurtCD -= dt;

  // plots growth
  for (const p of plots) {
    if (p.state === 2) {
      p.timer -= dt;
      if (p.crop) { const s = Math.max(0.3, 1 - p.timer / 60); p.crop.scale.set(s, s, s); }
      if (p.timer <= 0) { p.state = 3; toast('ผักโตแล้ว! ไปเก็บ 🧺', 'good'); sfx.pickup(); }
    }
  }

  // crystal lights: only the ones near the player stay visible (shader cost)
  lightT -= dt;
  if (lightT <= 0) {
    lightT = 0.5;
    for (const c of crystalLights) c.li.visible = (c.x - px) * (c.x - px) + (c.z - pz) * (c.z - pz) < 49;
  }

  // prompt
  const o = nearestInteract();
  const ph = promptFor(o);
  prompt(ph);

  // camera
  const want = new THREE.Vector3(px + CAM_OFF.x, TILE_H + CAM_OFF.y, pz + CAM_OFF.z);
  camera.position.lerp(want, 1 - Math.pow(0.001, dt));
  camera.lookAt(px, TILE_H + 0.5, pz);
  sun.target.position.set(px, 0, pz);

  // updatables
  for (const u of updatables) { try { u.userData.update && u.userData.update(t, dt); } catch {} }
  updateParts(dt);

  // HUD
  $('hpV').style.width = S.hp + '%'; $('stV').style.width = S.st + '%';
  $('huV').style.width = S.hu + '%'; $('waV').style.width = S.wa + '%';
  mapT -= dt; if (mapT <= 0) { mapT = 0.25; drawMap(); }
  diffT -= dt; if (diffT <= 0) { diffT = 1; updateSum(); }
}

function gameOver(win) {
  S.over = true; S.win = win;
  $('over').classList.add('show');
  $('overTitle').textContent = win ? `รอดครบ 5 คืน! 🏕️` : `คืนที่ ${S.day} — หนาวตาย… 🥶`;
  $('overSub').textContent = win
    ? `ฆ่า ${S.kills} ตัว · คราฟต์ ${S.built} ชิ้น · ฟืนเหลือ ${Math.ceil(S.fuel)}% — ค่ายของคุณอบอุ่นที่สุดในป่า pixel`
    : `อยู่รอดถึงวันที่ ${S.day} · ฆ่า ${S.kills} ตัว · ทิป: เติมฟืนบ่อย ๆ กินก่อนหิวหมด คราฟต์ดาบเหล็กก่อนคืนที่ 3`;
  if (win) sfx.win(); else sfx.die();
}

/* ---------------- boot ---------------- */
window.__camp = {
  S,
  get pos() { return { x: px, z: pz }; },
  get calls() { return renderer.info.render.calls; },
  get lights() { let n = 0; scene.traverse(o => { if (o.isPointLight && o.visible) n++; }); return n; },
  get counts() { return { interact: interact.length, enemies: enemies.length, updatables: updatables.length, solids: solids.length }; },
};
$('playBtn').onclick = () => {
  ac(); $('hero').classList.add('hide'); $('hud').classList.remove('hide');
  S.started = true; renderHot(); renderCraft(); renderInv(); updateSum();
  toast('คืนนี้หนาว ก่อไฟก่อน 🔥', 'good');
};
$('howBtn').onclick = () => { const h = $('how'); h.style.display = h.style.display === 'none' ? 'block' : 'none'; };
$('viewBtn').onclick = () => location.href = 'viewer.html';
$('againBtn').onclick = () => location.reload();

(async function boot() {
  setLoad(0.05, 'จุดไฟแคมป์…');
  await buildWorld();
  setLoad(0.9, 'พร้อมแล้ว!');
  renderHot(); updateSum(); drawMap(); updateSky();
  camera.position.set(px + CAM_OFF.x, TILE_H + CAM_OFF.y, pz + CAM_OFF.z);
  camera.lookAt(px, TILE_H, pz);
  setLoad(1);
  setTimeout(() => $('loading').classList.add('hide'), 350);
  renderer.setAnimationLoop(() => {
    try {
      const rawDt = clock.getDelta();
      const dt = Math.min(0.05, rawDt), t = clock.elapsedTime;
      // adaptive quality: sustained slow frames step the pixel ratio down
      emaMs = emaMs * 0.95 + rawDt * 1000 * 0.05; qTimer += rawDt;
      if (qTimer > 2.5) {
        qTimer = 0;
        if (emaMs > 26 && qStep < qSteps.length - 1) { qStep++; renderer.setPixelRatio(qSteps[qStep]); emaMs = 16; }
      }
      if (S.started && !S.over) update(dt, t);
      else {
        for (const u of updatables) { try { u.userData.update && u.userData.update(t, dt); } catch {} }
        updateParts(dt);
        camera.position.lerp(new THREE.Vector3(px + CAM_OFF.x, TILE_H + CAM_OFF.y, pz + CAM_OFF.z), 0.03);
        camera.lookAt(0, 1, 0);
      }
      // shadows change slowly (sun cycle) — refresh every 2nd frame
      if ((shadowTick++ & 1) === 0) renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
    } catch (err) { console.error('[game-loop]', err); } // never let one bad frame kill the loop
  });
})();
