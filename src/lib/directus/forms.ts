export const submitForm = async (
  formId: string,
  fields: { id: string; name: string; type: string }[],
  data: Record<string, any>,
  recaptchaToken: string,
) => {
  const values: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];
    if (!field.name || value === undefined || value === null || value === '') continue;
    values[field.name] = String(value);
  }

  const response = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formId, values, recaptchaToken }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('[submitForm] Error:', err);
    const message = err?.error || 'Failed to submit form';

    // Surface reCAPTCHA-specific errors to the UI
    if (message.includes('reCAPTCHA') || message.includes('score')) {
      throw new Error('reCAPTCHA verification failed. Please try again.');
    }

    throw new Error(message);
  }
};
