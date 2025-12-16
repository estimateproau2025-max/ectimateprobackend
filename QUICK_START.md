# Quick Start - Testing EstiMate Pro

## 🚀 Quick Setup

### 1. Start Backend Server
```bash
cd NodeExpressVercel-master
npm install  # If not already done
npm run dev  # Or: npm start
```

### 2. Start Frontend Server (in another terminal)
```bash
cd Frontend
npm install  # If not already done
npm run dev
```

### 3. Create Dummy Data
```bash
cd NodeExpressVercel-master
npm run create-dummy-data
```

This creates:
- ✅ Admin account
- ✅ 3 test builder accounts
- ✅ 5 dummy leads with estimates
- ✅ Default pricing items matching Excel

### 4. Run Automated Tests
```bash
cd NodeExpressVercel-master
npm run test-features
```

## 📋 Test Accounts

After running `create-dummy-data`, use these accounts:

### Admin
- **Email**: `estimateproau2025@gmail.com` (or your `ADMIN_EMAIL`)
- **Password**: `Admin123!`

### Builder 1 (Active Trial - 2 months left)
- **Email**: `dummy.builder1@test.com`
- **Password**: `Test123!`
- **Survey Link**: Shown in console after running script

### Builder 2 (Active Subscription)
- **Email**: `dummy.builder2@test.com`
- **Password**: `Test123!`

### Builder 3 (Expired Trial)
- **Email**: `dummy.builder3@test.com`
- **Password**: `Test123!`

## ✅ What's Been Implemented

### Estimate Calculation
- ✅ All pricing items from Excel prototype
- ✅ Conditional logic (apartment fee, etc.)
- ✅ Percentage-based pricing (30% builder's labour, 3% apartment fee)
- ✅ Tiled area calculations (budget/standard/premium)
- ✅ Two-pass calculation (regular items, then percentages)

### All MVP Requirements
- ✅ Free trial & subscription logic
- ✅ User authentication & account management
- ✅ Pricing setup (Mode A & B)
- ✅ Client survey form
- ✅ Estimate calculation
- ✅ Builder dashboard
- ✅ Admin dashboard
- ✅ Stripe integration
- ✅ Email notifications
- ✅ Data & security

## 🧪 Testing Checklist

1. **Login as Builder 1**
   - View dashboard
   - Check leads (should have 3)
   - View lead details
   - Update lead status

2. **Test Survey Submission**
   - Get survey link from builder dashboard
   - Open in incognito window
   - Submit survey with measurements
   - Verify estimate calculated correctly

3. **Test Pricing Setup**
   - Go to Pricing Setup
   - Switch between Mode A (Final Price) and Mode B (Base + Markup)
   - Add/update pricing items
   - Verify items saved

4. **Test Admin Dashboard**
   - Login as admin
   - View all builders
   - View all leads
   - Toggle builder access

5. **Test Stripe Integration**
   - Go to Account Settings
   - Click "Add / Update Card"
   - Use test card: `4242 4242 4242 4242`

## 📊 Verify Estimate Calculation

Submit a survey with:
- **Floor length**: 3.5m
- **Floor width**: 2.5m
- **Wall height**: 2.4m
- **Tiling level**: Standard
- **Bathroom type**: Apartment (to test apartment fee)

Expected calculations:
- Floor area = 8.75 m²
- Wall area = 28.8 m²
- Total area = 37.55 m²
- Standard tiled area = 8.75 + (28.8 × 0.50) = 23.15 m²

The estimate should include:
- All fixed items
- Tiling labour × 23.15 m²
- Builder's labour (30% of subtotal)
- Access fee (3% of subtotal, because apartment)

## 📚 Documentation

- **TESTING_GUIDE.md** - Comprehensive manual testing guide
- **TEST_VERIFICATION.md** - Requirements verification checklist
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🐛 Troubleshooting

### "Stripe not configured"
- Check `.env` has `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

### "Database connection failed"
- Check `DATABASE_URL` in `.env`

### "Scripts not found"
- Ensure you're in `NodeExpressVercel-master` directory
- Run `npm install` first

### "No leads showing"
- Run `npm run create-dummy-data` to populate test data

## 🎯 Next Steps

1. ✅ Run dummy data script
2. ✅ Test all features manually
3. ✅ Verify estimates match Excel calculations
4. ✅ Test Stripe integration
5. ✅ Verify all requirements from Excel are met

---

**Ready to test!** Start with `npm run create-dummy-data` and follow the test accounts above.


