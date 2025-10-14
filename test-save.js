// Simple test script to verify database save functionality
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database connection and save
const testDatabase = () => {
  const dbPath = path.join(__dirname, 'server', 'test.db');
  const db = new sqlite3.Database(dbPath);

  // Create test table
  db.run(`
    CREATE TABLE IF NOT EXISTS test_bqc_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ref_number TEXT NOT NULL,
      group_name TEXT,
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    console.log('Test table created successfully');

    // Test insert
    const testData = {
      refNumber: 'TEST-001',
      groupName: 'Test Group',
      tenderDescription: 'Test Tender',
      prReference: 'PR-001',
      tenderType: 'Goods',
      evaluationMethodology: 'LCS',
      cecEstimateInclGst: 100,
      cecDate: '2024-01-01',
      cecEstimateExclGst: 90,
      lots: JSON.stringify([]),
      quantitySupplied: 10,
      budgetDetails: 'Test Budget',
      tenderPlatform: 'GeM',
      scopeOfWork: 'Test Scope',
      contractPeriodMonths: 12,
      deliveryPeriod: '30 days',
      warrantyPeriod: '1 year',
      amcPeriod: '',
      paymentTerms: '30 days',
      manufacturerTypes: JSON.stringify(['Original Equipment Manufacturer']),
      supplyingCapacity: 100,
      mseRelaxation: false,
      similarWorkDefinition: '',
      annualizedValue: 100,
      escalationClause: '',
      divisibility: 'Non-Divisible',
      performanceSecurity: 5,
      proposedBy: 'Test User',
      recommendedBy: 'Test User',
      concurredBy: 'Test User',
      approvedBy: 'Test User',
      amcValue: 0,
      hasAmc: false,
      correctionFactor: 0,
      omValue: 0,
      omPeriod: '',
      hasOm: false,
      additionalDetails: ''
    };

    db.run(`
      INSERT INTO test_bqc_data (
        user_id, ref_number, group_name, tender_description, pr_reference,
        tender_type, evaluation_methodology, cec_estimate_incl_gst, cec_date, cec_estimate_excl_gst,
        lots, quantity_supplied, budget_details, tender_platform, scope_of_work, contract_period_years,
        delivery_period, warranty_period, amc_period, payment_terms,
        manufacturer_types, supplying_capacity, mse_relaxation,
        similar_work_definition, annualized_value, escalation_clause,
        divisibility, performance_security, proposed_by, recommended_by,
        concurred_by, approved_by, amc_value, has_amc, correction_factor,
        o_m_value, o_m_period, has_om, additional_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1, testData.refNumber, testData.groupName, testData.tenderDescription,
      testData.prReference, testData.tenderType, testData.evaluationMethodology, testData.cecEstimateInclGst,
      testData.cecDate, testData.cecEstimateExclGst, testData.lots, testData.quantitySupplied, testData.budgetDetails,
      testData.tenderPlatform, testData.scopeOfWork, testData.contractPeriodMonths,
      testData.deliveryPeriod, testData.warrantyPeriod, testData.amcPeriod,
      testData.paymentTerms, testData.manufacturerTypes, testData.supplyingCapacity,
      testData.mseRelaxation ? 1 : 0, testData.similarWorkDefinition,
      testData.annualizedValue, testData.escalationClause, testData.divisibility,
      testData.performanceSecurity, testData.proposedBy, testData.recommendedBy,
      testData.concurredBy, testData.approvedBy, testData.amcValue,
      testData.hasAmc ? 1 : 0, testData.correctionFactor, testData.omValue,
      testData.omPeriod, testData.hasOm ? 1 : 0, testData.additionalDetails
    ], function(err) {
      if (err) {
        console.error('Error inserting test data:', err);
      } else {
        console.log('Test data inserted successfully with ID:', this.lastID);
      }
      db.close();
    });
  });
};

testDatabase();
