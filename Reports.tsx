import { useMemo } from "react";
import {
  FileBarChart,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Wrench,
  FileText,
  Printer,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useGRC } from "../context/GRCContext";

const riskColors: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const controlColors: Record<string, string> = {
  Implemented: "#22c55e",
  Partial: "#eab308",
  "Not Implemented": "#ef4444",
  "N/A": "#64748b",
};

const auditColors: Record<string, string> = {
  Pass: "#22c55e",
  Partial: "#eab308",
  Fail: "#ef4444",
  "Not Tested": "#64748b",
};

export default function Reports() {
  const {
    assets,
    risks,
    controls,
    complianceAssessments,
    gaps,
    remediations,
    audits,
    policies,
  } = useGRC();

  // ============================================================
  // RISK SUMMARY
  // ============================================================

  const riskSummary = useMemo(() => {
    return {
      critical: risks.filter(
        (r) => r.inherentLevel === "Critical"
      ).length,

      high: risks.filter(
        (r) => r.inherentLevel === "High"
      ).length,

      medium: risks.filter(
        (r) => r.inherentLevel === "Medium"
      ).length,

      low: risks.filter(
        (r) => r.inherentLevel === "Low"
      ).length,
    };
  }, [risks]);

  const riskChartData = [
    {
      name: "Critical",
      value: riskSummary.critical,
    },
    {
      name: "High",
      value: riskSummary.high,
    },
    {
      name: "Medium",
      value: riskSummary.medium,
    },
    {
      name: "Low",
      value: riskSummary.low,
    },
  ];

  // ============================================================
  // CONTROL SUMMARY
  // ============================================================

  const controlSummary = useMemo(() => {
    return {
      implemented: controls.filter(
        (c) =>
          c.implementationStatus === "Implemented"
      ).length,

      partial: controls.filter(
        (c) =>
          c.implementationStatus ===
          "Partially Implemented"
      ).length,

      notImplemented: controls.filter(
        (c) =>
          c.implementationStatus ===
          "Not Implemented"
      ).length,

      notApplicable: controls.filter(
        (c) =>
          c.implementationStatus ===
          "Not Applicable"
      ).length,
    };
  }, [controls]);

  const controlChartData = [
    {
      name: "Implemented",
      value: controlSummary.implemented,
    },
    {
      name: "Partial",
      value: controlSummary.partial,
    },
    {
      name: "Not Implemented",
      value: controlSummary.notImplemented,
    },
    {
      name: "N/A",
      value: controlSummary.notApplicable,
    },
  ];

  // ============================================================
  // COMPLIANCE SUMMARY
  // ============================================================

  const complianceSummary = useMemo(() => {
    if (complianceAssessments.length === 0) {
      return {
        compliant: 0,
        partial: 0,
        nonCompliant: 0,
        notApplicable: 0,
        percentage: 0,
      };
    }

    const compliant = complianceAssessments.filter(
      (c) => c.status === "Compliant"
    ).length;

    const partial = complianceAssessments.filter(
      (c) => c.status === "Partially Compliant"
    ).length;

    const nonCompliant = complianceAssessments.filter(
      (c) => c.status === "Non-Compliant"
    ).length;

    const notApplicable = complianceAssessments.filter(
      (c) => c.status === "Not Applicable"
    ).length;

    const applicable =
      complianceAssessments.length - notApplicable;

    const percentage =
      applicable > 0
        ? Math.round(
            ((compliant + partial * 0.5) /
              applicable) *
              100
          )
        : 0;

    return {
      compliant,
      partial,
      nonCompliant,
      notApplicable,
      percentage,
    };
  }, [complianceAssessments]);

  // ============================================================
  // GAP SUMMARY
  // ============================================================

  const gapSummary = useMemo(() => {
    return {
      open: gaps.filter(
        (g) => g.status === "Open"
      ).length,

      inProgress: gaps.filter(
        (g) => g.status === "In Progress"
      ).length,

      closed: gaps.filter(
        (g) => g.status === "Closed"
      ).length,
    };
  }, [gaps]);

  // ============================================================
  // REMEDIATION SUMMARY
  // ============================================================

  const remediationSummary = useMemo(() => {
    return {
      open: remediations.filter(
        (r) => r.status === "Open"
      ).length,

      inProgress: remediations.filter(
        (r) => r.status === "In Progress"
      ).length,

      blocked: remediations.filter(
        (r) => r.status === "Blocked"
      ).length,

      completed: remediations.filter(
        (r) => r.status === "Completed"
      ).length,

      acceptedRisk: remediations.filter(
        (r) => r.status === "Accepted Risk"
      ).length,
    };
  }, [remediations]);

  // ============================================================
  // AUDIT SUMMARY
  // ============================================================

  const auditSummary = useMemo(() => {
    return {
      pass: audits.filter(
        (a) => a.status === "Pass"
      ).length,

      partial: audits.filter(
        (a) => a.status === "Partial"
      ).length,

      fail: audits.filter(
        (a) => a.status === "Fail"
      ).length,

      notTested: audits.filter(
        (a) => a.status === "Not Tested"
      ).length,
    };
  }, [audits]);

  const auditChartData = [
    {
      name: "Pass",
      value: auditSummary.pass,
    },
    {
      name: "Partial",
      value: auditSummary.partial,
    },
    {
      name: "Fail",
      value: auditSummary.fail,
    },
    {
      name: "Not Tested",
      value: auditSummary.notTested,
    },
  ];

  // ============================================================
  // EXECUTIVE RISK SCORE
  // ============================================================

  const overallRiskScore = useMemo(() => {
    if (risks.length === 0) {
      return 0;
    }

    const total = risks.reduce(
      (sum, risk) => sum + risk.inherentRisk,
      0
    );

    return Math.round(total / risks.length);
  }, [risks]);

  const overallRiskLevel =
    overallRiskScore >= 17
      ? "Critical"
      : overallRiskScore >= 10
      ? "High"
      : overallRiskScore >= 5
      ? "Medium"
      : "Low";

  // ============================================================
  // FRAMEWORK COMPLIANCE
  // ============================================================

  const frameworkData = useMemo(() => {
    const grouped: Record<
      string,
      {
        total: number;
        compliant: number;
        partial: number;
        nonCompliant: number;
        notApplicable: number;
      }
    > = {};

    complianceAssessments.forEach(
      (assessment) => {
        const framework =
          assessment.frameworkId;

        if (!grouped[framework]) {
          grouped[framework] = {
            total: 0,
            compliant: 0,
            partial: 0,
            nonCompliant: 0,
            notApplicable: 0,
          };
        }

        grouped[framework].total += 1;

        if (
          assessment.status ===
          "Compliant"
        ) {
          grouped[framework].compliant += 1;
        }

        if (
          assessment.status ===
          "Partially Compliant"
        ) {
          grouped[framework].partial += 1;
        }

        if (
          assessment.status ===
          "Non-Compliant"
        ) {
          grouped[framework].nonCompliant += 1;
        }

        if (
          assessment.status ===
          "Not Applicable"
        ) {
          grouped[framework].notApplicable += 1;
        }
      }
    );

    return Object.entries(grouped).map(
      ([framework, data]) => {
        const applicable =
          data.total - data.notApplicable;

        const compliance =
          applicable > 0
            ? Math.round(
                ((data.compliant +
                  data.partial * 0.5) /
                  applicable) *
                  100
              )
            : 0;

        return {
          framework,
          compliance,
        };
      }
    );
  }, [complianceAssessments]);

  // ============================================================
  // PRINT
  // ============================================================

  function printReport() {
    window.print();
  }

  return (
    <div className="p-6 space-y-6 print:bg-white print:text-black">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 print:hidden">
              <FileBarChart className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white print:text-black">
                GRC Reports
              </h1>

              <p className="text-sm text-slate-400 print:text-slate-600 mt-1">
                Executive summary of organizational risk,
                compliance, controls and remediation.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={printReport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* ======================================================
          EXECUTIVE SUMMARY
      ====================================================== */}

      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 print:bg-white print:border-slate-300">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-cyan-400 print:text-black" />

          <h2 className="text-lg font-semibold text-white print:text-black">
            Executive Risk Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Overall Risk"
            value={overallRiskLevel}
            subtitle={`Average score: ${overallRiskScore}`}
            icon={
              <ShieldAlert className="w-5 h-5" />
            }
          />

          <SummaryCard
            title="Assets"
            value={assets.length}
            subtitle="Registered assets"
            icon={
              <FileText className="w-5 h-5" />
            }
          />

          <SummaryCard
            title="Compliance"
            value={`${complianceSummary.percentage}%`}
            subtitle="Overall assessment"
            icon={
              <CheckCircle2 className="w-5 h-5" />
            }
          />

          <SummaryCard
            title="Open Gaps"
            value={gapSummary.open}
            subtitle="Require attention"
            icon={
              <AlertTriangle className="w-5 h-5" />
            }
          />
        </div>
      </section>

      {/* ======================================================
          RISK + CONTROLS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ReportCard
          title="Risk Distribution"
          icon={
            <ShieldAlert className="w-5 h-5" />
          }
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={riskChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {riskChartData.map((entry, index) => (
  <Cell
    key={`risk-${index}`}
    fill={riskColors[entry.name]}
  />
))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>

        <ReportCard
          title="Control Implementation"
          icon={
            <CheckCircle2 className="w-5 h-5" />
          }
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={controlChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                  }}
                />

                <Bar
  dataKey="value"
  radius={[6, 6, 0, 0]}
>
  {controlChartData.map((entry, index) => (
    <Cell
      key={`control-${index}`}
      fill={controlColors[entry.name]}
    />
  ))}
</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </div>

      {/* ======================================================
          FRAMEWORK COMPLIANCE
      ====================================================== */}

      <ReportCard
        title="Framework Compliance"
        icon={
          <CheckCircle2 className="w-5 h-5" />
        }
      >
        <div className="space-y-5">
          {frameworkData.length === 0 ? (
            <p className="text-sm text-slate-500">
              No compliance assessment data
              available.
            </p>
          ) : (
            frameworkData.map((item) => (
              <div key={item.framework}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    {item.framework}
                  </span>

                  <span className="text-sm font-semibold text-cyan-400">
                    {item.compliance}%
                  </span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${item.compliance}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ReportCard>

      {/* ======================================================
          GAP + REMEDIATION
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ReportCard
          title="Gap Analysis"
          icon={
            <AlertTriangle className="w-5 h-5" />
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <MiniMetric
              label="Open"
              value={gapSummary.open}
            />

            <MiniMetric
              label="In Progress"
              value={gapSummary.inProgress}
            />

            <MiniMetric
              label="Closed"
              value={gapSummary.closed}
            />
          </div>
        </ReportCard>

        <ReportCard
          title="Remediation Status"
          icon={
            <Wrench className="w-5 h-5" />
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniMetric
              label="Open"
              value={remediationSummary.open}
            />

            <MiniMetric
              label="Progress"
              value={remediationSummary.inProgress}
            />

            <MiniMetric
              label="Blocked"
              value={remediationSummary.blocked}
            />

            <MiniMetric
              label="Completed"
              value={remediationSummary.completed}
            />

            <MiniMetric
              label="Accepted"
              value={remediationSummary.acceptedRisk}
            />
          </div>
        </ReportCard>
      </div>

      {/* ======================================================
          AUDITS
      ====================================================== */}

      <ReportCard
        title="Internal Audit Results"
        icon={
          <ClipboardCheck className="w-5 h-5" />
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div className="h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={auditChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {auditChartData.map((entry, index) => (
  <Cell
    key={`audit-${index}`}
    fill={auditColors[entry.name]}
  />
))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 content-center">
            <MiniMetric
              label="Passed"
              value={auditSummary.pass}
            />

            <MiniMetric
              label="Partial"
              value={auditSummary.partial}
            />

            <MiniMetric
              label="Failed"
              value={auditSummary.fail}
            />

            <MiniMetric
              label="Not Tested"
              value={auditSummary.notTested}
            />
          </div>
        </div>
      </ReportCard>

      {/* ======================================================
          POLICIES
      ====================================================== */}

      <ReportCard
        title="Policy Status"
        icon={
          <FileText className="w-5 h-5" />
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <MiniMetric
            label="Total"
            value={policies.length}
          />

          <MiniMetric
            label="Active"
            value={
              policies.filter(
                (p) => p.status === "Active"
              ).length
            }
          />

          <MiniMetric
            label="Review"
            value={
              policies.filter(
                (p) =>
                  p.status === "Under Review"
              ).length
            }
          />

          <MiniMetric
            label="Draft"
            value={
              policies.filter(
                (p) => p.status === "Draft"
              ).length
            }
          />
        </div>
      </ReportCard>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="text-xs text-slate-500 text-center py-4 print:text-black">
        FinSecure Technologies • SecureGRC •
        Educational GRC Assessment Report
      </div>
    </div>
  );
}

// ============================================================
// REPORT CARD
// ============================================================

function ReportCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 print:bg-white print:border-slate-300">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-cyan-400 print:text-black">
          {icon}
        </span>

        <h2 className="text-lg font-semibold text-white print:text-black">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 print:bg-white print:border-slate-300">
      <div className="flex justify-between items-start">

        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">
            {title}
          </p>

          <p className="text-2xl font-bold text-white print:text-black mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 print:hidden">
          {icon}
        </div>

      </div>
    </div>
  );
}

// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 print:bg-white print:border-slate-300">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="text-xl font-bold text-white print:text-black mt-1">
        {value}
      </p>
    </div>
  );
}