import { detectSaveData, detectWebGL2, getDeviceMemoryGB } from './capability-detection';

export const hasWebGL2 = detectWebGL2;

export const saveDataEnabled = detectSaveData;

export const deviceMemoryGB = getDeviceMemoryGB;
