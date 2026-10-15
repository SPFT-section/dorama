/* tiles — โครงสร้างจริง: ดินฐาน + หน้าดิน + รายละเอียดผิว
 * base 0.62 + top 0.18 = 0.8 (TILE_H)
 */
import * as THREE from 'three';
import { M, BOX, std, glow, palette, waterMaterial } from './core.js';

function tile(baseColor, topColor, topFlecks, deco) {
  const g = new THREE.Group();
  g.add(M(BOX(1, 0.62, 1), std(baseColor), 0, 0.31, 0));
  g.add(M(BOX(1.0, 0.18, 1.0), std(topColor, topFlecks), 0, 0.71, 0));
  if (deco) deco(g);
  return g;
}

const grassTuft = (g) => {
  const m = std(palette.mossDark);
  [[0.3, 0.3], [-0.3, 0.2], [0.1, -0.3], [-0.2, -0.25]].forEach(([x, z]) => {
    g.add(M(BOX(0.06, 0.12, 0.06), m, x, 0.86, z));
  });
};

export const tileBuilders = {
  tile_grass: () => tile(palette.dirtDark, palette.grass, [palette.grassDark, palette.leafLight], grassTuft),
  tile_dirt: () => tile(palette.dirtDark, palette.dirt, [palette.dirtDark, palette.woodDark], (g) => {
    const m = std(palette.dirtDark);
    [[0.2, 0.15], [-0.22, -0.1], [0.05, -0.28]].forEach(([x, z]) => g.add(M(BOX(0.12, 0.05, 0.1), m, x, 0.83, z)));
    g.add(M(BOX(0.3, 0.012, 0.02), m, -0.1, 0.815, 0.2));
    g.add(M(BOX(0.02, 0.012, 0.25), m, 0.25, 0.815, -0.15));
  }),
  tile_sand: () => tile(palette.sandDark, palette.sand, [palette.sandDark, 0xffffff], (g) => {
    const m = std(0xc9b183);
    g.add(M(BOX(0.07, 0.03, 0.05), m, 0.2, 0.82, 0.1));
    g.add(M(BOX(0.07, 0.03, 0.05), m, -0.25, 0.82, -0.15));
    g.add(M(BOX(0.6, 0.012, 0.03), m, 0, 0.812, 0.3));
    g.add(M(BOX(0.6, 0.012, 0.03), m, 0, 0.812, -0.25));
  }),
  tile_stone: () => tile(palette.stoneDark, palette.stone, [palette.stoneDark, 0xffffff], (g) => {
    const m = std(palette.stoneDark);
    [0.15, -0.05, -0.2].forEach((z, i) => g.add(M(BOX(0.4, 0.02, 0.04), m, 0, 0.82, z + i * 0.02)));
    g.add(M(BOX(0.02, 0.02, 0.7), m, 0.2, 0.82, 0));
  }),
  tile_snow: () => tile(palette.dirtDark, palette.snow, [palette.snowDark, 0xffffff], (g) => {
    const m = std(palette.snowDark);
    [[0.2, 0.2], [-0.2, 0.1], [0, -0.2]].forEach(([x, z]) => g.add(M(BOX(0.18, 0.05, 0.18), m, x, 0.83, z)));
  }),
  tile_water: () => {
    const g = new THREE.Group();
    g.add(M(BOX(1, 0.5, 1), std(palette.dirtDark), 0, 0.25, 0));
    const w = M(BOX(1, 0.2, 1), waterMaterial(), 0, 0.6, 0);
    w.castShadow = false; g.add(w);
    g.add(M(BOX(0.22, 0.02, 0.22), std(palette.mossDark), -0.2, 0.71, 0.15));
    const foam1 = M(BOX(0.2, 0.012, 0.04), glow(0xbfefff), 0.15, 0.71, -0.1);
    const foam2 = M(BOX(0.12, 0.012, 0.04), glow(0xbfefff), -0.1, 0.71, 0.3);
    foam1.castShadow = foam2.castShadow = false; g.add(foam1, foam2);
    const t0 = Math.random() * 10;
    g.userData.update = (t) => {
      foam1.position.x = 0.15 + Math.sin(t * 1.4 + t0) * 0.08;
      foam2.position.z = 0.3 + Math.cos(t * 1.1 + t0) * 0.06;
    };
    return g;
  },
};
