import type { BQCData } from '@/types';

/**
 * Calculate EMD amount for BQC/PQC criteria based on lot position
 * Returns values in Lakhs as per the specified criteria
 */
export function calculateBQCEMD(lotIndex: number): number {
  // EMD amounts as per the specified criteria
  const emdAmounts = [2.5, 1, 0, 1, 1]; // Lot 1, 2, 3, 4, 5
  
  if (lotIndex >= 0 && lotIndex < emdAmounts.length) {
    return emdAmounts[lotIndex];
  }
  
  // Default to 0 for lots beyond the specified range
  return 0;
}

/**
 * Format EMD amount for display in the BQC/PQC format
 */
export function formatEMDAmount(emdAmount: number): string {
  if (emdAmount === 0) {
    return 'Nil';
  }
  return `Rs. ${emdAmount} Lacs`;
}

/**
 * Calculate EMD amount based on estimated value and tender type
 * Based on the official EMD table - returns values in Lakhs
 * 
 * EMD Table (Fixed amounts in Lakhs):
 * 50L-100L: Goods=Nil, Service=1L, Works=1L (inclusive of both 50L and 100L)
 * >100L-500L: All types=2.5L
 * >500L-1000L: All types=5L
 * >1000L-1500L: All types=7.5L
 * >1500L-2500L: All types=10L
 * >2500L: All types=20L
 */
export function calculateEMD(estimatedValue: number, tenderType: string): number {
  // Convert Cr to Lakhs for calculation (1 Cr = 100 Lakhs)
  const valueInLakhs = estimatedValue * 100;
  
  // Debug logging
  console.log(`EMD Calculation: Value=${estimatedValue}Cr (${valueInLakhs}L), Type="${tenderType}"`);
  
  if (tenderType === 'Goods') {
    // Goods: 50L-100L = Nil, >100L = fixed amounts
    if (valueInLakhs >= 50 && valueInLakhs <= 100) {
      console.log('Goods: Returning Nil for 50L-100L range');
      return 0; // Nil
    } else if (valueInLakhs > 100 && valueInLakhs <= 500) {
      return 2.5; // 2.5 Lakhs
    } else if (valueInLakhs > 500 && valueInLakhs <= 1000) {
      return 5; // 5 Lakhs
    } else if (valueInLakhs > 1000 && valueInLakhs <= 1500) {
      return 7.5; // 7.5 Lakhs
    } else if (valueInLakhs > 1500 && valueInLakhs <= 2500) {
      return 10; // 10 Lakhs
    } else if (valueInLakhs > 2500) {
      return 20; // 20 Lakhs
    }
    console.log('Goods: Returning 0 for values < 50L');
    return 0; // For values < 50L
  }
  
  if (tenderType === 'Service') {
    // Service: 50L-100L = 1L (inclusive), >100L = fixed amounts
    if (valueInLakhs >= 50 && valueInLakhs <= 100) {
      console.log('Service: Returning 1L for 50L-100L range');
      return 1; // 1 Lakh
    } else if (valueInLakhs > 100 && valueInLakhs <= 500) {
      return 2.5; // 2.5 Lakhs
    } else if (valueInLakhs > 500 && valueInLakhs <= 1000) {
      return 5; // 5 Lakhs
    } else if (valueInLakhs > 1000 && valueInLakhs <= 1500) {
      return 7.5; // 7.5 Lakhs
    } else if (valueInLakhs > 1500 && valueInLakhs <= 2500) {
      return 10; // 10 Lakhs
    } else if (valueInLakhs > 2500) {
      return 20; // 20 Lakhs
    }
    console.log('Service: Returning 0 for values < 50L');
    return 0; // For values < 50L
  }
  
  if (tenderType === 'Works') {
    // Works: 50L-100L = 1L (inclusive), >100L = fixed amounts
    if (valueInLakhs >= 50 && valueInLakhs <= 100) {
      console.log('Works: Returning 1L for 50L-100L range');
      return 1; // 1 Lakh
    } else if (valueInLakhs > 100 && valueInLakhs <= 500) {
      return 2.5; // 2.5 Lakhs
    } else if (valueInLakhs > 500 && valueInLakhs <= 1000) {
      return 5; // 5 Lakhs
    } else if (valueInLakhs > 1000 && valueInLakhs <= 1500) {
      return 7.5; // 7.5 Lakhs
    } else if (valueInLakhs > 1500 && valueInLakhs <= 2500) {
      return 10; // 10 Lakhs
    } else if (valueInLakhs > 2500) {
      return 20; // 20 Lakhs
    }
    console.log('Works: Returning 0 for values < 50L');
    return 0; // For values < 50L
  }
  
  console.log(`Unknown tender type: "${tenderType}", returning 0`);
  return 0; // Default case
}

/**
 * Calculate annualized value based on contract period (in months)
 * Only annualize if contract period is more than 12 months
 */
