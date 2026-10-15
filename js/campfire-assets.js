/* Campfire Diorama — compatibility barrel
 * เดิมไฟล์เดียว 656 บรรทัด → แยกเป็น js/models/* เพื่อแก้สะดวก
 * game.js / viewer.html import path เดิมได้เหมือนเดิม
 */
export * from './models/registry.js';
import CampfireAssets from './models/registry.js';
export default CampfireAssets;
if (typeof window !== 'undefined') window.CampfireAssets = CampfireAssets;
