# Fix doctor image upload (RLS policy error)

If SQL shows **`must be owner of table objects`**, that is normal on Supabase hosted projects.  
**Do not run policy SQL** — add policies in the **Dashboard** instead.

## Step 1 — Create the bucket

**Option A — Dashboard (easiest)**

1. Supabase → **Storage**
2. **New bucket**
3. Name: `doctor-images`
4. Turn on **Public bucket**
5. Create

**Option B — SQL (bucket only)**

Run `supabase/storage-doctor-images.sql` in the SQL Editor (only the `insert into storage.buckets` line).

---

## Step 2 — Add policies (Dashboard)

1. **Storage** → open bucket **`doctor-images`**
2. Open the **Policies** tab
3. Add these four policies (or use “For full customization” / policy editor):

### Policy 1 — Public read

| Field | Value |
|--------|--------|
| Policy name | `Public read doctor-images` |
| Allowed operation | **SELECT** |
| Target roles | (default / all) |
| Policy definition | `bucket_id = 'doctor-images'` |

### Policy 2 — Admin upload

| Field | Value |
|--------|--------|
| Policy name | `Authenticated insert doctor-images` |
| Allowed operation | **INSERT** |
| Target roles | **authenticated** |
| WITH CHECK expression | `bucket_id = 'doctor-images'` |

### Policy 3 — Admin update (optional)

| Field | Value |
|--------|--------|
| Policy name | `Authenticated update doctor-images` |
| Allowed operation | **UPDATE** |
| Target roles | **authenticated** |
| USING | `bucket_id = 'doctor-images'` |
| WITH CHECK | `bucket_id = 'doctor-images'` |

### Policy 4 — Admin delete (optional)

| Field | Value |
|--------|--------|
| Policy name | `Authenticated delete doctor-images` |
| Allowed operation | **DELETE** |
| Target roles | **authenticated** |
| USING | `bucket_id = 'doctor-images'` |

**Minimum required:** Policy 1 (SELECT) + Policy 2 (INSERT).

Logged-in doctors use the same INSERT policy to upload their own profile photo from the doctor portal.

Also run `supabase/migration-v18-doctor-self-edit.sql` so doctors can update their own profile row after they sign in.

---

## Step 3 — Test

1. Log in at `/admin/login`
2. Go to **Admin → Doctors**
3. Upload a photo again

If it still fails, sign out and sign in again so your auth session is fresh.

---

## Quick path (Supabase templates)

On the bucket **Policies** page, Supabase sometimes offers:

- **“Allow public read access”** → use for public bucket reads  
- **“Allow authenticated uploads”** → use for INSERT for logged-in users  

Apply both to the **`doctor-images`** bucket only.
