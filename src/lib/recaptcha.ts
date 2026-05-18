/**
 * reCAPTCHA v3 script loader & token utilities.
 *
 * Loads the Google reCAPTCHA script on demand (only when a form is visible),
 * preventing unnecessary page-load slowdown on pages without forms.
 */

let scriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

/**
 * Dynamically inject the Google reCAPTCHA v3 <script> tag.
 * Safe to call multiple times – the script is only injected once.
 */
export function loadRecaptchaScript(siteKey: string): Promise<void> {
    if (scriptLoaded) return Promise.resolve();
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise<void>((resolve, reject) => {
        // Guard: if the script already exists in the DOM (e.g. another component loaded it)
        const existing = document.querySelector(
            `script[src="https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}"]`,
        );
        if (existing) {
            scriptLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            scriptLoaded = true;

            // Wait for grecaptcha to be fully ready (the script fires its own
            // onload before the grecaptcha object is populated in some cases).
            const waitForReady = () => {
                if (
                    typeof window !== 'undefined' &&
                    window.grecaptcha &&
                    typeof window.grecaptcha.ready === 'function'
                ) {
                    window.grecaptcha.ready(() => resolve());
                } else {
                    setTimeout(waitForReady, 50);
                }
            };
            waitForReady();
        };

        script.onerror = () => {
            scriptLoadPromise = null;
            reject(new Error('Failed to load reCAPTCHA script.'));
        };

        document.head.appendChild(script);
    });

    return scriptLoadPromise;
}

/**
 * Execute reCAPTCHA v3 and return a token.
 * The token is short-lived (~2 minutes) and should be sent to the server immediately.
 */
export async function getRecaptchaToken(siteKey: string, action = 'submit_form'): Promise<string> {
    if (typeof window === 'undefined' || !window.grecaptcha) {
        throw new Error('reCAPTCHA is not available.');
    }

    return new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
        });
    });
}

// Extend the global Window interface so TypeScript knows about grecaptcha.
declare global {
    interface Window {
        grecaptcha: {
            ready(callback: () => void): void;
            execute(siteKey: string, options: { action: string }): Promise<string>;
            render(container: string | HTMLElement, parameters: Record<string, unknown>): number;
            reset(widgetId?: number): void;
            getResponse(widgetId?: number): string;
        };
    }
}
