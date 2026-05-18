import type { APIRoute } from 'astro';
export const prerender = false;

/**
 * Verify a reCAPTCHA v3 token directly with Google (no internal HTTP call).
 * Called inline so we avoid Vercel serverless self-call deadlocks.
 */
async function verifyRecaptchaToken(
    token: string,
    secret: string,
    threshold: number,
): Promise<{ success: boolean; score: number }> {
    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', token);

    const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });

    const result = await googleRes.json();

    return {
        success: result.success && (result.score ?? 0) >= threshold,
        score: result.score ?? 0,
    };
}

export const POST: APIRoute = async ({ request }) => {
    const TOKEN = (import.meta as any).env?.DIRECTUS_SERVER_TOKEN as string;

    if (!TOKEN) {
        return new Response(JSON.stringify({ error: 'Server misconfiguration: missing token' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { formId, values, recaptchaToken } = body;

        if (!formId || !values || typeof values !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid payload: formId and values object required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // --- reCAPTCHA v3 server-side verification (direct to Google) ---
        const RECAPTCHA_SECRET = (import.meta as any).env?.RECAPTCHA_SECRET_KEY as string | undefined;
        const RECAPTCHA_THRESHOLD = parseFloat(
            (import.meta as any).env?.RECAPTCHA_SCORE_THRESHOLD || '0.5',
        );

        if (RECAPTCHA_SECRET && recaptchaToken) {
            try {
                const { success, score } = await verifyRecaptchaToken(
                    recaptchaToken,
                    RECAPTCHA_SECRET,
                    RECAPTCHA_THRESHOLD,
                );

                if (!success) {
                    console.warn(
                        `[submit-form API] reCAPTCHA rejected – score: ${score}, threshold: ${RECAPTCHA_THRESHOLD}`,
                    );
                    return new Response(
                        JSON.stringify({ error: `reCAPTCHA verification failed (score: ${score})` }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } },
                    );
                }

                console.log(`[submit-form API] reCAPTCHA passed – score: ${score}`);
            } catch (verifyErr) {
                console.error('[submit-form API] reCAPTCHA verify error:', verifyErr);
                return new Response(
                    JSON.stringify({ error: 'reCAPTCHA verification service unavailable' }),
                    { status: 502, headers: { 'Content-Type': 'application/json' } },
                );
            }
        } else if (RECAPTCHA_SECRET && !recaptchaToken) {
            console.warn('[submit-form API] Missing reCAPTCHA token despite RECAPTCHA_SECRET_KEY being set.');
            return new Response(
                JSON.stringify({ error: 'Missing reCAPTCHA token' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }
        // If RECAPTCHA_SECRET is not set (e.g. local dev), skip silently.
        // --- end reCAPTCHA ---

        const DIRECTUS_URL = (import.meta as any).env?.PUBLIC_DIRECTUS_URL as string;

        const payload = {
            form: formId,
            values,
        };

        const response = await fetch(`${DIRECTUS_URL}/items/form_submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[submit-form API] Directus error:', response.status, errorBody);
            return new Response(JSON.stringify({ error: `Directus error: ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await response.json();

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        console.error('[submit-form API] Error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
