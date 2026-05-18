import { glowAsThreeColor } from '@cyberskill/ds-cinematic/tokens/glow';

export const DUST_GLOW_TOKEN = '--glow-genie-soft';
export const DUST_GLOW_COLOR = glowAsThreeColor('genie_soft');

export const DUST_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPointSize;
  uniform float uDpr;

  attribute vec3 aVelocity;
  attribute float aLifetime;
  attribute float aPhase;

  varying float vAlpha;

  void main() {
    float life = fract((uTime + aPhase) / aLifetime);
    vec3 animated = position + (aVelocity * life);
    float radial = length(animated.xy) / 2.4;
    float centerAlpha = mix(1.0, 0.3, smoothstep(0.0, 0.5, radial));
    float edgeAlpha = 1.0 - smoothstep(0.5, 0.7, radial);
    vAlpha = centerAlpha * edgeAlpha * (1.0 - (life * 0.35));

    vec4 modelPosition = modelMatrix * vec4(animated, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * uDpr * (1.0 + (1.0 - life) * 0.2);
  }
`;

export const DUST_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;

  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float mote = 1.0 - smoothstep(0.18, 0.5, length(uv));
    gl_FragColor = vec4(uColor, mote * vAlpha * uIntensity);
  }
`;