export function calculateAnnualizedValue(cecEstimate: number, contractPeriodMonths: number): number {
  if (contractPeriodMonths <= 0) return 0;
  
  // Only annualize if contract period is more than 12 months
  if (contractPeriodMonths > 12) {
    const contractPeriodYears = contractPeriodMonths / 12;
    return cecEstimate / contractPeriodYears;
  }
  
  // For 12 months or less, return the full amount (no annualization)
  return cecEstimate;
}

/**
 * Calculate Past Performance requirement for individual lot or total
 * Updated to use 30% of Quantity Supplied
 */
export function calculatePastPerformance(quantitySupplied: number, mseRelaxation: boolean = false): number {
  const basePercentage = 0.30; // 30% of Quantity Supplied
  
  if (mseRelaxation) {
    // Apply 15% relaxation: 30% * (1 - 0.15) = 25.5%
    return Math.round(quantitySupplied * basePercentage * (1 - 0.15));
  } else {
    // Standard 30% of Quantity Supplied
    return Math.round(quantitySupplied * basePercentage);
  }
}

/**
 * Calculate total CEC values for lot-wise evaluation
 */
export function calculateLotWiseTotals(data: BQCData): {
  totalCECInclGst: number;
  totalCECExclGst: number;
  totalPastPerformance: number;
} {
  if (data.evaluationMethodology === 'least cash outflow') {
    // For least cash outflow, only use quantitySupplied if it's provided, otherwise return 0
    const quantitySupplied = data.quantitySupplied || 0;
    // Always return Non-MSE (standard) value for the main calculation
    // MSE value will be calculated separately in the UI
    return {
      totalCECInclGst: data.cecEstimateInclGst,
      totalCECExclGst: data.cecEstimateExclGst,
      totalPastPerformance: calculatePastPerformance(quantitySupplied, false)
    };
  }

  // Lot-wise calculations
  const totalCECInclGst = data.lots?.reduce((sum, lot) => sum + (lot.cecEstimateInclGst || 0), 0) || 0;
  const totalCECExclGst = data.lots?.reduce((sum, lot) => sum + (lot.cecEstimateExclGst || 0), 0) || 0;
  const totalPastPerformance = data.lots?.reduce((sum, lot) => 
    sum + calculatePastPerformance(lot.quantitySupplied || 0, lot.mseRelaxation || false), 0) || 0;

  return {
    totalCECInclGst,
    totalCECExclGst,
    totalPastPerformance
  };
}

/**
 * Calculate turnover requirement with refined logic
 * Updated to use 30% of (CEC including GST - AMC) and annualize based on contract period
 */
export function calculateTurnoverRequirement(data: BQCData): {
  amount: number;
  percentage: number;
  description: string;
} {
  let basePercentage = 0.3;

  // Apply correction factor when divisible for all tender types
  if (data.divisibility === 'Divisible') {
    basePercentage = 0.3 * (1 + data.correctionFactor);
  }

  // Get total CEC values (handles both least cash outflow and lot-wise)
  const totals = calculateLotWiseTotals(data);

  // Calculate base amount: CEC including GST minus AMC
  let baseAmount = totals.totalCECInclGst;
  
  // Subtract AMC if applicable (only if value > 0)
  if (data.evaluationMethodology === 'least cash outflow' && data.hasAmc && data.amcValue && data.amcValue > 0) {
    baseAmount -= data.amcValue;
  } else if (data.evaluationMethodology === 'Lot-wise' && data.lots) {
    const totalAMC = data.lots.reduce((sum, lot) => sum + (lot.hasAmc && lot.amcValue && lot.amcValue > 0 ? lot.amcValue : 0), 0);
    baseAmount -= totalAMC;
  }

  // Calculate turnover requirement as 30% of (CEC including GST - AMC)
  const turnoverAmount = basePercentage * baseAmount;
  
  // Always apply annualization based on contract duration (divide by contract period)
  const contractDurationYears = data.contractDurationYears || 1;
  const annualizedAmount = turnoverAmount / contractDurationYears;
  
  const description = `${basePercentage * 100}% of (CEC including GST${(data.hasAmc && data.amcValue && data.amcValue > 0) || (data.lots && data.lots.some(lot => lot.hasAmc && lot.amcValue && lot.amcValue > 0)) ? ' - AMC' : ''}) ÷ ${contractDurationYears} year${contractDurationYears !== 1 ? 's' : ''}`;

  return {
    amount: annualizedAmount,
    percentage: basePercentage * 100,
    description
  };
}


/**
 * Calculate lot-wise similar works requirements for Service/Works
 */
