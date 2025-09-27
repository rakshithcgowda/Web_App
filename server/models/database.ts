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
        item_name TEXT,
        project_name TEXT,
        tender_description TEXT,
        pr_reference TEXT,
        tender_type TEXT,
        cec_estimate_incl_gst REAL,
        cec_date DATE,
        cec_estimate_excl_gst REAL,
        budget_details TEXT,
        tender_platform TEXT,
        scope_of_work TEXT,
        contract_period_years REAL,
        delivery_period TEXT,
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
        proposed_by TEXT,
        recommended_by TEXT,
        concurred_by TEXT,
        approved_by TEXT,
        amc_value REAL,
        has_amc INTEGER,
        correction_factor REAL,
        o_m_value REAL,
        o_m_period TEXT,
        has_om INTEGER,
        additional_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
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
        (err, existingRecord) => {
          if (err) {
            reject(err);
            return;
          }

          const manufacturerTypesJson = JSON.stringify(bqcData.manufacturerTypes || []);
          
          if (existingRecord) {
            // Update existing record
            this.db.run(`
              UPDATE bqc_data SET
                group_name = ?, tender_description = ?, pr_reference = ?,
                tender_type = ?, cec_estimate_incl_gst = ?, cec_date = ?,
                cec_estimate_excl_gst = ?, budget_details = ?, tender_platform = ?,
                scope_of_work = ?, contract_period_years = ?, delivery_period = ?,
                warranty_period = ?, amc_period = ?, payment_terms = ?,
                manufacturer_types = ?, supplying_capacity = ?, mse_relaxation = ?,
                similar_work_definition = ?, annualized_value = ?, escalation_clause = ?,
                divisibility = ?, performance_security = ?, proposed_by = ?,
                recommended_by = ?, concurred_by = ?, approved_by = ?,
                amc_value = ?, has_amc = ?, correction_factor = ?,
                additional_details = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [
              bqcData.groupName, bqcData.tenderDescription, bqcData.prReference,
              bqcData.tenderType, bqcData.cecEstimateInclGst, bqcData.cecDate,
              bqcData.cecEstimateExclGst, bqcData.budgetDetails, bqcData.tenderPlatform,
              bqcData.scopeOfWork, bqcData.contractPeriodYears, bqcData.deliveryPeriod,
              bqcData.warrantyPeriod, bqcData.amcPeriod, bqcData.paymentTerms,
              manufacturerTypesJson, bqcData.supplyingCapacity, bqcData.mseRelaxation ? 1 : 0,
              bqcData.similarWorkDefinition, bqcData.annualizedValue, bqcData.escalationClause,
              bqcData.divisibility, bqcData.performanceSecurity, bqcData.proposedBy,
              bqcData.recommendedBy, bqcData.concurredBy, bqcData.approvedBy,
              bqcData.amcValue, bqcData.hasAmc ? 1 : 0, bqcData.correctionFactor,
              bqcData.additionalDetails, existingRecord.id
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
                user_id, ref_number, group_name, tender_description, pr_reference,
                tender_type, cec_estimate_incl_gst, cec_date, cec_estimate_excl_gst,
                budget_details, tender_platform, scope_of_work, contract_period_years,
                delivery_period, warranty_period, amc_period, payment_terms,
                manufacturer_types, supplying_capacity, mse_relaxation,
                similar_work_definition, annualized_value, escalation_clause,
                divisibility, performance_security, proposed_by, recommended_by,
                concurred_by, approved_by, amc_value, has_amc, correction_factor,
                additional_details
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              userId, bqcData.refNumber, bqcData.groupName, bqcData.tenderDescription,
              bqcData.prReference, bqcData.tenderType, bqcData.cecEstimateInclGst,
              bqcData.cecDate, bqcData.cecEstimateExclGst, bqcData.budgetDetails,
              bqcData.tenderPlatform, bqcData.scopeOfWork, bqcData.contractPeriodYears,
              bqcData.deliveryPeriod, bqcData.warrantyPeriod, bqcData.amcPeriod,
              bqcData.paymentTerms, manufacturerTypesJson, bqcData.supplyingCapacity,
              bqcData.mseRelaxation ? 1 : 0, bqcData.similarWorkDefinition,
              bqcData.annualizedValue, bqcData.escalationClause, bqcData.divisibility,
              bqcData.performanceSecurity, bqcData.proposedBy, bqcData.recommendedBy,
              bqcData.concurredBy, bqcData.approvedBy, bqcData.amcValue,
              bqcData.hasAmc ? 1 : 0, bqcData.correctionFactor, bqcData.additionalDetails
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
        (err, row) => {
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
