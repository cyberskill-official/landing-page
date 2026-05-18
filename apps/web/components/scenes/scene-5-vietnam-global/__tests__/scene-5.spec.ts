import { describe, expect, test } from 'vitest';
import { createDestinationArcGeometry, greatCirclePoints } from '../DestinationArc';
import { DESTINATION_POINTS, HCMC_POINT, latLonToVector3 } from '../HcmcPin';
import { estimateIcosahedronTriangles, GLOBE_DETAIL, GLOBE_SPIN_RATE } from '../StylizedGlobe';
import { TRUST_SIGNALS } from '../TrustSignalsStrip';

describe('FR-SCENE-017 Scene 5 Vietnam global implementation', () => {
  test('uses a faceted globe, HCMC pin, three destination pins, and great-circle arcs', () => {
    expect(estimateIcosahedronTriangles(GLOBE_DETAIL)).toBe(20_480);
    expect(GLOBE_SPIN_RATE).toBe(0.15);
    expect(HCMC_POINT).toMatchObject({ lat: 10.776, lon: 106.701 });
    expect(DESTINATION_POINTS.map((point) => point.label)).toEqual(['New York', 'London', 'Berlin']);
    const start = latLonToVector3(HCMC_POINT.lat, HCMC_POINT.lon);
    const end = latLonToVector3(DESTINATION_POINTS[0]!.lat, DESTINATION_POINTS[0]!.lon);
    expect(greatCirclePoints(start, end, 16)).toHaveLength(16);
    expect(createDestinationArcGeometry(DESTINATION_POINTS[0]!).type).toBe('TubeGeometry');
  });

  test('trust signals avoid cost-led language', () => {
    const text = TRUST_SIGNALS.join(' ').toLowerCase();
    expect(text).toContain('duns 673219568');
    expect(text).not.toMatch(/cheap|affordable|low-cost|rate|competitive pricing/);
  });
});
