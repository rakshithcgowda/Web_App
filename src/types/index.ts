export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isApproved?: boolean;
  approvedAt?: string;
  approvedBy?: number;
  approvedByUsername?: string;
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
  contractPeriodMonths: number; // Keep for backward compatibility and calculations
  contractPeriodText: string; // New field for text-based contract period input
  quantitySupplied?: number; // For past performance calculation in Goods tender type
  mseRelaxation?: boolean; // For MSE relaxation in past performance calculation
  // AMC/CAMC fields per lot
  hasAmc?: boolean;
  amcValue?: number;
  amcPeriod?: string;
  // Lot-wise similar works fields
  similarWorksOptionA?: number; // 40% of lot CEC
  similarWorksOptionB?: number; // 50% of lot CEC
  similarWorksOptionC?: number; // 80% of lot CEC
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
  contractPeriodText: string; // Text-based contract period for display
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
  provenTrackRecordMseRelaxation?: boolean; // MSE relaxation for proven track record table
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
  // Supplying Capacity visibility toggles
  showNonMseCalculations?: boolean;
  showMseCalculations?: boolean;
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

export interface UserManagementRequest {
  userId: number;
  action: 'approve' | 'reject';
}

export interface UserManagementResponse {
  success: boolean;
  message: string;
  data?: User[];
}
