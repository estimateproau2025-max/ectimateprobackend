# EstiMate Pro - Testing Guide

This guide explains how to test all features of the EstiMate Pro MVP.

## Prerequisites

1. **Backend server running**: `npm run dev` or `npm start` in `NodeExpressVercel-master`
2. **Frontend server running**: `npm run dev` in `Frontend`
3. **Database connected**: MongoDB connection configured in `.env`

## Step 1: Create Dummy Data

Run the dummy data script to populate the database with test accounts and leads:

```bash
cd NodeExpressVercel-master
npm run create-dummy-data
```

This will create:
- **Admin account** (from `ADMIN_EMAIL` in `.env`)
- **3 Test Builder accounts** with different subscription statuses
- **5 Dummy leads** with calculated estimates

### Test Accounts Created:

1. **Admin**:
   - Email: `admin@estimatepro.com` (or your `ADMIN_EMAIL`)
   - Password: `Admin123!`

2. **Builder 1 (Active Trial)**:
   - Email: `dummy.builder1@test.com`
   - Password: `Test123!`
   - Status: Active trial (2 months remaining)
   - Has 3 leads

3. **Builder 2 (Active Subscription)**:
   - Email: `dummy.builder2@test.com`
   - Password: `Test123!`
   - Status: Active subscription
   - Has 2 leads

4. **Builder 3 (Expired Trial)**:
   - Email: `dummy.builder3@test.com`
   - Password: `Test123!`
   - Status: Expired trial (access disabled)

## Step 2: Run Automated Tests

Run the automated feature test suite:

```bash
cd NodeExpressVercel-master
npm run test-features
```

This will test:
- ✅ API health check
- ✅ User authentication (signup/login)
- ✅ Builder profile management
- ✅ Pricing setup
- ✅ Survey submission
- ✅ Leads management
- ✅ Admin dashboard
- ✅ Estimate calculation
- ✅ Subscription guards

## Step 3: Manual Testing Checklist

### 1. Free Trial & Subscription Logic

- [ ] **Sign up new builder**
  - Go to `https://estimate-pro-chi.vercel.app/auth`
  - Sign up with a new email
  - Verify: Account created with 3-month trial
  - Verify: No payment method required

- [ ] **Trial access**
  - Login as `dummy.builder1@test.com`
  - Verify: Can access dashboard
  - Verify: Trial end date shown in account settings

- [ ] **Expired trial**
  - Login as `dummy.builder3@test.com`
  - Verify: Access blocked or payment required message

### 2. User Authentication & Account Management

- [ ] **Registration**
  - Sign up with new email
  - Verify: Account created successfully
  - Verify: Redirected to dashboard

- [ ] **Login**
  - Login with `dummy.builder1@test.com` / `Test123!`
  - Verify: Successful login
  - Verify: Session persists on refresh

- [ ] **Password Reset**
  - Go to Account Settings
  - Click "Request Password Reset"
  - Verify: Email sent (check console logs)

- [ ] **Profile Update**
  - Go to Account Settings
  - Update business name/phone
  - Verify: Changes saved

### 3. Pricing Setup

- [ ] **Mode A: Final Price**
  - Login as builder
  - Go to Pricing Setup
  - Select "Final Price" mode
  - Add pricing items with final prices
  - Verify: Items saved

- [ ] **Mode B: Base Cost + Markup**
  - Switch to "Base Cost + Markup %" mode
  - Add items with base cost and markup %
  - Verify: Final price calculated automatically
  - Verify: Items saved

- [ ] **Pricing Items Match Excel**
  - Verify all items from Excel are present:
    - Demolition (labour) - $1,500 fixed
    - Waste disposal - $800 fixed
    - Plumbing (same layout) - $800 fixed
    - Plumbing (layout change) - $1,600 fixed
    - Electrical (labour) - $850 fixed
    - Electrical (material) - $500 fixed
    - Waterproofing - $1,000 fixed
    - Tiling (labour) - $55/m²
    - Tiles (material) - $40/m²
    - Niche - $250 fixed
    - Consumables - $1,450 fixed
    - Shower base & screen - $900 fixed
    - Gap filling & painting - $2,000 fixed
    - Builder's labour - 30% percentage
    - Access fee (apartment) - 3% percentage
    - Wall removal - $4,000 fixed

### 4. Client Survey Form

- [ ] **Generate Survey Link**
  - Login as builder
  - Go to Dashboard
  - Copy survey link
  - Verify: Link is unique to builder

- [ ] **Public Survey Access**
  - Open survey link in incognito/private window
  - Verify: No login required
  - Verify: Builder name displayed

- [ ] **Submit Survey**
  - Fill out all fields:
    - Client name, phone, email
    - Measurements (either total m² OR dimensions)
    - Bathroom type (House/Unit, Apartment, Other)
    - Tiling level (Budget, Standard, Premium)
    - Home age category
    - Design style
  - Upload photos (up to 5)
  - Submit
  - Verify: Thank you page shown
  - Verify: Lead created in builder dashboard

### 5. Estimate Calculation

