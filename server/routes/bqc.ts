import express from 'express';
import { database } from '../models/database-adapter.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { convertHtmlToWordRuns } from '../utils/htmlToWord.js';

const router = express.Router();

// All BQC routes require authentication
router.use(authenticateToken);

// Save BQC data
router.post('/save', async (req: AuthRequest, res) => {
  try {
    const bqcData = req.body;
    const userId = req.userId!;

    // Only validate critical fields - other fields will be filled with defaults
    if (!bqcData.refNumber || bqcData.refNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reference number is required'
      });
    }

    const id = await database.saveBQCData(userId, bqcData);

    res.json({
      success: true,
      data: { id },
      message: 'BQC data saved successfully'
    });
  } catch (error) {
    console.error('Save BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save BQC data'
    });
  }
});

// Load BQC data by ID
router.get('/load/:id', async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const bqcData = await database.getBQCData(userId, id);
    if (!bqcData) {
      return res.status(404).json({
        success: false,
        message: 'BQC data not found'
      });
    }

    // Convert database format to frontend format
    const formattedData = {
      id: bqcData.id,
      refNumber: bqcData.ref_number,
      groupName: bqcData.group_name,
      subject: bqcData.subject || '',
      tenderDescription: bqcData.tender_description,
      prReference: bqcData.pr_reference,
      tenderType: bqcData.tender_type,
      evaluationMethodology: bqcData.evaluation_methodology || 'least cash outflow',
      cecEstimateInclGst: bqcData.cec_estimate_incl_gst,
      cecDate: bqcData.cec_date,
      cecEstimateExclGst: bqcData.cec_estimate_excl_gst,
      lots: bqcData.lots ? JSON.parse(bqcData.lots) : [],
      quantitySupplied: bqcData.quantity_supplied,
      budgetDetails: bqcData.budget_details,
      tenderPlatform: bqcData.tender_platform,
      scopeOfWork: bqcData.scope_of_work,
      contractPeriodMonths: bqcData.contract_period_months,
      deliveryPeriod: bqcData.delivery_period || '',
      warrantyPeriod: bqcData.warranty_period || '',
      amcPeriod: bqcData.amc_period || '',
      paymentTerms: bqcData.payment_terms || '',
      manufacturerTypes: bqcData.manufacturer_types || [],
      supplyingCapacity: bqcData.supplying_capacity,
      mseRelaxation: Boolean(bqcData.mse_relaxation),
      similarWorkDefinition: bqcData.similar_work_definition || '',
      annualizedValue: bqcData.annualized_value,
      escalationClause: bqcData.escalation_clause || '',
      divisibility: bqcData.divisibility,
      performanceSecurity: bqcData.performance_security,
      hasPerformanceSecurity: Boolean(bqcData.has_performance_security),
      proposedBy: bqcData.proposed_by,
      proposedByDesignation: bqcData.proposed_by_designation || '',
      recommendedBy: bqcData.recommended_by,
      recommendedByDesignation: bqcData.recommended_by_designation || '',
      concurredBy: bqcData.concurred_by,
      concurredByDesignation: bqcData.concurred_by_designation || '',
      approvedBy: bqcData.approved_by,
      approvedByDesignation: bqcData.approved_by_designation || '',
      amcValue: bqcData.amc_value,
      hasAmc: Boolean(bqcData.has_amc),
      correctionFactor: bqcData.correction_factor,
      omValue: bqcData.o_m_value || 0,
      omPeriod: bqcData.o_m_period || '',
      hasOm: Boolean(bqcData.has_om),
      additionalDetails: bqcData.additional_details || '',
      noteTo: bqcData.note_to || '',
      commercialEvaluationMethod: bqcData.commercial_evaluation_method || [],
      // Explanatory Notes
      hasExperienceExplanatoryNote: Boolean(bqcData.has_experience_explanatory_note),
      experienceExplanatoryNote: bqcData.experience_explanatory_note || '',
      hasAdditionalExplanatoryNote: Boolean(bqcData.has_additional_explanatory_note),
      additionalExplanatoryNote: bqcData.additional_explanatory_note || '',
      hasFinancialExplanatoryNote: Boolean(bqcData.has_financial_explanatory_note),
      financialExplanatoryNote: bqcData.financial_explanatory_note || '',
      hasEMDExplanatoryNote: Boolean(bqcData.has_emd_explanatory_note),
      emdExplanatoryNote: bqcData.emd_explanatory_note || '',
      hasPastPerformanceExplanatoryNote: Boolean(bqcData.has_past_performance_explanatory_note),
      pastPerformanceExplanatoryNote: bqcData.past_performance_explanatory_note || '',
      pastPerformanceMseRelaxation: Boolean(bqcData.past_performance_mse_relaxation)
    };

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Load BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load BQC data'
    });
  }
});

