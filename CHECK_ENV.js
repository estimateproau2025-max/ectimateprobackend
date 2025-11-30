// Quick script to check if environment variables are loaded
// Run: node CHECK_ENV.js

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const config = require('./src/config');

console.log('\n=== Environment Variables Check ===\n');

console.log('Database URL:', config.databaseUrl ? '✅ Set' : '❌ Missing');
console.log('Access Token Secret:', config.jwt.accessTokenSecret ? '✅ Set' : '❌ Missing');
console.log('Refresh Token Secret:', config.jwt.refreshTokenSecret ? '✅ Set' : '❌ Missing');
console.log('Frontend URL:', config.frontendUrl);
console.log('\n--- Stripe Configuration ---');
console.log('Stripe Secret Key:', config.stripe.secretKey ? '✅ Set' : '❌ MISSING (Required for billing)');
console.log('Stripe Publishable Key:', config.stripe.publishableKey ? '✅ Set' : '❌ Missing');
console.log('Stripe Price ID:', config.stripe.defaultPriceId ? '✅ Set' : '⚠️  Optional (for subscriptions)');
console.log('Stripe Webhook Secret:', config.stripe.webhookSecret ? '✅ Set' : '⚠️  Optional (for production)');
console.log('\n--- Email Configuration ---');
console.log('Email Host:', config.email.host ? '✅ Set' : '⚠️  Optional');
console.log('Email User:', config.email.user ? '✅ Set' : '⚠️  Optional');
console.log('\n--- Admin ---');
console.log('Admin Email:', config.admin.email || 'Not set');
console.log('\n=====================================\n');

if (!config.stripe.secretKey) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is required for billing features!');
  console.error('   Please add it to your .env file in the NodeExpressVercel-master directory.');
  console.error('   Example: STRIPE_SECRET_KEY=sk_test_...\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set!\n');



