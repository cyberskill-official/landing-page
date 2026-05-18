/* FR-OPS-005 mocked draco decoder. Replace with --mode installed once the 240 KB decoder budget is amended or upstream bytes shrink. three=0.184.0; meshoptimizer=1.1.1 */
globalThis.DracoDecoderModule = function DracoDecoderModule() { return Promise.resolve({ mocked: true, decoder: 'draco' }); };
