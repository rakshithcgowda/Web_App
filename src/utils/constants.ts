import type { GroupOption, EMDThreshold, ManufacturerType } from '@/types';

export const EMD_THRESHOLDS: EMDThreshold[] = [
  { threshold: 50, emd: 0 },
  { threshold: 100, emd: 1 },
  { threshold: 500, emd: 2.5 },
  { threshold: 1000, emd: 5 },
  { threshold: 1500, emd: 7.5 },
  { threshold: 2500, emd: 10 },
  { threshold: Infinity, emd: 20 }
];

export const GROUP_OPTIONS: GroupOption[] = [
  { key: '1', value: 'LPG' },
  { key: '2', value: 'GAS/HRS/CBG' },
  { key: '3', value: 'E&P GOODS' },
  { key: '4', value: 'E&P SERVICES' },
  { key: '6', value: 'LUBES' },
  { key: '7', value: 'PIPELINES' },
  { key: '8', value: 'BIOFUELS/DISPOSELS' },
  { key: '9', value: 'RETAIL/IS' },
  { key: '10', value: 'TRANSPORT' }
];

export const TENDER_TYPES = ['Goods', 'Service', 'Works'] as const;

export const MANUFACTURER_TYPES: ManufacturerType[] = [
  'Original Equipment Manufacturer',
  'Authorized Channel Partner',
  'Authorized Agent',
  'Dealer',
  'Authorized Distributor'
];

export const DIVISIBILITY_OPTIONS = ['Non-Divisible', 'Divisible'] as const;

export const DIVISION_PATTERNS = ['80:20', '70:20:10'] as const;

export const PLATFORM_OPTIONS = ['GeM', 'E-procurement'] as const;

export const EVALUATION_METHODOLOGY_OPTIONS = ['LCS', 'Lot-wise'] as const;

export const DEFAULT_BQC_DATA = {
  refNumber: '',
  groupName: '1 - LPG',
  itemName: '',
  projectName: '',
  tenderDescription: '',
  prReference: '',
  tenderType: 'Goods' as const,
  evaluationMethodology: 'LCS' as const,
  cecEstimateInclGst: 0,
  cecDate: new Date().toISOString().split('T')[0],
  cecEstimateExclGst: 0,
  budgetDetails: '',
  tenderPlatform: 'GeM' as const,
  lots: [],
  scopeOfWork: '',
  contractPeriodYears: 1,
  deliveryPeriod: '',
  warrantyPeriod: '',
  amcPeriod: '',
  paymentTerms: '',
  manufacturerTypes: ['Original Equipment Manufacturer'] as ManufacturerType[],
  supplyingCapacity: 30,
  mseRelaxation: false,
  similarWorkDefinition: '',
  annualizedValue: 0,
  escalationClause: '',
  divisibility: 'Non-Divisible' as const,
  performanceSecurity: 5,
  proposedBy: 'XXXXX',
  recommendedBy: 'XXXXX',
  concurredBy: 'Rajesh J.',
  approvedBy: 'Kani Amudhan N.',
  amcValue: 0,
  hasAmc: false,
  correctionFactor: 0,
  omValue: 0,
  omPeriod: '',
  hasOm: false,
  additionalDetails: ''
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  BQC: {
    SAVE: '/api/bqc/save',
    LOAD: '/api/bqc/load',
    LIST: '/api/bqc/list',
    DELETE: '/api/bqc/delete',
    GENERATE: '/api/bqc/generate'
  }
} as const;
