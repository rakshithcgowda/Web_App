import { useState, useCallback } from 'react';
import type { BQCData, SavedBQCEntry, DocumentGenerationRequest } from '@/types';
import { bqcService } from '@/services/bqc';
import { DEFAULT_BQC_DATA } from '@/utils/constants';
import { validateBQCData, fillEmptyFieldsWithDefaults, getFieldsFilledWithDefaults } from '@/utils/validation';
import { 
  calculateAnnualizedValue, 
  calculateTurnoverRequirement,
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
      
      // Ensure evaluation methodology defaults to least cash outflow if not set
      if (!newData.evaluationMethodology) {
        newData.evaluationMethodology = 'least cash outflow';
      }
      
      // Handle methodology transition
      if (updates.evaluationMethodology) {
        const newMethodology = updates.evaluationMethodology;
        const oldMethodology = prevData.evaluationMethodology;
        
        // If switching from least cash outflow to Lot-wise, clear main CEC values and ensure lots array exists
        if (oldMethodology === 'least cash outflow' && newMethodology === 'Lot-wise') {
          newData.cecEstimateInclGst = 0;
          newData.cecEstimateExclGst = 0;
          // Only initialize lots array if it doesn't exist, don't clear existing lots
          if (!newData.lots || newData.lots.length === 0) {
            newData.lots = [];
          }
        }
        
        // If switching from Lot-wise to least cash outflow, clear lots array and ensure CEC values are set
        if (oldMethodology === 'Lot-wise' && newMethodology === 'least cash outflow') {
          // Calculate total CEC from lots before clearing
          const totalCECInclGst = newData.lots?.reduce((sum, lot) => sum + (lot.cecEstimateInclGst || 0), 0) || 0;
          const totalCECExclGst = newData.lots?.reduce((sum, lot) => sum + (lot.cecEstimateExclGst || 0), 0) || 0;
          
          newData.lots = [];
          // Set CEC values from lots total if they exist
          if (totalCECInclGst > 0) {
            newData.cecEstimateInclGst = totalCECInclGst;
          }
          if (totalCECExclGst > 0) {
            newData.cecEstimateExclGst = totalCECExclGst;
          }
        }
      }
      
      // Handle tender type transition
      if (updates.tenderType) {
        const newTenderType = updates.tenderType;
        const oldTenderType = prevData.tenderType;
        
        // If switching from Goods to Service/Works, clear Goods-specific fields
        if (oldTenderType === 'Goods' && (newTenderType === 'Service' || newTenderType === 'Works')) {
          newData.manufacturerTypes = [];
          newData.deliveryPeriod = '';
          newData.warrantyPeriod = '';
          // Initialize Service-specific fields if not already set
          if (!newData.similarWorkDefinition) {
            newData.similarWorkDefinition = '';
          }
        }
        
        // If switching from Service/Works to Goods, clear Service/Works-specific fields
        if ((oldTenderType === 'Service' || oldTenderType === 'Works') && newTenderType === 'Goods') {
          newData.similarWorkDefinition = '';
          newData.mseRelaxation = false;
          // Initialize Goods-specific fields if not already set
          if (!newData.manufacturerTypes || newData.manufacturerTypes.length === 0) {
            newData.manufacturerTypes = [];
          }
        }
      }
      
      // Recalculate derived values
      newData.annualizedValue = calculateAnnualizedValue(
        newData.cecEstimateExclGst, 
        parseInt(newData.contractPeriodMonths)
      );

      return newData;
    });
  }, []);

  // Get calculated values
  const getCalculatedValues = useCallback(() => {
    const lotWiseTotals = calculateLotWiseTotals(bqcData);
    const turnoverReq = calculateTurnoverRequirement(bqcData);
    const experienceReq = calculateExperienceRequirements(bqcData);
    const emdAmount = calculateEMD(lotWiseTotals.totalCECInclGst, bqcData.tenderType); // Uses total CEC including GST for EMD

    return {
      turnoverRequirement: turnoverReq,
      supplyingCapacity: bqcData.supplyingCapacity,
      experienceRequirements: experienceReq,
      emdAmount,
      pastPerformance: lotWiseTotals.totalPastPerformance,
      lotWiseTotals
    };
  }, [bqcData]);

  // Save BQC data
  const saveBQCData = useCallback(async () => {
    // Fill empty fields with default values before validation
    const filledData = fillEmptyFieldsWithDefaults(bqcData);
    const fieldsFilledWithDefaults = getFieldsFilledWithDefaults(bqcData, filledData);
    
    const validation = validateBQCData(filledData);
    if (!validation.isValid) {
      setError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      return { success: false, errors: validation.errors };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bqcService.saveBQCData(filledData);
      if (response.success) {
        // Update the local state with the filled data
        setBQCData(filledData);
        // Refresh saved entries list
        await loadSavedEntries();
        return { 
          success: true, 
          fieldsFilledWithDefaults,
          message: fieldsFilledWithDefaults.length > 0 
            ? `Data saved successfully! ${fieldsFilledWithDefaults.length} empty field(s) filled with default values.`
            : 'Data saved successfully!'
        };
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

    // Additional validation: Check if CEC values are entered for lots
    if (bqcData.evaluationMethodology === 'Lot-wise' && bqcData.lots && bqcData.lots.length > 0) {
      const hasValidCECData = bqcData.lots.some(lot => (lot.cecEstimateInclGst || 0) > 0);
      if (!hasValidCECData) {
        setError('❌ Cannot generate document: No lots have CEC values greater than 0. Please go to the Preamble tab and enter CEC estimates (both including and excluding GST) for at least one lot. The generated document will show 0.00 values if CEC estimates are not entered.');
        return { success: false, errors: [{ field: 'lots', message: 'CEC estimates required for lots' }] };
      }
    }

    setIsLoading(true);
    setError(null);
    
    // Start timing the generation process
    const startTime = Date.now();

    try {
      const request: DocumentGenerationRequest = {
        data: bqcData,
        format
      };

      // Debug: Log the data being sent
      console.log('=== FRONTEND DEBUG - Data being sent to backend ===');
      console.log('BQC Data:', JSON.stringify(bqcData, null, 2));
      if (bqcData.lots && bqcData.lots.length > 0) {
        console.log('Lots data being sent:');
        bqcData.lots.forEach((lot, index) => {
          console.log(`  Lot ${index + 1}:`, {
            lotNumber: lot.lotNumber,
            cecEstimateInclGst: lot.cecEstimateInclGst,
            cecEstimateExclGst: lot.cecEstimateExclGst,
            contractPeriodText: lot.contractPeriodText,
            contractPeriodMonths: lot.contractPeriodMonths,
            hasAmc: lot.hasAmc,
            amcValue: lot.amcValue,
            mseRelaxation: lot.mseRelaxation,
            // Debug pre-calculated values
            similarWorksOptionA: lot.similarWorksOptionA,
            similarWorksOptionB: lot.similarWorksOptionB,
            similarWorksOptionC: lot.similarWorksOptionC
          });
          
          // Check if CEC values are 0
          if (lot.cecEstimateInclGst === 0) {
            console.warn(`WARNING: Lot ${index + 1} has CEC Estimate = 0 in frontend data!`);
          } else {
            console.log(`✅ Lot ${index + 1} has CEC Estimate = ${lot.cecEstimateInclGst}`);
          }
        });
      } else {
        console.log('No lots data found!');
      }
      
      // Additional debug: Check evaluation methodology
      console.log('Evaluation Methodology:', bqcData.evaluationMethodology);
      console.log('Contract Duration Years:', bqcData.contractDurationYears);
      console.log('=== END FRONTEND DEBUG ===');

      const response = await bqcService.generateDocument(request);
      if (response.success && response.data) {
        // Calculate generation time
        const endTime = Date.now();
        const generationTimeMs = endTime - startTime;
        
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
        
        return { success: true, generationTimeMs };
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
