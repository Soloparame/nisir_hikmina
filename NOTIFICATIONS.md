# Admin notifications (new appointments)

When a patient completes the booking form, the server saves the row in Supabase, then tries to notify you by **email** (Resend), **Telegram** (optional bot), and **WhatsApp** (optional CallMeBot).

Default recipients (built into the app; override with env vars if needed):

- Email: `fisihaguade2127@gmail.com`
- Telegram (shown in message text): `@NisirAd`
- WhatsApp: `+251947018285` (`ADMIN_NOTIFY_WHATSAPP_E164=251947018285`)

---

## Where to put these variables

| Environment | What to do |
|-------------|------------|
| **Local** (`npm run dev`) | Create or edit **`.env.local`** in the project root (same folder as `package.json`). Never commit this file. |
| **Production** (e.g. **Vercel**) | Project → **Settings** → **Environment Variables** → add each name/value → choose **Production** (and **Preview** if you want previews to notify too) → **Save** → trigger a **new deployment** (Redeploy) so the server picks up the new values. |

Format (no spaces around `=`):

```bash
RESEND_API_KEY=re_xxxxxxxx
```

Restart `npm run dev` after changing `.env.local`.

---

## 1) Email — `RESEND_API_KEY` (recommended)

### Why you need this

The app sends email through [Resend](https://resend.com). Without `RESEND_API_KEY`, **no email is sent** (you’ll see a warning in server logs).

### Step-by-step (Resend)

1. Go to [https://resend.com](https://resend.com) and **sign up** (GitHub or email).
2. Confirm your email if Resend asks you to.
3. In the Resend dashboard, open **API Keys** (sometimes under **Settings**).
4. Click **Create API Key**, give it a name (e.g. `eagle-medical`), choose permission **Sending access** (or full if that’s the only option).
5. Copy the key — it starts with **`re_`**. You only see the full key once; if you lose it, create a new key.
6. Add to **`.env.local`** (and to your host’s env vars for production):

   ```bash
   RESEND_API_KEY=re_paste_your_key_here
   ```

7. **Sender address (optional)**  
   For quick tests, the app defaults to Resend’s test sender:  
   `Eagle Medical <onboarding@resend.dev>`  
   Resend may restrict who you can send **to** on the free tier (often your own inbox until you add a domain). If mail doesn’t arrive, open Resend → **Logs** / **Emails** to see bounces or errors.

8. **Custom domain (later, optional)**  
   After you verify a domain in Resend, you can set:

   ```bash
   RESEND_FROM_EMAIL=Eagle Medical <appointments@yourdomain.com>
   ```

9. **Override recipient email (optional)**  
   Default inbox is already `fisihaguade2127@gmail.com`. To change it:

   ```bash
   ADMIN_NOTIFY_EMAIL=you@example.com
   ```

10. **Test**  
    Run the app, submit a booking on `/book`, then check the inbox and Resend dashboard logs.

---

## 2) Telegram — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

### Why two values?

Telegram’s API does **not** let a server send a private message using only `@NisirAd`. You create a **bot**, you **start** a chat with it, then you use your numeric **`chat_id`** so the bot can message **you**.

### Step-by-step (Telegram)

1. In Telegram, open **[@BotFather](https://t.me/BotFather)**.
2. Send: **`/newbot`**
3. Follow prompts: choose a **display name** (e.g. `Eagle Medical Appointments Bot`) and a **username** ending in `bot` (e.g. `eagle_medical_bot`).
4. BotFather replies with a **HTTP API token** — a long string like `7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. **Copy it.** That is `TELEGRAM_BOT_TOKEN`.

   ```bash
   TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. Open your new bot in Telegram (tap the link BotFather gives you) and send **`/start`** (or any message). This creates a chat between **you** and the bot.

6. In a **desktop browser**, open this URL (replace `TOKEN` with your real token, **no spaces**):

   `https://api.telegram.org/botTOKEN/getUpdates`

   Example (fake token):

   `https://api.telegram.org/bot7123456789:AAHxxxx/getUpdates`

7. You should see JSON. Search for **`"chat"`** then **`"id"`** under the object that represents **your** user (not the bot). Typical private chat id looks like:

   ```json
   "chat":{"id":123456789,"first_name":"YourName", ...
   ```

   That number **`123456789`** is `TELEGRAM_CHAT_ID` (sometimes negative for groups; for a private DM to the bot it’s usually positive).

   ```bash
   TELEGRAM_CHAT_ID=123456789
   ```

8. If `getUpdates` is empty, send **`/start`** to the bot again, wait a second, refresh the URL.

9. Add both variables to **`.env.local`** and production, restart dev / redeploy, then submit a test booking. You should get a Telegram message with the appointment text.

---

## 3) WhatsApp — `CALLMEBOT_API_KEY` (optional)

There is no official free “send WhatsApp from my Next.js app” API without a provider. This project can use **[CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/)** so your **own WhatsApp number** receives a text when someone books.

### Step-by-step (CallMeBot — high level)

Exact screens can change; always follow CallMeBot’s current instructions on their site.

1. Open CallMeBot’s WhatsApp API guide:  
   [https://www.callmebot.com/blog/free-api-whatsapp-messages/](https://www.callmebot.com/blog/free-api-whatsapp-messages/)

2. They usually ask you to **send a specific WhatsApp message** from the phone number that should **receive** alerts (e.g. your `+251947018285` line) to their control number. That **links** your WhatsApp to their service.

3. After linking, they give you an **API key** (a number or string). Put it in env:

   ```bash
   CALLMEBOT_API_KEY=paste_key_from_callmebot
   ```

4. The app sends to the default **`251947018285`** (no `+` in env). To use a different number:

   ```bash
   ADMIN_NOTIFY_WHATSAPP_E164=2519XXXXXXXX
   ```

   Use **country code + number**, digits only (Ethiopia is `251`).

5. Redeploy / restart, then test a booking. If nothing arrives, check CallMeBot’s FAQ and that the phone completed their activation message.

---

## Quick checklist

- [ ] `RESEND_API_KEY` in `.env.local` + production host  
- [ ] Restart dev server / redeploy after any env change  
- [ ] (Optional) `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`  
- [ ] (Optional) `CALLMEBOT_API_KEY` (+ `ADMIN_NOTIFY_WHATSAPP_E164` if not default)  
- [ ] Submit a test appointment on `/book` and verify email / Telegram / WhatsApp  

If something still fails, check **host logs** (Vercel → Deployment → **Functions** / **Logs**) for lines starting with `[notify-admin]`.
