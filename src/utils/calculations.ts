import type { BQCData } from '@/types';
import { EMD_THRESHOLDS } from './constants';

/**
 * Calculate EMD amount based on estimated value and tender type
 * Note: Uses CEC including GST as per updated requirements
 */
export function calculateEMD(estimatedValue: number, tenderType: string): number {
  if (estimatedValue < 50) {
    return 0;
  }

  for (const { threshold, emd } of EMD_THRESHOLDS) {
    if (estimatedValue <= threshold) {
      // Special case for Goods/Services between 50-100
      if (threshold === 100 && ['Goods', 'Services'].includes(tenderType)) {
        return 0;
      }
      return emd;
    }
  }
  return 20;
}

/**
 * Calculate annualized value based on contract period
 */
export function calculateAnnualizedValue(cecEstimate: number, contractPeriodYears: number): number {
  if (contractPeriodYears <= 0) return 0;
  return cecEstimate / contractPeriodYears;
}

/**
 * Calculate Past Performance requirement for individual lot or total
 */
export function calculatePastPerformance(cecInclGst: number, mseRelaxation: boolean = false): number {
  const basePercentage = 0.30; // 30% of CEC incl GST
  
  if (mseRelaxation) {
    // Apply 15% relaxation: 30% * (1 - 0.15) = 25.5%
    return cecInclGst * basePercentage * (1 - 0.15);
  } else {
    // Standard 30% of CEC incl GST
    return cecInclGst * basePercentage;
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
    return {
      totalCECInclGst: data.cecEstimateInclGst,
      totalCECExclGst: data.cecEstimateExclGst,
      totalPastPerformance: calculatePastPerformance(data.cecEstimateInclGst, data.mseRelaxation)
    };
  }

  // Lot-wise calculations
  const totalCECInclGst = data.lots?.reduce((sum, lot) => sum + (lot.cecEstimateInclGst || 0), 0) || 0;
  const totalCECExclGst = data.lots?.reduce((sum, lot) => sum + (lot.cecEstimateExclGst || 0), 0) || 0;
  const totalPastPerformance = data.lots?.reduce((sum, lot) => 
    sum + calculatePastPerformance(lot.cecEstimateInclGst || 0, lot.mseRelaxation || false), 0) || 0;

  return {
    totalCECInclGst,
    totalCECExclGst,
    totalPastPerformance
  };
}

/**
 * Calculate turnover requirement with refined logic
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

  // Calculate turnover requirement considering AMC value
  let maintenanceValue = 0;
  let maintenanceText = '';

  if (data.hasAmc) {
    maintenanceValue = data.amcValue;
    maintenanceText = 'AMC';
  }

  let amount: number;
  let description: string;

  if (maintenanceValue > 0) {
    // Calculate as base_percentage of (CEC_incl_gst - maintenance_value)
    amount = basePercentage * (totals.totalCECInclGst - maintenanceValue);
    description = `${basePercentage * 100}% of CEC-${maintenanceText}`;
  } else {
    // Calculate as base_percentage of CEC
    amount = basePercentage * totals.totalCECExclGst;
    description = `${basePercentage * 100}% of CEC`;
  }

  return {
    amount,
    percentage: basePercentage * 100,
    description
  };
}

/**
 * Calculate supplying capacity (30% of base value)
 */
export function calculateSupplyingCapacity(baseCapacity: number, mseRelaxation: boolean): {
  calculated: number;
  final: number;
  mseAdjusted?: number;
} {
  const calculated = Math.floor(baseCapacity * 0.3);
  
  if (mseRelaxation) {
    const mseAdjusted = Math.floor(calculated * 0.85); // 15% relaxation
    return {
      calculated,
      final: mseAdjusted,
      mseAdjusted
    };
  }

  return {
    calculated,
    final: calculated
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

  return {
    optionA: {
      percentage: optionAPercent * 100,
      value: optionAPercent * totals.totalCECInclGst
    },
    optionB: {
      percentage: optionBPercent * 100,
      value: optionBPercent * totals.totalCECInclGst
    },
    optionC: {
      percentage: optionCPercent * 100,
      value: optionCPercent * totals.totalCECInclGst
    }
  };
}

/**
 * Get standard performance security percentage based on tender type
 */
export function getStandardPerformanceSecurity(tenderType: string): number {
  return ['Goods', 'Services'].includes(tenderType) ? 5 : 10;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, suffix: string = 'Lacs'): string {
  if (amount === 0) return `Rs. 0.00 ${suffix}`;
  return `Rs. ${amount.toFixed(2)} ${suffix}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(0)}%`;
}
