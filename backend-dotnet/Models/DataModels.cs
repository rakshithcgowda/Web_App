using System;
using System.Collections.Generic;

namespace BqcApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Store hashed password
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = true;
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class LotData
    {
        public string Id { get; set; } = string.Empty;
        public string LotNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double CecEstimateInclGst { get; set; }
        public double CecEstimateExclGst { get; set; }
        public int ContractPeriodMonths { get; set; }
        public string ContractPeriodText { get; set; } = string.Empty;
        public double? QuantitySupplied { get; set; }
        public bool? MseRelaxation { get; set; }
        public bool? HasAmc { get; set; }
        public double? AmcValue { get; set; }
        public string AmcPeriod { get; set; } = string.Empty;
        public double? SimilarWorksOptionA { get; set; }
        public double? SimilarWorksOptionB { get; set; }
        public double? SimilarWorksOptionC { get; set; }
    }

    public class SupplyingCapacity
    {
        public double Calculated { get; set; }
        public double Final { get; set; }
        public double? MseAdjusted { get; set; }
    }

    public class BQCData
    {
        public int? Id { get; set; }
        public int? UserId { get; set; }
        public string RefNumber { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string TenderDescription { get; set; } = string.Empty;
        public string PrReference { get; set; } = string.Empty;
        public string TenderType { get; set; } = string.Empty; // Goods, Service, Works
        public string EvaluationMethodology { get; set; } = string.Empty; // least cash outflow, Lot-wise
        public double CecEstimateInclGst { get; set; }
        public string CecDate { get; set; } = string.Empty;
        public double CecEstimateExclGst { get; set; }
        public string BudgetDetails { get; set; } = string.Empty;
        public string TenderPlatform { get; set; } = string.Empty; // GeM, E-procurement
        public List<LotData> Lots { get; set; } = new List<LotData>();
        public string ScopeOfWork { get; set; } = string.Empty;
        public string ContractPeriodMonths { get; set; } = string.Empty;
        public string ContractPeriodText { get; set; } = string.Empty;
        public double ContractDurationYears { get; set; } = 1;
        public string DeliveryPeriod { get; set; } = string.Empty;
        public string BidValidityPeriod { get; set; } = string.Empty;
        public string WarrantyPeriod { get; set; } = string.Empty;
        public string AmcPeriod { get; set; } = string.Empty;
        public string PaymentTerms { get; set; } = string.Empty;
        public List<string> ManufacturerTypes { get; set; } = new List<string>();
        public SupplyingCapacity SupplyingCapacity { get; set; } = new SupplyingCapacity();
        public bool MseRelaxation { get; set; }
        public string SimilarWorkDefinition { get; set; } = string.Empty;
        public double AnnualizedValue { get; set; }
        public string EscalationClause { get; set; } = string.Empty;
        public string Divisibility { get; set; } = string.Empty; // Divisible, Non-Divisible
        public string PerformanceSecurity { get; set; } = string.Empty;
        public bool HasPerformanceSecurity { get; set; }
        public string ProposedBy { get; set; } = string.Empty;
        public string ProposedByDesignation { get; set; } = string.Empty;
        public string RecommendedBy { get; set; } = string.Empty;
        public string RecommendedByDesignation { get; set; } = string.Empty;
        public string ConcurredBy { get; set; } = string.Empty;
        public string ConcurredByDesignation { get; set; } = string.Empty;
        public string ApprovedBy { get; set; } = string.Empty;
        public string ApprovedByDesignation { get; set; } = string.Empty;
        public double AmcValue { get; set; }
        public bool HasAmc { get; set; }
        public double CorrectionFactor { get; set; }
        public double OmValue { get; set; }
        public string OmPeriod { get; set; } = string.Empty;
        public bool HasOm { get; set; }
        public string AdditionalDetails { get; set; } = string.Empty;
        public double? QuantitySupplied { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string NoteTo { get; set; } = string.Empty;
        public List<string> CommercialEvaluationMethod { get; set; } = new List<string>();
        public bool? HasExperienceExplanatoryNote { get; set; }
        public string ExperienceExplanatoryNote { get; set; } = string.Empty;
        public bool? HasAdditionalExplanatoryNote { get; set; }
        public string AdditionalExplanatoryNote { get; set; } = string.Empty;
        public bool? HasFinancialExplanatoryNote { get; set; }
        public string FinancialExplanatoryNote { get; set; } = string.Empty;
        public bool? HasEMDExplanatoryNote { get; set; }
        public string EmdExplanatoryNote { get; set; } = string.Empty;
        public bool? HasPastPerformanceExplanatoryNote { get; set; }
        public string PastPerformanceExplanatoryNote { get; set; } = string.Empty;
        public bool? PastPerformanceMseRelaxation { get; set; }
        // Flags to control display of Non-MSE / MSE calculated columns (optional)
        public bool? ShowNonMseCalculations { get; set; }
        public bool? ShowMseCalculations { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
