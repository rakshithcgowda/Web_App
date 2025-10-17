import { sql } from '@vercel/postgres';

class PostgresDatabase {
  constructor() {
    // Delay database setup to ensure environment variables are loaded
    setTimeout(() => {
      this.setupDatabase();
    }, 100);
  }

  private async setupDatabase(): Promise<void> {
    try {
      console.log('Setting up database tables...');
      console.log('Environment check:', {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      });
      
      // Test database connection first
      await sql`SELECT 1 as test`;
      console.log('Database connection successful');
      
      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          full_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Users table created/verified');

      // Create bqc_data table
      await sql`
        CREATE TABLE IF NOT EXISTS bqc_data (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          ref_number VARCHAR(255) NOT NULL,
          group_name VARCHAR(255),
          subject TEXT,
          tender_description TEXT,
          pr_reference VARCHAR(255),
          tender_type VARCHAR(50),
          evaluation_methodology VARCHAR(50),
          cec_estimate_incl_gst DECIMAL(15,2),
          cec_date DATE,
          cec_estimate_excl_gst DECIMAL(15,2),
          lots TEXT,
          quantity_supplied DECIMAL(15,2),
          budget_details TEXT,
          tender_platform VARCHAR(50),
          scope_of_work TEXT,
          contract_period_months VARCHAR(255),
          contract_duration_years DECIMAL(5,2) DEFAULT 1,
          delivery_period VARCHAR(255),
          bid_validity_period VARCHAR(255),
          warranty_period VARCHAR(255),
          amc_period VARCHAR(255),
          payment_terms TEXT,
          manufacturer_types TEXT,
          supplying_capacity INTEGER,
          mse_relaxation BOOLEAN DEFAULT FALSE,
          similar_work_definition TEXT,
          annualized_value DECIMAL(15,2),
          escalation_clause TEXT,
          divisibility VARCHAR(50),
          performance_security TEXT,
          has_performance_security BOOLEAN DEFAULT FALSE,
          proposed_by VARCHAR(255),
          proposed_by_designation VARCHAR(255),
          recommended_by VARCHAR(255),
          recommended_by_designation VARCHAR(255),
          concurred_by VARCHAR(255),
          concurred_by_designation VARCHAR(255),
          approved_by VARCHAR(255),
          approved_by_designation VARCHAR(255),
          amc_value DECIMAL(15,2),
          has_amc BOOLEAN DEFAULT FALSE,
          correction_factor DECIMAL(10,4),
          o_m_value DECIMAL(15,2),
          o_m_period VARCHAR(255),
          has_om BOOLEAN DEFAULT FALSE,
          additional_details TEXT,
          note_to VARCHAR(255),
          commercial_evaluation_method TEXT,
          has_experience_explanatory_note BOOLEAN DEFAULT FALSE,
          experience_explanatory_note TEXT,
          has_additional_explanatory_note BOOLEAN DEFAULT FALSE,
          additional_explanatory_note TEXT,
          has_financial_explanatory_note BOOLEAN DEFAULT FALSE,
          financial_explanatory_note TEXT,
          has_emd_explanatory_note BOOLEAN DEFAULT FALSE,
          emd_explanatory_note TEXT,
          has_past_performance_explanatory_note BOOLEAN DEFAULT FALSE,
          past_performance_explanatory_note TEXT,
          past_performance_mse_relaxation BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `;
    } catch (error) {
      console.error('Database setup error:', error);
      console.error('Database error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      // Don't throw the error to prevent server startup failure
      // The database might be available later
    }
  }

  // User operations
  async createUser(userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }): Promise<number> {
    const { username, password, email, fullName } = userData;
    const result = await sql`
      INSERT INTO users (username, password, email, full_name) 
      VALUES (${username}, ${password}, ${email}, ${fullName}) 
      RETURNING id
    `;
    return result.rows[0].id;
  }

