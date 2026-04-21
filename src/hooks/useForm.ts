// src/hooks/useForm.ts
import { useState, useCallback } from 'react';

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;
type Validator<T extends FormValues> = (values: T) => FormErrors;

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  validate?: Validator<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends FormValues>({ initialValues, validate, onSubmit }: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, errors, isSubmitting, handleChange, handleSubmit, reset };
}
