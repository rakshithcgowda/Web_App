import express from 'express';
import { database } from '../models/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

const router = express.Router();

// All BQC routes require authentication
router.use(authenticateToken);

// Save BQC data
router.post('/save', async (req: AuthRequest, res) => {
  try {
    const bqcData = req.body;
    const userId = req.userId!;

    // Validate required fields
    if (!bqcData.refNumber) {
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
      itemName: bqcData.item_name || '',
      projectName: bqcData.project_name || '',
      tenderDescription: bqcData.tender_description,
      prReference: bqcData.pr_reference,
      tenderType: bqcData.tender_type,
      cecEstimateInclGst: bqcData.cec_estimate_incl_gst,
      cecDate: bqcData.cec_date,
      cecEstimateExclGst: bqcData.cec_estimate_excl_gst,
      budgetDetails: bqcData.budget_details,
      tenderPlatform: bqcData.tender_platform,
      scopeOfWork: bqcData.scope_of_work,
      contractPeriodYears: bqcData.contract_period_years,
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
      proposedBy: bqcData.proposed_by,
      recommendedBy: bqcData.recommended_by,
      concurredBy: bqcData.concurred_by,
      approvedBy: bqcData.approved_by,
      amcValue: bqcData.amc_value,
      hasAmc: Boolean(bqcData.has_amc),
      correctionFactor: bqcData.correction_factor,
      omValue: bqcData.o_m_value || 0,
      omPeriod: bqcData.o_m_period || '',
      hasOm: Boolean(bqcData.has_om),
      additionalDetails: bqcData.additional_details || ''
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
    const calculatePastPerformance = (cecInclGst: number, mseRelaxation: boolean = false) => {
      const basePercentage = 0.30; // 30% of CEC incl GST
      if (mseRelaxation) {
        return cecInclGst * basePercentage * (1 - 0.15); // 15% relaxation
      }
      return cecInclGst * basePercentage;
    };

    const calculateEMD = (estimatedValue: number, tenderType: string) => {
      if (estimatedValue < 50) return 0;
      if (estimatedValue <= 100 && ['Goods', 'Services'].includes(tenderType)) return 0;
      if (estimatedValue <= 500) return 2.5;
      if (estimatedValue <= 1000) return 5;
      if (estimatedValue <= 1500) return 7.5;
      if (estimatedValue <= 2500) return 10;
      return 20;
    };

    const calculateTurnover = (data: {
      divisibility?: string;
      correctionFactor?: number;
      cecEstimateInclGst?: number;
      cecEstimateExclGst?: number;
      evaluationMethodology?: string;
      lots?: Array<{ cecEstimateInclGst?: number }>;
      hasAmc?: boolean;
      amcValue?: number;
    }) => {
      let basePercentage = 0.3;
      if (data.divisibility === 'Divisible') {
        basePercentage = 0.3 * (1 + (data.correctionFactor || 0));
      }
      
      let totalCEC = data.cecEstimateInclGst || 0;
      if (data.evaluationMethodology === 'Lot-wise' && data.lots) {
        totalCEC = data.lots.reduce((sum: number, lot) => sum + (lot.cecEstimateInclGst || 0), 0);
      }
      
      let maintenanceValue = 0;
      if (data.hasAmc) {
        maintenanceValue = data.amcValue || 0;
      }
      
      if (maintenanceValue > 0) {
        return basePercentage * (totalCEC - maintenanceValue);
      } else {
        return basePercentage * (data.cecEstimateExclGst || 0);
      }
    };

    // Calculate values
    const pastPerformanceNonMSE = calculatePastPerformance(bqcData.cecEstimateInclGst || 0, false);
    const pastPerformanceMSE = calculatePastPerformance(bqcData.cecEstimateInclGst || 0, true);
    const turnoverAmount = calculateTurnover(bqcData);
    const emdAmount = calculateEMD(bqcData.cecEstimateInclGst || 0, bqcData.tenderType || 'Goods');

    // Use imported docx library

    // Create document with BPCL format in table structure
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Main table containing all content
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
              // Header - Note To
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Note To", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                        spacing: { line: 276 }, // 1.15 line spacing (240 * 1.15 = 276)
                      }),
                    ],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Chief Procurement Officer, CPO (M)", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              
              // Subject
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Subject", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Approval for Bid Qualification Criteria for floating an Open Tender for ${bqcData.tenderDescription || bqcData.itemName || "N/A"}.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 1.0 Background
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "1.0 Background", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Information Systems (IS) submitted proposal duly approved by Executive Director (IS) for floating an Open Tender for ${bqcData.tenderDescription || bqcData.itemName || "the specified work"}. ${bqcData.budgetDetails ? `Expenditure for this project will be debited to ${bqcData.budgetDetails}.` : ""}\n\nPR No. ${bqcData.prReference || "N/A"} is attached as Annexure–II.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 2.0 PR reference
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "2.0 PR reference / Email reference", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
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
                      }),
                    ],
                  }),
                ],
              }),
              
              // 3.0 Type of Tender
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "3.0 Type of Tender Good / Service / Works", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.tenderType || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 4.0 CEC estimate (incl. of GST)
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "4.0 CEC estimate (incl. of GST)/ Date", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `The overall estimated value of the above Job as per CEC estimate is Rs. ${bqcData.cecEstimateInclGst || 0} Lakh inclusive of 18% GST dated ${bqcData.cecDate || "N/A"}.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 5.0 CEC estimate exclusive of GST
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "5.0 CEC estimate exclusive of GST", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `₹ ${bqcData.cecEstimateExclGst || 0} Lakh`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 6.0 Budget Details
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "6.0 Budget Details (WBS/ Revex)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
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
                      }),
                    ],
                  }),
                ],
              }),
              
              // 7.0 Tender Platform
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "7.0 Tender Platform – GeM/ E-procurement", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `It is proposed to float the open tender thru ${bqcData.tenderPlatform || "GeM"} Portal in two part- bids system viz. Technical Bid (comprising of Bid-qualification criteria & Technical) and Price bid.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 8.0 Brief Scope of Work
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "8.0 Brief Scope of Work:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `The detailed scope of work under this tender enquiry is as per SCOPE OF WORK enclosed with the tender documents and brief is as below:\n\n"${bqcData.scopeOfWork || "N/A"}"`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 9.0 Contract Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "9.0 Contract Period /Completion Period", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${bqcData.contractPeriodYears || 0} Years${bqcData.hasAmc ? ` including ${bqcData.amcPeriod || "AMC"}` : ""}`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 10.0 Delivery Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "10.0 Delivery Period of the Item", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.deliveryPeriod || "As per contract terms", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 11.0 Warranty Period
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "11.0 Warranty Period", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.warrantyPeriod || "Nil", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 12.0 AMC/CAMC
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "12.0 AMC/ CAMC/ O&M (No. of Years)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.hasAmc ? `${bqcData.amcPeriod || "N/A"} - ₹${bqcData.amcValue || 0} Lakh` : "Not Applicable", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 13.0 Payment Terms
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "13.0 Payment Terms", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.paymentTerms || "As per standard terms (within 30 days)", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 14.0 Bid Validity
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "14.0 Bid Validity Period", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "120 days from date of opening of the tender.", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 15.0 BQC
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "15.0 Bid Qualification Criteria (BQC):", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "BPCL would like to qualify vendors for undertaking the above work as indicated in the brief scope.\n\nDetailed bid qualification criteria for short listing vendors shall be as follows:", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 15.1 Experience/Past Performance
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "15.1 Experience / Past performance / Technical Capability:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Bidder should have executed similar contracts in the last Seven years to any Central/ State Govt. Organization/ PSU/ Public Listed Company / Private Company in India.\n\nDefinition of Similar Works: ${bqcData.similarWorkDefinition || "As defined in tender documents"}\n\nPast Performance Requirements:\n• Non-MSE: ₹${pastPerformanceNonMSE.toFixed(2)} Lakh\n• MSE: ₹${pastPerformanceMSE.toFixed(2)} Lakh`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 15.2 Financial Criteria
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "15.2 Financial Criteria", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `AVERAGE ANNUAL TURNOVER: The average annual turnover of the Bidder for last three audited accounting years shall be ₹${(turnoverAmount / 100).toFixed(2)} Crore or above.\n\nNet Worth: The bidders should have positive net worth as per the latest audited financial statement.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 18.0 Evaluation Methodology
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "18.0 Evaluation Methodology", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `This tender is being invited through Open (Domestic) tender as two-part bid using ${bqcData.evaluationMethodology || "LCS"} methodology. The bid evaluation will be done as per the bid qualification criteria.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 19.0 EMD
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "19.0 Earnest Money Deposit (EMD)", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Bidders will be required to provide Earnest Money Deposit of ${emdAmount === 0 ? 'Nil' : `₹${emdAmount} Lakh`} as per tender requirements.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 20.0 Performance Security
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "20.0 Performance Security", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `Security deposit @ ${bqcData.performanceSecurity || 5}%, shall be collected in the form of Bank guarantee based on the value of the purchase order.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 24.0 Approval Requested
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "24.0 Approval Requested For:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `In view of the above, for the job of "${bqcData.tenderDescription || bqcData.itemName || "N/A"}", approval is requested for the above mentioned criteria and terms.\n\nI / We declare that I / We have no personal interest in the companies / Agencies participating in the tender process.`, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              // Approval Section
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Proposed By:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.proposedBy || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Recommended By:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.recommendedBy || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Concurred By:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.concurredBy || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: "Approved By:", 
                            bold: true, 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ 
                            text: bqcData.approvedBy || "N/A", 
                            size: 24,
                            font: "Arial"
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Set response headers for file download
    const filename = `BQC_${bqcData.refNumber || 'document'}_${new Date().toISOString().split('T')[0]}.docx`;
    
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
