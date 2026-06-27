import type { APIRoute } from 'astro';

const DIRECTUS_URL = import.meta.env.PUBLIC_DIRECTUS_URL as string;
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_SERVER_TOKEN as string;
const FORM_UUID = '7c93965b-f97a-46ac-b8c8-18d7c484129b';

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_THRESHOLD = Number(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const params = new URLSearchParams();
  params.set('secret', RECAPTCHA_SECRET!);
  params.set('response', token);
  const googleRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const result = await googleRes.json();
  return {
    success: result.success && (result.score ?? 0) >= RECAPTCHA_THRESHOLD,
    score: result.score ?? 0,
  };
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  let name: string;
  let email: string;
  let subject: string;
  let message: string;
  let recaptchaToken: string | undefined;

  try {
    const body = await request.json();
    name = (body.name as string)?.trim();
    email = (body.email as string)?.trim();
    subject = (body.subject as string)?.trim();
    message = (body.message as string)?.trim();
    recaptchaToken = body.recaptchaToken as string | undefined;
  } catch {
    return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return new Response(JSON.stringify({ error: 'Vui lòng điền đầy đủ thông tin' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!validateEmail(email)) {
    return new Response(JSON.stringify({ error: 'Email không hợp lệ' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // reCAPTCHA verification
  if (RECAPTCHA_SECRET) {
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: 'Thiếu recaptcha token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { success } = await verifyRecaptcha(recaptchaToken);
    if (!success) {
      return new Response(JSON.stringify({ error: 'reCAPTCHA xác thực thất bại' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Submit to Directus
  try {
    const payload = {
      form: FORM_UUID,
      values: { name, email, subject, message },
      recaptcha_token: recaptchaToken || null,
      user_agent: request.headers.get('user-agent') || null,
      page_url: `${import.meta.env.PUBLIC_SITE_URL || ''}/lien-he`,
    };

    const res = await fetch(`${DIRECTUS_URL}/items/form_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Directus submit error:', errText);
      return new Response(JSON.stringify({ error: 'Gửi thất bại, vui lòng thử lại' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact API error:', err);
    return new Response(JSON.stringify({ error: 'Lỗi server, vui lòng thử lại' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};