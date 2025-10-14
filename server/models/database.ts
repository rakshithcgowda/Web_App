import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Get application data directory for portable database storage
function getAppDataDir(): string {
  let appData: string;
  
  if (process.platform === 'win32') {
    appData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
  } else if (process.platform === 'darwin') {
    appData = path.join(process.env.HOME || '', 'Library', 'Application Support');
  } else {
    appData = process.env.XDG_DATA_HOME || path.join(process.env.HOME || '', '.local', 'share');
  }
  
  const appDir = path.join(appData, 'BQCGenerator');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  
  return appDir;
}

const APP_DATA_DIR = getAppDataDir();
const DB_PATH = path.join(APP_DATA_DIR, 'user_data.db');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.setupDatabase();
  }

  private setupDatabase(): void {
    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        full_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bqc_data table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bqc_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        ref_number TEXT NOT NULL,
        group_name TEXT,
        subject TEXT,
        tender_description TEXT,
        pr_reference TEXT,
        tender_type TEXT,
        evaluation_methodology TEXT,
        cec_estimate_incl_gst REAL,
        cec_date DATE,
        cec_estimate_excl_gst REAL,
        lots TEXT,
        quantity_supplied REAL,
        budget_details TEXT,
        tender_platform TEXT,
        scope_of_work TEXT,
        contract_period_months TEXT,
        contract_duration_years REAL,
        delivery_period TEXT,
        bid_validity_period TEXT,
        warranty_period TEXT,
        amc_period TEXT,
        payment_terms TEXT,
        manufacturer_types TEXT,
        supplying_capacity INTEGER,
        mse_relaxation INTEGER,
        similar_work_definition TEXT,
        annualized_value REAL,
        escalation_clause TEXT,
        divisibility TEXT,
        performance_security INTEGER,
        has_performance_security INTEGER,
        proposed_by TEXT,
        proposed_by_designation TEXT,
        recommended_by TEXT,
        recommended_by_designation TEXT,
        concurred_by TEXT,
        concurred_by_designation TEXT,
        approved_by TEXT,
        approved_by_designation TEXT,
        amc_value REAL,
        has_amc INTEGER,
        correction_factor REAL,
        o_m_value REAL,
        o_m_period TEXT,
        has_om INTEGER,
        additional_details TEXT,
        note_to TEXT,
        commercial_evaluation_method TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Add migration for contract_duration_years column if it doesn't exist
    this.db.run(`
      ALTER TABLE bqc_data ADD COLUMN contract_duration_years REAL DEFAULT 1
    `, (err) => {
      // Ignore error if column already exists
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding contract_duration_years column:', err);
      }
    });

    // Add migration for bid_validity_period column if it doesn't exist
    this.db.run(`
      ALTER TABLE bqc_data ADD COLUMN bid_validity_period TEXT
    `, (err) => {
      // Ignore error if column already exists
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding bid_validity_period column:', err);
      }
    });
  }

  // User operations
  async createUser(userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }): Promise<number> {
    return new Promise((resolve, reject) => {
      const { username, password, email, fullName } = userData;
      this.db.run(
        'INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)',
        [username, password, email, fullName],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getUserByUsername(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async getUserById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // BQC data operations
  async saveBQCData(userId: number, bqcData: any): Promise<number> {
    return new Promise((resolve, reject) => {
      // Check if record exists
      this.db.get(
        'SELECT id FROM bqc_data WHERE user_id = ? AND ref_number = ?',
        [userId, bqcData.refNumber],
        (err, existingRecord: any) => {
          if (err) {
            reject(err);
            return;
          }

          const manufacturerTypesJson = JSON.stringify(bqcData.manufacturerTypes || []);
          const commercialEvaluationMethodJson = JSON.stringify(bqcData.commercialEvaluationMethod || []);
          
          if (existingRecord) {
            // Update existing record
            this.db.run(`
              UPDATE bqc_data SET
                group_name = ?, subject = ?, tender_description = ?, pr_reference = ?,
                tender_type = ?, evaluation_methodology = ?, cec_estimate_incl_gst = ?, cec_date = ?,
                cec_estimate_excl_gst = ?, lots = ?, quantity_supplied = ?, budget_details = ?, tender_platform = ?,
                scope_of_work = ?, contract_period_months = ?, contract_duration_years = ?, delivery_period = ?, bid_validity_period = ?,
                warranty_period = ?, amc_period = ?, payment_terms = ?,
                manufacturer_types = ?, supplying_capacity = ?, mse_relaxation = ?,
                similar_work_definition = ?, annualized_value = ?, escalation_clause = ?,
                divisibility = ?, performance_security = ?, has_performance_security = ?, proposed_by = ?, proposed_by_designation = ?,
                recommended_by = ?, recommended_by_designation = ?, concurred_by = ?, concurred_by_designation = ?, approved_by = ?, approved_by_designation = ?,
                amc_value = ?, has_amc = ?, correction_factor = ?,
                o_m_value = ?, o_m_period = ?, has_om = ?, additional_details = ?, note_to = ?, commercial_evaluation_method = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [
              bqcData.groupName, bqcData.subject, bqcData.tenderDescription, bqcData.prReference,
              bqcData.tenderType, bqcData.evaluationMethodology, bqcData.cecEstimateInclGst, bqcData.cecDate,
              bqcData.cecEstimateExclGst, JSON.stringify(bqcData.lots || []), bqcData.quantitySupplied, bqcData.budgetDetails, bqcData.tenderPlatform,
              bqcData.scopeOfWork, bqcData.contractPeriodMonths, bqcData.contractDurationYears, bqcData.deliveryPeriod, bqcData.bidValidityPeriod,
              bqcData.warrantyPeriod, bqcData.amcPeriod, bqcData.paymentTerms,
              manufacturerTypesJson, bqcData.supplyingCapacity, bqcData.mseRelaxation ? 1 : 0,
              bqcData.similarWorkDefinition, bqcData.annualizedValue, bqcData.escalationClause,
              bqcData.divisibility, bqcData.performanceSecurity, bqcData.hasPerformanceSecurity ? 1 : 0, bqcData.proposedBy, bqcData.proposedByDesignation,
              bqcData.recommendedBy, bqcData.recommendedByDesignation, bqcData.concurredBy, bqcData.concurredByDesignation, bqcData.approvedBy, bqcData.approvedByDesignation,
              bqcData.amcValue, bqcData.hasAmc ? 1 : 0, bqcData.correctionFactor,
              bqcData.omValue || 0, bqcData.omPeriod || '', bqcData.hasOm ? 1 : 0,
              bqcData.additionalDetails, bqcData.noteTo, commercialEvaluationMethodJson, existingRecord.id
            ], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(existingRecord.id);
              }
            });
          } else {
            // Insert new record
            this.db.run(`
              INSERT INTO bqc_data (
                user_id, ref_number, group_name, subject, tender_description, pr_reference,
                tender_type, evaluation_methodology, cec_estimate_incl_gst, cec_date, cec_estimate_excl_gst,
                lots, quantity_supplied, budget_details, tender_platform,                 scope_of_work, contract_period_months, contract_duration_years,
                delivery_period, bid_validity_period, warranty_period, amc_period, payment_terms,
                manufacturer_types, supplying_capacity, mse_relaxation,
                similar_work_definition, annualized_value, escalation_clause,
                divisibility, performance_security, has_performance_security, proposed_by, proposed_by_designation, recommended_by, recommended_by_designation,
                concurred_by, concurred_by_designation, approved_by, approved_by_designation, amc_value, has_amc, correction_factor,
                o_m_value, o_m_period, has_om, additional_details, note_to, commercial_evaluation_method
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              userId, bqcData.refNumber, bqcData.groupName, bqcData.subject, bqcData.tenderDescription,
              bqcData.prReference, bqcData.tenderType, bqcData.evaluationMethodology, bqcData.cecEstimateInclGst,
              bqcData.cecDate, bqcData.cecEstimateExclGst, JSON.stringify(bqcData.lots || []), bqcData.quantitySupplied, bqcData.budgetDetails,
              bqcData.tenderPlatform, bqcData.scopeOfWork, bqcData.contractPeriodMonths, bqcData.contractDurationYears,
              bqcData.deliveryPeriod, bqcData.bidValidityPeriod, bqcData.warrantyPeriod, bqcData.amcPeriod,
              bqcData.paymentTerms, manufacturerTypesJson, bqcData.supplyingCapacity,
              bqcData.mseRelaxation ? 1 : 0, bqcData.similarWorkDefinition,
              bqcData.annualizedValue, bqcData.escalationClause, bqcData.divisibility,
              bqcData.performanceSecurity, bqcData.hasPerformanceSecurity ? 1 : 0, bqcData.proposedBy, bqcData.proposedByDesignation, bqcData.recommendedBy, bqcData.recommendedByDesignation,
              bqcData.concurredBy, bqcData.concurredByDesignation, bqcData.approvedBy, bqcData.approvedByDesignation, bqcData.amcValue,
              bqcData.hasAmc ? 1 : 0, bqcData.correctionFactor, bqcData.omValue || 0,
              bqcData.omPeriod || '', bqcData.hasOm ? 1 : 0, bqcData.additionalDetails, bqcData.noteTo, commercialEvaluationMethodJson
            ], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID);
              }
            });
          }
        }
      );
    });
  }

  async getBQCData(userId: number, id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM bqc_data WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
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
            }
            resolve(row);
          }
        }
      );
    });
  }

  async listBQCData(userId: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, ref_number, tender_description, created_at FROM bqc_data WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async deleteBQCData(userId: number, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM bqc_data WHERE id = ? AND user_id = ?',
        [id, userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}

export const database = new Database();