  async getUserByUsername(username: string): Promise<any> {
    try {
      const result = await sql`
        SELECT * FROM users WHERE username = ${username}
      `;
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<any> {
    const result = await sql`
      SELECT id, username, email, full_name, created_at 
      FROM users WHERE id = ${id}
    `;
    return result.rows[0];
  }

  // BQC data operations
  async saveBQCData(userId: number, bqcData: any): Promise<number> {
    // Check if record exists
    const existingRecord = await sql`
      SELECT id FROM bqc_data WHERE user_id = ${userId} AND ref_number = ${bqcData.refNumber}
    `;

    const manufacturerTypesJson = JSON.stringify(bqcData.manufacturerTypes || []);
    const commercialEvaluationMethodJson = JSON.stringify(bqcData.commercialEvaluationMethod || []);

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const result = await sql`
        UPDATE bqc_data SET
          group_name = ${bqcData.groupName},
          subject = ${bqcData.subject},
          tender_description = ${bqcData.tenderDescription},
          pr_reference = ${bqcData.prReference},
          tender_type = ${bqcData.tenderType},
          evaluation_methodology = ${bqcData.evaluationMethodology},
          cec_estimate_incl_gst = ${bqcData.cecEstimateInclGst},
          cec_date = ${bqcData.cecDate},
          cec_estimate_excl_gst = ${bqcData.cecEstimateExclGst},
          lots = ${JSON.stringify(bqcData.lots || [])},
          quantity_supplied = ${bqcData.quantitySupplied},
          budget_details = ${bqcData.budgetDetails},
          tender_platform = ${bqcData.tenderPlatform},
          scope_of_work = ${bqcData.scopeOfWork},
          contract_period_months = ${bqcData.contractPeriodMonths},
          contract_duration_years = ${bqcData.contractDurationYears},
          delivery_period = ${bqcData.deliveryPeriod},
          bid_validity_period = ${bqcData.bidValidityPeriod},
          warranty_period = ${bqcData.warrantyPeriod},
          amc_period = ${bqcData.amcPeriod},
          payment_terms = ${bqcData.paymentTerms},
          manufacturer_types = ${manufacturerTypesJson},
          supplying_capacity = ${bqcData.supplyingCapacity},
          mse_relaxation = ${bqcData.mseRelaxation || false},
          similar_work_definition = ${bqcData.similarWorkDefinition},
          annualized_value = ${bqcData.annualizedValue},
          escalation_clause = ${bqcData.escalationClause},
          divisibility = ${bqcData.divisibility},
          performance_security = ${bqcData.performanceSecurity},
          has_performance_security = ${bqcData.hasPerformanceSecurity || false},
          proposed_by = ${bqcData.proposedBy},
          proposed_by_designation = ${bqcData.proposedByDesignation},
          recommended_by = ${bqcData.recommendedBy},
          recommended_by_designation = ${bqcData.recommendedByDesignation},
          concurred_by = ${bqcData.concurredBy},
          concurred_by_designation = ${bqcData.concurredByDesignation},
          approved_by = ${bqcData.approvedBy},
          approved_by_designation = ${bqcData.approvedByDesignation},
          amc_value = ${bqcData.amcValue},
          has_amc = ${bqcData.hasAmc || false},
          correction_factor = ${bqcData.correctionFactor},
          o_m_value = ${bqcData.omValue || 0},
          o_m_period = ${bqcData.omPeriod || ''},
          has_om = ${bqcData.hasOm || false},
          additional_details = ${bqcData.additionalDetails},
          note_to = ${bqcData.noteTo},
          commercial_evaluation_method = ${commercialEvaluationMethodJson},
          has_experience_explanatory_note = ${bqcData.hasExperienceExplanatoryNote || false},
          experience_explanatory_note = ${bqcData.experienceExplanatoryNote || ''},
          has_additional_explanatory_note = ${bqcData.hasAdditionalExplanatoryNote || false},
          additional_explanatory_note = ${bqcData.additionalExplanatoryNote || ''},
          has_financial_explanatory_note = ${bqcData.hasFinancialExplanatoryNote || false},
          financial_explanatory_note = ${bqcData.financialExplanatoryNote || ''},
          has_emd_explanatory_note = ${bqcData.hasEMDExplanatoryNote || false},
          emd_explanatory_note = ${bqcData.emdExplanatoryNote || ''},
          has_past_performance_explanatory_note = ${bqcData.hasPastPerformanceExplanatoryNote || false},
          past_performance_explanatory_note = ${bqcData.pastPerformanceExplanatoryNote || ''},
          past_performance_mse_relaxation = ${bqcData.pastPerformanceMseRelaxation || false},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingRecord.rows[0].id}
        RETURNING id
      `;
      return result.rows[0].id;
    } else {
      // Insert new record
      const result = await sql`
        INSERT INTO bqc_data (
          user_id, ref_number, group_name, subject, tender_description, pr_reference,
          tender_type, evaluation_methodology, cec_estimate_incl_gst, cec_date, cec_estimate_excl_gst,
          lots, quantity_supplied, budget_details, tender_platform, scope_of_work, contract_period_months, contract_duration_years,
          delivery_period, bid_validity_period, warranty_period, amc_period, payment_terms,
          manufacturer_types, supplying_capacity, mse_relaxation,
          similar_work_definition, annualized_value, escalation_clause,
          divisibility, performance_security, has_performance_security, proposed_by, proposed_by_designation, recommended_by, recommended_by_designation,
          concurred_by, concurred_by_designation, approved_by, approved_by_designation, amc_value, has_amc, correction_factor,
          o_m_value, o_m_period, has_om, additional_details, note_to, commercial_evaluation_method,
          has_experience_explanatory_note, experience_explanatory_note, has_additional_explanatory_note, additional_explanatory_note,
          has_financial_explanatory_note, financial_explanatory_note, has_emd_explanatory_note, emd_explanatory_note,
          has_past_performance_explanatory_note, past_performance_explanatory_note, past_performance_mse_relaxation
        ) VALUES (
          ${userId}, ${bqcData.refNumber}, ${bqcData.groupName}, ${bqcData.subject}, ${bqcData.tenderDescription},
          ${bqcData.prReference}, ${bqcData.tenderType}, ${bqcData.evaluationMethodology}, ${bqcData.cecEstimateInclGst},
          ${bqcData.cecDate}, ${bqcData.cecEstimateExclGst}, ${JSON.stringify(bqcData.lots || [])}, ${bqcData.quantitySupplied}, ${bqcData.budgetDetails},
          ${bqcData.tenderPlatform}, ${bqcData.scopeOfWork}, ${bqcData.contractPeriodMonths}, ${bqcData.contractDurationYears},
          ${bqcData.deliveryPeriod}, ${bqcData.bidValidityPeriod}, ${bqcData.warrantyPeriod}, ${bqcData.amcPeriod},
          ${bqcData.paymentTerms}, ${manufacturerTypesJson}, ${bqcData.supplyingCapacity},
          ${bqcData.mseRelaxation || false}, ${bqcData.similarWorkDefinition},
          ${bqcData.annualizedValue}, ${bqcData.escalationClause}, ${bqcData.divisibility},
          ${bqcData.performanceSecurity}, ${bqcData.hasPerformanceSecurity || false}, ${bqcData.proposedBy}, ${bqcData.proposedByDesignation}, ${bqcData.recommendedBy}, ${bqcData.recommendedByDesignation},
          ${bqcData.concurredBy}, ${bqcData.concurredByDesignation}, ${bqcData.approvedBy}, ${bqcData.approvedByDesignation}, ${bqcData.amcValue},
          ${bqcData.hasAmc || false}, ${bqcData.correctionFactor}, ${bqcData.omValue || 0},
          ${bqcData.omPeriod || ''}, ${bqcData.hasOm || false}, ${bqcData.additionalDetails}, ${bqcData.noteTo}, ${commercialEvaluationMethodJson},
          ${bqcData.hasExperienceExplanatoryNote || false}, ${bqcData.experienceExplanatoryNote || ''},
          ${bqcData.hasAdditionalExplanatoryNote || false}, ${bqcData.additionalExplanatoryNote || ''},
          ${bqcData.hasFinancialExplanatoryNote || false}, ${bqcData.financialExplanatoryNote || ''},
          ${bqcData.hasEMDExplanatoryNote || false}, ${bqcData.emdExplanatoryNote || ''},
          ${bqcData.hasPastPerformanceExplanatoryNote || false}, ${bqcData.pastPerformanceExplanatoryNote || ''},
          ${bqcData.pastPerformanceMseRelaxation || false}
        ) RETURNING id
      `;
      return result.rows[0].id;
    }
  }

  async getBQCData(userId: number, id: number): Promise<any> {
    const result = await sql`
      SELECT * FROM bqc_data WHERE id = ${id} AND user_id = ${userId}
    `;
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Parse manufacturer types
      try {
        row.manufacturer_types = JSON.parse(row.manufacturer_types || '[]');
      } catch {
        row.manufacturer_types = [];
      }
      
      // Parse commercial evaluation method
      try {
        row.commercial_evaluation_method = JSON.parse(row.commercial_evaluation_method || '[]');
      } catch {
        row.commercial_evaluation_method = [];
      }
      
      return row;
    }
    return null;
  }

