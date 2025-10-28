import type { VercelRequest, VercelResponse } from '@vercel/node';
import { database } from '../../server/models/database-adapter';
import { authenticateTokenVercel } from '../../server/middleware/auth';

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

    const bqcData = req.body;
    const userId = authResult.userId!;

    // Debug logging to check lots data being saved
    console.log('=== SAVE API DEBUG ===');
    console.log('BQC Data being saved:', JSON.stringify(bqcData, null, 2));
    if (bqcData.lots && bqcData.lots.length > 0) {
      console.log('Lots data:');
      bqcData.lots.forEach((lot: any, index: number) => {
        console.log(`  Lot ${index + 1}:`, {
          lotNumber: lot.lotNumber,
          cecEstimateInclGst: lot.cecEstimateInclGst,
          cecEstimateExclGst: lot.cecEstimateExclGst,
          contractPeriodText: lot.contractPeriodText,
          contractPeriodMonths: lot.contractPeriodMonths,
          hasAmc: lot.hasAmc,
          amcValue: lot.amcValue,
          mseRelaxation: lot.mseRelaxation
        });
      });
    } else {
      console.log('No lots data found or lots array is empty');
    }
    console.log('=== END SAVE DEBUG ===');

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
}
