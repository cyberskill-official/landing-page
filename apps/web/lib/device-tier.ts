export type DeviceTier = 'high' | 'mid' | 'low';

export type DeviceTierSignals = {
  cores?: number;
  lowMemoryMode?: boolean;
  memory?: number;
  renderer?: string;
};

const TIER_RANK: Record<DeviceTier, number> = {
  low: 1,
  mid: 2,
  high: 3,
};

export function detectDeviceTier(signals: DeviceTierSignals = {}): DeviceTier {
  if (signals.lowMemoryMode) return 'low';

  const memory = signals.memory ?? readNavigatorMemory();
  const cores = signals.cores ?? readNavigatorCores();
  const renderer = signals.renderer ?? readRenderer();
  const memoryTier = tierFromMemory(memory);
  const cpuTier = tierFromCores(cores);
  const gpuTier = tierFromRenderer(renderer);
  const rank = Math.min(TIER_RANK[memoryTier], TIER_RANK[cpuTier], TIER_RANK[gpuTier]);

  return rankToTier(rank);
}

export function tierFromMemory(memory: number | undefined): DeviceTier {
  if (memory == null || !Number.isFinite(memory)) return 'high';
  if (memory >= 8) return 'high';
  if (memory >= 4) return 'mid';
  return 'low';
}

export function tierFromCores(cores: number | undefined): DeviceTier {
  if (cores == null || !Number.isFinite(cores)) return 'mid';
  if (cores >= 8) return 'high';
  if (cores >= 4) return 'mid';
  return 'low';
}

export function tierFromRenderer(renderer: string | undefined): DeviceTier {
  if (!renderer) return 'high';
  if (/\b(M[1-9]|M[1-9]\s*(Pro|Max|Ultra)|RTX|Radeon|Adreno \(TM\) 7|Adreno 7|Adreno 7\d{2}|Mali-G7)\b/i.test(renderer)) {
    return 'high';
  }
  if (/\b(Adreno \(TM\) 6|Adreno 6|Adreno 6\d{2}|Mali-G5|Mali-G6|Intel|Iris|UHD)\b/i.test(renderer)) {
    return 'mid';
  }
  return 'low';
}

function rankToTier(rank: number): DeviceTier {
  if (rank >= 3) return 'high';
  if (rank === 2) return 'mid';
  return 'low';
}

function readNavigatorMemory() {
  if (typeof navigator === 'undefined') return 8;
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
}

function readNavigatorCores() {
  if (typeof navigator === 'undefined') return 4;
  return navigator.hardwareConcurrency ?? 4;
}

function readRenderer() {
  if (typeof document === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    if (!gl || !debugInfo) return undefined;
    return String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
  } catch {
    return undefined;
  }
}
