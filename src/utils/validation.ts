import type { BQCData, ValidationError } from '@/types';

/**
 * Validate BQC form data
 */
export function validateBQCData(data: BQCData): {
  isValid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Required fields validation
  const requiredFields: Array<{ key: keyof BQCData; label: string }> = [
    { key: 'refNumber', label: 'Reference Number' },
    { key: 'tenderDescription', label: 'Tender Description' },
    { key: 'prReference', label: 'PR Reference' },
    { key: 'budgetDetails', label: 'Budget Details' },
    { key: 'scopeOfWork', label: 'Scope of Work' }
  ];

  for (const { key, label } of requiredFields) {
    const value = data[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        field: key,
        message: `${label} is required`
      });
    }
  }

  // Numeric validation
  if (data.cecEstimateInclGst <= 0) {
    errors.push({
      field: 'cecEstimateInclGst',
      message: 'CEC Estimate (incl. GST) must be greater than 0'
    });
  }

  if (data.cecEstimateExclGst <= 0) {
    errors.push({
      field: 'cecEstimateExclGst',
      message: 'CEC Estimate (excl. GST) must be greater than 0'
    });
  }

  if (data.cecEstimateInclGst < data.cecEstimateExclGst) {
    errors.push({
      field: 'cecEstimateInclGst',
      message: 'CEC Estimate (incl. GST) must be greater than or equal to CEC Estimate (excl. GST)'
    });
  }

  // Contract period validation
  if (data.contractPeriodYears <= 0) {
    errors.push({
      field: 'contractPeriodYears',
      message: 'Contract Period must be greater than 0'
    });
  }

  // Goods-specific validation
  if (data.tenderType === 'Goods') {
    if (!data.deliveryPeriod || data.deliveryPeriod.trim() === '') {
      errors.push({
        field: 'deliveryPeriod',
        message: 'Delivery Period is required for Goods tenders'
      });
    }
    if (!data.warrantyPeriod || data.warrantyPeriod.trim() === '') {
      errors.push({
        field: 'warrantyPeriod',
        message: 'Warranty Period is required for Goods tenders'
      });
    }
  }

  // Service/Works-specific validation
  if (['Service', 'Works'].includes(data.tenderType)) {
    if (!data.similarWorkDefinition || data.similarWorkDefinition.trim() === '') {
      errors.push({
        field: 'similarWorkDefinition',
        message: 'Definition of Similar Work is required for Service/Works tenders'
      });
    }
  }

  // AMC validation
  if (data.hasAmc) {
    if (!data.amcPeriod || data.amcPeriod.trim() === '') {
      errors.push({
        field: 'amcPeriod',
        message: 'AMC Period is required when AMC is enabled'
      });
    }
    if (data.amcValue <= 0) {
      errors.push({
        field: 'amcValue',
        message: 'AMC Value must be greater than 0 when AMC is enabled'
      });
    }
  }

  // Manufacturer types validation for Goods
  if (data.tenderType === 'Goods' && data.manufacturerTypes.length === 0) {
    errors.push({
      field: 'manufacturerTypes',
      message: 'At least one manufacturer type must be selected for Goods tenders'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(username: string, password: string): {
  isValid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!username || username.trim() === '') {
    errors.push({
      field: 'username',
      message: 'Username is required'
    });
  }

  if (!password || password.trim() === '') {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate registration data
 */
export function validateRegistrationData(data: {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
}): {
  isValid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.username || data.username.trim() === '') {
    errors.push({
      field: 'username',
      message: 'Username is required'
    });
  }

  if (!data.password || data.password.trim() === '') {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }

  if (!data.email || data.email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  }

  if (!data.fullName || data.fullName.trim() === '') {
    errors.push({
      field: 'fullName',
      message: 'Full Name is required'
    });
  }

  // Password validation
  if (data.password && data.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long'
    });
  }

  if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match'
    });
  }

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address'
    });
  }

  // Username validation
  if (data.username && data.username.length < 3) {
    errors.push({
      field: 'username',
      message: 'Username must be at least 3 characters long'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize value for database storage
 */
export function sanitizeValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NA';
  }
  if (typeof value === 'string' && value.trim() === '') {
    return 'NA';
  }
  return String(value);
}
