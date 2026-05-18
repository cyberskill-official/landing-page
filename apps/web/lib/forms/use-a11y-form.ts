'use client';

import { useCallback, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

export type A11yFormOptions<T extends FieldValues> = {
  schema: z.ZodType<T>;
  defaultValues?: UseFormProps<T>['defaultValues'];
};

export type A11yFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  focusFirstError: (errors?: FieldErrors<T>) => void;
  fieldErrorId: (name: Path<T>) => string;
  fieldTipId: (name: Path<T>) => string;
  describedBy: (name: Path<T>, includeTip?: boolean) => string | undefined;
};

export function useA11yForm<T extends FieldValues>({
  schema,
  defaultValues,
}: A11yFormOptions<T>): A11yFormReturn<T> {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const firstErrorName = useCallback((errors: FieldErrors<T>): Path<T> | undefined => {
    return Object.keys(errors)[0] as Path<T> | undefined;
  }, []);

  const focusFirstError = useCallback(
    (errors: FieldErrors<T> = methods.formState.errors) => {
      const name = firstErrorName(errors);
      if (!name || typeof document === 'undefined') return;

      const field = document.querySelector<HTMLElement>(`[name="${String(name)}"]`);
      field?.focus();
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [firstErrorName, methods.formState.errors],
  );

  useEffect(() => {
    if (methods.formState.submitCount === 0) return;
    if (Object.keys(methods.formState.errors).length === 0) return;
    focusFirstError(methods.formState.errors);
  }, [focusFirstError, methods.formState.errors, methods.formState.submitCount]);

  const fieldErrorId = (name: Path<T>) => `${String(name)}-error`;
  const fieldTipId = (name: Path<T>) => `${String(name)}-tip`;
  const describedBy = (name: Path<T>, includeTip = false) => {
    const parts = [];
    if (includeTip) parts.push(fieldTipId(name));
    if (fieldError(methods.formState.errors, String(name))) parts.push(fieldErrorId(name));
    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  return {
    ...methods,
    focusFirstError,
    fieldErrorId,
    fieldTipId,
    describedBy,
  };
}

export function fieldError(errors: FieldErrors, name: string) {
  return errors[name];
}

export function errorMessages(errors: FieldErrors) {
  return Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => typeof message === 'string');
}
