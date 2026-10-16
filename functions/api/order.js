// Cloudflare Pages Function: POST /api/order
// Credentials must be configured under Pages > Settings > Variables and Secrets.

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

export async function onRequestPost({ request, env }) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 10000) return json({ error: 'Слишком большая заявка' }, 413);
  let data;
  try { data = await request.json(); } catch { return json({error:'Неверный формат заявки'}, 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return json({error:'Неверный формат заявки'}, 400);
  const field = (key, max) => typeof data[key] === 'string' ? data[key].trim().slice(0, max) : '';
  if (field('website', 200)) return json({ok:true}); // spam trap
  const name=field('name',100), phone=field('phone',60), email=field('email',160),
    messenger=field('messenger',160) || field('telegram',160), guide=field('guide',120), guideTitle=field('guideTitle',120);
  if (!name || !phone || !email || !messenger || !/^[a-z0-9][a-z0-9-]{0,59}$/.test(guide) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({error:'Проверьте заполнение полей'},400);
  if (env.SITE_KV) {
    const catalog = await env.SITE_KV.get('catalog','json');
    if (catalog && !catalog.guides?.[guide]) return json({error:'Гайд не найден'},400);
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.error('Missing Telegram secrets');
    return json({error:'Сервис заявок временно недоступен'},503);
  }
  const message = [
    '🧁 <b>Новая заявка с сайта</b>', '',
    `📖 <b>Гайд:</b> ${escapeHTML(guideTitle || guide)}`,
    `👤 <b>Имя:</b> ${escapeHTML(name)}`,
    `📞 <b>Телефон:</b> ${escapeHTML(phone)}`,
    `✉️ <b>Email:</b> ${escapeHTML(email)}`,
    `💬 <b>Мессенджер:</b> ${escapeHTML(messenger)}`
  ].join('\n');
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: env.TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML', disable_web_page_preview: true})
    });
    if (!response.ok) {
      console.error('Telegram API returned', response.status);
      return json({error:'Не удалось доставить заявку'},503);
    }
    const result = await response.json();
    if (!result.ok) return json({error:'Не удалось доставить заявку'},503);
    return json({ok:true});
  } catch(error) {
    console.error('Telegram network error', String(error));
    return json({error:'Не удалось доставить заявку'},503);
  }
}