- [ ] **Area Calculations**
  - Submit survey with dimensions:
    - Floor length: 3.5m
    - Floor width: 2.5m
    - Wall height: 2.4m
  - Verify in lead detail:
    - Floor area = 8.75 m²
    - Wall area = 28.8 m²
    - Total area = 37.55 m²

- [ ] **Tiled Area Calculations**
  - For Budget: floor + (wall × 0.30)
  - For Standard: floor + (wall × 0.50)
  - For Premium: floor + (wall × 1.00)
  - Verify: Correct tiled area calculated

- [ ] **Estimate Calculation**
  - Submit survey with Standard tiling
  - Verify in lead detail:
    - Base estimate calculated
    - High estimate = base × 1.35
    - Line items show correct calculations
    - Fixed items included
    - Per m² items use correct area
    - Percentage items calculated on subtotal

- [ ] **Conditional Items**
  - Submit survey with "Apartment" bathroom type
  - Verify: 3% access fee added
  - Submit survey with "House / Unit"
  - Verify: Access fee NOT added

### 6. Builder Dashboard

- [ ] **View Leads**
  - Login as `dummy.builder1@test.com`
  - Go to Leads page
  - Verify: All builder's leads shown
  - Verify: Sorted by date (newest first)
  - Verify: Shows client name, phone, estimate range, status

- [ ] **Lead Detail View**
  - Click on a lead
  - Verify: All survey answers displayed
  - Verify: Photos displayed (if uploaded)
  - Verify: Estimate breakdown shown
  - Verify: Status displayed

- [ ] **Update Lead Status**
  - Open lead detail
  - Change status (e.g., New → Contacted)
  - Verify: Status updated
  - Verify: Change reflected in leads list

### 7. Admin Dashboard

- [ ] **Access Admin Dashboard**
  - Login as admin (`admin@estimatepro.com`)
  - Verify: Admin link in sidebar
  - Go to Admin Dashboard
  - Verify: Summary stats shown

- [ ] **View All Builders**
  - Verify: All builders listed
  - Verify: Shows business name, email, subscription status, signup date
  - Test filters: by subscription status

- [ ] **View All Leads**
  - Verify: All leads across platform shown
  - Test filters: by builder, status, date

- [ ] **Toggle Builder Access**
  - Find a builder
  - Toggle access disabled
  - Verify: Builder cannot login
  - Toggle back
  - Verify: Builder can login

### 8. Stripe Integration

- [ ] **Add Payment Method**
  - Login as builder
  - Go to Account Settings
  - Click "Add / Update Card"
  - Verify: Redirected to Stripe Checkout
  - Use test card: `4242 4242 4242 4242`
  - Verify: Payment method added
  - Verify: Subscription status updated

- [ ] **Manage Billing**
  - Click "Manage Billing in Stripe"
  - Verify: Redirected to Stripe Customer Portal
  - Verify: Can view subscription, update payment method

- [ ] **Webhook Testing** (requires Stripe CLI)
  - Use Stripe CLI to send test webhook events
  - Verify: Subscription status synced in database

### 9. Email Notifications

- [ ] **New Lead Email**
  - Submit survey as client
  - Verify: Builder receives email notification
  - Check email logs in console

- [ ] **Trial Reminder** (requires cron job)
  - Manually trigger: `sendTrialReminderEmails()` for builders 1 week before trial end
  - Verify: Email sent

- [ ] **Trial Expiration** (requires cron job)
  - Manually trigger: `disableExpiredTrials()`
  - Verify: Expired trials disabled
  - Verify: Expiration email sent

### 10. Data & Security

- [ ] **Access Control - Builders**
  - Login as builder
  - Try accessing another builder's leads
  - Verify: Only own leads visible

- [ ] **Access Control - Admin**
  - Login as admin
  - Verify: Can see all builders and leads

- [ ] **Photo Security**
  - Upload photos in survey
  - Verify: Photos stored in `uploads/` directory
  - Verify: Photos accessible via authenticated routes only

- [ ] **Password Security**
  - Sign up with password
  - Verify: Password hashed in database (not plain text)

## Test Data Summary

After running `npm run create-dummy-data`, you'll have:

- **4 Builder accounts** (1 admin + 3 test builders)
- **5 Leads** with calculated estimates
- **Default pricing items** matching Excel structure

## Common Issues & Solutions

### Issue: "Stripe not configured"
- **Solution**: Check `.env` has `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

### Issue: "Database connection failed"
- **Solution**: Check `DATABASE_URL` in `.env` is correct

### Issue: "Email not sending"
- **Solution**: Check email configuration in `.env` (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD)

### Issue: "Survey link not working"
- **Solution**: Ensure builder has `surveySlug` set (auto-generated on signup)

## Next Steps

1. ✅ Run dummy data script
2. ✅ Run automated tests
3. ✅ Complete manual testing checklist
4. ✅ Verify all requirements from Excel are met
5. ✅ Test estimate calculations match Excel formulas

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify `.env` configuration
3. Check database connection
4. Review `TEST_VERIFICATION.md` for implementation details

