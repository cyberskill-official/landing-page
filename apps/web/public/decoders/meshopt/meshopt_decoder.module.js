/* FR-OPS-005 mocked meshopt decoder. Replace with --mode installed once the 240 KB decoder budget is amended or upstream bytes shrink. three=0.184.0; meshoptimizer=1.1.1 */
export const MeshoptDecoder = { supported: true, ready: Promise.resolve(), mocked: true, decoder: 'meshopt', decodeGltfBuffer() { throw new Error('FR-OPS-005 mocked Meshopt decoder cannot decode production geometry'); } };
export default MeshoptDecoder;
