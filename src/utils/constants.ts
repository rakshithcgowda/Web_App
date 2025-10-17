import type { GroupOption, EMDThreshold, ManufacturerType } from '@/types';

export const EMD_THRESHOLDS: EMDThreshold[] = [
  { threshold: 0.5, emd: 0 }, // 50 Lakhs = 0.5 Crores
  { threshold: 1, emd: 1 }, // 100 Lakhs = 1 Crore
  { threshold: 5, emd: 2.5 }, // 500 Lakhs = 5 Crores
  { threshold: 10, emd: 5 }, // 1000 Lakhs = 10 Crores
  { threshold: 15, emd: 7.5 }, // 1500 Lakhs = 15 Crores
  { threshold: 25, emd: 10 }, // 2500 Lakhs = 25 Crores
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

export const EVALUATION_METHODOLOGY_OPTIONS = ['least cash outflow', 'Lot-wise'] as const;

export const COMMERCIAL_EVALUATION_OPTIONS = [
  'Overall Lowest Basis',
  'Schedule wise Lowest basis',
  '% bidding',
  'LOT wise lowest basis',
  'Least Cash Outflow basis',
  'QCBS',
  'Reverse auction (as applicable for GeM/C1 portal)'
] as const;

export const NOTE_TO_OPTIONS = [
  'CHIEF PROCUREMENT OFFICER, CPO (M)',
  'PROCUREMENT LEADER'
] as const;

export const DEFAULT_BQC_DATA = {
  refNumber: '',
  groupName: '1 - LPG',
  subject: '',
  tenderDescription: '',
  prReference: '',
  tenderType: 'Goods' as const,
  evaluationMethodology: 'least cash outflow' as const,
  cecEstimateInclGst: 0,
  cecDate: new Date().toISOString().split('T')[0],
  cecEstimateExclGst: 0,
  quantitySupplied: 0,
  budgetDetails: '',
  tenderPlatform: 'GeM' as const,
  lots: [],
  scopeOfWork: '',
  contractPeriodMonths: '1 year',
  contractDurationYears: 1,
  deliveryPeriod: 'AS per tender terms and conditions',
  bidValidityPeriod: '90 days',
  warrantyPeriod: 'AS per tender terms and conditions',
  amcPeriod: 'AS per tender terms and conditions',
  paymentTerms: '',
  manufacturerTypes: ['Original Equipment Manufacturer'] as ManufacturerType[],
  supplyingCapacity: {
    calculated: 30,
    final: 30,
    mseAdjusted: undefined
  },
  mseRelaxation: false,
  similarWorkDefinition: '',
  annualizedValue: 0,
  escalationClause: '',
  divisibility: 'Non-Divisible' as const,
  performanceSecurity: '5',
  hasPerformanceSecurity: false,
  proposedBy: 'XXXXX',
  proposedByDesignation: '',
  recommendedBy: 'XXXXX',
  recommendedByDesignation: '',
  concurredBy: 'Rajesh J.',
  concurredByDesignation: 'General Manager Finance (CPO Marketing)',
  approvedBy: 'Kani Amudhan N.',
  approvedByDesignation: 'Chief Procurement Officer (CPO Marketing)',
  amcValue: 0,
  hasAmc: false,
  correctionFactor: 0,
  omValue: 0,
  omPeriod: 'AS per tender terms and conditions',
  hasOm: false,
  additionalDetails: '',
  commercialEvaluationMethod: [],
  noteTo: 'CHIEF PROCUREMENT OFFICER, CPO (M)',
  // Explanatory Notes
  hasExperienceExplanatoryNote: false,
  experienceExplanatoryNote: '',
  hasAdditionalExplanatoryNote: false,
  additionalExplanatoryNote: '',
  hasFinancialExplanatoryNote: false,
  financialExplanatoryNote: '',
  hasEMDExplanatoryNote: false,
  emdExplanatoryNote: '',
  hasPastPerformanceExplanatoryNote: false,
  pastPerformanceExplanatoryNote: '',
  // MSE Relaxation for Past Performance Requirement
  pastPerformanceMseRelaxation: false
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
  },
  ADMIN: {
    STATS_OVERVIEW: '/api/admin/stats-overview',
    STATS_GROUPS: '/api/admin/stats-groups',
    STATS_DATE_RANGE: '/api/admin/stats-date-range',
    STATS_USERS: '/api/admin/stats-users',
    STATS_TENDER_TYPES: '/api/admin/stats-tender-types',
    STATS_FINANCIAL: '/api/admin/stats-financial',
    BQC_ENTRIES: '/api/admin/bqc-entries',
    EXPORT: '/api/admin/export'
  }
} as const;
