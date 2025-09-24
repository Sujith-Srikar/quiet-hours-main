# Supabase Email Confirmation Redirect Fix

## The Problem

After users click the email confirmation link, they're being redirected to `localhost` instead of your deployed Netlify URL. This happens because Supabase doesn't know your production URL for redirects.

## The Solution

### 1. Set Environment Variables in Netlify

Go to your Netlify site dashboard → **Site Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_SITE_URL=https://your-app-name.netlify.app
```

Replace `your-app-name.netlify.app` with your actual Netlify domain.

### 2. Configure Supabase Dashboard

In your Supabase project dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Redirect URLs**:
   ```
   https://your-app-name.netlify.app/auth/callback
   ```
3. Set **Site URL** to:
   ```
   https://your-app-name.netlify.app
   ```

### 3. Updated Code Changes

The following files have been updated to handle redirects properly:

#### `lib/supabaseClient.ts`

- Added `siteUrl` export for consistent URL handling
- Uses `NEXT_PUBLIC_SITE_URL` environment variable

#### `components/Auth/Register.tsx`

- Now includes `emailRedirectTo` option in signup
- Redirects to correct callback URL after email confirmation

#### `pages/auth/callback.tsx`

- Improved error handling and user feedback
- Better session management after email confirmation
- Clear status messages for users

### 4. Testing the Fix

1. **Local Development**: Uses `http://localhost:3000`
2. **Production**: Uses your `NEXT_PUBLIC_SITE_URL`

### 5. Deployment Checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` in Netlify environment variables
- [ ] Configure redirect URLs in Supabase dashboard
- [ ] Deploy your updated code
- [ ] Test email confirmation flow

### 6. Common Issues & Solutions

**Issue**: Still redirecting to localhost
**Solution**: Clear browser cache and ensure `NEXT_PUBLIC_SITE_URL` is set correctly in Netlify

**Issue**: "Invalid redirect URL" error
**Solution**: Make sure the exact URL is added to Supabase's redirect URLs list

**Issue**: Email confirmation not working
**Solution**: Check Supabase email templates and ensure they're using the correct redirect URL

### 7. Environment Variables Summary

Required environment variables for Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-app-name.netlify.app
MONGODB_URI=your_mongodb_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_from_email_address
```

After making these changes and redeploying, your email confirmation links should redirect to your live Netlify site instead of localhost.
