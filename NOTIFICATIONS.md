# Notifications (appointments & doctor onboarding)

## Doctor welcome email (new doctors)

When an admin **adds a doctor** (or assigns a login ID for the first time) and saves with an **email** on the form, the server emails that doctor:

- **Doctor ID** (e.g. `E7VLHSS7`)
- **Full login link** (e.g. `https://eaglemedicalcare.com/doctor/E7VLHSS7/login`)
- First-login instructions (create password)

Requires:

- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL` (verified sender in Brevo)
- `NEXT_PUBLIC_SITE_URL=https://eaglemedicalcare.com` in Netlify / `.env.local` (no trailing slash)

To **send the welcome email again**, use the **Email** button on the doctor row in Admin → Doctors.

---

## Admin notifications (new appointments)

When a patient completes the booking form, the server saves the row in Supabase, then tries to notify you by **email** (Brevo), **Telegram** (optional bot), and **WhatsApp** (optional CallMeBot).

Default recipients (built into the app; override with env vars if needed):

- Email: `fisihaguade2127@gmail.com`
- Telegram (shown in message text): `@NisirAd`
- WhatsApp: `+251947018285` (`ADMIN_NOTIFY_WHATSAPP_E164=251947018285`)

---

## Where to put these variables

| Environment | What to do |
|-------------|------------|
| **Local** (`npm run dev`) | Create or edit **`.env.local`** in the project root (same folder as `package.json`). Never commit this file. |
| **Production** (e.g. **Netlify**) | Site → **Environment variables** → add each name/value → **Save** → **Redeploy**. |

Format (no spaces around `=`):

```bash
BREVO_API_KEY=xkeysib-xxxxxxxx
BREVO_FROM_EMAIL=noreply@eaglemedicalcare.com
```

Restart `npm run dev` after changing `.env.local`.

---

## 1) Email — Brevo (`BREVO_API_KEY` + `BREVO_FROM_EMAIL`)

### Why you need this

The app sends all transactional mail through [Brevo](https://www.brevo.com) (doctor welcome, password reset, appointment alerts). Without these keys, **no email is sent**.

### Step-by-step (Brevo)

1. Go to [https://www.brevo.com](https://www.brevo.com) and **sign up**.
2. Confirm your account email if Brevo asks.
3. Open **SMTP & API** → **API keys** (or **Settings** → **SMTP & API**).
4. Click **Generate a new API key**, name it e.g. `eagle-medical`, copy it (starts with **`xkeysib-`**). Store it safely — you may only see it once.
5. Open **Senders, Domains & Dedicated IPs** → **Senders**:
   - Add your sender email (e.g. `noreply@eaglemedicalcare.com` or your personal email for testing).
   - Complete Brevo’s verification (confirm the email link, or verify the whole domain with DNS).
6. Add to **`.env.local`** and **Netlify**:

   ```bash
   BREVO_API_KEY=xkeysib-paste_your_key_here
   BREVO_FROM_EMAIL=noreply@eaglemedicalcare.com
   # Optional display name (defaults to "Eagle Medical")
   # BREVO_FROM_NAME=Eagle Medical
   ```

7. **Remove old Resend vars** if present (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) — they are no longer used.

8. **Override admin alert recipient (optional)**  
   Default inbox is `fisihaguade2127@gmail.com`. To change it:

   ```bash
   ADMIN_NOTIFY_EMAIL=you@example.com
   ```

9. **Test**
   - Save a doctor with email → doctor receives welcome mail.
   - Or click **Email** on an existing doctor row.
   - Submit a booking on `/book` → admin receives appointment alert.
   - Check Brevo → **Transactional** → **Emails** / **Logs** if nothing arrives.

**Important:** `BREVO_FROM_EMAIL` must be a **verified sender** (or on a verified domain) in the **same Brevo account** as the API key.

---

## 2) Telegram — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

### Why two values?

Telegram’s API does **not** let a server send a private message using only `@NisirAd`. You create a **bot**, you **start** a chat with it, then you use your numeric **`chat_id`** so the bot can message **you**.

### Step-by-step

1. Open Telegram, search **`@BotFather`**, start a chat.
2. Send `/newbot`, follow prompts, copy the **HTTP API token**.
3. Open your new bot and send **`/start`** (required once).
4. In a browser open (replace `TOKEN`):

   ```text
   https://api.telegram.org/botTOKEN/getUpdates
   ```

5. Find `"chat":{"id": 123456789}` — that number is `TELEGRAM_CHAT_ID`.
6. Set:

   ```bash
   TELEGRAM_BOT_TOKEN=123456:ABC...
   TELEGRAM_CHAT_ID=123456789
   ```

---

## 3) WhatsApp — CallMeBot (optional)

See CallMeBot docs. Set `CALLMEBOT_API_KEY` and optionally `ADMIN_NOTIFY_WHATSAPP_E164`.

---

## Quick checklist

- [ ] `BREVO_API_KEY` in `.env.local` + Netlify  
- [ ] `BREVO_FROM_EMAIL` verified in Brevo Senders  
- [ ] `NEXT_PUBLIC_SITE_URL` set (doctor login links)  
- [ ] Remove unused `RESEND_*` env vars  
- [ ] Restart / redeploy after env changes  
- [ ] (Optional) Telegram + CallMeBot  
- [ ] Test: save doctor, booking, password reset  

If something fails, check host logs for `[notify-doctor-welcome]`, `[notify-admin]`, or `[password-reset]`.
