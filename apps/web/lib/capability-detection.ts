import { clearLitePref, getLitePref, setLitePref } from './lite-pref-storage';
import { detectSaveData as detectNetworkSaveData } from './perf/detect-save-data';

export type CapabilityDebugSnapshot = {
  deviceMemory: number | null;
  litePref: ReturnType<typeof getLitePref>;
  lowMemory: boolean;
  saveData: boolean;
  webgl2: boolean;
};

function capabilityOverride() {
  if (typeof window === 'undefined') return undefined;
  return window.__cyberskillCapabilityOverride;
}

export function detectWebGL2(): boolean {
  const override = capabilityOverride()?.webgl2;
  if (typeof override === 'boolean') return override;
  if (typeof document === 'undefined') return true;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    return Boolean(gl?.getExtension('EXT_color_buffer_float'));
  } catch {
    return false;
  }
}

export function detectSaveData(): boolean {
  const override = capabilityOverride()?.saveData;
  if (typeof override === 'boolean') return override;
  return detectNetworkSaveData();
}

export function getDeviceMemoryGB(): number | undefined {
  const override = capabilityOverride()?.deviceMemory;
  if (typeof override === 'number') return override;
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as { deviceMemory?: number }).deviceMemory;
}

export function detectLowMemory(): boolean {
  const memory = getDeviceMemoryGB();
  return typeof memory === 'number' && memory < 4;
}

export function getCapabilityDebugSnapshot(): CapabilityDebugSnapshot {
  const deviceMemory = getDeviceMemoryGB() ?? null;
  return {
    deviceMemory,
    litePref: getLitePref(),
    lowMemory: detectLowMemory(),
    saveData: detectSaveData(),
    webgl2: detectWebGL2(),
  };
}

export { clearLitePref, getLitePref, setLitePref };

declare global {
  interface Window {
    __cyberskillCapabilityOverride?: {
      deviceMemory?: number;
      saveData?: boolean;
      webgl2?: boolean;
    };
  }
}