  async listBQCData(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT id, ref_number, tender_description, created_at 
      FROM bqc_data 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    return result.rows;
  }

  async deleteBQCData(userId: number, id: number): Promise<void> {
    await sql`
      DELETE FROM bqc_data WHERE id = ${id} AND user_id = ${userId}
    `;
  }

  // Admin statistics methods
  async getBQCStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<any> {
    // For now, return basic stats without filtering
    // You can implement filtering later if needed
    const result = await sql`
      SELECT 
        COUNT(*) as "totalBQCs",
        COUNT(DISTINCT user_id) as "totalUsers",
        SUM(cec_estimate_incl_gst) as "totalValue",
        AVG(cec_estimate_incl_gst) as "avgValue",
        COUNT(CASE WHEN tender_type = 'Goods' THEN 1 END) as "goodsCount",
        COUNT(CASE WHEN tender_type = 'Service' THEN 1 END) as "serviceCount",
        COUNT(CASE WHEN tender_type = 'Works' THEN 1 END) as "worksCount",
        COUNT(CASE WHEN evaluation_methodology = 'least cash outflow' THEN 1 END) as "leastCashOutflowCount",
        COUNT(CASE WHEN evaluation_methodology = 'Lot-wise' THEN 1 END) as "lotWiseCount"
      FROM bqc_data
    `;
    
    return result.rows[0];
  }

