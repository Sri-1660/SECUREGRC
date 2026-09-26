import { useMemo } from "react";
import { useGRC } from "../context/GRCContext";

function Dashboard() {
  const {
    assets,
    risks,
    controls,
    complianceAssessments,
    gaps,
    remediations,
  } = useGRC();

  const dashboard = useMemo(() => {
    const criticalRisks = risks.filter(
      (risk) => risk.inherentLevel === "Critical"
    ).length;

    const highRisks = risks.filter(
      (risk) => risk.inherentLevel === "High"
    ).length;

    const mediumRisks = risks.filter(
      (risk) => risk.inherentLevel === "Medium"
    ).length;

    const lowRisks = risks.filter(
      (risk) => risk.inherentLevel === "Low"
    ).length;

    const averageRisk =
      risks.length > 0
        ? Math.round(
            risks.reduce(
              (total, risk) =>
                total + risk.inherentRisk,
              0
            ) / risks.length
          )
        : 0;

    const implementedControls = controls.filter(
      (control) =>
        control.implementationStatus ===
        "Implemented"
    ).length;

    const partialControls = controls.filter(
      (control) =>
        control.implementationStatus ===
        "Partially Implemented"
    ).length;

    const notImplementedControls = controls.filter(
      (control) =>
        control.implementationStatus ===
        "Not Implemented"
    ).length;

    const applicableAssessments =
      complianceAssessments.filter(
        (assessment) =>
          assessment.status !== "Not Applicable"
      );

    const compliantAssessments =
      applicableAssessments.filter(
        (assessment) =>
          assessment.status === "Compliant"
      );

    const compliancePercentage =
      applicableAssessments.length > 0
        ? Math.round(
            (compliantAssessments.length /
              applicableAssessments.length) *
              100
          )
        : 0;

    return {
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      averageRisk,
      implementedControls,
      partialControls,
      notImplementedControls,
      compliancePercentage,
      openGaps: gaps.filter(
        (gap) => gap.status !== "Closed"
      ).length,
      openRemediations: remediations.filter(
        (item) =>
          item.status === "Open" ||
          item.status === "In Progress"
      ).length,
      completedRemediations: remediations.filter(
        (item) => item.status === "Completed"
      ).length,
      totalAssets: assets.length,
      totalRisks: risks.length,
      totalControls: controls.length,
    };
  }, [
    assets,
    risks,
    controls,
    complianceAssessments,
    gaps,
    remediations,
  ]);

  return (
    <div className="p-8">

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-cyan-400">
          Security Posture
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Security & Compliance Overview
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Monitor organizational risk, control effectiveness,
          compliance posture and remediation progress.
        </p>
      </div>

      {/* KPI Cards */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Average Risk"
          value={dashboard.averageRisk}
          description={`${dashboard.totalRisks} registered risks`}
          valueClass="text-white"
        />

        <KpiCard
          title="Critical Risks"
          value={dashboard.criticalRisks}
          description="High priority risk items"
          valueClass="text-red-400"
        />

        <KpiCard
          title="Compliance"
          value={`${dashboard.compliancePercentage}%`}
          description="Across assessed requirements"
          valueClass="text-cyan-400"
        />

        <KpiCard
          title="Open Gaps"
          value={dashboard.openGaps}
          description="Requiring remediation"
          valueClass="text-orange-400"
        />

      </div>

      {/* Risk + Controls */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">

          <h2 className="text-lg font-semibold text-white">
            Risk Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current inherent risk levels
          </p>

          <div className="mt-6 space-y-4">

            <RiskBar
              label="Critical"
              count={dashboard.criticalRisks}
              total={dashboard.totalRisks}
              color="bg-red-500"
            />

            <RiskBar
              label="High"
              count={dashboard.highRisks}
              total={dashboard.totalRisks}
              color="bg-orange-500"
            />

            <RiskBar
              label="Medium"
              count={dashboard.mediumRisks}
              total={dashboard.totalRisks}
              color="bg-amber-500"
            />

            <RiskBar
              label="Low"
              count={dashboard.lowRisks}
              total={dashboard.totalRisks}
              color="bg-emerald-500"
            />

          </div>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">

          <h2 className="text-lg font-semibold text-white">
            Control Effectiveness
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current implementation status
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">

            <StatusCard
              label="Implemented"
              value={dashboard.implementedControls}
              color="text-emerald-400"
            />

            <StatusCard
              label="Partial"
              value={dashboard.partialControls}
              color="text-amber-400"
            />

            <StatusCard
              label="Not Implemented"
              value={dashboard.notImplementedControls}
              color="text-red-400"
            />

          </div>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-4">

            <div className="flex justify-between">
              <span className="text-xs text-slate-500">
                Total Controls
              </span>

              <span className="text-sm font-semibold text-white">
                {dashboard.totalControls}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Summary */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        <SummaryCard
          title="Assets"
          value={dashboard.totalAssets}
          description="Registered organizational assets"
        />

        <SummaryCard
          title="Open Remediation"
          value={dashboard.openRemediations}
          description="Actions requiring attention"
        />

        <SummaryCard
          title="Completed Remediation"
          value={dashboard.completedRemediations}
          description="Successfully completed actions"
        />

      </div>

    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  valueClass,
}: {
  title: string;
  value: string | number;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className={`mt-3 text-3xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

function RiskBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="text-sm text-slate-300">
          {label}
        </span>

        <span className="text-sm font-semibold text-white">
          {count}
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-center">

      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {label}
      </p>

    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default Dashboard;