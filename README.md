# Nisir Health — Next.js App

Ethiopia's trusted health appointment booking platform.

## Project Structure

```
nisir-health/
├── app/
│   ├── globals.css          # Global styles & CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Landing page (/)
│   ├── page.module.css      # Landing page styles
│   ├── book/
│   │   ├── page.tsx         # Booking form (/book)
│   │   └── book.module.css
│   └── success/
│       ├── page.tsx         # Confirmation page (/success)
│       └── success.module.css
├── components/
│   ├── Navbar.tsx           # Shared navigation bar
│   └── Navbar.module.css
├── package.json
├── tsconfig.json
└── next.config.js
```

## Pages

- `/` — Landing page: hero, services, about Nisir, how it works, footer
- `/book` — Booking form: name, disease, phone, Telegram, city (Ethiopia only), consult type
- `/success` — Confirmation: booking summary, Telegram channel link, back to home

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

## Customization

- **Telegram channel link**: Update `https://t.me/nisirhealth` in `app/success/page.tsx`
- **Cities list**: Edit the `CITIES` array in `app/book/page.tsx`
- **Services**: Edit the `services` array in `app/page.tsx`
- **Colors**: Update CSS variables in `app/globals.css`

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- CSS Modules
- No external UI libraries
