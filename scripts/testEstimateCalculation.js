const { calculateEstimate } = require("../src/utils/estimate");

// Test Case 1: Standard tiling, Apartment, Toilet same location, No wall changes
console.log("=== Test Case 1: Standard tiling, Apartment ===");
const pricingItems1 = [
  { itemName: "Demolition labour", applicability: "All estimates", priceType: "fixed", finalPrice: 1500, isActive: true },
  { itemName: "Waste disposal", applicability: "All estimates", priceType: "fixed", finalPrice: 800, isActive: true },
  { itemName: "Plumbing labour (layout same)", applicability: "If customer selects same layout", priceType: "fixed", finalPrice: 800, isActive: true },
  { itemName: "Plumbing labour (layout change)", applicability: "If customer selects toilet will change", priceType: "fixed", finalPrice: 1600, isActive: true },
  { itemName: "Electrical labour", applicability: "All estimates", priceType: "fixed", finalPrice: 850, isActive: true },
  { itemName: "Electrical material", applicability: "All estimates", priceType: "fixed", finalPrice: 500, isActive: true },
  { itemName: "Waterproofing", applicability: "All estimates", priceType: "fixed", finalPrice: 1000, isActive: true },
  { itemName: "Niche (fixed cost)", applicability: "All estimates", priceType: "fixed", finalPrice: 250, isActive: true },
  { itemName: "Consumables", applicability: "All estimates", priceType: "fixed", finalPrice: 1450, isActive: true },
  { itemName: "Shower base + screen", applicability: "All estimates", priceType: "fixed", finalPrice: 900, isActive: true },
  { itemName: "Gap filling & painting", applicability: "All estimates", priceType: "fixed", finalPrice: 2000, isActive: true },
  { itemName: "Builder labour for wall knock/shift", applicability: "If customer selects yes to changes to wall layout", priceType: "fixed", finalPrice: 0, isActive: true },
  { itemName: "Tiling labour", applicability: "All estimates", priceType: "sqm", finalPrice: 55, isActive: true },
  { itemName: "Tiles material", applicability: "If customer selects yes for tiles", priceType: "sqm", finalPrice: 0, isActive: true },
  { itemName: "Builder labour / PM / admin", applicability: "All estimates", priceType: "percentage", markupPercent: 30, isActive: true },
  { itemName: "Access/difficult site fee", applicability: "If client selects lives in apartment", priceType: "percentage", markupPercent: 3, isActive: true },
];

const payload1 = {
  measurements: {
    floorLength: 3.1,
    floorWidth: 2.1,
    wallHeight: 2.0,
  },
  tilingLevel: "Standard",
  bathroomType: "Apartment",
  toiletMove: false, // same location
  wallChange: false, // no
  includeTiles: false, // client supplies own
};

const result1 = calculateEstimate(pricingItems1, payload1);
console.log("Areas:", result1.areas);
console.log("Tiled Areas:", result1.tiledAreas);
console.log("Expected Standard Area: 6.51 + (20.80 * 0.5) = 16.91");
console.log("Actual Standard Area:", result1.tiledAreas.standardArea);
console.log("\nLine Items:");
result1.lineItems.forEach(item => {
  console.log(`${item.itemName}: ${item.quantity} × $${item.unitPrice} = $${item.total}`);
});
console.log("\nBase Estimate:", result1.baseEstimate);
console.log("High Estimate:", result1.highEstimate);
console.log("Expected Base: $14,603.47");
console.log("Expected High: $18,984.51");

// Test Case 2: Premium tiling, House/Unit, Toilet change location, No wall changes
console.log("\n\n=== Test Case 2: Premium tiling, House/Unit ===");
const payload2 = {
  measurements: {
    floorLength: 2.5,
    floorWidth: 3.0,
    wallHeight: 2.8,
  },
  tilingLevel: "Premium",
  bathroomType: "House / Unit",
  toiletMove: true, // change location
  wallChange: false, // no
  includeTiles: false, // client supplies own
};

const result2 = calculateEstimate(pricingItems1, payload2);
console.log("Areas:", result2.areas);
console.log("Tiled Areas:", result2.tiledAreas);
console.log("Expected Premium Area: 7.50 + (30.80 * 1.0) = 38.30");
console.log("Actual Premium Area:", result2.tiledAreas.premiumArea);
console.log("\nLine Items:");
result2.lineItems.forEach(item => {
  console.log(`${item.itemName}: ${item.quantity} × $${item.unitPrice} = $${item.total}`);
});
console.log("\nBase Estimate:", result2.baseEstimate);
console.log("High Estimate:", result2.highEstimate);
console.log("Expected Base: $16,843.45");
console.log("Expected High: $21,896.49");

