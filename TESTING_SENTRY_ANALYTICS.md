# 🧪 How to Test Sentry & Google Analytics

## 📋 Prerequisites

Make sure you added these to your `.env` file:
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🚀 Quick Test (After Deployment)

### Step 1: Deploy to Production
```bash
npm run build
# Deploy the dist/ folder to your hosting (Vercel/Netlify)
```

### Step 2: Visit blindblitz.com

You'll see a **yellow DevTools panel** in the bottom-right corner (ONLY in production!).

### Step 3: Click the Buttons

1. **🔍 Check Config** - Verifies your DSN/GA ID are loaded
2. **🐛 Test Sentry** - Sends a test error
3. **📊 Test Analytics** - Sends a test event

---

## 📊 **How to Verify Google Analytics**

### Method 1: Real-Time Reports (INSTANT)
1. Go to https://analytics.google.com
2. Click on your property "BlindBlitz"
3. Click **"Reports"** (left sidebar)
4. Click **"Realtime"** (left sidebar)
5. Click **"Test Analytics"** button on your site
6. **Within 30 seconds**, you should see:
   - Event: "Feature Used"
   - Event name: "DevTools Test Button"
   - Active users: +1

### Method 2: Debug View (FOR TESTING)
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Enable it (icon turns blue)
3. Open Chrome DevTools (F12)
4. Go to **Console** tab
5. Visit your site
6. You'll see GA events in console like:
   ```
   [GA4] Event: page_view
   [GA4] Event: user_login
   [GA4] Event: game_started
   ```

### Method 3: Browser Console Check
Open console (F12) and type:
```javascript
// Check if GA is loaded
window.gtag
// Should return: function gtag() { ... }

// Check if measurement ID is set
dataLayer
// Should show array with your G-XXXXXXXXXX
```

---

## 🐛 **How to Verify Sentry**

### Method 1: Test Error Button (EASIEST)
1. Click **"Test Sentry"** button in DevTools panel
2. Go to https://sentry.io
3. Click your project
4. You should see:
   ```
   ❌ TEST ERROR: Sentry is working! 🎉
   ```
5. Click it to see:
   - Stack trace
   - Browser info
   - User context (if logged in)

### Method 2: Real Error Test
1. Open browser console (F12)
2. Type: `throw new Error("My test error")`
3. Check Sentry dashboard - error appears in ~5 seconds

### Method 3: Check Console
In production, Sentry logs:
```
[Sentry] Session started
[Sentry] Breadcrumb: page loaded
```

---

## 📈 **What You Should See (After 24 Hours)**

### Google Analytics Dashboard:
```
Users: 150
New Users: 120
Sessions: 280
Engagement Rate: 68%
Avg Session: 8 min

Top Events:
1. page_view (500)
2. game_started (85)
3. user_signup (42)
4. game_completed (67)
5. daily_reward_claimed (98)
```

### Sentry Dashboard:
```
Issues: 3
Users Affected: 12
Events: 45

Top Issues:
1. TypeError: Cannot read 'fen' of undefined (5 users)
2. Network timeout (3 users)
3. ChessMove validation failed (2 users)
```

---

## 🔍 **Troubleshooting**

### "I don't see anything in Analytics"

**Check:**
1. Is GA Measurement ID correct? (Starts with `G-`)
2. Is it in production? (Dev doesn't send events)
3. Wait 30-60 seconds for real-time data
4. Check browser console for errors
5. Disable ad-blockers (they block GA!)

**Quick Fix:**
```bash
# Check your .env
cat .env | grep VITE_GA

# Rebuild
npm run build

# Redeploy
```

### "Sentry shows nothing"

**Check:**
1. Is Sentry DSN correct? (Starts with `https://`)
2. Is it in production? (Dev doesn't send to Sentry)
3. Did you whitelist your domain in Sentry settings?
4. Check browser console for Sentry init logs

**Quick Fix:**
```bash
# Check your .env
cat .env | grep VITE_SENTRY

# Rebuild
npm run build

# Redeploy
```

---

## 🎯 **Events You're Already Tracking**

### User Actions:
- ✅ Signup
- ✅ Login
- ✅ Logout

### Game Events:
- ✅ Matchmaking start
- ✅ Match found
- ✅ Game started
- ✅ Blind phase completed
- ✅ Game ended (win/loss/draw)

### Economy:
- ✅ Gold earned
- ✅ Gold spent
- ✅ Daily reward claimed

### Navigation:
- ✅ Every page visit (automatic!)

---

## 💡 **Pro Tips**

1. **Use Real-Time reports** - Data appears in 30 seconds
2. **Check Sentry daily** - Fix issues before users complain
3. **Monitor error rate** - Spikes mean something broke
4. **Track conversion funnel**:
   - Visits → Signup → First Game → Retention
5. **Set up alerts** in Sentry for critical errors

---

## 📞 **Still Need Help?**

If analytics/Sentry still doesn't work:

1. Check browser console for errors
2. Verify `.env` variables are set
3. Make sure you rebuilt after adding DSN/GA ID
4. Try in incognito mode (no ad blockers)
5. Check Sentry/GA quotas (free tier limits)

---

**Both tools work automatically in production - no extra code needed!** 🎉
