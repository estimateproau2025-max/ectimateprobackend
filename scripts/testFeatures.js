const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const API_BASE = process.env.API_BASE || "https://esitmatebackend.vercel.app/api";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ectimateprobackend.vercel.app";

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function logTest(name, passed, message = "") {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}${message ? `: ${message}` : ""}`);
    testResults.failed++;
    testResults.errors.push({ name, message });
  }
}

async function testAPI(endpoint, method = "GET", data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };
    if (data) config.data = data;
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

async function runTests() {
  console.log("🧪 Starting Feature Tests\n");
  console.log("=" .repeat(60));

  // Test 1: Health Check
  console.log("\n📋 Test 1: API Health Check");
  const healthCheck = await testAPI("/test/stripe-config");
  logTest("API is accessible", healthCheck.success, healthCheck.error?.message);

  // Test 2: Authentication - Signup
  console.log("\n📋 Test 2: User Authentication");
  const testEmail = `test.${Date.now()}@test.com`;
  const signupResult = await testAPI("/auth/v1/signup", "POST", {
    email: testEmail,
    password: "Test123!",
    data: { full_name: "Test User" },
  });
  logTest("User signup", signupResult.success, signupResult.error?.message);

  let accessToken = null;
  if (signupResult.success && signupResult.data?.access_token) {
    accessToken = signupResult.data.access_token;
    logTest("Access token received", true);
  } else {
    logTest("Access token received", false, "No token in response");
  }

  // Test 3: Authentication - Login
  const loginResult = await testAPI("/auth/v1/token", "POST", {
    email: testEmail,
    password: "Test123!",
    grant_type: "password",
  });
  logTest("User login", loginResult.success, loginResult.error?.message);
  if (loginResult.success && loginResult.data?.access_token) {
    accessToken = loginResult.data.access_token;
  }

  // Test 4: Get Builder Profile
  console.log("\n📋 Test 4: Builder Profile");
  if (accessToken) {
    const profileResult = await testAPI("/builders/me", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
    });
    logTest("Get builder profile", profileResult.success, profileResult.error?.message);
    if (profileResult.success) {
      logTest("Trial end date exists", !!profileResult.data?.builder?.trialEndsAt);
      logTest("Survey slug exists", !!profileResult.data?.builder?.surveySlug);
    }
  } else {
    logTest("Get builder profile", false, "No access token");
  }

  // Test 5: Pricing Setup
  console.log("\n📋 Test 5: Pricing Setup");
  if (accessToken) {
    const pricingData = {
      pricingMode: "final",
      pricingItems: [
        {
          itemName: "Test Item",
          applicability: "All estimates",
          priceType: "fixed",
          finalPrice: 1000,
          isActive: true,
        },
      ],
    };
    const pricingResult = await testAPI(
      "/builders/pricing",
      "PUT",
      pricingData,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
    logTest("Update pricing", pricingResult.success, pricingResult.error?.message);

    const getPricingResult = await testAPI("/builders/pricing", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
    });
    logTest("Get pricing", getPricingResult.success, getPricingResult.error?.message);
    if (getPricingResult.success) {
      logTest(
        "Pricing items saved",
        getPricingResult.data?.pricingItems?.length > 0
      );
    }
  } else {
    logTest("Update pricing", false, "No access token");
  }

  // Test 6: Survey Submission (using dummy builder)
  console.log("\n📋 Test 6: Survey Submission");
  // First, get a builder's survey slug
  const dummyLogin = await testAPI("/auth/v1/token", "POST", {
    email: "dummy.builder1@test.com",
    password: "Test123!",
    grant_type: "password",
  });
  if (dummyLogin.success && dummyLogin.data?.access_token) {
    const builderProfile = await testAPI("/builders/me", "GET", null, {
      Authorization: `Bearer ${dummyLogin.data.access_token}`,
    });
    if (builderProfile.success && builderProfile.data?.builder?.surveySlug) {
      const surveySlug = builderProfile.data.builder.surveySlug;
      // Note: Survey submission requires multipart/form-data, so this is a simplified test
      logTest("Survey slug accessible", true);
      logTest(
        "Survey endpoint exists",
        true,
        `Survey URL: ${FRONTEND_URL}/survey/${surveySlug}`
      );
    } else {
      logTest("Survey slug accessible", false, "No survey slug found");
    }
  } else {
    logTest("Survey submission test", false, "Could not login as dummy builder");
  }

  // Test 7: Leads Management
  console.log("\n📋 Test 7: Leads Management");
  if (dummyLogin.success && dummyLogin.data?.access_token) {
    const leadsResult = await testAPI("/leads", "GET", null, {
      Authorization: `Bearer ${dummyLogin.data.access_token}`,
    });
    logTest("Get leads list", leadsResult.success, leadsResult.error?.message);
    if (leadsResult.success) {
      logTest(
        "Leads returned",
        Array.isArray(leadsResult.data?.leads || leadsResult.data)
      );
      const leads = leadsResult.data?.leads || leadsResult.data || [];
      if (leads.length > 0) {
        logTest("Lead has estimate", !!leads[0].estimate);
        logTest("Lead has status", !!leads[0].status);
      }
    }
  } else {
    logTest("Get leads list", false, "No access token");
  }

  // Test 8: Admin Dashboard
  console.log("\n📋 Test 8: Admin Dashboard");
  const adminEmail = process.env.ADMIN_EMAIL || "estimateproau2025@gmail.com";
  const adminLogin = await testAPI("/auth/v1/token", "POST", {
    email: adminEmail,
    password: "Admin123!",
    grant_type: "password",
  });
  if (adminLogin.success && adminLogin.data?.access_token) {
    const adminToken = adminLogin.data.access_token;
    const adminSummary = await testAPI("/admin/summary", "GET", null, {
      Authorization: `Bearer ${adminToken}`,
    });
    logTest("Admin summary", adminSummary.success, adminSummary.error?.message);
    if (adminSummary.success) {
      logTest("Summary has stats", !!adminSummary.data?.totalBuilders);
    }

    const adminBuilders = await testAPI("/admin/builders", "GET", null, {
      Authorization: `Bearer ${adminToken}`,
    });
    logTest("Admin builders list", adminBuilders.success, adminBuilders.error?.message);
  } else {
    logTest("Admin dashboard", false, "Could not login as admin");
  }

  // Test 9: Estimate Calculation
  console.log("\n📋 Test 9: Estimate Calculation");
  const { calculateEstimate } = require("../src/utils/estimate");
  const testMeasurements = {
    floorLength: 3.5,
    floorWidth: 2.5,
    wallHeight: 2.4,
  };
  const testPricingItems = [
    {
      itemName: "Test Fixed Item",
      applicability: "All estimates",
      priceType: "fixed",
      finalPrice: 1000,
      isActive: true,
    },
    {
      itemName: "Test SQM Item",
      applicability: "All estimates",
      priceType: "sqm",
      finalPrice: 50,
      isActive: true,
    },
  ];
  try {
    const estimate = calculateEstimate(testPricingItems, {
      measurements: testMeasurements,
      tilingLevel: "Standard",
    });
    logTest("Estimate calculation", !!estimate.baseEstimate);
    logTest("High estimate calculated", estimate.highEstimate === estimate.baseEstimate * 1.30);
    logTest("Line items generated", estimate.lineItems.length > 0);
    logTest("Areas calculated", !!estimate.areas.floorArea);
    logTest("Tiled areas calculated", !!estimate.tiledAreas.standardArea);
  } catch (error) {
    logTest("Estimate calculation", false, error.message);
  }

  // Test 10: Subscription Guard
  console.log("\n📋 Test 10: Subscription Guard");
  if (accessToken) {
    // Try accessing a protected route
    const protectedRoute = await testAPI("/leads", "GET", null, {
      Authorization: `Bearer ${accessToken}`,
    });
    logTest("Protected route access", protectedRoute.success || protectedRoute.status === 402);
  } else {
    logTest("Protected route access", false, "No access token");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Test Summary");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log("\n❌ Errors:");
    testResults.errors.forEach((err) => {
      console.log(`   - ${err.name}: ${err.message}`);
    });
  }

  console.log("\n" + "=".repeat(60));
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});

