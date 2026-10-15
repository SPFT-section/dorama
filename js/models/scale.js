/* SCALE — ตารางอ้างอิงสเกลจริง (เมตร) + องศาจริง (เรเดียน/องศา)
 * ใช้ 1 unit = 1 เมตร ทั้ง dorama (tile 1×1m) และ forge
 * ที่มา: มาตรฐานเฟอร์นิเจอร์/สถาปัตย์ + สัตววิทยา Canis lupus + พฤกษศาสตร์ Pinus/Quercus
 */
export const HUMAN = {
  H: 1.7,          // ส่วนสูงผู้ใหญ่
  HEAD_H: 0.3,     // หัว 0.3m
  HIP_Y: 0.85,     // สะโพก ~50% ของส่วนสูง
  SHOULDER_Y: 1.32,
  EYE_Y: 1.55,
};
export const WOLF = {
  SHOULDER_H: 0.8,  // ไหล่ 0.8-0.85m (ความจริง 0.6-0.9)
  BODY_L: 1.1,      // จมูก-โคนหาง ~1.1m (ความจริง 1.0-1.3 ไม่รวมหาง)
  HEAD_W: 0.26,
};
export const CHICKEN = {
  H: 0.45,          // ไก่บ้าน ~0.4m
};
export const FURNITURE = {
  WORKBENCH_TOP: 0.85, // โต๊ะงานจริง 0.85-0.9m
  TABLE_CAMP_H: 0.6,   // โต๊ะแคมป์พับ ~0.55-0.65m (คงเดิม)
  STOOL_H: 0.45, FENCE_H: 1.0,   // รั้วสวน 0.9-1.1m
  SIGN_POST_H: 1.6, SIGN_BOARD_Y: [1.35, 1.05], // ป้ายระดับสายตา
  SCARECROW_H: 1.7, BEDROLL_H: 0.15,
};
export const ANGLES = {
  DEG: Math.PI / 180,
  // หลังคาจั่วจริง 30-45° จากแนวราบ
  ROOF_PITCH: 35 * Math.PI / 180,
  // กระจกหน้ารถเก๋ง ~30° จากแนวดิ่ง (60° จากแนวราบ)
  WINDSHIELD_RAKE: 0.5,
  // บันไดจริง: ลูกตั้ง 0.18 / ลูกนอน 0.28 → 32.7°
  STAIR_RISER: 0.18, STAIR_TREAD: 0.28,
  // กิ่งสนอ่อน ~90°(แนวนอน) แก่ห้อยลง 60-70°
  PINE_BRANCH_YOUNG: Math.PI / 2.4,
  // ทางปาล์ม: ชั้นบน -20°, ชั้นล่างห้อย -50°
  PALM_UPPER: -0.35, PALM_LOWER: -0.85,
  // เชือก guy เต็นท์สมอบก ~45°
  GUY_ANGLE: Math.PI / 4,
};
export const DOOR = { W: 0.9, H: 2.1 };   // ประตูมาตรฐาน
export const WINDOW = { W: 0.6, H: 0.8 }; // หน้าต่างเล็ก + ขอบปูน
export const WALL_T = 0.15;               // ผนังอิฐ 0.15m
