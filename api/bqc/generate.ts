import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateTokenVercel } from '../../server/middleware/auth';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Authenticate token
    const authResult = await authenticateTokenVercel(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { data: bqcData, format = 'docx' } = req.body;

    // Comprehensive debugging - log the entire request body
    console.log('=== GENERATE API DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Format:', format);
    console.log('BQC Data received:', JSON.stringify(bqcData, null, 2));
    
    // Check if lots data exists and has values
    if (bqcData.lots && bqcData.lots.length > 0) {
      console.log('Lots data:');
      bqcData.lots.forEach((lot: any, index: number) => {
        // Parse CEC values to ensure they're numbers
        const parsedCecIncl = typeof lot.cecEstimateInclGst === 'string' 
          ? parseFloat(lot.cecEstimateInclGst) || 0 
          : (lot.cecEstimateInclGst || 0);
        const parsedCecExcl = typeof lot.cecEstimateExclGst === 'string'
          ? parseFloat(lot.cecEstimateExclGst) || 0
          : (lot.cecEstimateExclGst || 0);
        
        console.log(`  Lot ${index + 1}:`, {
          lotNumber: lot.lotNumber,
          cecEstimateInclGst: lot.cecEstimateInclGst,
          cecEstimateInclGstType: typeof lot.cecEstimateInclGst,
          cecEstimateInclGstParsed: parsedCecIncl,
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
        
        // Debug: Check if CEC values are actually 0
        if (parsedCecIncl === 0 || isNaN(parsedCecIncl)) {
          console.error(`❌ ERROR: Lot ${index + 1} (${lot.lotNumber}) has CEC Estimate = ${lot.cecEstimateInclGst} (type: ${typeof lot.cecEstimateInclGst}, parsed: ${parsedCecIncl})`);
        } else {
          console.log(`✅ Lot ${index + 1} has CEC Estimate = ${parsedCecIncl} (type: ${typeof lot.cecEstimateInclGst})`);
        }
      });
    } else {
      console.log('No lots data found or lots array is empty');
    }
    
    // Additional debug: Check if we have any non-zero CEC values
    const hasNonZeroCEC = bqcData.lots?.some((lot: any) => {
      const parsedCec = typeof lot.cecEstimateInclGst === 'string'
        ? parseFloat(lot.cecEstimateInclGst) || 0
        : (lot.cecEstimateInclGst || 0);
      return parsedCec > 0;
    });
    console.log('Has non-zero CEC values:', hasNonZeroCEC);
    
    if (!hasNonZeroCEC) {
      console.error('❌ CRITICAL: No lots have CEC values > 0. This will cause all calculations to be 0.');
      console.error('This means the user either:');
      console.error('1. Has not entered CEC values for any lots');
      console.error('2. The data is being cleared somewhere in the process');
      console.error('3. There is a bug in the data flow');
      console.error('');
      console.error('Suggestion: Check the frontend to ensure:');
      console.error('- CEC values are being entered correctly in the UI');
      console.error('- Data is being saved before generating');
      console.error('- Data is being passed correctly to the generate API');
      
      // Don't return error - let the generation proceed so user can see what data was sent
      console.error('⚠️ Continuing with generation to show debug output, but values will be 0.00');
    }
    
    console.log('Contract Duration Years:', bqcData.contractDurationYears);
    console.log('Tender Type:', bqcData.tenderType);
    console.log('Evaluation Methodology:', bqcData.evaluationMethodology);
    console.log('=== END DEBUG ===');

    if (format !== 'docx') {
      return res.status(400).json({
        success: false,
        message: 'Only DOCX format is currently supported'
      });
    }

    // Format currency helper functions
    const formatCurrency = (amount: number): string => {
      if (amount >= 10000000) {
        return `Rs. ${Math.round((amount / 10000000) * 100) / 100} Crore`;
      } else if (amount >= 100000) {
        return `Rs. ${Math.round((amount / 100000) * 100) / 100} Lakh`;
      } else {
        return `Rs. ${amount.toLocaleString()}`;
      }
    };

    const formatLakhs = (amount: number): string => {
      return `Rs ${Math.round((amount / 100000) * 100) / 100} Lakh`;
    };

    // Format date to dd/mm/yyyy format
    const formatDate = (date: Date | string): string => {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        if (date.includes('-')) {
          const parts = date.split('-');
          if (parts[0].length === 4) {
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = date;
      }
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      return `${day}/${month}/${year}`;
    };

    // Calculate lot-wise values
    const calculateLotValues = (lots: any[]) => {
      console.log('=== CALCULATE LOT VALUES DEBUG ===');
      console.log('Input lots:', JSON.stringify(lots, null, 2));
      
      return lots.map((lot, index) => {
        console.log(`Processing lot ${index + 1}:`, JSON.stringify(lot, null, 2));
        
        // Parse CEC values - handle both string and number types
        const cecInclGst = typeof lot.cecEstimateInclGst === 'string' 
          ? parseFloat(lot.cecEstimateInclGst) || 0 
          : (lot.cecEstimateInclGst || 0);
        const cecExclGst = typeof lot.cecEstimateExclGst === 'string'
          ? parseFloat(lot.cecEstimateExclGst) || 0
          : (lot.cecEstimateExclGst || 0);
        
        console.log(`Lot ${index + 1} - CEC Incl GST (parsed):`, cecInclGst, '(raw:', lot.cecEstimateInclGst, ')');
        console.log(`Lot ${index + 1} - CEC Excl GST (parsed):`, cecExclGst, '(raw:', lot.cecEstimateExclGst, ')');
        
        // Debug: Check if CEC values are actually 0
        if (cecInclGst === 0 || isNaN(cecInclGst)) {
          console.error(`❌ ERROR: Lot ${index + 1} (${lot.lotNumber}) has invalid CEC Estimate = ${lot.cecEstimateInclGst}`);
          console.error(`This will cause all calculated values to be 0.`);
          console.error(`Please ensure CEC values are entered properly in the UI.`);
        }
        
        // Use EXACT same calculation logic as UI (BQCSection.tsx)
        const baseAmount = cecInclGst;
        
        // Parse contract period from text or use numeric value (EXACT same as UI)
        let contractMonths = lot.contractPeriodMonths || 12;
        if (lot.contractPeriodText) {
          const textMatch = lot.contractPeriodText.match(/(\d+)/);
          if (textMatch) {
            contractMonths = parseInt(textMatch[1]);
            // Handle years conversion
            if (lot.contractPeriodText.toLowerCase().includes('year')) {
              contractMonths = contractMonths * 12;
            }
          }
        }
        
        const contractYears = contractMonths / 12;
        // FIXED: Use individual lot contract period, not global contract duration
        const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
        const finalAmount = lot.mseRelaxation ? annualizedAmount * 0.85 : annualizedAmount;
        
        // Convert to Lakhs for display (1 Crore = 100 Lakhs) - EXACT same as UI
        const amountInLakhs = finalAmount * 100;
        
        // Calculate options - EXACT same as UI
        const optionA = amountInLakhs * 0.8; // 80% - One work
        const optionB = amountInLakhs * 0.5; // 50% - Two works each
        const optionC = amountInLakhs * 0.4; // 40% - Three works each
        
        // Calculate turnover (30% of CEC value minus AMC, using individual lot contract period)
        const lotAMC = lot.hasAmc && lot.amcValue && lot.amcValue > 0 ? lot.amcValue : 0;
        const turnoverBaseAmount = baseAmount - lotAMC;
        const baseTurnover = turnoverBaseAmount * 0.3;
        // FIXED: Use individual lot contract period, not global contract duration
        const turnoverInCrores = baseTurnover / contractYears;
        // Convert to Lakhs for display (1 Crore = 100 Lakhs)
        const turnover = turnoverInCrores * 100;
        
        console.log(`Lot ${index + 1} - Final calculations:`, {
          baseAmount,
          contractMonths,
          contractYears,
          annualizedAmount,
          finalAmount,
          amountInLakhs,
          optionA,
          optionB,
          optionC,
          turnover,
          turnoverInCrores,
          baseTurnover,
          // Show conversions
          optionAInLakhs: Math.round(optionA * 100) / 100,
          turnoverInLakhs: Math.round(turnover * 100) / 100,
          // Debug pre-calculated values
          preCalculatedOptionA: lot.similarWorksOptionA,
          preCalculatedOptionB: lot.similarWorksOptionB,
          preCalculatedOptionC: lot.similarWorksOptionC,
          usingPreCalculated: !!(lot.similarWorksOptionA || lot.similarWorksOptionB || lot.similarWorksOptionC)
        });
        
        return {
          ...lot,
          annualizedValue: annualizedAmount,
          optionA,
          optionB,
          optionC,
          turnover,
          turnoverInCrores,
          contractMonths,
          contractYears
        };
      });
    };

    // Debug: Log lots data before processing
    console.log('=== BEFORE calculateLotValues ===');
    console.log('Number of lots:', bqcData.lots?.length || 0);
    if (bqcData.lots && bqcData.lots.length > 0) {
      console.log('Lots summary:', bqcData.lots.map((lot: any) => ({
        lotNumber: lot.lotNumber,
        cecIncl: lot.cecEstimateInclGst,
        cecInclType: typeof lot.cecEstimateInclGst
      })));
    }
    
    // Calculate total values - handle both string and number types
    const totalCECInclGst = bqcData.lots?.reduce((sum: number, lot: any) => {
      const lotCEC = typeof lot.cecEstimateInclGst === 'string'
        ? parseFloat(lot.cecEstimateInclGst) || 0
        : (lot.cecEstimateInclGst || 0);
      return sum + lotCEC;
    }, 0) || 0;
    const totalCECExclGst = bqcData.lots?.reduce((sum: number, lot: any) => {
      const lotCEC = typeof lot.cecEstimateExclGst === 'string'
        ? parseFloat(lot.cecEstimateExclGst) || 0
        : (lot.cecEstimateExclGst || 0);
      return sum + lotCEC;
    }, 0) || 0;
    
    console.log('Total CEC Incl GST:', totalCECInclGst);
    console.log('Total CEC Excl GST:', totalCECExclGst);
    
    // Calculate total annualized value based on contract duration
    const contractDurationYears = bqcData.contractDurationYears || 1;
    const totalAnnualizedValue = contractDurationYears > 1 ? totalCECInclGst / contractDurationYears : totalCECInclGst;
    const totalTurnoverInCrores = (totalCECInclGst * 0.3) / contractDurationYears;
    // Convert to Lakhs for display (1 Crore = 100 Lakhs)
    const totalTurnover = totalTurnoverInCrores * 100;

    // Calculate EMD (5 Lakh for this example)
    const emdAmount = 5; // Fixed at 5 Lakh as per example

    // Process lots with calculated values
    const processedLots = calculateLotValues(bqcData.lots || []);
    
    // Debug logging
    console.log('Document Generation Debug Info:');
    console.log('- Total lots:', processedLots.length);
    console.log('- Contract Duration Years:', bqcData.contractDurationYears);
    console.log('- Lots data:', processedLots.map(lot => ({
      lotNumber: lot.lotNumber,
      cecInclGst: lot.cecEstimateInclGst,
      cecExclGst: lot.cecEstimateExclGst,
      contractPeriodText: lot.contractPeriodText,
      contractMonths: lot.contractPeriodMonths,
      annualizedValue: lot.annualizedValue,
      optionA: lot.optionA,
      optionB: lot.optionB,
      optionC: lot.optionC,
      turnover: lot.turnover,
      hasAmc: lot.hasAmc,
      amcValue: lot.amcValue,
      mseRelaxation: lot.mseRelaxation
    })));
    
    // Check if we have valid lot data
    if (!processedLots || processedLots.length === 0) {
      console.log('ERROR: No processed lots found');
      return res.status(400).json({
        success: false,
        message: 'No lot data found. Please add lots with CEC estimates before generating the document.'
      });
    }
    
    // Check if any lot has CEC values - use parsed values
    const hasValidCECData = processedLots.some(lot => {
      const parsedCec = typeof lot.cecEstimateInclGst === 'string'
        ? parseFloat(lot.cecEstimateInclGst) || 0
        : (lot.cecEstimateInclGst || 0);
      return parsedCec > 0;
    });
    
    if (!hasValidCECData) {
      console.log('ERROR: No valid CEC data found in lots');
      console.log('Processed lots:', processedLots.map(lot => ({
        lotNumber: lot.lotNumber,
        cecEstimateInclGst: lot.cecEstimateInclGst,
        cecEstimateInclGstType: typeof lot.cecEstimateInclGst,
        cecEstimateExclGst: lot.cecEstimateExclGst
      })));
      console.log('⚠️ Continuing to show all zeros in document for debugging purposes');
      // Don't return error - let user see the document with zeros to debug
    }

    // Create document with BPCL format
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with reference and date
          new Paragraph({
            children: [
              new TextRun({ 
                text: `${bqcData.refNumber || 'CPO.GR7.MISC MECH WORKS'} ${formatDate(new Date())}`,
                bold: true,
                size: 28,
                font: "Arial"
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Note to section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Note to: CPO(M)",
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 400 },
          }),

          // Subject section
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Subject: APPROVAL OF BID QUALIFICATION CRITERIA (BQC) FOR THE JOB OF "${bqcData.tenderDescription || 'MISCELLANEOUS MECHANICAL WORKS DUE TO AMENDMENT IN OISD 141/214 AND MAINTENANCE REQUIREMENTS AT PIPELINE LOCATIONS'}"`,
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 1.0 PREAMBLE section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "1.0 PREAMBLE",
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          // Preamble content table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              // Tender Description row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Tender Description", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: bqcData.tenderDescription || "MISCELLANEOUS MECHANICAL WORKS DUE TO AMENDMENT IN OISD 141/214 AND MAINTENANCE REQUIREMENTS AT PIPELINE LOCATIONS", size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // PR reference row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "PR reference/ Email reference", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: bqcData.prReference || "17559336", size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // Type of Tender row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Type of Tender", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: `${bqcData.tenderType || 'Works'}`, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // CEC estimate row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "CEC estimate (incl. of GST)/ Date", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: `Rs. ${Math.round(totalCECInclGst).toLocaleString()} /- (Incl. GST at 18%)`, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // LOT wise estimate breakup
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "LOT wise estimate breakup is as:", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: processedLots.map((lot, index) => {
                        const lotNumber = lot.lotNumber || `LOT-${index + 1}`;
                        const region = lot.description || 'Region';
                        const amount = formatLakhs(lot.cecEstimateInclGst || 0);
                        return new TextRun({ 
                          text: `${lotNumber} (${region}) - ${amount}\n`,
                          size: 22, 
                          font: "Arial" 
                        });
                      }),
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // CEC estimate exclusive of GST
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "CEC estimate exclusive of GST", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: `${formatCurrency(totalCECExclGst)} (excluding GST)`, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // Budget Details
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Budget Details (WBS/ Revex)", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: bqcData.budgetDetails || "CAPEX: WBSE PDSS/26003/01 & REVEX:GL 600080, CC 685278 & 685281", size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
              // Tender Platform
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Tender Platform – GeM/ E-procurement", bold: true, size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: bqcData.tenderPlatform || "E-procurement", size: 22, font: "Arial" })],
                      alignment: AlignmentType.LEFT,
                    })],
                  }),
                ],
              }),
            ],
          }),

          // 2.0 BRIEF SCOPE OF WORK section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "2.0 BRIEF SCOPE OF WORK:",
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          // Scope of work content
          new Paragraph({
            children: [
              new TextRun({ 
                text: `a. SCOPE OF WORK :\n${bqcData.scopeOfWork || 'Scope of work comprises of intrusive type Mechanical + Electronic Pig Signallers at various pipeline locations along with installation of vent/drain line as per latest amendment in OISD 141/214 and installation of valves as per maintenance requirements.'}`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `b. Contract Period /Completion Period: ${bqcData.contractPeriodText || '18 MONTHS FROM DATE OF RELEASE OF CONTRACT'}`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `c. Delivery Period of the Item: NA being Works`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `d. Warranty Period: ${bqcData.warrantyPeriod || '12 months from the date of commissioning or 18 months from the date of dispatch whichever is earlier.'}`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `e. AMC/ CAMC/ O&M (No. of Years): NA`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `f. Payment Terms (if different from standard terms i.e within 30 days): ${bqcData.paymentTerms || '75% of bill value shall be released within 15 days of receipt of bill duly certified by Engineer-In-Charge (EIC) and the balance payment shall be released within 30 days of receipt of bill by EIC after detailed scrutiny.'}`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 3.0 BID QUALIFICATION CRITERIA (BQC) section
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.0 BID QUALIFICATION CRITERIA (BQC):",
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          // 3.1 TECHNICAL CRITERIA
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.1 TECHNICAL CRITERIA:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "Bidder/Vendor should qualify in each of the following Bid Qualification Criteria",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // 3.1.1 For GOODS: Manufacturing Capability and Supplying Capacity
          ...(bqcData.tenderType === 'Goods' && bqcData.evaluationMethodology === 'Lot-wise' ? [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "3.1.1. For GOODS:",
                  bold: true,
                  size: 22,
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
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({ 
                  text: `Bidder* should be ${bqcData.manufacturerTypes?.join(' AND/OR ') || 'Original Equipment Manufacturer AND/OR Authorized Channel Partner AND/OR Authorized Agent AND/OR Dealer AND/OR Authorized Distributor'} of the item being tendered.`,
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Supplying Capacity:",
                  bold: true,
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Non-MSE (Standard) Requirements:\nThe bidder should have supplied similar goods in the last Seven (7) years. The quantity supplied should be at least 30% of the total quantity required for each lot as per below table.",
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ 
                  text: "For MSE bidders, Relaxation of 15% on the supplying capacity shall be given as per Corp. Finance Circular MA.TEC.POL.CON.3A dated 26.10.2020.",
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { after: 200 },
            }),

            // Supplying Capacity table
            ...(processedLots && processedLots.length > 0 ? [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
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
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Sr. No.", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 10, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Section / Description", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Quantity Required", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Non-MSE (30%)", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "MSE (15%)", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                // Data rows
                ...processedLots.map((lot, index) => {
                  const quantityRequired = lot.quantitySupplied || 0;
                  const nonMseRequirement = Math.round(quantityRequired * 0.3);
                  const mseRequirement = Math.round(quantityRequired * 0.15); // 15% for MSE
                  
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${index + 1}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${lot.lotNumber || `LOT-${index + 1}`}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.LEFT,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${quantityRequired.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${nonMseRequirement.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${mseRequirement.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                    ],
                  });
                }),
                // Total row
                (() => {
                  const totalQuantity = processedLots.reduce((sum, lot) => sum + (lot.quantitySupplied || 0), 0);
                  const totalNonMse = Math.round(totalQuantity * 0.3);
                  const totalMse = Math.round(totalQuantity * 0.15);
                  
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${processedLots.length + 1}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: "TOTAL FOR ALL LOTS", bold: true, size: 20, font: "Arial" })],
                          alignment: AlignmentType.LEFT,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${totalQuantity.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${totalNonMse.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${totalMse.toLocaleString()}`, size: 20, font: "Arial" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                    ],
                  });
                })(),
                ],
              }),
            ] : []),

            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Bidder can quote for any one or more than one LOT based on their capability/choice.",
                  size: 22,
                  font: "Arial"
                }),
              ],
              spacing: { before: 200, after: 400 },
            }),
          ] : []),

          // 3.1.1 PROVEN TRACK RECORD
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.1.1 PROVEN TRACK RECORD",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "The bidder shall have experience of having successfully executed similar works in the last Seven (7) years in any Oil & Gas Industry in India. The Value (Rs) of the similar work/s executed (proof of execution to be submitted) should be as follows:",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: `Definition of Similar work:\n${bqcData.similarWorkDefinition || 'Similar work shall be defined as Mechanical Maintenance or Repair activities that involve welding (and / or) hot tapping (and / or) piping fabrication works on hydrocarbon piping within India. Associated tasks directly related to the maintenance and repair of such pipelines will also fall under the scope of Similar Work. However, standalone activities such as manpower (or) equipment hiring, (or) transportation services will not be treated as Similar Work. In case of Supply of Manpower towards Mechanical Maintenance / Repair of pipelines, Work Order shall be considered only if scope of work involves welding (and / or) hot tapping (and / or) piping fabrication work.'}`,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // Experience requirements table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
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
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Sr. No.", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 7, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Section / Description", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  ...(bqcData.provenTrackRecordMseRelaxation ? [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "One similar work of total value not less than (Rs. in Lakhs) - Standard", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Two similar works EACH of value not less than (Rs. in Lakhs) - Standard", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Three similar works EACH of value not less than (Rs. in Lakhs) - Standard", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "One similar work (MSE - 15% reduction) (Rs. in Lakhs)", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Two similar works EACH (MSE - 15% reduction) (Rs. in Lakhs)", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Three similar works EACH (MSE - 15% reduction) (Rs. in Lakhs)", bold: true, size: 18, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 13, type: WidthType.PERCENTAGE },
                    }),
                  ] : [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "One similar work of total value not less than (Rs. in Lakhs)", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "OR Two similar works EACH of value not less than (Rs. in Lakhs)", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "OR Three similar works EACH of value not less than (Rs. in Lakhs)", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                      width: { size: 28, type: WidthType.PERCENTAGE },
                    }),
                  ]),
                ],
              }),
              // Data rows for each lot
              ...processedLots.map((lot, index) => {
                // Use pre-calculated values from calculateLotValues function
                const optionA = lot.optionA || 0;
                const optionB = lot.optionB || 0;
                const optionC = lot.optionC || 0;
                
                // Calculate MSE values (15% reduction)
                const mseOptionA = optionA * 0.85;
                const mseOptionB = optionB * 0.85;
                const mseOptionC = optionC * 0.85;
                
                console.log(`Technical Criteria Table - Lot ${index + 1}:`, {
                  lotNumber: lot.lotNumber,
                  cecEstimateInclGst: lot.cecEstimateInclGst,
                  optionA,
                  optionB,
                  optionC,
                  mseOptionA,
                  mseOptionB,
                  mseOptionC,
                  formattedA: Math.round((optionA || 0) * 100) / 100,
                  formattedB: Math.round((optionB || 0) * 100) / 100,
                  formattedC: Math.round((optionC || 0) * 100) / 100,
                  // Debug: Check if values are actually 0
                  isOptionAZero: optionA === 0,
                  isOptionBZero: optionB === 0,
                  isOptionCZero: optionC === 0
                });
                
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${index + 1}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${lot.lotNumber || `LOT-${index + 1}`} (${lot.description || 'Region'})`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.LEFT,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((optionA || 0) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((optionB || 0) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((optionC || 0) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    ...(bqcData.provenTrackRecordMseRelaxation ? [
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${(Math.round(mseOptionA * 100) / 100).toFixed(2)}`, size: 20, font: "Arial", color: "006400" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${(Math.round(mseOptionB * 100) / 100).toFixed(2)}`, size: 20, font: "Arial", color: "006400" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                      new TableCell({
                        children: [new Paragraph({
                          children: [new TextRun({ text: `${(Math.round(mseOptionC * 100) / 100).toFixed(2)}`, size: 20, font: "Arial", color: "006400" })],
                          alignment: AlignmentType.CENTER,
                        })],
                      }),
                    ] : []),
                  ],
                });
              }),
            ],
          }),

          // Note about cumulative eligibility
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Bidder can quote for any one or more than one LOT based on their capability/choice.\nNote: If the Bidder quotes for more than one LOT, the similar works criteria should not be less than the cumulative amount applicable for the LOTs quoted.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          // 3.1.2.1 DOCUMENTS REQUIRED
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.1.2.1 DOCUMENTS REQUIRED",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "The following documents should be submitted in support of the above clause:\n1. Signed Agreement/PO copy/Work order/LOI or any other valid document which shows value of awarded works along with BOQ. The work order for similar work(s) shall be in the name of the bidder and work order shall contain names, address and contact details of clients. In case of combined works, clear calculations showing the bifurcated cost towards the similar work as defined above.\n2. Execution Certificate/Final Bill certified by the client or any other document which conclusively proves execution of the awarded work.\n3. For long-term on-going contract, value of work executed & paid till the last day of month previous to which the tender was floated, shall be considered for similar work criteria. This is subject to the bidder providing a provisional or partial completion/ execution certificate from the client, or relevant invoices; confirming the value of work completed up to the specified date.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // Explanatory Note
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Explanatory Note:\nThe above criteria has been calculated based on the CTE Circular No. 12-02-1- CTE-6 dtd. 17th December 2002.\none works each costing not less than-80% of estimated value\ntwo works each costing not less than-50% of estimated value\nthree works each costing not less than-40% of estimated value.\nSince the nature of job is Works, the provision for relaxation for MSEs bidder for BQC Criteria is not applicable.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 3.2 FINANCIAL CRITERIA
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.2 FINANCIAL CRITERIA:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          // 3.2.1 ANNUAL TURNOVER
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.2.1 ANNUAL TURNOVER:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "The bidder should have achieved a minimum Average Annual financial turnover as per below table (LOT-WISE).as per Audited Balance sheet and P&L Statement in the last three* accounting years prior to due date of bid submission.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // Turnover table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
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
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Sr. No.", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Section / Description", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Annualized Estimated Value (Rs. In Lakhs)", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Average Annual Turnover (Rs. In Lakhs)", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Data rows for each lot
              ...processedLots.map((lot, index) => {
                // Use pre-calculated values from calculateLotValues function
                const annualizedValue = lot.annualizedValue || 0;
                const turnoverRequirement = lot.turnover || 0;
                
                // Convert annualized value to Lakhs for display (1 Crore = 100 Lakhs)
                const annualizedValueInLakhs = annualizedValue * 100;
                
                console.log(`Financial Criteria Table - Lot ${index + 1}:`, {
                  lotNumber: lot.lotNumber,
                  cecEstimateInclGst: lot.cecEstimateInclGst,
                  annualizedValue,
                  annualizedValueInLakhs,
                  turnoverRequirement,
                  formattedAnnualized: Math.round((annualizedValueInLakhs || 0) * 100) / 100,
                  formattedTurnover: Math.round((turnoverRequirement || 0) * 100) / 100
                });
                
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${index + 1}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${lot.lotNumber || `LOT-${index + 1}`} (${lot.description || 'Region'})`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.LEFT,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((annualizedValueInLakhs || 0) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((turnoverRequirement || 0) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                  ],
                });
              }),
              // Total row - Calculate totals from processed lots
              (() => {
                let totalAnnualizedValue = 0;
                let totalTurnover = 0;
                
                processedLots.forEach(lot => {
                  totalAnnualizedValue += lot.annualizedValue || 0;
                  totalTurnover += lot.turnover || 0;
                });
                
                // Convert total annualized value to Lakhs for display (1 Crore = 100 Lakhs)
                const totalAnnualizedValueInLakhs = totalAnnualizedValue * 100;
                
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${processedLots.length + 1}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `TOTAL FOR ALL LOTS`, bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.LEFT,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((totalAnnualizedValueInLakhs || 0) * 100) / 100).toFixed(2)}`, bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((totalTurnover || 0) * 100) / 100).toFixed(2)}`, bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                  ],
                });
              })(),
            ],
          }),

          // Note about cumulative turnover
          new Paragraph({
            children: [
              new TextRun({ 
                text: "Bidder can quote for any one or more than one LOT based on their capability/choice.\nNote: If the Bidder quotes for more than one LOT, the average value of Turnover should not be less than the cumulative amount applicable for the LOTs quoted.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          // 3.2.2 NET WORTH
          new Paragraph({
            children: [
              new TextRun({ 
                text: "3.2.2 NET WORTH:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "The bidders should have positive net worth as per the latest audited financial statement.\nBidder shall furnish Annual Report/ audited balance sheets including Profit and Loss Accounts along with the Bid to establish Bidder's conformance to Qualification Criteria.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // Explanatory Note for turnover
          new Paragraph({
            children: [
              new TextRun({ 
                text: "* Explanatory Note:\nThe annual average turnover is calculated as the 30% of the per LOT Annualized Estimate Value. Average annual turnover values in-line with CTE Office Memorandum No. 12-02-1-CTE-6 dated 17th Dec 2002\nDocuments Required: Please refer the ITB (Instruction to Bidders) which mentions the documents to be submitted by bidders for meeting the above Technical and Financial criteria, ITB is enclosed as Annexure-III",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 4.0 BIDS MAY BE SUBMITTED BY
          new Paragraph({
            children: [
              new TextRun({ 
                text: "4.0 BIDS MAY BE SUBMITTED BY:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "i. The bids may be submitted by an entity (domestic bidder) and should have completed 3 financial years of existence as on original due date of tender since date of commencement of business and shall fulfil each BQC eligibility criteria.\nii. JV/Consortium bids and will not be accepted (i.e., Qualification on the strength of the JV Partners/Consortium Members will not be accepted)\nPl. note: The definition of bidder is the entity which has a unique PAN (Permanent Account Number).",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 5.0 EARNEST MONEY DEPOSIT
          new Paragraph({
            children: [
              new TextRun({ 
                text: "5.0 EARNEST MONEY DEPOSIT:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "Bidders are required to provide Earnest Money Deposit as per below table (LOT-WISE):",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          // EMD table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
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
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Sr. No.", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "Section / Description", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 35, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "CEC Estimate (Rs. In Lakhs)", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: "EMD Amount (Rs. In Lakhs)", bold: true, size: 20, font: "Arial" })],
                      alignment: AlignmentType.CENTER,
                    })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Data rows for each lot
              ...processedLots.map((lot, index) => {
                // Parse CEC value - handle both string and number types
                const lotCEC = typeof lot.cecEstimateInclGst === 'string'
                  ? parseFloat(lot.cecEstimateInclGst) || 0
                  : (lot.cecEstimateInclGst || 0);
                
                // EMD amounts as per the specified criteria: [2.5, 1, 0, 1, 1] for Lot 1, 2, 3, 4, 5
                const emdAmounts = [2.5, 1, 0, 1, 1];
                const emdAmount = index < emdAmounts.length ? emdAmounts[index] : 0;
                
                console.log(`EMD Table - Lot ${index + 1}:`, {
                  lotNumber: lot.lotNumber,
                  cecEstimateInclGst: lot.cecEstimateInclGst,
                  lotCEC,
                  emdAmount,
                  cecInLakhs: lotCEC * 100,
                  cecRawType: typeof lot.cecEstimateInclGst
                });
                
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${index + 1}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${lot.lotNumber || `Lot ${index + 1}`}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.LEFT,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((lotCEC * 100) * 100) / 100).toFixed(2)}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${emdAmount}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                  ],
                });
              }),
              // Total row
              (() => {
                let totalCEC = 0;
                let totalEMD = 0;
                
                // EMD amounts as per the specified criteria: [2.5, 1, 0, 1, 1] for Lot 1, 2, 3, 4, 5
                const emdAmounts = [2.5, 1, 0, 1, 1];
                
                processedLots.forEach((lot, index) => {
                  const lotCEC = lot.cecEstimateInclGst || 0;
                  const emdAmount = index < emdAmounts.length ? emdAmounts[index] : 0;
                  
                  totalCEC += lotCEC;
                  totalEMD += emdAmount;
                });
                
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${processedLots.length + 1}`, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: "TOTAL FOR ALL LOTS", bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.LEFT,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${(Math.round((totalCEC * 100) * 100) / 100).toFixed(2)}`, bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: `${totalEMD}`, bold: true, size: 20, font: "Arial" })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                  ],
                });
              })(),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "EMD may be submitted preferably in form of e-Bank Guarantee or Bank Guarantee (as per format in GPC) executed by any Scheduled Bank approved by Reserve Bank of India or by NEFT transfer to BPCL Account or Insurance Surety Bond (as per format in GPC).",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "ii. Exemption of EMD:\nBidders claiming exemption of EMD, shall submit a CA certificate issued by a practicing CA on his letter head along with MSE document (Udyam Registration Certificate) to avail the benefits of Public Procurement Policy as per MSMED Act, 2006 /Public Procurement Policy Order 2021.In case CA certificate is not submitted, bid of the Bidder shall be rejected at EMD Stage. Please note the below further points with respect to same:\n\na. Bidder shall have to upload self -verified scanned copy of UDYAM Certificate & CA Certificate with UDIN mentioned on it. Thereupon, L1 Bidder shall submit the TPIA verified hard copy of CA certificate to BPCL within 5 days of intimation by BPCL.\nb. The CA certificate should be dated after the date of floating of tender and shall be specific to the tender for which bid is being submitted.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 6.0 PERFORMANCE SECURITY DEPOSIT
          new Paragraph({
            children: [
              new TextRun({ 
                text: "6.0 PERFORMANCE SECURITY DEPOSIT:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "To ensure performance of the contract and due discharge of the contractual obligations, the successful contractor will have to provide security deposit of 10% of the total value of contract. Amount received/retained towards this clause will be considered as security deposit.\n\nExplanatory Note: Performance Bid Security Deposit/Retention @ 10% is required in line with clause no 25 of Guideline for procurement of Goods and Contract Service Sept 2024",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 7.0 EVALUATION METHODOLOGY AND AWARD CRITERIA
          new Paragraph({
            children: [
              new TextRun({ 
                text: "7.0 EVALUATION METHODOLOGY AND AWARD CRITERIA:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "The tender will be invited through Open tender (Domestic) as two-part bid. The bid qualification evaluation of the received bids will be done as per the above bid qualification criteria and the technical bid of the shortlisted bidders will be evaluated subsequently. The price bids of the bidders who qualify BQC criteria & meet Technical / Commercial requirements of the tender will only be opened and evaluated.\nPrice Bid of all the LOTs for which bidder has submitted bid shall be opened or all bidders qualifying in Bid Qualification Criteria, Technical Evaluation & Techno-Commercial Evaluation and the award of all LOT/s shall be based on \"OVERALL LEAST COST BASIS TO BPCL\" taking cognizance of the cumulative* eligibility of the bidders, as per Bid Qualification Criteria.\nNote: If a bidder intends to qualify for more than one LOT, they must meet the required value of similar work(s) and average annual turnover on a cumulative basis for all the LOTs.\n\nThe job is not divisible (lot wise) & Purchase preference (Preference to Make In India) (PPP-MII) policy, as admissible from time to time under the existing Govt. policy shall be applicable during evaluation process.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),

          // 8.0 APPROVAL REQUESTED FOR
          new Paragraph({
            children: [
              new TextRun({ 
                text: "8.0 APPROVAL REQUESTED FOR:",
                bold: true,
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ 
                text: "i. Bid Qualification Criteria as per Sr. No. 3, as per Clause 13.8 of Guidelines for Procurement of Goods and Contract Services.\nii. Inviting bids (Two-part bid) through an Open tender and adopting Evaluation and Award Methodology as per Sr. no. 7 above.\niii. EMD & Performance Security Deposit as per Sr. no. 5 & 6 respectively as above.\niv. Publishing Open tender on BPCL e-procurement Portal.",
                size: 22,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),
        ],
      }],
    });

    // Generate the document buffer
    const buffer = await Packer.toBuffer(doc);

    // Set response headers for file download
    const filename = `BQC_${bqcData.refNumber || 'document'}_${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    // Send the document
    res.send(buffer);

  } catch (error) {
    console.error('Generate BQC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate document'
    });
  }
}
