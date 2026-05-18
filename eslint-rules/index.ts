import noAllocInUseFrame from './no-alloc-in-use-frame';
import noLongTitle from './no-long-title';
import noOutlineNone from './no-outline-none';
import noUndisposedThreeRef from './no-undisposed-three-ref';

export const rules = {
  'no-alloc-in-use-frame': noAllocInUseFrame,
  'no-long-title': noLongTitle,
  'no-outline-none': noOutlineNone,
  'no-undisposed-three-ref': noUndisposedThreeRef,
};

export default { rules };
