import { useState, useCallback } from 'react';
import { loadRecaptchaScript, getRecaptchaToken } from '@/lib/recaptcha';

interface UseRecaptchaReturn {
    /** Call this before submitting the form. Returns a reCAPTCHA token. */
    execute: () => Promise<string>;
    /** True while the reCAPTCHA script is loading or the token is being fetched. */
    isLoading: boolean;
    /** A human-readable error message, or null. */
    error: string | null;
}

/**
 * React hook that provides a reCAPTCHA v3 token on demand.
 *
 * Usage inside a form submit handler:
 *
 *   const recaptcha = useRecaptcha();
 *   const token = await recaptcha.execute();
 *   // send token alongside form data
 */
export function useRecaptcha(): UseRecaptchaReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const siteKey = (import.meta as any).env?.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined;

    const execute = useCallback(async (): Promise<string> => {
        if (!siteKey) {
            setError('reCAPTCHA is not configured. Missing PUBLIC_RECAPTCHA_SITE_KEY.');
            throw new Error('RECAPTCHA_NOT_CONFIGURED');
        }

        setIsLoading(true);
        setError(null);

        try {
            await loadRecaptchaScript(siteKey);
            const token = await getRecaptchaToken(siteKey, 'submit_form');
            return token;
        } catch (err: any) {
            const message = err?.message || 'reCAPTCHA verification failed. Please refresh and try again.';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [siteKey]);

    return { execute, isLoading, error };
}
