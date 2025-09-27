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
  contractPeriodYears: number;
  hasAmc: boolean;
  amcValue: number;
  amcPeriod: string;
  mseRelaxation?: boolean; // Added MSE relaxation for individual lots
}

export interface BQCData {
  id?: number;
  userId?: number;
  refNumber: string;
  groupName: string;
  itemName: string;
  projectName: string;
  tenderDescription: string;
  prReference: string;
  tenderType: 'Goods' | 'Service' | 'Works';
  evaluationMethodology: 'LCS' | 'Lot-wise';
  cecEstimateInclGst: number;
  cecDate: string;
  cecEstimateExclGst: number;
  budgetDetails: string;
  tenderPlatform: 'GeM' | 'E-procurement';
  lots: LotData[];
  scopeOfWork: string;
  contractPeriodYears: number;
  deliveryPeriod: string;
  warrantyPeriod: string;
  amcPeriod: string;
  paymentTerms: string;
  manufacturerTypes: ManufacturerType[];
  supplyingCapacity: number;
  mseRelaxation: boolean;
  similarWorkDefinition: string;
  annualizedValue: number;
  escalationClause: string;
  divisibility: 'Divisible' | 'Non-Divisible';
  performanceSecurity: number;
  proposedBy: string;
  recommendedBy: string;
  concurredBy: string;
  approvedBy: string;
  amcValue: number;
  hasAmc: boolean;
  correctionFactor: number;
  omValue: number;
  omPeriod: string;
  hasOm: boolean;
  additionalDetails: string;
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
