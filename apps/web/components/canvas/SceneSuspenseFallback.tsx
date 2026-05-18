export function SceneSuspenseFallback() {
  return (
    <group userData={{ suspenseFallback: 'gold-pulse' }}>
      <mesh scale={[0.28, 0.28, 0.28]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#e8b523" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
