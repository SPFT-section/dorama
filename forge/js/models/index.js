/* FORGE barrel — รวมโมดูลย่อย ใช้แทน forge3d_fixed.html เดิม */
export * from './core.js';
export * from './trees.js';
export * from './nature.js';
export * from './vehicles.js';
export * from './arch.js';
import { buildTree } from './trees.js';
import { buildFoliage, buildRock, buildTerrain } from './nature.js';
import { buildVehicle } from './vehicles.js';
import { buildProp, makeModular } from './arch.js';

export const ForgeModels = { buildTree, buildFoliage, buildRock, buildTerrain, buildVehicle, buildProp, makeModular };
export default ForgeModels;
if (typeof window !== 'undefined') window.ForgeModels = ForgeModels;
