using System.IO;
using System.Globalization;
using BqcApi.Models;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace BqcApi.Services
{
    public interface IDocxService
    {
        Task<byte[]> GenerateBqcDocxAsync(BQCData data);
    }

    public class OpenXmlDocxService : IDocxService
    {
        private const string DefaultFont = "Arial";
        private const int DefaultFontSize = 24; // 12pt = 24 half-points

        public async Task<byte[]> GenerateBqcDocxAsync(BQCData data)
        {
            using (var mem = new MemoryStream())
            {
                using (var wordDocument = WordprocessingDocument.Create(mem, WordprocessingDocumentType.Document))
                {
                    MainDocumentPart mainPart = wordDocument.AddMainDocumentPart();
                    mainPart.Document = new Document();
                    Body body = mainPart.Document.AppendChild(new Body());

                    // Section numbering logic (compute sequentially like the Express generator)
                    int currentSection = 3;
                    int bqcSection = currentSection; currentSection += 1;
                    int evaluationSection = currentSection; currentSection += 1;
                    int emdSection = currentSection; currentSection += 1;
                    int performanceSecuritySection = currentSection;
                    if (data.HasPerformanceSecurity)
                    {
                        performanceSecuritySection = currentSection; currentSection += 1;
                    }

                    AddHeaderTable(body, data);
                    AddNoteToTable(body, data);
                    AddSubjectTable(body, data);
                    AddSpacing(body);
                    AddPara(body, "1. PREAMBLE", true);
                    AddPreambleTable(body, data);
                    AddSpacing(body);
                    AddScopeOfWorkTable(body, data);
                    AddSpacing(body);

                    AddTechnicalCriteriaSection(body, data, bqcSection);
                    AddSpacing(body);
                    AddAdditionalDetailsSection(body, data);
                    AddFinancialCriteriaSection(body, data, bqcSection);
                    AddSpacing(body);
                    AddEvaluationMethodologySection(body, data, evaluationSection);
                    AddSpacing(body);
                    AddEMDSection(body, data, emdSection);
                    AddSpacing(body);
                    AddPerformanceSecuritySection(body, data, performanceSecuritySection);
                    AddSpacing(body);
                    AddApprovalSection(body, data, bqcSection, evaluationSection, emdSection, performanceSecuritySection);
                    
                    mainPart.Document.Save();
                }
                return mem.ToArray();
            }
        }

        private void AddSpacing(Body body, int lines = 1)
        {
            for (int i = 0; i < lines; i++)
            {
                body.AppendChild(new Paragraph(new Run(new Text(""))));
            }
        }

        #region Helper Methods (Formatting & Calculations)

        private string FormatIndianCurrency(double amount)
        {
            // Convert Crores to actual amount (1 Crore = 10,000,000) and format with Indian grouping
            double actualAmount = amount * 10000000; // amount is in Crores
            var formattedAmount = actualAmount.ToString("N0", new CultureInfo("en-IN"));
            return $"₹ {formattedAmount}";
        }

        private string FormatDate(DateTime date)
        {
            return date.ToString("dd/MM/yyyy");
        }

        private string FormatExperienceCurrency(double amount)
        {
            // Expecting `amount` in Crores; display as "Rs. X Crore" rounded to 2 decimals (matching Express)
            double rounded = Math.Round(amount * 100) / 100; // two decimal precision
            return $"Rs. {rounded} Crore";
        }

        private string FormatTurnoverAmount(double amount)
        {
            // Express displays turnover in Crores: round to 2 decimals and show 'Crore'
            double rounded = Math.Round(amount * 100) / 100;
            return $"Rs. {rounded} Crore";
        }

        private string FormatPastPerformanceUnits(double quantity)
        {
            return quantity.ToString("N0");
        }

        private double CalculateEMD(double estimatedValueInCr, string tenderType)
        {
            double valueInLakhs = estimatedValueInCr * 100;

            if (tenderType == "Goods")
            {
                if (valueInLakhs >= 50 && valueInLakhs <= 100) return 0;
                if (valueInLakhs > 100 && valueInLakhs <= 500) return 2.5;
                if (valueInLakhs > 500 && valueInLakhs <= 1000) return 5;
                if (valueInLakhs > 1000 && valueInLakhs <= 1500) return 7.5;
                if (valueInLakhs > 1500 && valueInLakhs <= 2500) return 10;
                if (valueInLakhs > 2500) return 20;
            }
            else if (tenderType == "Service" || tenderType == "Works")
            {
                if (valueInLakhs >= 50 && valueInLakhs <= 100) return 1;
                if (valueInLakhs > 100 && valueInLakhs <= 500) return 2.5;
                if (valueInLakhs > 500 && valueInLakhs <= 1000) return 5;
                if (valueInLakhs > 1000 && valueInLakhs <= 1500) return 7.5;
                if (valueInLakhs > 1500 && valueInLakhs <= 2500) return 10;
                if (valueInLakhs > 2500) return 20;
            }

            return 0;
        }

        private double CalculateTurnover(BQCData data)
        {
            double basePercentage = 0.3;
            if (data.Divisibility == "Divisible")
            {
                basePercentage = 0.3 * (1 + data.CorrectionFactor);
            }

            double baseAmount = 0;
            if (data.EvaluationMethodology == "Lot-wise" && data.Lots != null)
            {
                foreach (var lot in data.Lots)
                {
                    double lotCEC = lot.CecEstimateInclGst;
                    double lotAMC = (lot.HasAmc == true && lot.AmcValue > 0) ? lot.AmcValue.Value : 0;
                    baseAmount += (lotCEC - lotAMC);
                }
            }
            else
            {
                double cecInclGst = data.CecEstimateInclGst;
                double amcValue = (data.HasAmc && data.AmcValue > 0) ? data.AmcValue : 0;
                baseAmount = cecInclGst - amcValue;
            }

            double turnoverAmount = basePercentage * baseAmount;
            double contractDurationYears = data.ContractDurationYears > 0 ? data.ContractDurationYears : 1;

            // Return in Crores (match Express implementation which returns Crores)
            return turnoverAmount / contractDurationYears;
        }

        #endregion

        #region OpenXML Generation Helpers

        private List<Run> ConvertHtmlToRuns(string htmlContent)
        {
            if (string.IsNullOrEmpty(htmlContent))
            {
                return new List<Run> { new Run(new Text("")) };
            }

            var runs = new List<Run>();

            // Split by <br> tags first (preserve line breaks)
            var lines = System.Text.RegularExpressions.Regex.Split(htmlContent, @"<br\s*/?>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            for (int i = 0; i < lines.Length; i++)
            {
                if (i > 0)
                {
                    // Represent line break as a text run containing a newline to mimic Node behavior
                    var brRun = new Run(new Text("\n") { Space = SpaceProcessingModeValues.Preserve });
                    runs.Add(brRun);
                }

                var line = lines[i];
                if (string.IsNullOrWhiteSpace(line)) continue;

                // Stack-based parser to handle nested formatting similar to the Node helper
                var formatStack = new Stack<(bool Bold, bool Italic, bool Underline)>();
                bool isBold = false; bool isItalic = false; bool isUnderline = false;

                // List state
                var listStack = new Stack<string>(); // "ul" or "ol"
                var olCounters = new Stack<int>();
                bool insideLi = false;
                string pendingListPrefix = null;

                var segments = System.Text.RegularExpressions.Regex.Split(line, @"(<[^>]*>)");
                foreach (var seg in segments)
                {
                    if (string.IsNullOrEmpty(seg)) continue;
                    if (seg.StartsWith("<") && seg.EndsWith(">"))
                    {
                        var tagMatch = System.Text.RegularExpressions.Regex.Match(seg, @"</?([biu]|strong|em|ul|ol|li)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                        if (tagMatch.Success)
                        {
                            var tag = tagMatch.Groups[1].Value.ToLower();
                            bool isClosing = seg.StartsWith("</");

                            // Handle formatting tags
                            if (tag == "b" || tag == "strong" || tag == "i" || tag == "em" || tag == "u")
                            {
                                if (isClosing)
                                {
                                    if (formatStack.Count > 0)
                                    {
                                        var prev = formatStack.Pop();
                                        isBold = prev.Bold; isItalic = prev.Italic; isUnderline = prev.Underline;
                                    }
                                    else
                                    {
                                        isBold = false; isItalic = false; isUnderline = false;
                                    }
                                }
                                else
                                {
                                    formatStack.Push((isBold, isItalic, isUnderline));
                                    switch (tag)
                                    {
                                        case "b":
                                        case "strong":
                                            isBold = true; break;
                                        case "i":
                                        case "em":
                                            isItalic = true; break;
                                        case "u":
                                            isUnderline = true; break;
                                    }
                                }
                            }

                            // Handle list tags
                            if (tag == "ul")
                            {
                                if (isClosing)
                                {
                                    if (listStack.Count > 0) listStack.Pop();
                                    if (olCounters.Count > 0) olCounters.Pop();
                                }
                                else
                                {
                                    listStack.Push("ul");
                                    olCounters.Push(0);
                                }
                            }
                            else if (tag == "ol")
                            {
                                if (isClosing)
                                {
                                    if (listStack.Count > 0) listStack.Pop();
                                    if (olCounters.Count > 0) olCounters.Pop();
                                }
                                else
                                {
                                    listStack.Push("ol");
                                    olCounters.Push(0);
                                }
                            }
                            else if (tag == "li")
                            {
                                if (isClosing)
                                {
                                    // end of li - append a newline run
                                    insideLi = false;
                                    pendingListPrefix = null;
                                    runs.Add(new Run(new Text("\n") { Space = SpaceProcessingModeValues.Preserve }));
                                }
                                else
                                {
                                    // start of li
                                    insideLi = true;
                                    if (listStack.Count > 0 && listStack.Peek() == "ol")
                                    {
                                        int count = olCounters.Pop();
                                        count++;
                                        olCounters.Push(count);
                                        pendingListPrefix = count + ". ";
                                    }
                                    else
                                    {
                                        pendingListPrefix = "• ";
                                    }
                                }
                            }

                        }
                        continue;
                    }

                    // Text segment - if we have a pending list prefix, emit it first
                    if (!string.IsNullOrEmpty(pendingListPrefix))
                    {
                        var prefixRun = new Run();
                        var rpPrefix = new RunProperties();
                        rpPrefix.AppendChild(new RunFonts() { Ascii = DefaultFont });
                        rpPrefix.AppendChild(new FontSize() { Val = DefaultFontSize.ToString() });
                        if (isBold) rpPrefix.AppendChild(new Bold());
                        if (isItalic) rpPrefix.AppendChild(new Italic());
                        if (isUnderline) rpPrefix.AppendChild(new Underline() { Val = UnderlineValues.Single });
                        prefixRun.AppendChild(rpPrefix);
                        prefixRun.AppendChild(new Text(pendingListPrefix) { Space = SpaceProcessingModeValues.Preserve });
                        runs.Add(prefixRun);
                        // clear pending prefix so it's not added multiple times
                        pendingListPrefix = null;
                    }

                    var run = new Run();
                    var rp = new RunProperties();
                    rp.AppendChild(new RunFonts() { Ascii = DefaultFont });
                    rp.AppendChild(new FontSize() { Val = DefaultFontSize.ToString() });
                    if (isBold) rp.AppendChild(new Bold());
                    if (isItalic) rp.AppendChild(new Italic());
                    if (isUnderline) rp.AppendChild(new Underline() { Val = UnderlineValues.Single });
                    run.AppendChild(rp);
                    run.AppendChild(new Text(seg) { Space = SpaceProcessingModeValues.Preserve });
                    runs.Add(run);
                }
            }

            return runs;
        }

        #endregion


        private void AddHeaderTable(Body body, BQCData data)
        {
            Table table = new Table();

            TableProperties tblProp = new TableProperties(
                new TableWidth() { Width = "100", Type = TableWidthUnitValues.Pct },
                new TableBorders(
                    new TopBorder() { Val = BorderValues.Single, Size = 4 },
                    new BottomBorder() { Val = BorderValues.Single, Size = 4 },
                    new LeftBorder() { Val = BorderValues.Single, Size = 4 },
                    new RightBorder() { Val = BorderValues.Single, Size = 4 }
                )
            );
            table.AppendChild(tblProp);

            TableRow row = new TableRow();

            // Left Cell: Ref Number
            TableCell cellLeft = new TableCell();
            cellLeft.AppendChild(new TableCellProperties(new TableCellWidth() { Width = "50", Type = TableWidthUnitValues.Pct }));
            Paragraph pLeft = new Paragraph();
            ParagraphProperties ppLeft = new ParagraphProperties(new Justification() { Val = JustificationValues.Left });
            pLeft.AppendChild(ppLeft);
            
            Run rLeft = pLeft.AppendChild(new Run());
            rLeft.AppendChild(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }));
            rLeft.AppendChild(new Text($"Ref: {data.RefNumber ?? "XXXXXX"}"));
            cellLeft.AppendChild(pLeft);

            // Right Cell: Date
            TableCell cellRight = new TableCell();
            cellRight.AppendChild(new TableCellProperties(new TableCellWidth() { Width = "50", Type = TableWidthUnitValues.Pct }));
            Paragraph pRight = new Paragraph();
            ParagraphProperties ppRight = new ParagraphProperties(new Justification() { Val = JustificationValues.Right });
            pRight.AppendChild(ppRight);
            
            Run rRight = pRight.AppendChild(new Run());
            rRight.AppendChild(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }));
            rRight.AppendChild(new Text($"Date: {FormatDate(DateTime.Now)}"));
            cellRight.AppendChild(pRight);

            row.Append(cellLeft, cellRight);
            table.AppendChild(row);
            body.AppendChild(table);
        }

        private void AddNoteToTable(Body body, BQCData data)
        {
            Table table = new Table();
            TableProperties tblProp = new TableProperties(
                new TableWidth() { Width = "100", Type = TableWidthUnitValues.Pct },
                new TableBorders(
                    new TopBorder() { Val = BorderValues.Single, Size = 4 },
                    new BottomBorder() { Val = BorderValues.Single, Size = 4 },
                    new LeftBorder() { Val = BorderValues.Single, Size = 4 },
                    new RightBorder() { Val = BorderValues.Single, Size = 4 }
                )
            );
            table.AppendChild(tblProp);

            TableRow row = new TableRow();

            TableCell cellLabel = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "20", Type = TableWidthUnitValues.Pct }));
            Paragraph pLabel = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            pLabel.AppendChild(new Run(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }), new Text("NOTE TO:")));
            cellLabel.AppendChild(pLabel);

            TableCell cellValue = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "80", Type = TableWidthUnitValues.Pct }));
            Paragraph pValue = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            pValue.AppendChild(new Run(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }), new Text(data.NoteTo ?? "CHIEF PROCUREMENT OFFICER, CPO (M)")));
            cellValue.AppendChild(pValue);

            row.Append(cellLabel, cellValue);
            table.AppendChild(row);
            body.AppendChild(table);
        }

        private void AddSubjectTable(Body body, BQCData data)
        {
            Table table = new Table();

            TableProperties tblProp = new TableProperties(
                new TableWidth() { Width = "100", Type = TableWidthUnitValues.Pct },
                new TableBorders(
                    new TopBorder() { Val = BorderValues.Single, Size = 4 },
                    new BottomBorder() { Val = BorderValues.Single, Size = 4 },
                    new LeftBorder() { Val = BorderValues.Single, Size = 4 },
                    new RightBorder() { Val = BorderValues.Single, Size = 4 }
                )
            );
            table.AppendChild(tblProp);

            TableRow row = new TableRow();

            TableCell cellLabel = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "20", Type = TableWidthUnitValues.Pct }));
            Paragraph pLabel = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            pLabel.AppendChild(new Run(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }), new Text("SUBJECT:")));
            cellLabel.AppendChild(pLabel);

            TableCell cellValue = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "80", Type = TableWidthUnitValues.Pct }));
            Paragraph pValue = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            pValue.AppendChild(new Run(new RunProperties(new Bold(), new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }), new Text(data.Subject ?? "APPROVAL OF BID QUALIFICATION CRITERIA AND FLOATING OF OPEN DOMESTIC TENDER.")));
            cellValue.AppendChild(pValue);

            row.Append(cellLabel, cellValue);
            table.AppendChild(row);
            body.AppendChild(table);
        }

        private void AddPara(Body body, string text, bool bold = false, int size = DefaultFontSize, string font = DefaultFont, JustificationValues? justification = null)
        {
            var just = justification ?? JustificationValues.Left;
            Paragraph para = body.AppendChild(new Paragraph());

            ParagraphProperties paraProps = new ParagraphProperties();
            paraProps.AppendChild(new Justification() { Val = just });
            para.AppendChild(paraProps);

            Run run = para.AppendChild(new Run());
            RunProperties runProps = new RunProperties();
            runProps.AppendChild(new RunFonts() { Ascii = font });
            runProps.AppendChild(new FontSize() { Val = size.ToString() });
            if (bold) runProps.AppendChild(new Bold());
            run.AppendChild(runProps);

            run.AppendChild(new Text(text));
        }
        private void AddPreambleTable(Body body, BQCData data)
        {
            Table table = CreateBaseTable();

            // Tender Description row (Express places this in the Preamble)
            AddLabelValueRow(table, "Tender Description", data.TenderDescription ?? "N/A", true);
            AddLabelValueRow(table, "PR reference/ Email reference", data.PrReference ?? "N/A", true);
            AddLabelValueRow(table, "Type of Tender", data.TenderType ?? "Goods", true);

            string cecDate = !string.IsNullOrEmpty(data.CecDate) ? data.CecDate : "N/A";
            AddLabelValueRow(table, "CEC estimate (incl. of GST)/ Date", $"{FormatIndianCurrency(data.CecEstimateInclGst)} / {cecDate}", true);
            AddLabelValueRow(table, "CEC estimate exclusive of GST", FormatIndianCurrency(data.CecEstimateExclGst), true);
            AddLabelValueRow(table, "Budget Details (WBS/ Revex)", data.BudgetDetails ?? "N/A", true);
            AddLabelValueRow(table, "Tender Platform", data.TenderPlatform ?? "GeM", true);

            body.AppendChild(table);
        }

        private void AddScopeOfWorkTable(Body body, BQCData data)
        {
            AddPara(body, "BRIEF SCOPE OF WORK", true);
            Table table = CreateBaseTable();
            AddLabelValueRow(table, "Brief Scope of Work / Supply Items", data.TenderDescription ?? "N/A", true);
            // Determine contract period display text
            string contractPeriodText = !string.IsNullOrEmpty(data.ContractPeriodText)
                ? data.ContractPeriodText
                : (int.TryParse(data.ContractPeriodMonths, out var months) ? months.ToString() + " months" : "12 months");
            AddLabelValueRow(table, "Contract Period /Completion Period", contractPeriodText, true);
            AddLabelValueRow(table, "Delivery Period of the Item", data.DeliveryPeriod ?? "N/A", true);
            AddLabelValueRow(table, "Warranty Period", data.WarrantyPeriod ?? "N/A", true);
            // AMC row - only show if hasAmc and amcValue > 0
            if (data.HasAmc && data.AmcValue > 0)
            {
                AddLabelValueRow(table, "AMC/ CAMC/ O&M (No. of Years)", data.AmcPeriod ?? "N/A", true);
            }
            AddLabelValueRow(table, "Payment Terms (if different from standard terms i.e within 30 days)", data.PaymentTerms ?? "Within 30 days", true);
            body.AppendChild(table);
        }

        private void AddTechnicalCriteriaSection(Body body, BQCData data, int sectionNum)
        {
            AddPara(body, $"{sectionNum}. BID QUALIFICATION CRITERIA (BQC)", true);
            AddPara(body, "BPCL would like to qualify vendors for undertaking the above work as indicated in the brief scope. Detailed bid qualification criteria for short listing vendors shall be as follows:");
            AddSpacing(body);
            
            AddPara(body, $"{sectionNum}.1 TECHNICAL CRITERIA", true);
            AddSpacing(body);

            if (data.TenderType == "Goods")
            {
                AddPara(body, $"{sectionNum}.1.1. For GOODS:", true);
                AddPara(body, "Manufacturing Capability:", true);
                
                string mfrTypes = data.ManufacturerTypes != null && data.ManufacturerTypes.Count > 0 
                                  ? string.Join(" AND/OR ", data.ManufacturerTypes) 
                                  : "Original Equipment Manufacturer AND/OR Authorized Channel Partner AND/OR Authorized Agent AND/OR Dealer AND/OR Authorized Distributor";
                AddPara(body, $"Bidder* should be {mfrTypes} of the item being tendered.");
                AddSpacing(body);

                if (data.EvaluationMethodology == "least cash outflow")
                {
                    AddPara(body, "Supplying Capacity:", true);
                    // Standard requirement (Non-MSE)
                    double quantity = data.QuantitySupplied ?? 0;
                    double nonMseReq = Math.Round(quantity * 0.30);
                    AddPara(body, "Non-MSE (Standard) Requirements:", true);
                    AddPara(body, $"The bidder shall have experience of having successfully supplied minimum of {FormatPastPerformanceUnits(nonMseReq)} in any 12 continuous months during last 7 years in India or abroad, ending on last day of the month previous to the one in which tender is invited.");
                    
                    if (data.PastPerformanceMseRelaxation == true)
                    {
                        double mseReq = Math.Round(quantity * 0.30 * 0.85); // 15% relaxation
                        AddPara(body, "MSE (Relaxed) Requirements:", true);
                        AddPara(body, $"The MSE bidder shall have experience of having successfully supplied minimum of {FormatPastPerformanceUnits(mseReq)} in any 12 continuous months during last 7 years in India or abroad, ending on last day of the month previous to the one in which tender is invited.");
                        AddPara(body, "For MSE bidders Relaxation of 15% on the supplying capacity shall be given as per Corp. Finance Circular MA.TEC.POL.CON.3A dated 26.10.2020.");
                    }
                    AddSpacing(body);

                    // Past Performance Explanatory Note (if provided)
                    if (data.HasPastPerformanceExplanatoryNote == true && !string.IsNullOrEmpty(data.PastPerformanceExplanatoryNote))
                    {
                        Paragraph pPast = body.AppendChild(new Paragraph());
                        pPast.Append(ConvertHtmlToRuns(data.PastPerformanceExplanatoryNote));
                    }
                }
                else if (data.EvaluationMethodology == "Lot-wise" && data.Lots != null && data.Lots.Count > 0)
                {
                    AddPara(body, "Supplying Capacity:", true);
                    AddPara(body, "Non-MSE (Standard) Requirements:\nThe bidder should have supplied similar goods in the last Seven (7) years. The quantity supplied should be at least 30% of the total quantity required for each lot as per below table.");
                    AddPara(body, "For MSE bidders, Relaxation of 15% on the supplying capacity shall be given as per Corp. Finance Circular MA.TEC.POL.CON.3A dated 26.10.2020.");
                    AddSpacing(body);
                    AddLotWiseSupplyingCapacityTable(body, data);
                    AddPara(body, "Bidder can quote for any one or more than one LOT based on their capability/choice.");
                    AddSpacing(body);
                }
            }
            else if (data.TenderType == "Service" || data.TenderType == "Works")
            {
                 AddPara(body, $"{sectionNum}.1.2. BQC/PQC for Procurement of Works and Services:", true);
                 
                 if (data.EvaluationMethodology != "Lot-wise")
                 {
                    AddPara(body, "Experience / Past performance / Technical Capability:", true);
                    AddPara(body, "The bidder should have experience of having successfully completed similar works during last 7 years ending last day of month previous to the one in which tender is floated should be either of the following: -");
                    AddSpacing(body);

                    double baseValue = data.CecEstimateInclGst;
                    double optionA = baseValue * 0.8;
                    double optionB = baseValue * 0.5;
                    double optionC = baseValue * 0.4;

                    AddPara(body, "Experience Requirements:", true);
                    AddPara(body, $"Three similar completed works each costing not less than {FormatExperienceCurrency(optionC)}.");
                    AddPara(body, "or");
                    AddPara(body, $"Two similar completed works each costing not less than {FormatExperienceCurrency(optionB)}.");
                    AddPara(body, "or");
                    AddPara(body, $"One similar completed work costing not less than {FormatExperienceCurrency(optionA)}.");
                    AddSpacing(body);
                    
                    AddPara(body, $"Definition of the similar work should be considered as following: {data.SimilarWorkDefinition ?? "N/A"}");
                    AddSpacing(body);
                 }
                 else
                 {
                      // Lot-wise technical criteria for Service/Works
                      AddPara(body, $"{sectionNum}.1.3 PROVEN TRACK RECORD", true);
                     AddPara(body, "The bidder shall have experience of having successfully executed similar works in the last Seven (7) years in any Oil & Gas Industry in India. The Value (Rs) of the similar work/s executed (proof of execution to be submitted) should be as follows:");
                     AddSpacing(body);
                     AddPara(body, $"Definition of \"similar work\": {data.SimilarWorkDefinition ?? "N/A"}");
                     AddSpacing(body);
                     AddLotWiseTechnicalCriteriaTable(body, data);
                     AddSpacing(body);
                     AddPara(body, "Bidder can quote for any one or more than one LOT based on their capability/choice.");
                     AddPara(body, "Note: If the Bidder quotes for more than one LOT, the similar works criteria should not be less than the cumulative amount applicable for the LOTs quoted.");
                     AddSpacing(body);
                 }
            }

            if (data.HasExperienceExplanatoryNote == true && !string.IsNullOrEmpty(data.ExperienceExplanatoryNote))
            {
                Paragraph p = body.AppendChild(new Paragraph());
                p.Append(ConvertHtmlToRuns(data.ExperienceExplanatoryNote));
            }
            AddSpacing(body);
        }

        private void AddAdditionalDetailsSection(Body body, BQCData data)
        {
            if (!string.IsNullOrEmpty(data.AdditionalDetails))
            {
                AddPara(body, "ADDITIONAL DETAILS", true);
                AddPara(body, data.AdditionalDetails ?? string.Empty);
                AddSpacing(body);
            }

            if (data.HasAdditionalExplanatoryNote == true && !string.IsNullOrEmpty(data.AdditionalExplanatoryNote))
            {
                Paragraph p = body.AppendChild(new Paragraph());
                p.Append(ConvertHtmlToRuns(data.AdditionalExplanatoryNote));
                AddSpacing(body);
            }
        }

        private Table CreateBaseTable()
        {
            Table table = new Table();
            TableProperties tblProp = new TableProperties(
                new TableWidth() { Width = "100", Type = TableWidthUnitValues.Pct },
                new TableBorders(
                    new TopBorder() { Val = BorderValues.Single, Size = 4 },
                    new BottomBorder() { Val = BorderValues.Single, Size = 4 },
                    new LeftBorder() { Val = BorderValues.Single, Size = 4 },
                    new RightBorder() { Val = BorderValues.Single, Size = 4 },
                    new InsideHorizontalBorder() { Val = BorderValues.Single, Size = 4 },
                    new InsideVerticalBorder() { Val = BorderValues.Single, Size = 4 }
                )
            );
            table.AppendChild(tblProp);
            return table;
        }

        private void AddLotWiseSupplyingCapacityTable(Body body, BQCData data)
        {
            Table table = CreateBaseTable();
            // Determine whether to show Non-MSE / MSE columns (default true)
            bool showNonMse = data.ShowNonMseCalculations != false;
            bool showMse = data.ShowMseCalculations != false;

            // Calculate dynamic widths (Sr.No=10, Description=30, Quantity=20)
            int fixedWidth = 10 + 30 + 20;
            int dynamicColumns = (showNonMse ? 1 : 0) + (showMse ? 1 : 0);
            int remainingWidth = 100 - fixedWidth;
            int dynamicCellWidth = dynamicColumns > 0 ? remainingWidth / dynamicColumns : 0;

            // Header Row
            TableRow header = new TableRow();
            header.Append(
                CreateTableCell("Sr. No.", 10, true, JustificationValues.Center),
                CreateTableCell("Section / Description", 30, true, JustificationValues.Center),
                CreateTableCell("Quantity Required", 20, true, JustificationValues.Center)
            );
            if (showNonMse) header.Append(CreateTableCell("Non-MSE (30%)", dynamicCellWidth, true, JustificationValues.Center));
            if (showMse) header.Append(CreateTableCell("MSE (15%)", dynamicCellWidth, true, JustificationValues.Center));
            table.AppendChild(header);

            double totalQty = 0;
            for (int i = 0; i < data.Lots.Count; i++)
            {
                var lot = data.Lots[i];
                double qty = lot.QuantitySupplied ?? 0;
                totalQty += qty;

                TableRow row = new TableRow();
                row.Append(
                    CreateTableCell((i + 1).ToString(), 10, false, JustificationValues.Center),
                    CreateTableCell(lot.LotNumber ?? $"LOT-{i + 1}", 30),
                    CreateTableCell(qty.ToString("N0"), 20, false, JustificationValues.Center)
                );
                if (showNonMse) row.Append(CreateTableCell(Math.Round(qty * 0.3).ToString("N0"), dynamicCellWidth, false, JustificationValues.Center));
                if (showMse) row.Append(CreateTableCell(Math.Round(qty * 0.15).ToString("N0"), dynamicCellWidth, false, JustificationValues.Center));

                table.AppendChild(row);
            }

            // Total Row
            TableRow totalRow = new TableRow();
            totalRow.Append(
                CreateTableCell((data.Lots.Count + 1).ToString(), 10, false, JustificationValues.Center),
                CreateTableCell("TOTAL FOR ALL LOTS", 30, true),
                CreateTableCell(totalQty.ToString("N0"), 20, false, JustificationValues.Center)
            );
            if (showNonMse) totalRow.Append(CreateTableCell(Math.Round(totalQty * 0.3).ToString("N0"), dynamicCellWidth, false, JustificationValues.Center));
            if (showMse) totalRow.Append(CreateTableCell(Math.Round(totalQty * 0.15).ToString("N0"), dynamicCellWidth, false, JustificationValues.Center));
            table.AppendChild(totalRow);

            body.AppendChild(table);
        }

        private void AddLotWiseTechnicalCriteriaTable(Body body, BQCData data)
        {
            Table table = CreateBaseTable();
            TableRow header = new TableRow();
            header.Append(
                CreateTableCell("Sr. No.", 15, true, JustificationValues.Center),
                CreateTableCell("Section / Description", 25, true, JustificationValues.Center),
                CreateTableCell("One similar work (80%)", 20, true, JustificationValues.Center),
                CreateTableCell("Two similar works (50%)", 20, true, JustificationValues.Center),
                CreateTableCell("Three similar works (40%)", 20, true, JustificationValues.Center)
            );
            table.AppendChild(header);

            for (int i = 0; i < data.Lots.Count; i++)
            {
                var lot = data.Lots[i];
                double baseAmt = lot.CecEstimateInclGst; // Cr
                double annualized = lot.ContractPeriodMonths > 12 ? baseAmt / (lot.ContractPeriodMonths / 12.0) : baseAmt;
                double inLakhs = annualized * 100;

                TableRow row = new TableRow();
                row.Append(
                    CreateTableCell((i + 1).ToString(), 15, false, JustificationValues.Center),
                    CreateTableCell(lot.LotNumber ?? $"LOT-{i + 1}", 25),
                    CreateTableCell((inLakhs * 0.8).ToString("N2"), 20, false, JustificationValues.Center),
                    CreateTableCell((inLakhs * 0.5).ToString("N2"), 20, false, JustificationValues.Center),
                    CreateTableCell((inLakhs * 0.4).ToString("N2"), 20, false, JustificationValues.Center)
                );
                table.AppendChild(row);
            }
            body.AppendChild(table);
        }

        private void AddLotWiseFinancialTable(Body body, BQCData data)
        {
            Table table = CreateBaseTable();
            TableRow header = new TableRow();
            header.Append(
                CreateTableCell("Sr. No.", 10, true, JustificationValues.Center),
                CreateTableCell("Section / Description", 40, true, JustificationValues.Center),
                CreateTableCell("Annualized Est. Value (Lakhs)", 25, true, JustificationValues.Center),
                CreateTableCell("Avg. Annual Turnover (Lakhs)", 25, true, JustificationValues.Center)
            );
            table.AppendChild(header);

            double totalAnnualized = 0;
            double totalTurnover = 0;

            for (int i = 0; i < data.Lots.Count; i++)
            {
                var lot = data.Lots[i];
                double annualized = lot.ContractPeriodMonths > 12 ? lot.CecEstimateInclGst / (lot.ContractPeriodMonths / 12.0) : lot.CecEstimateInclGst;
                double inLakhs = annualized * 100;
                double turnoverReq = inLakhs * 0.3;

                totalAnnualized += inLakhs;
                totalTurnover += turnoverReq;

                TableRow row = new TableRow();
                row.Append(
                    CreateTableCell((i + 1).ToString(), 10, false, JustificationValues.Center),
                    CreateTableCell(lot.LotNumber ?? $"LOT-{i + 1}", 40),
                    CreateTableCell(inLakhs.ToString("N2"), 25, false, JustificationValues.Center),
                    CreateTableCell(turnoverReq.ToString("N2"), 25, false, JustificationValues.Center)
                );
                table.AppendChild(row);
            }

            TableRow totalRow = new TableRow();
            totalRow.Append(
                CreateTableCell((data.Lots.Count + 1).ToString(), 10, false, JustificationValues.Center),
                CreateTableCell("TOTAL FOR ALL LOTS", 40, true),
                CreateTableCell(totalAnnualized.ToString("N2"), 25, true, JustificationValues.Center),
                CreateTableCell(totalTurnover.ToString("N2"), 25, true, JustificationValues.Center)
            );
            table.AppendChild(totalRow);

            body.AppendChild(table);
        }

        private void AddEvaluationMethodologySection(Body body, BQCData data, int sectionNum)
        {
            AddPara(body, $"{sectionNum}. EVALUATION METHODOLOGY", true);
            AddPara(body, "The tender will be invited through Open tender (Domestic) as two-part bid. The bid qualification evaluation of the received bids will be done as per the above bid qualification criteria and the technical bid of the shortlisted bidders will be evaluated subsequently. The price bids of the bidders who qualify BQC criteria & meet Technical / Commercial requirements of the tender will only be opened and evaluated.");
            
            string commEval = data.CommercialEvaluationMethod != null && data.CommercialEvaluationMethod.Count > 0 
                              ? string.Join(", ", data.CommercialEvaluationMethod) 
                              : "Overall Lowest Basis";
            AddPara(body, $"The Commercial Evaluation shall be done on {commEval}.");
            
            string preference = data.TenderType == "Works" 
                               ? "The order will be placed based on above methodology AND Purchase preference based on PPP-MII Policy."
                               : "The order will be placed based on above methodology AND Purchase preference based on MSE/ PPP-MII Policy.";
            AddPara(body, preference);
            AddPara(body, $"The subject job is {data.Divisibility ?? "Non-Divisible"}.");
            AddSpacing(body);
        }

        private void AddEMDSection(Body body, BQCData data, int sectionNum)
        {
            AddPara(body, $"{sectionNum}. EARNEST MONEY DEPOSIT (EMD)", true);
            
            if (data.EvaluationMethodology == "Lot-wise" && data.Lots != null && data.Lots.Count > 0)
            {
                AddPara(body, "Bidders are required to provide Earnest Money Deposit as per below table (LOT-WISE):");
                AddLotWiseEMDTable(body, data);
                AddPara(body, "Bidder can quote for any one or more than one LOT based on their capability/choice.");
                AddPara(body, "Note: If the Bidder quotes for more than one LOT, the EMD amount should not be less than the cumulative amount applicable for the LOTs quoted.");
            }
            else
            {
                double emd = CalculateEMD(data.CecEstimateInclGst, data.TenderType);
                AddPara(body, $"Bidders are required to provide Earnest Money Deposit equivalent to Rs. {emd:N2} Lacs for the tender.");
            }
            AddPara(body, "EMD exemption shall be as per General Terms & Conditions of GeM (applicable for GeM tenders)/ MSE policy");
            if (data.HasEMDExplanatoryNote == true && !string.IsNullOrEmpty(data.EmdExplanatoryNote))
            {
                Paragraph p = body.AppendChild(new Paragraph());
                p.Append(ConvertHtmlToRuns(data.EmdExplanatoryNote));
            }
            AddSpacing(body);
        }

        private void AddFinancialCriteriaSection(Body body, BQCData data, int sectionNum)
        {
            AddPara(body, $"{sectionNum}.2 FINANCIAL CRITERIA", true);
            AddPara(body, $"{sectionNum}.2.1 ANNUAL TURNOVER", true);
            
            if (data.EvaluationMethodology == "Lot-wise" && data.Lots != null && data.Lots.Count > 0)
            {
                AddPara(body, "The bidder should have achieved a minimum Average Annual financial turnover as per below table (LOT-WISE).as per Audited Balance sheet and P&L Statement in the last three* accounting years prior to due date of bid submission.");
                AddLotWiseFinancialTable(body, data);
                AddPara(body, "Bidder can quote for any one or more than one LOT based on their capability/choice.");
                AddPara(body, "Note: If the Bidder quotes for more than one LOT, the average value of Turnover should not be less than the cumulative amount applicable for the LOTs quoted.");
            }
            else
            {
                double turnover = CalculateTurnover(data);
                AddPara(body, $"The average annual turnover of the Bidder for last three audited accounting years shall be equal to or more than {FormatTurnoverAmount(turnover)}.");
            }
            AddSpacing(body);

            AddPara(body, $"{sectionNum}.2.2 NET WORTH", true);
            AddPara(body, "The bidder should have positive net worth as per the latest audited financial statement.");
            
            if (data.HasFinancialExplanatoryNote == true && !string.IsNullOrEmpty(data.FinancialExplanatoryNote))
            {
                Paragraph p = body.AppendChild(new Paragraph());
                p.Append(ConvertHtmlToRuns(data.FinancialExplanatoryNote));
            }
            AddSpacing(body);

            AddPara(body, $"{sectionNum}.3 BIDS MAY BE SUBMITTED BY", true);
            AddPara(body, "3.3.1 An entity (domestic bidder) should have completed 3 financial years of existence as on original due date of tender since date of commencement of business and shall fulfil each BQC eligibility criteria as mentioned above.");
            AddPara(body, "3.3.2 JV/Consortium bids will not be accepted (i.e. Qualification on the strength of the JV Partners/Consortium Members /Subsidiaries / Group members will not be accepted)");
            AddSpacing(body);
        }

        private void AddLotWiseEMDTable(Body body, BQCData data)
        {
            Table table = CreateBaseTable();
            TableRow header = new TableRow();
            header.Append(
                CreateTableCell("Sr. No.", 10, true, JustificationValues.Center),
                CreateTableCell("Section / Description", 40, true, JustificationValues.Center),
                CreateTableCell("CEC Estimate (Lakhs)", 25, true, JustificationValues.Center),
                CreateTableCell("EMD Amount (Lakhs)", 25, true, JustificationValues.Center)
            );
            table.AppendChild(header);

            double totalCEC = 0;
            double totalEMD = 0;

            for (int i = 0; i < data.Lots.Count; i++)
            {
                var lot = data.Lots[i];
                double cecInLakhs = lot.CecEstimateInclGst * 100;
                double emd = CalculateEMD(lot.CecEstimateInclGst, data.TenderType);

                totalCEC += cecInLakhs;
                totalEMD += emd;

                TableRow row = new TableRow();
                // Round lot-level EMD to one decimal for display (as per Express behavior)
                var emdDisplay = (Math.Round(emd * 10) / 10.0).ToString("0.##");
                row.Append(
                    CreateTableCell((i + 1).ToString(), 10, false, JustificationValues.Center),
                    CreateTableCell(lot.LotNumber ?? $"LOT-{i + 1}", 40),
                    CreateTableCell(cecInLakhs.ToString("N2"), 25, false, JustificationValues.Center),
                    CreateTableCell(emdDisplay, 25, false, JustificationValues.Center)
                );
                table.AppendChild(row);
            }

            TableRow totalRow = new TableRow();
            var totalEmdDisplay = (Math.Round(totalEMD * 10) / 10.0).ToString("0.##");
            totalRow.Append(
                CreateTableCell((data.Lots.Count + 1).ToString(), 10, false, JustificationValues.Center),
                CreateTableCell("TOTAL FOR ALL LOTS", 40, true),
                CreateTableCell(totalCEC.ToString("N2"), 25, true, JustificationValues.Center),
                CreateTableCell(totalEmdDisplay, 25, true, JustificationValues.Center)
            );
            table.AppendChild(totalRow);

            body.AppendChild(table);
        }

        private void AddPerformanceSecuritySection(Body body, BQCData data, int sectionNum)
        {
            if (data.HasPerformanceSecurity)
            {
                AddPara(body, $"{sectionNum}. Performance Security (if at variance with the ITB clause):", true);
                AddPara(body, $"Performance Security % other than Standard to be mentioned, approved by the competent authority: {data.PerformanceSecurity ?? "Standard"}");
                AddSpacing(body);
            }
        }

        private void AddApprovalSection(Body body, BQCData data, int bqcSec, int evalSec, int emdSec, int psSec)
        {
            AddPara(body, "8. APPROVAL REQUIRED", true);
            AddPara(body, $"In view of above, approval is requested for the supply of {data.TenderDescription ?? "the tender"}/job {data.TenderDescription ?? "the tender"} for");
            AddPara(body, $"Bid Qualification Criteria as per Sr. No. {bqcSec}, as per Clause 13.8 of Guidelines for procurement of Goods and Contract Services.");
            AddPara(body, $"Inviting bids (two-part bid) through a Domestic Open Tender and adopting evaluation methodology as per Sr. No. {evalSec} above.");
            AddPara(body, $"Earnest Money Deposit as per Sr. No. {emdSec} above.{(data.HasPerformanceSecurity ? $"/ Performance Security as per Sr. No. {psSec} (if applicable)" : "")}");
            AddSpacing(body, 2);

            AddPara(body, "Proposed by", true, justification: JustificationValues.Center);
            AddPara(body, $"{data.ProposedBy ?? "XXXXX"}, {data.ProposedByDesignation ?? "Procurement Manager (CPO Mktg.)"}", justification: JustificationValues.Center);
            AddSpacing(body, 2);

            AddPara(body, "Recommended by", true, justification: JustificationValues.Center);
            AddPara(body, $"{data.RecommendedBy ?? "XXXXXX"}, {data.RecommendedByDesignation ?? "Procurement Leader (CPO Mktg.)"}", justification: JustificationValues.Center);
            AddSpacing(body, 2);

            AddPara(body, "Concurred by", true, justification: JustificationValues.Center);
            AddPara(body, $"{data.ConcurredBy ?? "Rajesh J."}, {data.ConcurredByDesignation ?? "General Manager Finance (CPO Marketing)"}", justification: JustificationValues.Center);
            AddSpacing(body, 2);

            AddPara(body, "Approved by", true, justification: JustificationValues.Center);
            AddPara(body, $"{data.ApprovedBy ?? "Kani Amudhan N."}, {data.ApprovedByDesignation ?? "Chief Procurement Officer (CPO Marketing)"}", justification: JustificationValues.Center);
        }

        private void AddLabelValueRow(Table table, string label, string value, bool boldLabel = true)
        {
            TableRow row = new TableRow();

            TableCell cellLabel = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "30", Type = TableWidthUnitValues.Pct }));
            Paragraph pLabel = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            Run rLabel = pLabel.AppendChild(new Run());
            RunProperties rpLabel = rLabel.AppendChild(new RunProperties(new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }));
            if (boldLabel) rpLabel.AppendChild(new Bold());
            rLabel.AppendChild(new Text(label));
            cellLabel.AppendChild(pLabel);

            TableCell cellValue = new TableCell(new TableCellProperties(new TableCellWidth() { Width = "70", Type = TableWidthUnitValues.Pct }));
            Paragraph pValue = new Paragraph(new ParagraphProperties(new Justification() { Val = JustificationValues.Left }));
            Run rValue = pValue.AppendChild(new Run());
            rValue.AppendChild(new RunProperties(new RunFonts() { Ascii = DefaultFont }, new FontSize() { Val = DefaultFontSize.ToString() }));
            rValue.AppendChild(new Text(value));
            cellValue.AppendChild(pValue);

            row.Append(cellLabel, cellValue);
            table.AppendChild(row);
        }

        private TableCell CreateTableCell(string text, int widthPct, bool bold = false, JustificationValues? justification = null)
        {
            var just = justification ?? JustificationValues.Left;
            TableCell cell = new TableCell(new TableCellProperties(new TableCellWidth() { Width = widthPct.ToString(), Type = TableWidthUnitValues.Pct }));
            ParagraphProperties pp = new ParagraphProperties(new Justification() { Val = just });
            RunProperties rp = new RunProperties();
            rp.AppendChild(new RunFonts() { Ascii = DefaultFont });
            rp.AppendChild(new FontSize() { Val = DefaultFontSize.ToString() });
            if (bold) rp.AppendChild(new Bold());

            Paragraph p = new Paragraph(pp);
            p.AppendChild(new Run(rp, new Text(text)));
            cell.AppendChild(p);
            return cell;
        }
    }
}
