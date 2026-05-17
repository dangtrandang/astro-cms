import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;

    if (!TOKEN) {
        return new Response(JSON.stringify({ error: 'Server misconfiguration: missing token' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { formId, values } = body;

        if (!formId || !values || typeof values !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid payload: formId and values object required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;

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
