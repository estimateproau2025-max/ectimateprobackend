const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const Builder = require("../src/models/Builder");
const Lead = require("../src/models/Lead");
const connectDatabase = require("../src/config/database");
const dayjs = require("dayjs");

// Pricing items matching the Excel structure
const defaultPricingItems = [
  // Demolition
  {
    itemName: "Demolition (labour)",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 1500,
    isActive: true,
  },
  {
    itemName: "Waste disposal",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 800,
    isActive: true,
  },
  // Plumbing
  {
    itemName: "Plumbing (labour) if layout stays the same",
    applicability: "If customer selects same layout",
    priceType: "fixed",
    finalPrice: 800,
    isActive: true,
  },
  {
    itemName: "Plumbing (labour) if changes to layout",
    applicability: "If customer selects toilet will change",
    priceType: "fixed",
    finalPrice: 1600,
    isActive: true,
  },
  // Electrical
  {
    itemName: "Electrical (labour)",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 850,
    isActive: true,
  },
  {
    itemName: "Electrical (material)",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 500,
    isActive: true,
  },
  // Tiling
  {
    itemName: "Waterproofing",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 1000,
    isActive: true,
  },
  {
    itemName: "Tiling (labour)",
    applicability: "All estimates",
    priceType: "sqm",
    finalPrice: 55,
    isActive: true,
  },
  {
    itemName: "Tiles (material)",
    applicability: "If customer selects yes for tiles",
    priceType: "sqm",
    finalPrice: 40,
    isActive: true,
  },
  {
    itemName: "Niche extra cost from tiler + builder labour to frame",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 250,
    isActive: true,
  },
  // Consumables
  {
    itemName: "Consumables: Timber, Floor Protection, plaster, insulation, caulking, cornice, fixing materials, etc",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 1450,
    isActive: true,
  },
  {
    itemName: "Supply & installation of shower base & shower screen based on 900x900",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 900,
    isActive: true,
  },
  // Finishes & Builder's labour
  {
    itemName: "Gap filling & painting",
    applicability: "All estimates",
    priceType: "fixed",
    finalPrice: 2000,
    isActive: true,
  },
  {
    itemName: "Builder's labour, project management & administration costs",
    applicability: "All estimates",
    priceType: "percentage",
    finalPrice: 30, // 30%
    isActive: true,
  },
  {
    itemName: "Access/difficult site fee",
    applicability: "If client selects lives in apartment",
    priceType: "percentage",
    finalPrice: 3, // 3%
    isActive: true,
  },
  {
    itemName: "Builder's labour for knocking down/shift wall",
    applicability: "If client selects yes to wall layout change",
    priceType: "fixed",
    finalPrice: 4000,
    isActive: true,
  },
];