  async getBQCGroupStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<any[]> {
    // For now, return basic group stats without filtering
    const result = await sql`
      SELECT 
        group_name,
        COUNT(*) as count,
        SUM(cec_estimate_incl_gst) as "totalValue",
        AVG(cec_estimate_incl_gst) as "avgValue",
        COUNT(CASE WHEN tender_type = 'Goods' THEN 1 END) as "goodsCount",
        COUNT(CASE WHEN tender_type = 'Service' THEN 1 END) as "serviceCount",
        COUNT(CASE WHEN tender_type = 'Works' THEN 1 END) as "worksCount"
      FROM bqc_data
      GROUP BY group_name 
      ORDER BY count DESC
    `;
    
    return result.rows;
  }

  async getBQCDateRangeStats(filters: {
    startDate?: string;
    endDate?: string;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<any[]> {
    // For now, return basic date range stats without filtering
    const result = await sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as period,
        COUNT(*) as count,
        SUM(cec_estimate_incl_gst) as "totalValue"
      FROM bqc_data
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY period
    `;
    
    return result.rows;
  }

  async getBQCEntries(filters: {
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    groupName?: string;
    tenderType?: string;
    search?: string;
  }): Promise<{ entries: any[]; total: number; totalPages: number }> {
    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM bqc_data b
    `;

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;

    // Get paginated entries
    const entriesResult = await sql`
      SELECT 
        b.id,
        b.ref_number,
        b.group_name,
        b.subject,
        b.tender_description,
        b.tender_type,
        b.cec_estimate_incl_gst,
        b.created_at,
        u.username,
        u.full_name
      FROM bqc_data b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT ${filters.limit} OFFSET ${offset}
    `;

    return {
      entries: entriesResult.rows,
      total,
      totalPages
    };
  }

  async getUserStats(): Promise<any> {
    const result = await sql`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as newUsersLast30Days,
        COUNT(CASE WHEN DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as newUsersLast7Days
      FROM users
    `;
    return result.rows[0];
  }

  async getTenderTypeStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<any[]> {
    const result = await sql`
      SELECT 
        tender_type,
        COUNT(*) as count,
        SUM(cec_estimate_incl_gst) as "totalValue",
        AVG(cec_estimate_incl_gst) as "avgValue"
      FROM bqc_data
      GROUP BY tender_type 
      ORDER BY count DESC
    `;
    
    return result.rows;
  }

  async getFinancialStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<any> {
    const result = await sql`
      SELECT 
        SUM(cec_estimate_incl_gst) as "totalValue",
        AVG(cec_estimate_incl_gst) as "avgValue",
        MIN(cec_estimate_incl_gst) as "minValue",
        MAX(cec_estimate_incl_gst) as "maxValue",
        COUNT(CASE WHEN cec_estimate_incl_gst < 100000 THEN 1 END) as "under1Lakh",
        COUNT(CASE WHEN cec_estimate_incl_gst >= 100000 AND cec_estimate_incl_gst < 1000000 THEN 1 END) as "between1LakhAnd10Lakh",
        COUNT(CASE WHEN cec_estimate_incl_gst >= 1000000 AND cec_estimate_incl_gst < 10000000 THEN 1 END) as "between10LakhAnd1Crore",
        COUNT(CASE WHEN cec_estimate_incl_gst >= 10000000 THEN 1 END) as "above1Crore"
      FROM bqc_data
    `;
    
    return result.rows[0];
  }

  async exportBQCData(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
    format: 'csv' | 'excel';
  }): Promise<string> {
    const result = await sql`
      SELECT 
        b.id,
        b.ref_number,
        b.group_name,
        b.subject,
        b.tender_description,
        b.tender_type,
        b.evaluation_methodology,
        b.cec_estimate_incl_gst,
        b.cec_estimate_excl_gst,
        b.created_at,
        u.username,
        u.full_name
      FROM bqc_data b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `;

    const rows = result.rows;
    
    if (filters.format === 'csv') {
      // Convert to CSV
      const csvHeader = 'ID,Ref Number,Group,Subject,Tender Description,Tender Type,Evaluation Methodology,CEC (Incl GST),CEC (Excl GST),Created At,Username,Full Name\n';
      const csvRows = rows.map(row => 
        `${row.id},"${row.ref_number}","${row.group_name}","${row.subject}","${row.tender_description}","${row.tender_type}","${row.evaluation_methodology}",${row.cec_estimate_incl_gst},${row.cec_estimate_excl_gst},"${row.created_at}","${row.username}","${row.full_name}"`
      ).join('\n');
      return csvHeader + csvRows;
    } else {
      // For Excel, we'll return CSV for now (you can implement proper Excel export later)
      const csvHeader = 'ID,Ref Number,Group,Subject,Tender Description,Tender Type,Evaluation Methodology,CEC (Incl GST),CEC (Excl GST),Created At,Username,Full Name\n';
      const csvRows = rows.map(row => 
        `${row.id},"${row.ref_number}","${row.group_name}","${row.subject}","${row.tender_description}","${row.tender_type}","${row.evaluation_methodology}",${row.cec_estimate_incl_gst},${row.cec_estimate_excl_gst},"${row.created_at}","${row.username}","${row.full_name}"`
      ).join('\n');
      return csvHeader + csvRows;
    }
  }
}

export const postgresDatabase = new PostgresDatabase();
