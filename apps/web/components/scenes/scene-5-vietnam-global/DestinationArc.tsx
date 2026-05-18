'use client';

import React, { useMemo } from 'react';
import { TubeGeometry, CatmullRomCurve3, Vector3 } from 'three';
import { DESTINATION_POINTS, HCMC_POINT, latLonToVector3, type GeoPoint } from './HcmcPin';
import { GLOBE_RADIUS } from './StylizedGlobe';

export function greatCirclePoints(start: Vector3, end: Vector3, samples = 16) {
  const startUnit = start.clone().normalize();
  const endUnit = end.clone().normalize();
  return Array.from({ length: samples }, (_, index) => {
    const t = index / (samples - 1);
    return startUnit.clone().lerp(endUnit, t).normalize().multiplyScalar(GLOBE_RADIUS * 1.08);
  });
}

export function createDestinationArcGeometry(destination: GeoPoint) {
  const start = latLonToVector3(HCMC_POINT.lat, HCMC_POINT.lon);
  const end = latLonToVector3(destination.lat, destination.lon);
  return new TubeGeometry(new CatmullRomCurve3(greatCirclePoints(start, end)), 32, 0.01, 8, false);
}

export function DestinationArc({ destination }: { destination: GeoPoint }) {
  const geometry = useMemo(() => createDestinationArcGeometry(destination), [destination]);

  return (
    <mesh geometry={geometry} name={`scene-5-arc-${destination.label}`}>
      <meshBasicMaterial color="#FFEB3B" transparent opacity={0.78} />
    </mesh>
  );
}

export function DestinationArcs() {
  return (
    <>
      {DESTINATION_POINTS.map((destination) => (
        <DestinationArc key={destination.label} destination={destination} />
      ))}
    </>
  );
}
