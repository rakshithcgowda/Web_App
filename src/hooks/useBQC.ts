import { useState, useCallback } from 'react';
import type { BQCData, SavedBQCEntry, DocumentGenerationRequest } from '@/types';
import { bqcService } from '@/services/bqc';
import { DEFAULT_BQC_DATA } from '@/utils/constants';
import { validateBQCData } from '@/utils/validation';
import { 
  calculateAnnualizedValue, 
  calculateTurnoverRequirement,
  calculateSupplyingCapacity,
  calculateExperienceRequirements,
  calculateEMD,
  calculateLotWiseTotals
} from '@/utils/calculations';

export function useBQC() {
  const [bqcData, setBQCData] = useState<BQCData>(DEFAULT_BQC_DATA);
  const [savedEntries, setSavedEntries] = useState<SavedBQCEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update BQC data and recalculate derived values
  const updateBQCData = useCallback((updates: Partial<BQCData>) => {
    setBQCData(prevData => {
      const newData = { ...prevData, ...updates };
      
      // Recalculate derived values
      newData.annualizedValue = calculateAnnualizedValue(
        newData.cecEstimateExclGst, 
        newData.contractPeriodYears
      );

      return newData;
    });
  }, []);

  // Get calculated values
  const getCalculatedValues = useCallback(() => {
    const lotWiseTotals = calculateLotWiseTotals(bqcData);
    const turnoverReq = calculateTurnoverRequirement(bqcData);
    const supplyingCapacity = calculateSupplyingCapacity(
      bqcData.supplyingCapacity, 
      bqcData.mseRelaxation
    );
    const experienceReq = calculateExperienceRequirements(bqcData);
    const emdAmount = calculateEMD(lotWiseTotals.totalCECInclGst, bqcData.tenderType); // Uses total CEC including GST for EMD

    return {
      turnoverRequirement: turnoverReq,
      supplyingCapacity,
      experienceRequirements: experienceReq,
      emdAmount,
      pastPerformance: lotWiseTotals.totalPastPerformance,
      lotWiseTotals
    };
  }, [bqcData]);

  // Save BQC data
  const saveBQCData = useCallback(async () => {
    const validation = validateBQCData(bqcData);
    if (!validation.isValid) {
      setError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bqcService.saveBQCData(bqcData);
      if (response.success) {
        // Refresh saved entries list
        await loadSavedEntries();
        return { success: true };
      } else {
        setError(response.message || 'Failed to save data');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to save data. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [bqcData]);

  // Load BQC data by ID
  const loadBQCData = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bqcService.loadBQCData(id);
      if (response.success && response.data) {
        setBQCData(response.data);
        return { success: true };
      } else {
        setError(response.message || 'Failed to load data');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to load data. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved entries list
  const loadSavedEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bqcService.listBQCData();
      if (response.success && response.data) {
        setSavedEntries(response.data);
        return { success: true };
      } else {
        setError(response.message || 'Failed to load saved entries');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to load saved entries. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete BQC data
  const deleteBQCData = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bqcService.deleteBQCData(id);
      if (response.success) {
        // Refresh saved entries list
        await loadSavedEntries();
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete data');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to delete data. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadSavedEntries]);

  // Generate document
  const generateDocument = useCallback(async (format: 'docx' | 'pdf' = 'docx') => {
    const validation = validateBQCData(bqcData);
    if (!validation.isValid) {
      setError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: DocumentGenerationRequest = {
        data: bqcData,
        format
      };

      const response = await bqcService.generateDocument(request);
      if (response.success && response.data) {
        // Download the document directly from blob
        const { blob, filename } = response.data;
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
      } else {
        setError(response.message || 'Failed to generate document');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to generate document. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [bqcData]);

  // Clear form data
  const clearBQCData = useCallback(() => {
    setBQCData(DEFAULT_BQC_DATA);
    setError(null);
  }, []);

  // Validate current data
  const validateCurrentData = useCallback(() => {
    return validateBQCData(bqcData);
  }, [bqcData]);

  return {
    bqcData,
    savedEntries,
    isLoading,
    error,
    updateBQCData,
    getCalculatedValues,
    saveBQCData,
    loadBQCData,
    loadSavedEntries,
    deleteBQCData,
    generateDocument,
    clearBQCData,
    validateCurrentData,
    setError
  };
}
