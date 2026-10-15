/* registry — รวม builders ทั้งหมด + create() + listAssets()
 * คง API เดิม: create(id, opts), createSurvivor, buildTool, listAssets, TILE_H, palette
 */
import { TILE_H, palette, pixelTexture, std, glow } from './core.js';
import { tileBuilders } from './tiles.js';
import { treeBuilders } from './trees.js';
import { rockBuilders } from './rocks.js';
import { grassBuilders } from './grasses.js';
import { fireBuilders } from './fire.js';
import { shelterBuilders } from './shelter.js';
import { furnitureBuilders } from './furniture.js';
import { creatureBuilders } from './creatures.js';
import { createSurvivor } from './survivor.js';
import { buildTool, toolBuilders } from './tools.js';
import { sedanBuilders } from './sedan.js';
import * as THREE from 'three';
import { M, BOX } from './core.js';

export { TILE_H, palette, pixelTexture, std, glow, createSurvivor, buildTool };

const builders = {
  ...tileBuilders,
  ...treeBuilders,
  ...rockBuilders,
  ...grassBuilders,
  ...fireBuilders,
  ...shelterBuilders,
  ...furnitureBuilders,
  ...creatureBuilders,
  ...toolBuilders,
  ...sedanBuilders,
};

const alias = {
  plot_0: 'plot_0', plot_1: 'plot_1', plot_2: 'plot_2', plot_3: 'plot_3',
  plot: 'plot',
  survivor_idle: 'survivor', survivor_walk: 'survivor',
  survivor_knight: 'survivor', survivor_farmer: 'survivor',
  survivor_hunter: 'survivor', survivor_miner: 'survivor',
  survivor: 'survivor',
};

export function create(id, opts) {
  if (alias[id]) {
    const a = alias[id];
    if (a === 'survivor') {
      if (id === 'survivor_knight') return createSurvivor({ ...opts, armor: 'iron', hat: 'iron', tool: 'sword' });
      if (id === 'survivor_farmer') return createSurvivor({ ...opts, hat: 'straw', tool: 'hoe' });
      if (id === 'survivor_hunter') return createSurvivor({ ...opts, tool: 'bow' });
      if (id === 'survivor_miner') return createSurvivor({ ...opts, hat: 'hard', tool: 'pick' });
      if (id === 'survivor_walk') return createSurvivor({ ...opts, walk: true });
      return createSurvivor(opts);
    }
    if (builders[a]) { const g = builders[a](opts); g.userData.assetId = id; return g; }
    id = a;
  }
  if (id === 'survivor') return createSurvivor(opts);
  if (builders[id]) { const g = builders[id](opts); g.userData.assetId = id; return g; }
  if (id.startsWith('item_') || id.startsWith('gear_') || id.startsWith('food_')) {
    const g = new THREE.Group();
    g.add(M(BOX(0.3, 0.15, 0.15), std(palette.woodLight, [palette.wood]), 0, 0.1, 0));
    g.userData.assetId = id;
    return g;
  }
  const g = builders.rock(); g.userData.assetId = id; return g;
}

export function listAssets() { return Object.keys(builders).sort(); }

const CampfireAssets = { TILE_H, palette, create, createSurvivor, buildTool, listAssets, pixelTexture, std, glow };
export default CampfireAssets;
if (typeof window !== 'undefined') window.CampfireAssets = CampfireAssets;
