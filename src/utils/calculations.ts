import type { BQCData } from '@/types';

/**
 * Calculate EMD amount based on estimated value and tender type
 * Based on the provided EMD table - returns values in Lakhs
 */
export function calculateEMD(estimatedValue: number, tenderType: string): number {
  if (tenderType === 'Goods') {
    // Goods: 0.5-1.0 Cr = Nil, >1.0 Cr = progressive rates
    if (estimatedValue >= 0.5 && estimatedValue <= 1.0) {
      return 0; // Nil
    } else if (estimatedValue > 1.0 && estimatedValue <= 5.0) {
      return 2.5; // 2.5 Lakhs
    } else if (estimatedValue > 5.0 && estimatedValue <= 10.0) {
      return 5; // 5 Lakhs
    } else if (estimatedValue > 10.0 && estimatedValue <= 15.0) {
      return 7.5; // 7.5 Lakhs
    } else if (estimatedValue > 15.0 && estimatedValue <= 25.0) {
      return 10; // 10 Lakhs
    } else if (estimatedValue > 25.0) {
      return 20; // 20 Lakhs
    }
    return 0;
  }
  
  if (tenderType === 'Service') {
    // Services: 0.5-1.0 Cr = 1L, >1.0 Cr = progressive rates
    if (estimatedValue >= 0.5 && estimatedValue <= 1.0) {
      return 1; // 1 Lakh
    } else if (estimatedValue > 1.0 && estimatedValue <= 5.0) {
      return 2.5; // 2.5 Lakhs
    } else if (estimatedValue > 5.0 && estimatedValue <= 10.0) {
      return 5; // 5 Lakhs
    } else if (estimatedValue > 10.0 && estimatedValue <= 15.0) {
      return 7.5; // 7.5 Lakhs
    } else if (estimatedValue > 15.0 && estimatedValue <= 25.0) {
      return 10; // 10 Lakhs
    } else if (estimatedValue > 25.0) {
      return 20; // 20 Lakhs
    }
    return 0; // For values < 0.5 Cr
  }
  
  if (tenderType === 'Works') {
    // Works: 0.5-1.0 Cr = 1L, >1.0 Cr = progressive rates
    if (estimatedValue >= 0.5 && estimatedValue <= 1.0) {
      return 1; // 1 Lakh
    } else if (estimatedValue > 1.0 && estimatedValue <= 5.0) {
      return 2.5; // 2.5 Lakhs
    } else if (estimatedValue > 5.0 && estimatedValue <= 10.0) {
      return 5; // 5 Lakhs
    } else if (estimatedValue > 10.0 && estimatedValue <= 15.0) {
      return 7.5; // 7.5 Lakhs
    } else if (estimatedValue > 15.0 && estimatedValue <= 25.0) {
      return 10; // 10 Lakhs
    } else if (estimatedValue > 25.0) {
      return 20; // 20 Lakhs
    }
    return 0; // For values < 0.5 Cr
  }
  
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
  if (data.evaluationMethodology === 'LCS') {
    // For LCS, only use quantitySupplied if it's provided, otherwise return 0
    const quantitySupplied = data.quantitySupplied || 0;
    return {
      totalCECInclGst: data.cecEstimateInclGst,
      totalCECExclGst: data.cecEstimateExclGst,
      totalPastPerformance: calculatePastPerformance(quantitySupplied, data.mseRelaxation)
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

  // Get total CEC values (handles both LCS and lot-wise)
  const totals = calculateLotWiseTotals(data);

  // Calculate base amount: CEC including GST minus AMC
  let baseAmount = totals.totalCECInclGst;
  
  // Subtract AMC if applicable
  if (data.evaluationMethodology === 'LCS' && data.hasAmc && data.amcValue) {
    baseAmount -= data.amcValue;
  } else if (data.evaluationMethodology === 'Lot-wise' && data.lots) {
    const totalAMC = data.lots.reduce((sum, lot) => sum + (lot.hasAmc ? lot.amcValue : 0), 0);
    baseAmount -= totalAMC;
  }

  // Calculate turnover requirement as 30% of (CEC including GST - AMC)
  const turnoverAmount = basePercentage * baseAmount;
  
  // Apply annualization for all tender types if contract duration > 1 year
  const contractDurationYears = data.contractDurationYears || 1;
  let annualizedAmount = turnoverAmount;
  
  if (contractDurationYears > 1) {
    annualizedAmount = turnoverAmount / contractDurationYears;
  }
  
  const description = `${basePercentage * 100}% of (CEC including GST${data.hasAmc || (data.lots && data.lots.some(lot => lot.hasAmc)) ? ' - AMC' : ''})`;

  return {
    amount: annualizedAmount,
    percentage: basePercentage * 100,
    description
  };
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

  // Get total CEC values (handles both LCS and lot-wise)
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

  // Apply MSE relaxation for Service/Works tenders with LCS if enabled
  let finalOptionA = annualizedOptionA;
  let finalOptionB = annualizedOptionB;
  let finalOptionC = annualizedOptionC;

  if ((data.tenderType === 'Service' || data.tenderType === 'Works') && data.evaluationMethodology === 'LCS' && data.mseRelaxation) {
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
 * Format currency amount for display
 */
export function formatCurrency(amount: number, suffix: string = 'Crore'): string {
  if (amount === 0) return `Rs. 0.00 ${suffix}`;
  return `Rs. ${amount.toFixed(2)} ${suffix}`;
}

/**
 * Format turnover amount - display in Lakhs if beyond 2 decimal places in Crores
 */
export function formatTurnoverAmount(amountInCrores: number): string {
  // If amount is less than 0.01 Crores (1 Lakh), display in Lakhs
  if (amountInCrores < 0.01) {
    const amountInLakhs = amountInCrores * 100;
    return `Rs. ${amountInLakhs.toFixed(2)} Lakh`;
  }
  
  // If amount has more than 2 decimal places, display in Lakhs
  const roundedCrores = Math.round(amountInCrores * 100) / 100;
  if (Math.abs(amountInCrores - roundedCrores) > 0.001) {
    const amountInLakhs = amountInCrores * 100;
    return `Rs. ${amountInLakhs.toFixed(2)} Lakh`;
  }
  
  // Otherwise display in Crores
  return `Rs. ${amountInCrores.toFixed(2)} Crore`;
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
