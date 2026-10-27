"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChartComponent, PieChartComponent } from "@/components/charts";
import { mockFairnessMetrics, mockBiasAuditData } from "@/lib/mockData";
import { formatPercentage, cn } from "@/lib/utils";
import {
  ShieldCheck,
  AlertCircle,
  Download,
  Info,
  BarChart2,
  PieChart,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const metricExplanations = {
  demographicParity: {
    title: "Demographic Parity Difference",
    description: "Measures whether selection rates are equal across demographic groups. A value of 0 means perfect parity.",
    formula: "|Selection Rate(Group A) - Selection Rate(Group B)|",
    threshold: "≤ 0.20 (20%)",
    interpretation: "Lower is better. Values above 0.20 suggest potential disparate impact.",
  },
  equalizedOdds: {
    title: "Equalized Odds Difference",
    description: "Measures whether true positive rates and false positive rates are equal across groups.",
    formula: "max(|TPR_A - TPR_B|, |FPR_A - FPR_B|)",
    threshold: "≤ 0.15 (15%)",
    interpretation: "Lower is better. Ensures similar error rates across groups.",
  },
  selectionRate: {
    title: "Selection Rate by Group",
    description: "Percentage of candidates selected (above threshold) within each demographic group.",
    formula: "Selected Candidates in Group / Total Candidates in Group",
    threshold: "Parity across groups",
    interpretation: "Large gaps may indicate bias. Investigate root causes before acting.",
  },
};

export default function FairnessPage() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [exportFormat, setExportFormat] = React.useState<"json" | "csv" | "pdf">("json");

  const { baselineMetrics, debiasedMetrics, demographicParityDifference, equalizedOddsDifference, selectionRateByGroup } = mockFairnessMetrics;

  const getStatus = (value: number, threshold: number, lowerIsBetter = true) => {
    const pass = lowerIsBetter ? value <= threshold : value >= threshold;
    return { pass, label: pass ? "Pass" : "Review", icon: pass ? ShieldCheck : AlertCircle, color: pass ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100" };
  };

  const dpStatus = getStatus(demographicParityDifference, 0.20);
  const eoStatus = getStatus(equalizedOddsDifference, 0.15);
  const maxSelectionGap = Math.max(...Object.values(selectionRateByGroup)) - Math.min(...Object.values(selectionRateByGroup));
  const srStatus = getStatus(maxSelectionGap, 0.15);

  const selectionRateChartData = Object.entries(selectionRateByGroup).map(([group, rate]) => {
    const auditData = mockBiasAuditData.find(d => d.group === group);
    return {
      group,
      baseline: (auditData?.baselineSelectionRate ?? 0) * 100,
      debiased: (auditData?.debiasedSelectionRate ?? 0) * 100,
      count: auditData?.candidateCount ?? 0,
    };
  });

  const metricComparisonData = [
    { metric: "Accuracy", baseline: baselineMetrics.accuracy * 100, debiased: debiasedMetrics.accuracy * 100 },
    { metric: "Precision", baseline: baselineMetrics.precision * 100, debiased: debiasedMetrics.precision * 100 },
    { metric: "Recall", baseline: baselineMetrics.recall * 100, debiased: debiasedMetrics.recall * 100 },
    { metric: "F1 Score", baseline: baselineMetrics.f1Score * 100, debiased: debiasedMetrics.f1Score * 100 },
    { metric: "Selection Rate", baseline: baselineMetrics.selectionRate * 100, debiased: debiasedMetrics.selectionRate * 100 },
  ];

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      modelVersion: "v1.0.0-demo",
      dataSource: "Synthetic demo data (not production data)",
      fairnessMetrics: {
        demographicParityDifference,
        equalizedOddsDifference,
        selectionRateByGroup,
        maxSelectionGap,
      },
      modelPerformance: {
        baseline: baselineMetrics,
        debiased: debiasedMetrics,
      },
      biasAuditData: mockBiasAuditData,
      limitations: [
        "Metrics computed on synthetic data — not representative of real candidate pools",
        "Demographic groups are simulated; real-world groups require self-identification",
        "Removing proxy features alone does not eliminate bias",
        "Fairness metrics can conflict; trade-offs require stakeholder input",
        "This audit does not constitute legal compliance certification",
      ],
      recommendations: [
        "Collect voluntary demographic data for production audits",
        "Monitor metrics continuously in production",
        "Establish domain-specific thresholds with legal/DEI teams",
        "Document mitigation rationale for each model version",
        "Schedule quarterly bias audits minimum",
      ],
    };

    if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hirefair-fairness-audit-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fairness & Bias Audit</h1>
            <p className="text-muted-foreground mt-1">
              Evaluate model fairness across demographic groups. Compare baseline vs. debiased approaches.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "json" | "csv" | "pdf")}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
          <AlertCircle className="h-3 w-3" />
          Demo Mode: All data is synthetic. Connect real pipeline for production audits.
        </Badge>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart2 className="h-4 w-4 mr-2" />
              Metrics Detail
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <TrendingUp className="h-4 w-4 mr-2" />
              Baseline vs Debiased
            </TabsTrigger>
            <TabsTrigger value="limitations">
              <Info className="h-4 w-4 mr-2" />
              Limitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Demographic Parity</span>
                    <dpStatus.icon className={cn("h-4 w-4", dpStatus.color.replace("bg-emerald-100", "text-emerald-600").replace("bg-amber-100", "text-amber-600"))} />
                  </CardTitle>
                  <CardDescription>{formatPercentage(demographicParityDifference * 100)} difference</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={(1 - demographicParityDifference / 0.20) * 100} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">Threshold: 20% • Status: {dpStatus.label}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Equalized Odds</span>
                    <eoStatus.icon className={cn("h-4 w-4", eoStatus.color.replace("bg-emerald-100", "text-emerald-600").replace("bg-amber-100", "text-amber-600"))} />
                  </CardTitle>
                  <CardDescription>{formatPercentage(equalizedOddsDifference * 100)} difference</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={(1 - equalizedOddsDifference / 0.15) * 100} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">Threshold: 15% • Status: {eoStatus.label}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Selection Rate Parity</span>
                    <srStatus.icon className={cn("h-4 w-4", srStatus.color.replace("bg-emerald-100", "text-emerald-600").replace("bg-amber-100", "text-amber-600"))} />
                  </CardTitle>
                  <CardDescription>{formatPercentage(maxSelectionGap * 100)} max gap</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={(1 - maxSelectionGap / 0.15) * 100} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">Threshold: 15% • Status: {srStatus.label}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Selection Rate by Demographic Group
                  <Badge variant="secondary">Debiased Model</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={selectionRateChartData}
                  xKey="group"
                  yKeys={["debiased"]}
                  colors={["#10b981"]}
                  height={280}
                  showLegend={false}
                />
                <div className="grid grid-cols-4 gap-4 mt-4 text-center">
                  {selectionRateChartData.map((d) => (
                    <div key={d.group} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-bold text-emerald-600">{formatPercentage(d.debiased)}</p>
                      <p className="text-sm text-muted-foreground">{d.group}</p>
                      <p className="text-xs text-muted-foreground">{d.count} candidates</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Debiasing reduced demographic parity gap</p>
                    <p className="text-sm text-emerald-700 mt-1">From 18% to 12% — below 20% threshold. Mitigation: removed proxy features (zip code, university prestige) from TF-IDF vocabulary.</p>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Slight accuracy trade-off</p>
                    <p className="text-sm text-amber-700 mt-1">Accuracy dropped from 82% to 80%. Precision decreased, recall improved. This is expected when optimizing for fairness.</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Selection rate parity needs monitoring</p>
                    <p className="text-sm text-blue-700 mt-1">Max gap 18% exceeds 15% threshold. Group C selected at 75%, Group B at 68%. Investigate feature correlations before deploying.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {Object.entries(metricExplanations).map(([key, explanation]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{explanation.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Formula</p>
                      <p className="font-mono text-sm bg-background p-2 rounded">{explanation.formula}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Threshold</p>
                      <p className="font-medium">{explanation.threshold}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-medium">
                        {key === "demographicParity" && formatPercentage(demographicParityDifference * 100)}
                        {key === "equalizedOdds" && formatPercentage(equalizedOddsDifference * 100)}
                        {key === "selectionRate" && formatPercentage(maxSelectionGap * 100)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">{explanation.description}</p>
                  <p className="text-sm text-muted-foreground"><strong>Interpretation:</strong> {explanation.interpretation}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance: Baseline vs. Debiased</CardTitle>
                <CardDescription>Debiased model removes proxy features (zip code, university names, graduation year) from TF-IDF vocabulary</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={metricComparisonData}
                  xKey="metric"
                  yKeys={["baseline", "debiased"]}
                  colors={["#64748b", "#10b981"]}
                  height={300}
                />
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">Baseline</TableHead>
                      <TableHead className="text-center">Debiased</TableHead>
                      <TableHead className="text-center">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metricComparisonData.map((row) => {
                      const change = row.debiased - row.baseline;
                      return (
                        <TableRow key={row.metric}>
                          <TableHead>{row.metric}</TableHead>
                          <TableCell className="text-center">{formatPercentage(row.baseline)}</TableCell>
                          <TableCell className="text-center">{formatPercentage(row.debiased)}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn("font-medium", change >= 0 ? "text-emerald-600" : "text-red-600")}>
                              {change >= 0 ? "+" : ""}{formatPercentage(change)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selection Rate by Group: Baseline vs. Debiased</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={selectionRateChartData}
                  xKey="group"
                  yKeys={["baseline", "debiased"]}
                  colors={["#ef4444", "#10b981"]}
                  height={280}
                />
                <p className="text-sm text-muted-foreground mt-3">
                  Red = Baseline model (with proxy features) • Green = Debiased model (proxy features removed)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group-Level Audit Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-center">Candidates</TableHead>
                      <TableHead className="text-center">Baseline Selection</TableHead>
                      <TableHead className="text-center">Debiased Selection</TableHead>
                      <TableHead className="text-center">Improvement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBiasAuditData.map((row) => (
                      <TableRow key={row.group}>
                        <TableHead>{row.group}</TableHead>
                        <TableCell className="text-center">{row.candidateCount}</TableCell>
                        <TableCell className="text-center">{formatPercentage(row.baselineSelectionRate * 100)}</TableCell>
                        <TableCell className="text-center">{formatPercentage(row.debiasedSelectionRate * 100)}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn("font-medium", row.debiasedSelectionRate >= row.baselineSelectionRate ? "text-emerald-600" : "text-red-600")}>
                            {row.debiasedSelectionRate >= row.baselineSelectionRate ? "+" : ""}
                            {formatPercentage((row.debiasedSelectionRate - row.baselineSelectionRate) * 100)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Important Limitations & Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2">This audit does NOT certify the model as "unbiased"</h4>
                  <p className="text-red-700 text-sm">
                    Improving one fairness metric (e.g., demographic parity) does not guarantee fairness across all dimensions.
                    Fairness is multidimensional and context-dependent. A model passing these thresholds may still exhibit bias in production.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    "Synthetic demographic groups — real-world groups require voluntary self-identification",
                    "Proxy feature removal is a weak mitigation; does not address structural bias in training data",
                    "Fairness metrics can conflict (e.g., demographic parity vs. equalized odds) — trade-offs require stakeholder alignment",
                    "Thresholds (20%, 15%) are heuristic; legal/regulatory requirements vary by jurisdiction",
                    "No assessment of intersectional bias (e.g., race × gender combinations)",
                    "Audit snapshot only — continuous monitoring required in production",
                    "Skill extraction uses exact matching; misses semantic equivalents",
                    "TF-IDF cannot capture contextual meaning or skill proficiency levels",
                  ].map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Minus className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{limitation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Recommended Next Steps for Production
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Collect voluntary demographic data at application time (with clear consent & purpose)",
                  "Establish fairness thresholds with legal, DEI, and engineering stakeholders",
                  "Implement continuous monitoring dashboard with alerting on metric drift",
                  "Document mitigation rationale and feature removal decisions per model version",
                  "Schedule quarterly bias audits minimum; more frequent for high-stakes hiring",
                  "Test for intersectional bias using subgroup analysis",
                  "Consider adversarial debiasing or reweighting for stronger mitigation",
                  "Maintain human-in-the-loop: AI scores inform, never auto-reject",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">{i + 1}</span>
                    <p className="text-sm text-blue-800">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Contents Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
{JSON.stringify({
  generatedAt: new Date().toISOString(),
  modelVersion: "v1.0.0-demo",
  dataSource: "Synthetic demo data (not production data)",
  fairnessMetrics: {
    demographicParityDifference,
    equalizedOddsDifference,
    selectionRateByGroup,
    maxSelectionGap,
  },
  modelPerformance: { baseline: baselineMetrics, debiased: debiasedMetrics },
  limitations: [
    "Metrics computed on synthetic data",
    "Demographic groups are simulated",
    "Proxy removal alone does not eliminate bias",
  ],
}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}