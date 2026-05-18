/* @vitest-environment happy-dom */

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import criteria from '../../../../../content/accessibility/criteria.json';
import { CriteriaTable, type Criterion } from '../CriteriaTable';

const typedCriteria = criteria as Criterion[];

describe('FR-A11Y-011 CriteriaTable', () => {
  afterEach(cleanup);

  test('renders criteria rows with a semantic caption', () => {
    render(<CriteriaTable criteria={typedCriteria.slice(0, 2)} />);

    expect(screen.getByText('WCAG 2.2 criteria conformance coverage')).toBeTruthy();
    expect(screen.getByText('1.1.1')).toBeTruthy();
    expect(screen.getByText('Non-text Content')).toBeTruthy();
  });

  test('localizes status labels and notes for Vietnamese page', () => {
    render(<CriteriaTable criteria={typedCriteria.slice(0, 1)} locale="vi" />);

    expect(screen.getByText('Bang doi chieu tieu chi WCAG 2.2')).toBeTruthy();
    expect(screen.getByText('Day du')).toBeTruthy();
  });

  test('covers every WCAG 2.2 A and AA criterion and includes implementation evidence', () => {
    const aaRows = typedCriteria.filter((criterion) => criterion.level === 'A' || criterion.level === 'AA');
    const ids = new Set(aaRows.map((criterion) => criterion.id));

    expect(aaRows).toHaveLength(55);
    expect(ids.has('3.3.7')).toBe(true);
    expect(ids.has('3.3.8')).toBe(true);
    expect(ids.has('4.1.1')).toBe(false);
    expect(typedCriteria.every((criterion) => criterion.fr_refs.length > 0)).toBe(true);
  });
});