export function calculateLotWiseSimilarWorks(data: BQCData): {
  lots: Array<{
    lotId: string;
    lotNumber: string;
    optionA: number;
    optionB: number;
    optionC: number;
  }>;
  totals: {
    optionA: number;
    optionB: number;
    optionC: number;
  };
} {
  if (data.tenderType !== 'Service' && data.tenderType !== 'Works') {
    return {
      lots: [],
      totals: { optionA: 0, optionB: 0, optionC: 0 }
    };
  }

  const lots = data.lots?.map(lot => {
    const baseAmount = lot.cecEstimateInclGst || 0;
    
    // Parse contract period from text or use numeric value
    let contractMonths = lot.contractPeriodMonths || 12;
    if (lot.contractPeriodText) {
      const numericMatch = lot.contractPeriodText.match(/(\d+)/);
      if (numericMatch) {
        contractMonths = parseInt(numericMatch[1]);
        // Handle years conversion
        if (lot.contractPeriodText.toLowerCase().includes('year')) {
          contractMonths = contractMonths * 12;
        }
      }
    }
    
    const contractYears = contractMonths / 12;
    const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
    const finalAmount = lot.mseRelaxation ? annualizedAmount * 0.85 : annualizedAmount;
    
    return {
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      optionA: finalAmount * 0.4, // 40%
      optionB: finalAmount * 0.5, // 50%
      optionC: finalAmount * 0.8  // 80%
    };
  }) || [];

  const totals = lots.reduce(
    (acc, lot) => ({
      optionA: acc.optionA + lot.optionA,
      optionB: acc.optionB + lot.optionB,
      optionC: acc.optionC + lot.optionC
    }),
    { optionA: 0, optionB: 0, optionC: 0 }
  );

  return { lots, totals };
}

/**
 * Calculate experience requirements for Service/Works
 */
export function calculateExperienceRequirements(data: BQCData): {
  optionA: { percentage: number; value: number };
  optionB: { percentage: number; value: number };
  optionC: { percentage: number; value: number };
} {
  // Apply correction factor if divisible
  let optionAPercent = 0.4;
  let optionBPercent = 0.5;
  let optionCPercent = 0.8;

  if (data.divisibility === 'Divisible') {
    const correctionFactor = data.correctionFactor;
    optionAPercent = 0.4 * (1 + correctionFactor);
    optionBPercent = 0.5 * (1 + correctionFactor);
    optionCPercent = 0.8 * (1 + correctionFactor);
  }

  // Get total CEC values (handles both least cash outflow and lot-wise)
  const totals = calculateLotWiseTotals(data);

  // Calculate base values
  const baseOptionA = optionAPercent * totals.totalCECInclGst;
  const baseOptionB = optionBPercent * totals.totalCECInclGst;
  const baseOptionC = optionCPercent * totals.totalCECInclGst;

  // Apply annualization for Service and Works tender types if contract duration > 1 year
  let annualizedOptionA = baseOptionA;
  let annualizedOptionB = baseOptionB;
  let annualizedOptionC = baseOptionC;

  const contractDurationYears = data.contractDurationYears || 1;
  
  if ((data.tenderType === 'Service' || data.tenderType === 'Works') && contractDurationYears > 1) {
    annualizedOptionA = baseOptionA / contractDurationYears;
    annualizedOptionB = baseOptionB / contractDurationYears;
    annualizedOptionC = baseOptionC / contractDurationYears;
  }

  // Apply MSE relaxation for Service/Works tenders with least cash outflow if enabled
  let finalOptionA = annualizedOptionA;
  let finalOptionB = annualizedOptionB;
  let finalOptionC = annualizedOptionC;

  if ((data.tenderType === 'Service' || data.tenderType === 'Works') && data.evaluationMethodology === 'least cash outflow' && data.mseRelaxation) {
    // Apply 15% relaxation for MSE
    finalOptionA = annualizedOptionA * 0.85;
    finalOptionB = annualizedOptionB * 0.85;
    finalOptionC = annualizedOptionC * 0.85;
  }

  return {
    optionA: {
      percentage: optionAPercent * 100,
      value: finalOptionA
    },
    optionB: {
      percentage: optionBPercent * 100,
      value: finalOptionB
    },
    optionC: {
      percentage: optionCPercent * 100,
      value: finalOptionC
    }
  };
}

/**
 * Get standard performance security percentage based on tender type
 */
export function getStandardPerformanceSecurity(tenderType: string): number {
  return ['Goods', 'Service'].includes(tenderType) ? 5 : 10;
}

/**
 * Format currency amount for display - updated to handle Lakhs and Crores properly
 */
export function formatCurrency(amount: number, suffix: string = 'Crore'): string {
  if (amount === 0) return `Rs. 0.00 ${suffix}`;
  
  // Round to 2 decimal places
  const roundedAmount = Math.round(amount * 100) / 100;
  
  return `Rs. ${roundedAmount} ${suffix}`;
}

/**
 * Format amount in Lakhs - specifically for BQC/PQC criteria
 */
export function formatAmountInLakhs(amountInCrores: number): string {
  const amountInLakhs = amountInCrores * 100;
  const roundedAmount = Math.round(amountInLakhs * 100) / 100;
  return `${roundedAmount}`;
}

/**
 * Format turnover amount - always display in Crores
 */
export function formatTurnoverAmount(amountInCrores: number): string {
  // Always display in Crores format, rounded to 2 decimal places
  const roundedAmount = Math.round(amountInCrores * 100) / 100;
  return `Rs. ${roundedAmount} Crore`;
}

/**
 * Format Past Performance amount in units
 */
export function formatPastPerformance(amount: number): string {
  if (amount === 0) return '0 Units';
  return `${amount.toLocaleString()} Units`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(0)}%`;
}
