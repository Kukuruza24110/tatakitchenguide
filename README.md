# Тата Анастасия — Cloudflare Pages

Сайт для продажи PDF-гайдов с отдельными страницами и доставкой заявок в Telegram.

## Публикация через GitHub + Cloudflare Pages

1. Распакуйте архив и загрузите **содержимое папки** в корень GitHub-репозитория (включая `public/` и `functions/`).
2. В Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** (интерфейс может немного отличаться). Выберите репозиторий и ветку `main`.
3. Framework preset: `None`; Build command: `exit 0`; Build output directory: `public`; Root directory: оставить стандартной (корень).
4. Запустите публикацию. Cloudflare выдаст адрес `название.pages.dev`.
5. В проекте откройте **Settings → Variables and Secrets**. Добавьте:
   - `TELEGRAM_BOT_TOKEN` — токен от @BotFather, **Encrypt/Secret**.
   - `TELEGRAM_CHAT_ID` — `371891461`.
   Добавьте для Production и, если нужно, Preview.
6. Сделайте повторный Deploy (или новый commit), затем отправьте заявку со страницы гайда.
7. Важно: **сначала откройте своего Telegram-бота и нажмите Start**, иначе он не сможет писать вам в личный чат.

## Файлы

- `public/index.html` — главная страница.
- `public/guides/*.html` — четыре отдельные страницы.
- `public/images/` — положите свои изображения.
- `functions/api/order.js` — серверный обработчик формы POST `/api/order`.

Не загружайте токен бота в репозиторий. Кнопка «Купить» отправляет **заявку**, а не принимает платёж. Фотографии и тексты сейчас содержат заглушки — замените перед рекламой сайта. Для полноценного коммерческого запуска нужны политика конфиденциальности и защита от спама.
Telegram deployment test
