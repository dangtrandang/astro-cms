import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  // Đọc dữ liệu từ Directus gửi sang
  const body = await request.json();
  
  console.log("Dữ liệu nhận từ Directus:", body);

  return new Response(JSON.stringify({ 
    status: "success", 
    message: "Endpoint đã hoạt động!" 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};