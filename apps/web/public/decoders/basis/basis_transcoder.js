/* FR-OPS-005 mocked basis decoder. Replace with --mode installed once the 240 KB decoder budget is amended or upstream bytes shrink. three=0.184.0; meshoptimizer=1.1.1 */
globalThis.BASIS = function BASIS() { return Promise.resolve({ mocked: true, decoder: 'basis' }); };