// List saved BQC entries
router.get('/list', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const entries = await database.listBQCData(userId);

    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      refNumber: entry.ref_number,
      tenderDescription: entry.tender_description,
      createdAt: entry.created_at
    }));

    res.json({
      success: true,
      data: formattedEntries
    });
  } catch (error) {
    console.error('List BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load BQC entries'
    });
  }
});

// Delete BQC data
router.delete('/delete/:id', async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    await database.deleteBQCData(userId, id);

    res.json({
      success: true,
      message: 'BQC data deleted successfully'
    });
  } catch (error) {
    console.error('Delete BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete BQC data'
    });
  }
});

// Generate document
router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const { data: bqcData, format = 'docx' } = req.body;

    if (format !== 'docx') {
      return res.status(400).json({
        success: false,
        message: 'Only DOCX format is currently supported'
      });
    }

    // Calculate values for document
    const calculatePastPerformance = (quantitySupplied: number, mseRelaxation: boolean = false) => {
      const basePercentage = 0.30; // 30% of Quantity Supplied
      if (mseRelaxation) {
        return Math.round(quantitySupplied * basePercentage * (1 - 0.15)); // 15% relaxation
      }
      return Math.round(quantitySupplied * basePercentage);
    };

    const calculateEMD = (estimatedValue: number, tenderType: string) => {
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
    };

    const calculateTurnover = (data: {
      divisibility?: string;
      correctionFactor?: number;
      cecEstimateInclGst?: number;
      cecEstimateExclGst?: number;
      evaluationMethodology?: string;
      lots?: Array<{ cecEstimateInclGst?: number; cecEstimateExclGst?: number; hasAmc?: boolean; amcValue?: number }>;
      hasAmc?: boolean;
      amcValue?: number;
      contractPeriodMonths?: number;
    }) => {
      let basePercentage = 0.3;
      if (data.divisibility === 'Divisible') {
        basePercentage = 0.3 * (1 + (data.correctionFactor || 0));
      }
      
      let baseAmount = 0;
      
      // For lot-wise, calculate total CEC including GST minus AMC
      if (data.evaluationMethodology === 'Lot-wise' && data.lots) {
        baseAmount = data.lots.reduce((sum: number, lot) => {
          const lotCEC = lot.cecEstimateInclGst || 0;
          const lotAMC = (lot.hasAmc && lot.amcValue && lot.amcValue > 0) ? lot.amcValue : 0;
          return sum + (lotCEC - lotAMC);
        }, 0);
      } else {
        // For least cash outflow, use CEC including GST minus AMC
        const cecInclGst = data.cecEstimateInclGst || 0;
        const amcValue = (data.hasAmc && data.amcValue && data.amcValue > 0) ? data.amcValue : 0;
        baseAmount = cecInclGst - amcValue;
      }
      
      // Calculate turnover requirement
      const turnoverAmount = basePercentage * baseAmount;
      
      // Apply annualization for all tender types if contract duration > 1 year
      const contractDurationYears = (data as any).contractDurationYears || 1;
      
      if (contractDurationYears > 1) {
        return turnoverAmount / contractDurationYears;
      }
      
      // For other cases, return the full amount (no annualization)
      return turnoverAmount;
    };

    const extractContractYears = (contractPeriod: string): number => {
      if (!contractPeriod) return 1; // Default to 1 year if not specified
      
      // Extract numbers from the contract period string
      const match = contractPeriod.match(/(\d+(?:\.\d+)?)/);
      if (!match) return 1;
      
      const number = parseFloat(match[1]);
      
      // Convert to years based on common patterns
      if (contractPeriod.toLowerCase().includes('year')) {
        return number;
      } else if (contractPeriod.toLowerCase().includes('month')) {
        return number / 12;
      } else if (contractPeriod.toLowerCase().includes('day')) {
        return number / 365;
      }
      
      // If no unit specified, assume years
      return number;
    };

    const calculateExperienceRequirements = (data: any) => {
      // Apply correction factor if divisible
      let optionAPercent = 0.4;
      let optionBPercent = 0.5;
      let optionCPercent = 0.8;

      if (data.divisibility === 'Divisible') {
        const correctionFactor = data.correctionFactor || 0;
        optionAPercent = 0.4 * (1 + correctionFactor);
        optionBPercent = 0.5 * (1 + correctionFactor);
        optionCPercent = 0.8 * (1 + correctionFactor);
      }

      // Get total CEC values (handles both least cash outflow and lot-wise)
      let totalCECInclGst = 0;
      if (data.lots && data.lots.length > 0) {
        totalCECInclGst = data.lots.reduce((sum: number, lot: any) => sum + (lot.cecEstimateInclGst || 0), 0);
      } else {
        totalCECInclGst = data.cecEstimateInclGst || 0;
      }

      // Calculate base values
      const baseOptionA = optionAPercent * totalCECInclGst;
      const baseOptionB = optionBPercent * totalCECInclGst;
      const baseOptionC = optionCPercent * totalCECInclGst;

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

      // Apply MSE relaxation for Service/Works tenders with least cash outflow if enabled
      let finalOptionA = annualizedOptionA;
      let finalOptionB = annualizedOptionB;
      let finalOptionC = annualizedOptionC;

      if ((data.tenderType === 'Service' || data.tenderType === 'Works') && data.evaluationMethodology === 'least cash outflow' && data.mseRelaxation) {
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
    };

    const formatCurrency = (amount: number): string => {
      if (amount >= 10000000) {
        return `Rs. ${(amount / 10000000).toFixed(2)} Crore`;
      } else if (amount >= 100000) {
        return `Rs. ${(amount / 100000).toFixed(2)} Lacs`;
      } else {
        return `Rs. ${amount.toLocaleString()}`;
      }
    };

    const formatTurnoverAmount = (amountInCrores: number): string => {
      // Always display in Crores format
      return `Rs. ${amountInCrores.toFixed(2)} Crore`;
    };

    // Calculate dynamic section numbers based on document structure
    const getSectionNumbers = () => {
      const sections = {
        bqc: 3,        // BID QUALIFICATION CRITERIA
        evaluation: 5, // EVALUATION METHODOLOGY  
        emd: 6,        // EARNEST MONEY DEPOSIT
        performanceSecurity: 7 // PERFORMANCE SECURITY
      };
      
      // Adjust section numbers based on document content
      let currentSection = 3; // Start from BQC section
      
      // BQC section is always 3
      sections.bqc = currentSection;
      currentSection += 1;
      
      // Evaluation methodology section
      sections.evaluation = currentSection;
      currentSection += 1;
      
      // EMD section
      sections.emd = currentSection;
      currentSection += 1;
      
      // Performance Security section (only if applicable)
      if (bqcData.hasPerformanceSecurity) {
        sections.performanceSecurity = currentSection;
        currentSection += 1;
      }
      
      return sections;
    };

    const sectionNumbers = getSectionNumbers();

    // Format number with Indian comma separation for Crore values
    const formatIndianCurrency = (amountInCrores: number): string => {
      // Convert Crores to actual amount (multiply by 1,00,00,000)
      const actualAmount = amountInCrores * 10000000;
      
      // Format with Indian number system (lakhs and crores)
      const formattedAmount = actualAmount.toLocaleString('en-IN');
      
      return `₹ ${formattedAmount}`;
    };

    // Format past performance amount for display
    const formatPastPerformance = (amountInCrores: number): string => {
      if (amountInCrores >= 1) {
        return `${amountInCrores} Crore${amountInCrores > 1 ? 's' : ''}`;
      } else {
        const amountInLakhs = amountInCrores * 100;
        return `${amountInLakhs} Lakh${amountInLakhs > 1 ? 's' : ''}`;
      }
    };

    // Format date to dd/mm/yyyy format
    const formatDate = (date: Date | string): string => {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // Handle different input formats
        if (date.includes('-')) {
          // Handle dd-mm-yyyy or yyyy-mm-dd format
          const parts = date.split('-');
          if (parts[0].length === 4) {
            // yyyy-mm-dd format
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            // dd-mm-yyyy format
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = date;
      }
      
      // Format as dd/mm/yyyy
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}/${month}/${year}`;
    };

    // Get performance security percentage based on tender type
    const getPerformanceSecurityPercentage = (tenderType: string): string => {
      if (tenderType === 'Works') {
        return '10% (Works)';
      } else {
        // For Goods and Service
        return '5% (Goods & Service)';
      }
    };

    // Format experience requirements in Crores
    const formatExperienceCurrency = (amount: number): string => {
      return `Rs. ${amount.toFixed(3)} Crore`;
    };

    // Calculate values based on methodology
    let pastPerformanceNonMSE = 0;
    let pastPerformanceMSE = 0;
    let turnoverAmount = 0;
    let emdAmount = 0;
    let totalCECInclGst = 0;
    let totalCECExclGst = 0;
    let experienceRequirements = null;

    if (bqcData.evaluationMethodology === 'least cash outflow') {
      // least cash outflow methodology - use main CEC values
      const quantitySupplied = bqcData.quantitySupplied || 0;
      // Only calculate past performance for Goods tender type
      if (bqcData.tenderType === 'Goods') {
        pastPerformanceNonMSE = calculatePastPerformance(quantitySupplied, false);
        // Use the specific MSE relaxation field for Past Performance Requirement
        const mseRelaxation = bqcData.pastPerformanceMseRelaxation || false;
        pastPerformanceMSE = calculatePastPerformance(quantitySupplied, mseRelaxation);
      }
      turnoverAmount = calculateTurnover(bqcData);
      emdAmount = calculateEMD(bqcData.cecEstimateInclGst || 0, bqcData.tenderType || 'Goods');
      totalCECInclGst = bqcData.cecEstimateInclGst || 0;
      totalCECExclGst = bqcData.cecEstimateExclGst || 0;
      experienceRequirements = calculateExperienceRequirements(bqcData);
    } else {
      // Lot-wise methodology - calculate from lots
      if (bqcData.lots && bqcData.lots.length > 0) {
        totalCECInclGst = bqcData.lots.reduce((sum: number, lot: any) => sum + (lot.cecEstimateInclGst || 0), 0);
        totalCECExclGst = bqcData.lots.reduce((sum: number, lot: any) => sum + (lot.cecEstimateExclGst || 0), 0);
        
        // Only calculate past performance for Goods tender type
        if (bqcData.tenderType === 'Goods') {
          pastPerformanceNonMSE = bqcData.lots.reduce((sum: number, lot: any) => 
            sum + calculatePastPerformance(lot.quantitySupplied || 0, false), 0);
          pastPerformanceMSE = bqcData.lots.reduce((sum: number, lot: any) => 
            sum + calculatePastPerformance(lot.quantitySupplied || 0, lot.mseRelaxation || false), 0);
        }
        
        turnoverAmount = calculateTurnover(bqcData);
        emdAmount = calculateEMD(totalCECInclGst, bqcData.tenderType || 'Goods');
        experienceRequirements = calculateExperienceRequirements(bqcData);
      }
    }

    // Create document with BPCL format using tables
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Ref: ${bqcData.refNumber || 'XXXXXX'}`, 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 200 },
                      }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Date: ${formatDate(new Date())}`, 
                            bold: true,
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                      }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
                  }),
                ],
              }),
              
              // Note To Table
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: "NOTE TO:", 
                                bold: true, 
                                size: 24,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 100 },
                          }),
                        ],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                           new Paragraph({
                             children: [
                               new TextRun({ 
                                 text: bqcData.noteTo || "CHIEF PROCUREMENT OFFICER, CPO (M)", 
                                 bold: true,
                                 size: 24,
                                 font: "Arial"
                               }),
                             ],
                             alignment: AlignmentType.LEFT,
                             spacing: { after: 100 },
                           }),
                        ],
                        width: { size: 80, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                ],
              }),
              
          // Subject Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "SUBJECT:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.subject || "APPROVAL OF BID QUALIFICATION CRITERIA AND FLOATING OF OPEN DOMESTIC TENDER.", 
                            bold: true,
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                ],
              }),
              
          // Add spacing between top section and Preamble
          new Paragraph({
            children: [
              new TextRun({ 
                text: "",
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),
              
          // Preamble Section Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "1. PREAMBLE", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0 },
                      bottom: { style: BorderStyle.NONE, size: 0 },
                      left: { style: BorderStyle.NONE, size: 0 },
                      right: { style: BorderStyle.NONE, size: 0 },
                    },
                  }),
                ],
              }),
              // Reference Number
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Reference Number", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.refNumber || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Procurement Group
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Procurement Group", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.groupName || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Tender Description
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Tender Description", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.tenderDescription || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // PR reference
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "PR reference/ Email reference", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.prReference || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Type of Tender
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Type of Tender", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.tenderType || "Goods", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // CEC estimate incl GST
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "CEC estimate (incl. of GST)/ Date", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${formatIndianCurrency(totalCECInclGst || 0)} / ${bqcData.cecDate ? formatDate(bqcData.cecDate) : "N/A"}`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // CEC estimate excl GST
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "CEC estimate exclusive of GST", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${formatIndianCurrency(totalCECExclGst || 0)}`,
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Budget Details
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Budget Details (WBS/ Revex)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.budgetDetails || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Tender Platform
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Tender Platform", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.tenderPlatform || "GeM", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          
          // Add spacing between sections
          new Paragraph({
            children: [
              new TextRun({ 
                text: "",
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),
          
          // Brief Scope of Work Section Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "2. BRIEF SCOPE OF WORK", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                      }),
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0 },
                      bottom: { style: BorderStyle.NONE, size: 0 },
                      left: { style: BorderStyle.NONE, size: 0 },
                      right: { style: BorderStyle.NONE, size: 0 },
                    },
                  }),
                ],
              }),
              // Brief Scope of Work
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Brief Scope of Work / Supply Items", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.scopeOfWork || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Contract Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Contract Period /Completion Period", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${bqcData.contractPeriodMonths || 12} months`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Delivery Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Delivery Period of the Item", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.deliveryPeriod || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Warranty Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Warranty Period", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.warrantyPeriod || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // AMC Period - only show if hasAmc and amcValue > 0
              ...(bqcData.hasAmc && bqcData.amcValue && bqcData.amcValue > 0 ? [new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "AMC/ CAMC/ O&M (No. of Years)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${bqcData.amcPeriod || "N/A"} years`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              })] : []),
              // Payment Terms
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Payment Terms (if different from standard terms i.e within 30 days)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.paymentTerms || "Within 30 days", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 100 },
                      }),
                    ],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),
          
          // BQC Section
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `${sectionNumbers.bqc}. BID QUALIFICATION CRITERIA (BQC)`, 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
                      }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: "BPCL would like to qualify vendors for undertaking the above work as indicated in the brief scope. Detailed bid qualification criteria for short listing vendors shall be as follows:", 
                size: 24,
                font: "Arial"
                      }),
                    ],
            spacing: { after: 200 },
                  }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.1 TECHNICAL CRITERIA", 
                bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          // Dynamic content based on tender type
          ...(bqcData.tenderType === 'Goods' ? [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "3.1.1. For GOODS:", 
                  bold: true, 
                  size: 24,
                  font: "Arial"
                  }),
                ],
              spacing: { after: 200 },
              }),
              
                      new Paragraph({
                        children: [
                          new TextRun({ 
                  text: "Manufacturing Capability:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
              spacing: { after: 100 },
                      }),
            
                      new Paragraph({
                        children: [
                          new TextRun({ 
                  text: `Bidder* should be ${bqcData.manufacturerTypes?.join(' AND/OR ') || 'Original Equipment Manufacturer AND/OR Authorized Channel Partner AND/OR Authorized Agent AND/OR Dealer AND/OR Authorized Distributor'} of the item being tendered.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
              spacing: { after: 200 },
            }),
            
            // Only show Supplying Capacity section for Goods tender type
            ...(bqcData.tenderType === 'Goods' ? [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Supplying Capacity:", 
                    bold: true, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              // Always show Non-MSE (Standard) Requirements
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Non-MSE (Standard) Requirements:", 
                    bold: true,
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `The bidder shall have experience of having successfully supplied minimum of ${formatPastPerformance(pastPerformanceNonMSE)} in any 12 continuous months during last 7 years in India or abroad, ending on last day of the month previous to the one in which tender is invited.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
              
              // Show MSE (Relaxed) Requirements only when MSE relaxation is enabled
              ...(bqcData.pastPerformanceMseRelaxation ? [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: "MSE (Relaxed) Requirements:", 
                      bold: true,
                      size: 24,
                      font: "Arial"
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: `The MSE bidder shall have experience of having successfully supplied minimum of ${formatPastPerformance(pastPerformanceMSE)} in any 12 continuous months during last 7 years in India or abroad, ending on last day of the month previous to the one in which tender is invited.`, 
                      size: 24,
                      font: "Arial"
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ] : []),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "For MSE bidders Relaxation of 15% on the supplying capacity shall be given as per Corp. Finance Circular MA.TEC.POL.CON.3A dated 26.10.2020.", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
              
          // Explanatory Note for Past Performance Requirement
          ...(bqcData.hasPastPerformanceExplanatoryNote && bqcData.pastPerformanceExplanatoryNote ? [
            new Paragraph({
              children: convertHtmlToWordRuns(bqcData.pastPerformanceExplanatoryNote),
              spacing: { after: 200 },
            }),
          ] : []),
            ] : []),
            
          ] : []),
          
          // Service/Works content
          ...(bqcData.tenderType === 'Service' || bqcData.tenderType === 'Works' ? [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                  text: "3.1.2. BQC/PQC for Procurement of Works and Services:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Experience / Past performance / Technical Capability:", 
                  bold: true, 
                  size: 24,
                  font: "Arial"
                      }),
                    ],
              spacing: { after: 100 },
                  }),
            
                      new Paragraph({
                        children: [
                          new TextRun({ 
                  text: "The bidder should have experience of having successfully completed similar works during last 7 years ending last day of month previous to the one in which tender is floated should be either of the following: -", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
              spacing: { after: 200 },
            }),
            
            // Experience Requirements - Dynamic based on MSE relaxation
            ...((bqcData.tenderType === 'Service' || bqcData.tenderType === 'Works') && bqcData.evaluationMethodology === 'least cash outflow' && bqcData.mseRelaxation ? [
              // Show both Non-MSE and MSE values when MSE relaxation is enabled
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Experience Requirements:", 
                    bold: true,
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
              
              // Non-MSE (Standard) Requirements
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Non-MSE (Standard) Requirements:", 
                    bold: true,
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Three similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionA.value / 0.85 : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Two similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionB.value / 0.85 : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `One similar completed work costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionC.value / 0.85 : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
              
              // MSE Relaxed Requirements
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "MSE Relaxed Requirements (15% reduction):", 
                    bold: true,
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Three similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionA.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Two similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionB.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `One similar completed work costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionC.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
              
            ] : [
              // Show standard requirements when MSE relaxation is not enabled
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Three similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionA.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Two similar completed works each costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionB.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "or", 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 100 },
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `One similar completed work costing not less than ${formatExperienceCurrency(experienceRequirements ? experienceRequirements.optionC.value : 0)}.`, 
                    size: 24,
                    font: "Arial"
                  }),
                ],
                spacing: { after: 200 },
              }),
            ]),
              
                      new Paragraph({
                        children: [
                          new TextRun({ 
                  text: `Definition of "similar work" should be clearly defined: ${bqcData.similarWorkDefinition || "N/A"}`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
              spacing: { after: 200 },
                      }),
            
          ] : []),
          
          // Explanatory Note for Experience Requirements
          ...(bqcData.hasExperienceExplanatoryNote && bqcData.experienceExplanatoryNote ? [
            new Paragraph({
              children: convertHtmlToWordRuns(bqcData.experienceExplanatoryNote),
              spacing: { after: 200 },
            }),
          ] : []),
          
          // Lot-wise Calculations Section - Only for Lot-wise methodology
          ...(bqcData.evaluationMethodology === 'Lot-wise' && bqcData.lots && bqcData.lots.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "3.1.3 LOT-WISE CALCULATIONS", 
                  bold: true, 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "The following calculations are applicable for each lot individually:", 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // Lot-wise calculations table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: "Lot", 
                              bold: true, 
                              size: 20,
                              font: "Arial"
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                        }),
                      ],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: "CEC (Incl. GST)", 
                              bold: true, 
                              size: 20,
                              font: "Arial"
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                        }),
                      ],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: "EMD Amount", 
                              bold: true, 
                              size: 20,
                              font: "Arial"
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                        }),
                      ],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: "Turnover Req.", 
                              bold: true, 
                              size: 20,
                              font: "Arial"
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                        }),
                      ],
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    ...(bqcData.tenderType === 'Goods' ? [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: "Past Performance", 
                                bold: true, 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                    ] : []),
                    ...((bqcData.tenderType === 'Service' || bqcData.tenderType === 'Works') ? [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: "Exp. Req. (40%)", 
                                bold: true, 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                      }),
                    ] : []),
                  ],
                }),
                // Data rows for each lot
                ...bqcData.lots.map((lot: any) => {
                  const lotEMD = calculateEMD(lot.cecEstimateInclGst || 0, bqcData.tenderType || 'Goods');
                  const lotTurnover = (lot.cecEstimateInclGst - (lot.hasAmc && lot.amcValue && lot.amcValue > 0 ? lot.amcValue : 0)) * 0.3;
                  const lotPastPerformance = bqcData.tenderType === 'Goods' ? calculatePastPerformance(lot.quantitySupplied || 0, lot.mseRelaxation || false) : 0;
                  
                  // Calculate experience requirements for Service/Works
                  let lotExperienceReq = 0;
                  if (bqcData.tenderType === 'Service' || bqcData.tenderType === 'Works') {
                    const baseAmount = lot.cecEstimateInclGst || 0;
                    const contractYears = (lot.contractPeriodMonths || 12) / 12;
                    const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
                    const finalAmount = lot.mseRelaxation ? annualizedAmount * 0.85 : annualizedAmount;
                    lotExperienceReq = finalAmount * 0.4; // 40%
                  }
                  
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: lot.lotNumber || `Lot ${bqcData.lots.indexOf(lot) + 1}`, 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: formatIndianCurrency(lot.cecEstimateInclGst || 0), 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: `Rs. ${lotEMD.toFixed(1)} Lacs`, 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ 
                                text: formatTurnoverAmount(lotTurnover), 
                                size: 20,
                                font: "Arial"
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                          }),
                        ],
                      }),
                      ...(bqcData.tenderType === 'Goods' ? [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ 
                                  text: `${lotPastPerformance.toLocaleString()} Units${lot.mseRelaxation ? ' (MSE -15%)' : ''}`, 
                                  size: 20,
                                  font: "Arial"
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                              spacing: { after: 100 },
                            }),
                          ],
                        }),
                      ] : []),
                      ...((bqcData.tenderType === 'Service' || bqcData.tenderType === 'Works') ? [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ 
                                  text: formatExperienceCurrency(lotExperienceReq), 
                                  size: 20,
                                  font: "Arial"
                                }),
                              ],
                              alignment: AlignmentType.CENTER,
                              spacing: { after: 100 },
                            }),
                          ],
                        }),
                      ] : []),
                    ],
                  });
                }),
              ],
            }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "", 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 400 },
            }),
          ] : []),
          
          // Financial Criteria
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.2 FINANCIAL CRITERIA", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
                      }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.2.1 AVERAGE ANNUAL TURNOVER", 
                bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: `The average annual turnover of the Bidder for last three audited accounting years shall be equal to or more than ${formatTurnoverAmount(turnoverAmount || 0)}.`, 
                size: 24,
                font: "Arial"
                  }),
                ],
            spacing: { after: 200 },
              }),
              
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.2.2 NET WORTH", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 100 },
                      }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "The bidder should have positive net worth as per the latest audited financial statement.", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          // Explanatory Note for Financial Criteria
          ...(bqcData.hasFinancialExplanatoryNote && bqcData.financialExplanatoryNote ? [
            new Paragraph({
              children: convertHtmlToWordRuns(bqcData.financialExplanatoryNote),
              spacing: { after: 200 },
            }),
          ] : []),
          
              
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.3 BIDS MAY BE SUBMITTED BY", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.3.1 An entity (domestic bidder) should have completed 3 financial years of existence as on original due date of tender since date of commencement of business and shall fulfil each BQC eligibility criteria as mentioned above.", 
                size: 24,
                font: "Arial"
                      }),
                    ],
            spacing: { after: 200 },
                  }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "3.3.2 JV/Consortium bids will not be accepted (i.e. Qualification on the strength of the JV Partners/Consortium Members /Subsidiaries / Group members will not be accepted)", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 400 },
          }),
          
          // Escalation Clause - Only for non-E&P SERVICES groups
          ...(bqcData.groupName !== '4 - E&P SERVICES' ? [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "4. ESCALATION/ DE-ESCALATION CLAUSE: Buyer to take approval of the relevant clause, if applicable.", 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: bqcData.escalationClause || "N/A", 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 400 },
            })
          ] : []),
          
          // Explanatory Note for Additional Details
          ...(bqcData.hasAdditionalExplanatoryNote && bqcData.additionalExplanatoryNote ? [
            new Paragraph({
              children: convertHtmlToWordRuns(bqcData.additionalExplanatoryNote),
              spacing: { after: 200 },
            }),
          ] : []),
          
          // Evaluation Methodology
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `${sectionNumbers.evaluation}. EVALUATION METHODOLOGY`, 
                bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: "The tender will be invited through Open tender (Domestic) as two-part bid. The bid qualification evaluation of the received bids will be done as per the above bid qualification criteria and the technical bid of the shortlisted bidders will be evaluated subsequently. The price bids of the bidders who qualify BQC criteria & meet Technical / Commercial requirements of the tender will only be opened and evaluated.", 
                size: 24,
                font: "Arial"
                  }),
                ],
            spacing: { after: 200 },
              }),
              
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: `The Commercial Evaluation shall be done on ${Array.isArray(bqcData.commercialEvaluationMethod) && bqcData.commercialEvaluationMethod.length > 0 ? bqcData.commercialEvaluationMethod.join(', ') : 'Overall Lowest Basis'}.`, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             spacing: { after: 200 },
                       }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: bqcData.tenderType === 'Works' 
                  ? "The order will be placed based on above methodology AND Purchase preference based on PPP-MII Policy."
                  : "The order will be placed based on above methodology AND Purchase preference based on MSE/ PPP-MII Policy.", 
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: `The subject job is ${bqcData.divisibility || 'Non-Divisible'}.`, 
                size: 24,
                font: "Arial"
                  }),
                ],
            spacing: { after: 400 },
          }),
          
          // EMD
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `${sectionNumbers.emd}. EARNEST MONEY DEPOSIT (EMD)`, 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
                      }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `Bidders are required to provide Earnest Money Deposit equivalent to Rs. ${(emdAmount || 0).toFixed(2)} Lacs for the tender.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: "EMD exemption shall be as per General Terms & Conditions of GeM (applicable for GeM tenders)/ MSE policy", 
                size: 24,
                font: "Arial"
                  }),
                ],
            spacing: { after: 400 },
          }),
          
          // Explanatory Note for EMD
          ...(bqcData.hasEMDExplanatoryNote && bqcData.emdExplanatoryNote ? [
            new Paragraph({
              children: convertHtmlToWordRuns(bqcData.emdExplanatoryNote),
              spacing: { after: 200 },
            }),
          ] : []),
          
          // Performance Security - Only if enabled
          ...(bqcData.hasPerformanceSecurity ? [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `${sectionNumbers.performanceSecurity}. Performance Security (if at variance with the ITB clause):`, 
                  bold: true, 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `Performance Security % other than ${getPerformanceSecurityPercentage(bqcData.tenderType || 'Goods')} to be mentioned, approved by the competent authority: ${bqcData.performanceSecurity || 'Standard'}`, 
                  size: 24,
                  font: "Arial"
                }),
              ],
              spacing: { after: 400 },
            })
          ] : []),
          
          // Approval Required
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: "8. APPROVAL REQUIRED", 
                bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: "In view of above, approval is requested:", 
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),
              
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `Bid Qualification Criteria as per Sr. No. ${sectionNumbers.bqc}, as per Clause 13.8 of Guidelines for procurement of Goods and Contract Services.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 100 },
                      }),
          
                      new Paragraph({
                        children: [
                          new TextRun({ 
                text: `Inviting bids (two-part bid) through a Domestic Open Tender and adopting evaluation methodology as per Sr. No. ${sectionNumbers.evaluation} above.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Earnest Money Deposit as per Sr. No. ${sectionNumbers.emd} above.${bqcData.hasPerformanceSecurity ? `/ Performance Security as per Sr. No. ${sectionNumbers.performanceSecurity} (if applicable)` : ''}`, 
                size: 24,
                font: "Arial"
                  }),
                ],
            spacing: { after: 400 },
              }),
              
               // Approval Section - Centered
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: "Proposed by", 
                             bold: true, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
                       }),
           
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: `${bqcData.proposedBy || "XXXXX"}${bqcData.proposedByDesignation ? `, ${bqcData.proposedByDesignation}` : ', Procurement Manager (CPO Mktg.)'}`, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 400 },
               }),
               
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: "Recommended by", 
                             bold: true, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
                       }),
           
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: `${bqcData.recommendedBy || "XXXXXX"}${bqcData.recommendedByDesignation ? `, ${bqcData.recommendedByDesignation}` : ', Procurement Leader (CPO Mktg.)'}`, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 400 },
               }),
               
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: "Concurred by", 
                             bold: true, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
                       }),
           
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: `${bqcData.concurredBy || "Rajesh J."}${bqcData.concurredByDesignation ? `, ${bqcData.concurredByDesignation}` : ', General Manager Finance (CPO Marketing)'}`, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 400 },
               }),
               
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: "Approved by", 
                             bold: true, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
                       }),
           
                       new Paragraph({
                         children: [
                           new TextRun({ 
                 text: `${bqcData.approvedBy || "Kani Amudhan N."}${bqcData.approvedByDesignation ? `, ${bqcData.approvedByDesignation}` : ', Chief Procurement Officer (CPO Marketing)'}`, 
                             size: 24,
                             font: "Arial"
                           }),
                         ],
             alignment: AlignmentType.CENTER,
             spacing: { after: 200 },
           }),
        ],
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Set response headers for file download
    const filename = `BQC_${bqcData.refNumber || 'document'}_${formatDate(new Date()).replace(/\//g, '-')}.docx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send the buffer
    res.send(buffer);
    
  } catch (error) {
    console.error('Generate document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate document'
    });
  }
});

export default router;
