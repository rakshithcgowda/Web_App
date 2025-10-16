export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
}

export interface LotData {
  id: string;
  lotNumber: string;
  description: string;
  cecEstimateInclGst: number;
  cecEstimateExclGst: number;
  contractPeriodMonths: number;
  hasAmc: boolean;
  amcValue: number;
  amcPeriod: string;
  mseRelaxation?: boolean; // Added MSE relaxation for individual lots
  quantitySupplied: number; // Added quantity supplied field
}

export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'current' | 'complete' | 'upcoming';
}

export interface BQCData {
  id?: number;
  userId?: number;
  refNumber: string;
  groupName: string;
  subject: string;
  tenderDescription: string;
  prReference: string;
  tenderType: 'Goods' | 'Service' | 'Works';
  evaluationMethodology: 'least cash outflow' | 'Lot-wise';
  cecEstimateInclGst: number;
  cecDate: string;
  cecEstimateExclGst: number;
  budgetDetails: string;
  tenderPlatform: 'GeM' | 'E-procurement';
  lots: LotData[];
  scopeOfWork: string;
  contractPeriodMonths: string;
  contractDurationYears: number;
  deliveryPeriod: string;
  bidValidityPeriod: string;
  warrantyPeriod: string;
  amcPeriod: string;
  paymentTerms: string;
  manufacturerTypes: ManufacturerType[];
  supplyingCapacity: {
    calculated: number;
    final: number;
    mseAdjusted?: number;
  };
  mseRelaxation: boolean;
  similarWorkDefinition: string;
  annualizedValue: number;
  escalationClause: string;
  divisibility: 'Divisible' | 'Non-Divisible';
  performanceSecurity: string;
  hasPerformanceSecurity: boolean;
  proposedBy: string;
  proposedByDesignation: string;
  recommendedBy: string;
  recommendedByDesignation: string;
  concurredBy: string;
  concurredByDesignation: string;
  approvedBy: string;
  approvedByDesignation: string;
  amcValue: number;
  hasAmc: boolean;
  correctionFactor: number;
  omValue: number;
  omPeriod: string;
  hasOm: boolean;
  additionalDetails: string;
  quantitySupplied?: number; // Added quantity supplied field for least cash outflow methodology
  itemName?: string; // Added item name field
  noteTo?: string; // NOTE TO recipient selection
  commercialEvaluationMethod?: string[]; // Commercial evaluation method selection (multiple)
  // Explanatory Notes
  hasExperienceExplanatoryNote?: boolean;
  experienceExplanatoryNote?: string;
  hasAdditionalExplanatoryNote?: boolean;
  additionalExplanatoryNote?: string;
  hasFinancialExplanatoryNote?: boolean;
  financialExplanatoryNote?: string;
  hasEMDExplanatoryNote?: boolean;
  emdExplanatoryNote?: string;
  hasPastPerformanceExplanatoryNote?: boolean;
  pastPerformanceExplanatoryNote?: string;
  // MSE Relaxation for Past Performance Requirement
  pastPerformanceMseRelaxation?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ManufacturerType = 
  | 'Original Equipment Manufacturer'
  | 'Authorized Channel Partner'
  | 'Authorized Agent'
  | 'Dealer'
  | 'Authorized Distributor';

export interface GroupOption {
  key: string;
  value: string;
}

export interface EMDThreshold {
  threshold: number;
  emd: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface SavedBQCEntry {
  id: number;
  refNumber: string;
  tenderDescription: string;
  createdAt: string;
}

export interface DocumentGenerationRequest {
  data: BQCData;
  format?: 'docx' | 'pdf';
}
