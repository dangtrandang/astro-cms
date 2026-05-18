import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Server-side reCAPTCHA v3 verification endpoint.
 *
 * Called by the submit-form API route before saving to Directus.
 * Talks to Google's siteverify API with the secret key (never exposed
 * to the client).
 */

interface GoogleVerifyResponse {
    success: boolean;
    score: number;      // 0.0 (bot) – 1.0 (human)
    action: string;      // should match the action we sent (e.g. "submit_form")
    challenge_ts: string;
    hostname: string;
    'error-codes'?: string[];
}

export const POST: APIRoute = async ({ request }) => {
    const secret = (import.meta as any).env?.RECAPTCHA_SECRET_KEY as string | undefined;
    const threshold = parseFloat(
        (import.meta as any).env?.RECAPTCHA_SCORE_THRESHOLD || '0.5',
    );

    if (!secret) {
        console.error('[verify-recaptcha] RECAPTCHA_SECRET_KEY is not set.');
        // In dev, skip verification when key is missing so the form still works.
        if ((import.meta as any).env?.DEV) {
            return new Response(
                JSON.stringify({ success: true, score: 1.0, action: 'submit_form', devBypass: true }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            );
        }
        return new Response(
            JSON.stringify({ success: false, error: 'Server misconfiguration' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
    }

    let token: string;
    try {
        const body = await request.json();
        token = body.token;
    } catch {
        return new Response(
            JSON.stringify({ success: false, error: 'Invalid request body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
    }

    if (!token || typeof token !== 'string') {
        return new Response(
            JSON.stringify({ success: false, error: 'Missing reCAPTCHA token' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
    }

    try {
        const params = new URLSearchParams();
        params.set('secret', secret);
        params.set('response', token);

        const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        const result: GoogleVerifyResponse = await googleRes.json();

        if (!result.success || (result.score !== undefined && result.score < threshold)) {
            console.warn(
                `[verify-recaptcha] Rejected – success=${result.success}, score=${result.score}, threshold=${threshold}`,
            );
            return new Response(
                JSON.stringify({
                    success: false,
                    score: result.score,
                    error: result['error-codes']?.join(', ') || 'score below threshold',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        return new Response(
            JSON.stringify({ success: true, score: result.score, action: result.action }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
    } catch (err) {
        console.error('[verify-recaptcha] Network error:', err);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to verify reCAPTCHA' }),
            { status: 502, headers: { 'Content-Type': 'application/json' } },
        );
    }
};
