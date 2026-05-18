'use client';

import { useState } from 'react';
import { clearStoredFormPrefill } from '@/lib/forms/use-form-prefill';

export function FormPrefillClearButton() {
  const [cleared, setCleared] = useState(false);

  return (
    <div className="form-prefill-clear">
      <button
        type="button"
        onClick={() => {
          clearStoredFormPrefill();
          setCleared(true);
        }}
      >
        Clear saved form details
      </button>
      <p aria-live="polite" data-form-prefill-clear-status>
        {cleared ? 'Saved form details cleared on this device.' : ''}
      </p>
    </div>
  );
}