async function createDummyData() {
  try {
    await connectDatabase();
    console.log("✅ Connected to database");

    // Clear existing dummy data (optional - comment out if you want to keep existing data)
    // await Builder.deleteMany({ email: { $regex: /^dummy/ } });
    // await Lead.deleteMany({ clientName: { $regex: /^Dummy/ } });
    // console.log("🧹 Cleared existing dummy data");

    // Create Admin Builder
    const adminEmail = process.env.ADMIN_EMAIL || "admin@estimatepro.com";
    let adminBuilder = await Builder.findOne({ email: adminEmail });
    if (!adminBuilder) {
      adminBuilder = await Builder.create({
        businessName: "EstiMate Pro Admin",
        contactName: "Admin User",
        email: adminEmail,
        phone: "+61 400 000 000",
        password: "Admin123!",
        role: "admin",
        pricingItems: defaultPricingItems,
        pricingMode: "final",
        trialEndsAt: dayjs().add(1, "year").toDate(),
        subscriptionStatus: "active",
        hasPaymentMethod: true,
      });
      console.log(`✅ Created admin builder: ${adminBuilder.email}`);
    } else {
      adminBuilder.pricingItems = defaultPricingItems;
      await adminBuilder.save();
      console.log(`✅ Updated admin builder with pricing items`);
    }

    // Create Test Builder 1 (Active Trial)
    let builder1 = await Builder.findOne({ email: "dummy.builder1@test.com" });
    if (!builder1) {
      builder1 = await Builder.create({
        businessName: "Premium Bathroom Renovations",
        contactName: "John Smith",
        email: "dummy.builder1@test.com",
        phone: "+61 400 111 111",
        password: "Test123!",
        role: "builder",
        pricingItems: defaultPricingItems,
        pricingMode: "final",
        trialEndsAt: dayjs().add(2, "month").toDate(),
        subscriptionStatus: "trialing",
        hasPaymentMethod: false,
      });
      console.log(`✅ Created builder 1: ${builder1.email}`);
    } else {
      builder1.pricingItems = defaultPricingItems;
      await builder1.save();
      console.log(`✅ Updated builder 1 with pricing items`);
    }

    // Create Test Builder 2 (Active Subscription)
    let builder2 = await Builder.findOne({ email: "dummy.builder2@test.com" });
    if (!builder2) {
      builder2 = await Builder.create({
        businessName: "Modern Bathroom Solutions",
        contactName: "Sarah Johnson",
        email: "dummy.builder2@test.com",
        phone: "+61 400 222 222",
        password: "Test123!",
        role: "builder",
        pricingItems: defaultPricingItems,
        pricingMode: "base",
        trialEndsAt: dayjs().subtract(1, "month").toDate(),
        subscriptionStatus: "active",
        hasPaymentMethod: true,
      });
      console.log(`✅ Created builder 2: ${builder2.email}`);
    } else {
      builder2.pricingItems = defaultPricingItems;
      await builder2.save();
      console.log(`✅ Updated builder 2 with pricing items`);
    }

    // Create Test Builder 3 (Expired Trial)
    let builder3 = await Builder.findOne({ email: "dummy.builder3@test.com" });
    if (!builder3) {
      builder3 = await Builder.create({
        businessName: "Budget Bathroom Builders",
        contactName: "Mike Wilson",
        email: "dummy.builder3@test.com",
        phone: "+61 400 333 333",
        password: "Test123!",
        role: "builder",
        pricingItems: defaultPricingItems,
        pricingMode: "final",
        trialEndsAt: dayjs().subtract(1, "week").toDate(),
        subscriptionStatus: "inactive",
        hasPaymentMethod: false,
        isAccessDisabled: true,
      });
      console.log(`✅ Created builder 3 (expired trial): ${builder3.email}`);
    } else {
      builder3.pricingItems = defaultPricingItems;
      await builder3.save();
      console.log(`✅ Updated builder 3 with pricing items`);
    }

    // Create dummy leads for builder1
    const existingLeads1 = await Lead.countDocuments({ builder: builder1._id });
    if (existingLeads1 === 0) {
      const leads1 = [
        {
          builder: builder1._id,
          surveySlug: builder1.surveySlug,
          clientName: "Dummy Client 1",
          clientPhone: "+61 411 111 111",
          clientEmail: "dummy.client1@test.com",
          bathroomType: "House / Unit",
          tilingLevel: "Standard",
          designStyle: "Modern minimalist",
          homeAgeCategory: "10-30 years",
          measurements: {
            floorLength: 3.5,
            floorWidth: 2.5,
            wallHeight: 2.4,
          },
          status: "New",
          submittedAt: dayjs().subtract(2, "days").toDate(),
        },
        {
          builder: builder1._id,
          surveySlug: builder1.surveySlug,
          clientName: "Dummy Client 2",
          clientPhone: "+61 411 222 222",
          clientEmail: "dummy.client2@test.com",
          bathroomType: "Apartment",
          tilingLevel: "Premium",
          designStyle: "Luxury spa style",
          homeAgeCategory: "Less than 10 years",
          measurements: {
            totalArea: 12,
          },
          status: "Contacted",
          submittedAt: dayjs().subtract(5, "days").toDate(),
        },
        {
          builder: builder1._id,
          surveySlug: builder1.surveySlug,
          clientName: "Dummy Client 3",
          clientPhone: "+61 411 333 333",
          bathroomType: "House / Unit",
          tilingLevel: "Budget",
          designStyle: "Classic traditional",
          homeAgeCategory: "Over 50 years",
          measurements: {
            floorLength: 4.0,
            floorWidth: 3.0,
            wallHeight: 2.5,
          },
          status: "Site Visit Done",
          submittedAt: dayjs().subtract(10, "days").toDate(),
        },
      ];

      // Calculate estimates for each lead
      const { calculateEstimate } = require("../src/utils/estimate");
      for (const leadData of leads1) {
        const estimate = calculateEstimate(builder1.pricingItems, {
          measurements: leadData.measurements,
          tilingLevel: leadData.tilingLevel,
          bathroomType: leadData.bathroomType,
        });

        leadData.calculatedAreas = {
          ...estimate.areas,
          ...estimate.tiledAreas,
        };
        leadData.estimate = {
          baseEstimate: estimate.baseEstimate,
          highEstimate: estimate.highEstimate,
          lineItems: estimate.lineItems,
        };
      }

      await Lead.insertMany(leads1);
      console.log(`✅ Created ${leads1.length} dummy leads for builder 1`);
    }

    // Create dummy leads for builder2
    const existingLeads2 = await Lead.countDocuments({ builder: builder2._id });
    if (existingLeads2 === 0) {
      const leads2 = [
        {
          builder: builder2._id,
          surveySlug: builder2.surveySlug,
          clientName: "Dummy Client 4",
          clientPhone: "+61 411 444 444",
          clientEmail: "dummy.client4@test.com",
          bathroomType: "House / Unit",
          tilingLevel: "Standard",
          designStyle: "Contemporary",
          homeAgeCategory: "30-50 years",
          measurements: {
            floorLength: 3.0,
            floorWidth: 2.0,
            wallHeight: 2.4,
          },
          status: "Quote Sent",
          submittedAt: dayjs().subtract(1, "day").toDate(),
        },
        {
          builder: builder2._id,
          surveySlug: builder2.surveySlug,
          clientName: "Dummy Client 5",
          clientPhone: "+61 411 555 555",
          bathroomType: "Apartment",
          tilingLevel: "Premium",
          designStyle: "Scandinavian",
          homeAgeCategory: "Less than 10 years",
          measurements: {
            totalArea: 15,
          },
          status: "Quote Accepted",
          submittedAt: dayjs().subtract(7, "days").toDate(),
        },
      ];

      const { calculateEstimate } = require("../src/utils/estimate");
      for (const leadData of leads2) {
        const estimate = calculateEstimate(builder2.pricingItems, {
          measurements: leadData.measurements,
          tilingLevel: leadData.tilingLevel,
          bathroomType: leadData.bathroomType,
        });

        leadData.calculatedAreas = {
          ...estimate.areas,
          ...estimate.tiledAreas,
        };
        leadData.estimate = {
          baseEstimate: estimate.baseEstimate,
          highEstimate: estimate.highEstimate,
          lineItems: estimate.lineItems,
        };
      }

      await Lead.insertMany(leads2);
      console.log(`✅ Created ${leads2.length} dummy leads for builder 2`);
    }

    console.log("\n✅ Dummy data creation complete!");
    console.log("\n📋 Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: Admin123!`);
    console.log("\nBuilder 1 (Active Trial):");
    console.log(`  Email: dummy.builder1@test.com`);
    console.log(`  Password: Test123!`);
    console.log(`  Survey Link: https://estimate-pro-chi.vercel.app/survey/${builder1.surveySlug}`);
    console.log("\nBuilder 2 (Active Subscription):");
    console.log(`  Email: dummy.builder2@test.com`);
    console.log(`  Password: Test123!`);
    console.log(`  Survey Link: https://estimate-pro-chi.vercel.app/survey/${builder2.surveySlug}`);
    console.log("\nBuilder 3 (Expired Trial):");
    console.log(`  Email: dummy.builder3@test.com`);
    console.log(`  Password: Test123!`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating dummy data:", error);
    process.exit(1);
  }
}

createDummyData();

