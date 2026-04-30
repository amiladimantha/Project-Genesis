# Payment Alerts Setup Guide

This guide walks you through setting up the Payment Alerts feature for FinTrack, which sends email reminders before subscription payments are due.

## Overview

The Payment Alerts system includes:
- ✅ **Email notifications** via Resend
- ✅ **Multiple reminder timings** (7 days, 3 days, 1 day before payment)
- ✅ **In-app alerts** (dashboard notifications)
- ✅ **User preferences** (dashboard toggle controls)
- ✅ **Automatic cron scheduling** via external service

## Step 1: Set Up Resend Email Service

1. Go to [https://resend.com](https://resend.com) and sign up for a free account
2. Create or verify a domain:
   - Free tier: Use `onboarding@resend.dev` (comes with trial account)
   - Custom domain: Add your domain in Resend dashboard for production
3. Get your API key:
   - Go to **Settings → API Keys**
   - Copy your API key (starts with `re_`)

4. Update your `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=FinTrack <onboarding@resend.dev>  # Or use your domain
   ```

## Step 2: Create Database Tables

FinTrack needs two new tables to store notification settings and alerts.

1. Open your **Supabase dashboard**
2. Go to **SQL Editor**
3. Copy the contents of `SCHEMA.sql`
4. Paste into SQL Editor and run

**Tables created:**
- `notification_preferences` - Stores user alert settings (enabled/disabled)
- `payment_alerts` - Stores in-app notifications shown on dashboard

## Step 3: Set Up Environment Variables

Add to your `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=FinTrack <onboarding@resend.dev>

# Cron Secret (for securing the alerts endpoint)
# Generate a secure random string - example: openssl rand -base64 32
CRON_SECRET=your_very_secure_random_token_here
```

## Step 4: Set Up Cron Job Scheduling

The payment alerts are checked and sent via an API endpoint: `/api/cron/payment-alerts`

You have several options to schedule this:

### Option A: Using EasyCron (Free, Recommended for Testing)

1. Go to [https://www.easycron.com](https://www.easycron.com)
2. Sign up for a free account
3. Click "Add a Cron Job"
4. Set the following:
   - **URL**: `https://yourdomain.com/api/cron/payment-alerts`
   - **HTTP Request Method**: POST
   - **HTTP Authorization Header**: 
     ```
     Bearer your_cron_secret_here
     ```
   - **Execution**: Every day at your preferred time (e.g., 8:00 AM)

5. Test it by clicking "Run Now"

### Option B: Using Vercel Cron (If hosting on Vercel)

If you deploy on Vercel, you can use Vercel's built-in cron:

1. Create a file: `vercel.json`
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/payment-alerts",
         "schedule": "0 8 * * *"
       }
     ]
   }
   ```

2. Deploy to Vercel - cron will run daily at 8 AM UTC

### Option C: Using GitHub Actions

Create `.github/workflows/payment-alerts.yml`:

```yaml
name: Daily Payment Alerts
on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC daily

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Send Payment Alerts
        run: |
          curl -X POST https://yourdomain.com/api/cron/payment-alerts \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Step 5: Test the Setup

1. **Create a test subscription** with a payment date tomorrow or in 1-3 days
2. **Manually trigger** the cron job (use "Run Now" in EasyCron or call the endpoint)
3. **Check email** - you should receive a payment reminder
4. **Check dashboard** - an alert should appear at the top

### Manual Testing Command

```bash
curl -X POST http://localhost:3000/api/cron/payment-alerts \
  -H "Authorization: Bearer your_cron_secret_here"
```

## Step 6: Configure in Dashboard

1. Go to **Dashboard → Settings**
2. Scroll to **Payment Alerts** section
3. Toggle options:
   - Enable/disable email alerts
   - Choose which reminder timings to receive (7, 3, or 1 day)

## Verification Checklist

- [ ] Resend account created and API key obtained
- [ ] Database tables created (run SQL script)
- [ ] Environment variables added to `.env.local`
- [ ] Cron job configured (EasyCron, Vercel, or GitHub Actions)
- [ ] Test subscription created with upcoming payment
- [ ] Cron job triggered manually and email received
- [ ] Dashboard alerts appearing correctly
- [ ] Settings page shows notification preferences panel

## Troubleshooting

### Email Not Received

1. **Check Resend** - Visit [resend.com/emails](https://resend.com/emails) to see if email was sent
2. **Check API Key** - Verify `RESEND_API_KEY` is correct in `.env.local`
3. **Check sender email** - If using `onboarding@resend.dev`, Resend trial has sending limits
4. **Verify domain** - If using custom domain, ensure it's verified in Resend

### Cron Job Not Running

1. **Test the endpoint** directly:
   ```bash
   curl -X POST https://yourdomain.com/api/cron/payment-alerts \
     -H "Authorization: Bearer your_cron_secret_here"
   ```
2. **Check logs** - Look at deployment logs (Vercel/GitHub)
3. **Verify CRON_SECRET** - Make sure secret matches in endpoint header
4. **Check timing** - Cron only sends alerts when payment date matches exactly

### Alerts Not Appearing

1. **Check user preferences** - Ensure alerts are enabled in settings
2. **Check dates** - Payment must be exactly 1, 3, or 7 days away
3. **Check status** - Subscription must be marked as "active"
4. **Check database** - Verify `notification_preferences` table has your user preferences

## Production Deployment

When deploying to production:

1. **Update environment variables** in your hosting platform
2. **Use production email** - Set up custom domain in Resend
3. **Use production URL** - Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. **Secure cron secret** - Use a strong random token for `CRON_SECRET`
5. **Set cron schedule** - Schedule alerts to run at optimal time for your users
6. **Monitor** - Check Resend dashboard weekly for delivery status

## How It Works

```
1. Cron job runs (daily, scheduled)
   ↓
2. Fetches all active subscriptions
   ↓
3. Checks if payment date matches 1, 3, or 7 days from now
   ↓
4. Retrieves user's notification preferences
   ↓
5. Sends email via Resend (if enabled)
   ↓
6. Creates in-app alert in `payment_alerts` table
   ↓
7. Alert appears on user's dashboard
   ↓
8. User can dismiss alert or update preferences
```

## API Endpoint Details

**Endpoint:** `POST /api/cron/payment-alerts`

**Required Header:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "success": true,
  "sentAlerts": 3,
  "alerts": [
    "Netflix to user@example.com (7 days away)",
    "Spotify to user@example.com (1 day away)"
  ],
  "errors": []
}
```

## Security Notes

- The cron endpoint requires the `CRON_SECRET` header for authentication
- User data is protected by Supabase Row-Level Security (RLS)
- Email addresses are only accessed for sending alerts
- Users can disable alerts anytime in settings

## Next Steps

- Monitor email delivery in Resend dashboard
- Collect user feedback on reminder timing
- Consider adding SMS notifications in the future
- Implement alert analytics to track engagement
