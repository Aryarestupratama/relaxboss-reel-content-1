// Tata letak Scene 5 (RelaxMate), koordinat kanvas. Dipakai juga oleh timeline
// sebagai titik asal lingkaran saat masuk ke Scene 6.
export const BLOB_SIZE = 260;
export const BLOB_CX = 300;
export const BLOB_CY = 1410;
/** Pusat visual blob (sama dengan rumus `placed` di Scene 2). */
export const BLOB_CENTER_SCREEN = { x: BLOB_CX, y: BLOB_CY };

export const ROBOT_H = 520;
export const ROBOT_W = Math.round((ROBOT_H * 320) / 460); // frame sprite 320 x 460
export const ROBOT_X = 760; // pusat
export const ROBOT_FEET_Y = 1540;
export const ROBOT_TOP = ROBOT_FEET_Y - ROBOT_H;

export const USER_BUBBLE = { x: 64, y: 610, w: 640, h: 200 };
export const BOT_BUBBLE = { x: 330, y: 840, w: 686, h: 180 };
