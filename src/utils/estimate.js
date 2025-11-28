const { tilingLevels } = require("../constants");

function calculateAreas(measurements = {}) {
  const floorLength = Number(measurements.floorLength) || 0;
  const floorWidth = Number(measurements.floorWidth) || 0;
  const wallHeight = Number(measurements.wallHeight) || 0;
  const totalAreaInput = Number(measurements.totalArea) || 0;

  const floorArea =
    totalAreaInput > 0 ? totalAreaInput : floorLength * floorWidth || 0;

  const wallArea =
    totalAreaInput > 0
      ? floorArea
      : 2 * (floorLength * wallHeight) + 2 * (floorWidth * wallHeight) || 0;

  const totalArea =
    totalAreaInput > 0 ? totalAreaInput : floorArea + wallArea || 0;

  return { floorArea, wallArea, totalArea };
}

function calculateTilingAreas({ floorArea, wallArea }) {
  return {
    budgetArea: floorArea + wallArea * 0.3,
    standardArea: floorArea + wallArea * 0.5,
    premiumArea: floorArea + wallArea * 1.0,
  };
}

function normaliseApplicability(applicability = "") {
  if (!applicability) return "all";
  const lower = applicability.toLowerCase();
  if (lower.includes("all")) return "all";
  if (lower.includes("same layout") || lower.includes("layout stays")) return "same_layout";
  if (lower.includes("toilet will change") || lower.includes("layout change")) return "layout_change";
  if (lower.includes("tiles") && (lower.includes("yes") || lower.includes("select yes"))) return "tiles_yes";
  if (lower.includes("apartment") || lower.includes("lives in apartment")) return "apartment";
  if (lower.includes("wall") && (lower.includes("change") || lower.includes("yes"))) return "wall_change";
  const match = tilingLevels.find((level) =>
    lower.includes(level.toLowerCase())
  );
  return match ? match.toLowerCase() : "custom";
}

function shouldIncludeItem(item, payload = {}) {
  const applicability = normaliseApplicability(item.applicability);
  
  if (applicability === "all") return true;
  
  const bathroomType = (payload.bathroomType || "").toLowerCase();
  const tilingLevel = (payload.tilingLevel || "").toLowerCase();
  
  // Check conditional logic
  if (applicability === "same_layout") {
    // For now, assume included if not explicitly changed
    // In future, add toiletLayout field to survey
    return true; // Default to include
  }
  
  if (applicability === "layout_change") {
    // For now, assume not included unless specified
    // In future, add toiletLayout field to survey
    return false; // Default to exclude
  }
  
  if (applicability === "tiles_yes") {
    // For now, assume included if tiling level is selected
    // In future, add tilesMaterial field to survey
    return !!tilingLevel;
  }
  
  if (applicability === "apartment") {
    return bathroomType === "apartment";
  }
  
  if (applicability === "wall_change") {
    // For now, assume not included unless specified
    // In future, add wallLayoutChange field to survey
    return false; // Default to exclude
  }
  
  // Check tiling level match
  if (tilingLevels.map((lvl) => lvl.toLowerCase()).includes(applicability)) {
    return tilingLevel === applicability;
  }
  
  return true; // Default to include if unclear
}

function selectAreaForItem(item, areas, tiledAreas, tilingLevel) {
  if (item.priceType === "fixed" || item.priceType === "percentage") {
    return 1;
  }

  const normalised = normaliseApplicability(item.applicability);
  
  // For tiling-related items, use tiled area based on tiling level
  if (item.itemName && item.itemName.toLowerCase().includes("tiling")) {
    const tilingKey = `${tilingLevel.toLowerCase()}Area`;
    return tiledAreas[tilingKey] || areas.floorArea;
  }
  
  if (normalised === "all") {
    return areas.totalArea || areas.floorArea;
  }

  if (tilingLevels.map((lvl) => lvl.toLowerCase()).includes(normalised)) {
    const key = `${normalised}Area`;
    return tiledAreas[key] || areas.floorArea;
  }

  return areas.totalArea || areas.floorArea;
}

function resolveFinalPrice(item) {
  if (item.finalPrice && item.finalPrice > 0) {
    return item.finalPrice;
  }

  const baseCost = Number(item.baseCost) || 0;
  const markupPercent = Number(item.markupPercent) || 0;
  return baseCost * (1 + markupPercent / 100);
}

function calculateEstimate(pricingItems = [], payload = {}) {
  const areas = calculateAreas(payload.measurements || {});
  const tiledAreas = calculateTilingAreas(areas);

  const tilingLevel = payload.tilingLevel || "Standard";

  // First pass: calculate all non-percentage line items
  const regularLineItems = [];
  let subtotalBeforePercentages = 0;

  pricingItems
    .filter((item) => item.isActive !== false)
    .forEach((item) => {
      // Check if item should be included based on conditional logic
      if (!shouldIncludeItem(item, payload)) {
        return;
      }

      // Skip percentage items in first pass
      if (item.priceType === "percentage") {
        return;
      }

      const quantity = selectAreaForItem(item, areas, tiledAreas, tilingLevel);
      const unitPrice = resolveFinalPrice(item);
      const total = quantity * unitPrice;

      regularLineItems.push({
        itemName: item.itemName,
        applicability: item.applicability,
        priceType: item.priceType,
        quantity: Number(quantity.toFixed(2)),
        unitPrice: Number(unitPrice.toFixed(2)),
        total: Number(total.toFixed(2)),
      });

      subtotalBeforePercentages += total;
    });

  // Second pass: calculate percentage-based items
  const percentageLineItems = [];
  let currentSubtotal = subtotalBeforePercentages;

  pricingItems
    .filter((item) => item.isActive !== false && item.priceType === "percentage")
    .forEach((item) => {
      if (!shouldIncludeItem(item, payload)) {
        return;
      }

      const percentage = Number(item.finalPrice || item.baseCost || 0);
      const amount = (currentSubtotal * percentage) / 100;

      percentageLineItems.push({
        itemName: item.itemName,
        applicability: item.applicability,
        priceType: "percentage",
        quantity: 1,
        unitPrice: Number(percentage.toFixed(2)),
        total: Number(amount.toFixed(2)),
      });

      currentSubtotal += amount;
    });

  // Combine all line items
  const allLineItems = [...regularLineItems, ...percentageLineItems];
  const baseEstimate = allLineItems.reduce((acc, curr) => acc + curr.total, 0);
  const highEstimate = baseEstimate * 1.35;

  return {
    areas,
    tiledAreas,
    lineItems: allLineItems,
    baseEstimate: Number(baseEstimate.toFixed(2)),
    highEstimate: Number(highEstimate.toFixed(2)),
  };
}

module.exports = {
  calculateAreas,
  calculateTilingAreas,
  calculateEstimate,
};



