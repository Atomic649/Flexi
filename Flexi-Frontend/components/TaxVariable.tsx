/**
 * TaxVariable.tsx
 * 
 * Thai Withholding Tax (WHT) percentage rules based on expense group and tax type.
 * This file centralizes all tax-related calculations to make it easier to update
 * when government tax laws change.
 * 
 * Last updated: September 12, 2025
 * Reference: Thai Revenue Department Withholding Tax Regulations
 */

//-------------Command for updating tax rules------------------
// To update tax rules, modify the WHT_PERCENTAGE_RULES array below.
// Each rule includes the expense group, optional tax type, and corresponding WHT percentage.
// Ensure to follow the format and include descriptions for clarity.

//-------------WHT Percentage Rules------------------
// Note: "Fuel" group has no WHT regardless of tax type.
// if group expense selected also watch TaxType set %WHT as foollowing..
// 0% group =Maintenance and TaxType  = Individual

// 1% 
// condition1 (group =Transport and TaxType = Individual)
// condition2 (group = Interest and TaxType = Juristic)

// 2% (group =Advertising )

// 3% 
// codition1 (group as Accounting or Legal or Freelancer or Commission or Copyright or Marketing or Influrencer,Product,Packing,office)
// condition2 (group=Insurance and TaxType=Individual)
// condition3 (group=Transport and TaxType = Juristic)
// condition4 (group =Maintenance and TaxType  = Juristic)

// 5% (group =OfficeRental or  CarRental )

// 10% (group = Dividend)

// 15% (Group = interest and TaxType = Individual)

//--------------------------End of Command------------------

export interface WHTPercentageRule {
  group: string;
  taxType?: "Individual" | "Juristic";
  percentage: number;
  description?: string;
}

export const WHT_PERCENTAGE_RULES: WHTPercentageRule[] = [
  // 0% WHT Rules
  {
    group: "Maintenance",
    taxType: "Individual",
    percentage: 0,
    description: "Maintenance services for individuals"
  },
  
  // 1% WHT Rules
  {
    group: "Transport",
    taxType: "Individual", 
    percentage: 1,
    description: "Transport services for individuals"
  },
  {
    group: "Interest",
    taxType: "Juristic",
    percentage: 1,
    description: "Interest payments to juristic persons"
  },
  
  // 2% WHT Rules
  {
    group: "Advertising",
    percentage: 2,
    description: "Advertising services"
  },
  
  // 3% WHT Rules - Service Groups
  {
    group: "Accounting",
    percentage: 3,
    description: "Accounting services"
  },
  {
    group: "Legal",
    percentage: 3,
    description: "Legal services"
  },
  {
    group: "Freelancer",
    percentage: 3,
    description: "Freelancer services"
  },
  {
    group: "Commission",
    percentage: 3,
    description: "Commission payments"
  },
  {
    group: "Copyright",
    percentage: 3,
    description: "Copyright payments"
  },
  {
    group: "Marketing",
    percentage: 3,
    description: "Marketing services"
  },
  {
    group: "Influencer",
    percentage: 3,
    description: "Influencer services"
  },
  {
    group: "Product",
    percentage: 3,
    description: "Product-related services"
  },
  {
    group: "Packing",
    percentage: 3,
    description: "Packing services"
  },
  {
    group: "Office",
    percentage: 3,
    description: "Office services"
  },
  
  // 3% WHT Rules - Conditional
  {
    group: "Insurance",
    taxType: "Individual",
    percentage: 3,
    description: "Insurance services for individuals"
  },
  {
    group: "Transport",
    taxType: "Juristic",
    percentage: 3,
    description: "Transport services for juristic persons"
  },
  {
    group: "Maintenance",
    taxType: "Juristic",
    percentage: 3,
    description: "Maintenance services for juristic persons"
  },
  
  // 5% WHT Rules
  {
    group: "OfficeRental",
    percentage: 5,
    description: "Office rental payments"
  },
  {
    group: "CarRental",
    percentage: 5,
    description: "Car rental payments"
  },
  
  // 10% WHT Rules
  {
    group: "Dividend",
    percentage: 10,
    description: "Dividend payments"
  },
  
  // 15% WHT Rules
  {
    group: "Interest",
    taxType: "Individual",
    percentage: 15,
    description: "Interest payments to individuals"
  }
];

/**
 * Get WHT percentage based on expense group and tax type
 * @param group - Expense group
 * @param taxType - Tax type (Individual or Juristic)
 * @returns WHT percentage (0-15)
 */
export const getWHTPercentage = (
  group: string, 
  taxType: "Individual" | "Juristic"
): number => {
  // Special case: Fuel group has no WHT
  if (group === "Fuel") {
    return 0;
  }

  // Find matching rule with specific tax type first
  const specificRule = WHT_PERCENTAGE_RULES.find(
    rule => rule.group === group && rule.taxType === taxType
  );
  
  if (specificRule) {
    return specificRule.percentage;
  }

  // Find matching rule without tax type requirement
  const generalRule = WHT_PERCENTAGE_RULES.find(
    rule => rule.group === group && !rule.taxType
  );

  return generalRule ? generalRule.percentage : 3;
};

/**
 * Get all expense groups that require WHT
 * @returns Array of expense groups with WHT requirements
 */
export const getWHTRequiredGroups = (): string[] => {
  const groups = WHT_PERCENTAGE_RULES.map(rule => rule.group);
  return [...new Set(groups)]; // Remove duplicates
};

/**
 * Get WHT rule details for a specific group and tax type
 * @param group - Expense group
 * @param taxType - Tax type
 * @returns Rule details or null if not found
 */
export const getWHTRuleDetails = (
  group: string, 
  taxType: "Individual" | "Juristic"
): WHTPercentageRule | null => {
  // Find specific rule first
  const specificRule = WHT_PERCENTAGE_RULES.find(
    rule => rule.group === group && rule.taxType === taxType
  );
  
  if (specificRule) {
    return specificRule;
  }

  // Find general rule
  const generalRule = WHT_PERCENTAGE_RULES.find(
    rule => rule.group === group && !rule.taxType
  );

  return generalRule || null;
};

/**
 * Check if an expense group requires WHT
 * @param group - Expense group
 * @returns Boolean indicating if WHT is required
 */
export const isWHTRequired = (group: string): boolean => {
  if (group === "Fuel") return false;
  return WHT_PERCENTAGE_RULES.some(rule => rule.group === group);
};

export default {
  WHT_PERCENTAGE_RULES,
  getWHTPercentage,
  getWHTRequiredGroups,
  getWHTRuleDetails,
  isWHTRequired
};
