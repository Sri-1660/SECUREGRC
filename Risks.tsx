import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ShieldAlert,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import { calculateRiskLevel } from "../lib/risk";

import type {
  Risk,
  RiskLevel,
  RiskTreatment,
  RiskStatus,
} from "../types/grc";

// ============================================================
// Empty Risk
// ============================================================

const emptyRisk: Risk = {
  id: "",
  title: "",
  description: "",
  assetId: "",
  threat: "",
  vulnerability: "",
  existingControl: "",
  riskOwner: "",
  likelihood: 3,
  impact: 3,
  inherentRisk: 9,
  inherentLevel: "Medium",
  treatment: "Mitigate",
  residualLikelihood: 2,
  residualImpact: 2,
  residualRisk: 4,
  residualLevel: "Low",
  status: "Open",
  targetDate: "",
};

// ============================================================
// Risk Register
// ============================================================

function Risks() {
  const {
    risks,
    assets,
    setRisks,
  } = useGRC();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingRisk, setEditingRisk] =
    useState<Risk | null>(null);

  const [formData, setFormData] =
    useState<Risk>(emptyRisk);

  // ==========================================================
  // Filtered Risks
  // ==========================================================

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const asset = assets.find(
        (item) => item.id === risk.assetId
      );

      const assetName =
        asset?.name ?? "";

      const matchesSearch =
        risk.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        risk.riskOwner
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        risk.threat
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        assetName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesLevel =
        levelFilter === "All" ||
        risk.inherentLevel === levelFilter;

      const matchesStatus =
        statusFilter === "All" ||
        risk.status === statusFilter;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesStatus
      );
    });
  }, [
    risks,
    assets,
    search,
    levelFilter,
    statusFilter,
  ]);

  // ==========================================================
  // Risk Statistics
  // ==========================================================

  const statistics = useMemo(() => {
    return {
      total: risks.length,

      critical: risks.filter(
        (risk) =>
          risk.inherentLevel === "Critical"
      ).length,

      high: risks.filter(
        (risk) =>
          risk.inherentLevel === "High"
      ).length,

      medium: risks.filter(
        (risk) =>
          risk.inherentLevel === "Medium"
      ).length,

      low: risks.filter(
        (risk) =>
          risk.inherentLevel === "Low"
      ).length,
    };
  }, [risks]);

  // ==========================================================
  // Open Add
  // ==========================================================

  const handleAdd = () => {
    const nextNumber =
      risks.length + 1;

    setEditingRisk(null);

    setFormData({
      ...emptyRisk,
      id: `RSK-${String(nextNumber).padStart(
        3,
        "0"
      )}`,
      assetId:
        assets.length > 0
          ? assets[0].id
          : "",
      targetDate:
        new Date(
          Date.now() +
            30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
    });

    setIsModalOpen(true);
  };

  // ==========================================================
  // Open Edit
  // ==========================================================

  const handleEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      ...risk,
    });

    setIsModalOpen(true);
  };

  // ==========================================================
  // Delete
  // ==========================================================

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this risk?"
    );

    if (!confirmed) {
      return;
    }

    setRisks(
      risks.filter(
        (risk) => risk.id !== id
      )
    );
  };

  // ==========================================================
  // Save
  // ==========================================================

  const handleSave = () => {
    if (!formData.title.trim()) {
      window.alert(
        "Risk title is required."
      );
      return;
    }

    if (!formData.assetId) {
      window.alert(
        "Please select an asset."
      );
      return;
    }

    const inherent =
      calculateRiskLevel(
        formData.likelihood,
        formData.impact
      );

    const residual =
      calculateRiskLevel(
        formData.residualLikelihood,
        formData.residualImpact
      );

    const updatedRisk: Risk = {
      ...formData,

      inherentRisk:
        inherent.score,

      inherentLevel:
        inherent.level,

      residualRisk:
        residual.score,

      residualLevel:
        residual.level,
    };

    if (editingRisk) {
      setRisks(
        risks.map((risk) =>
          risk.id === editingRisk.id
            ? updatedRisk
            : risk
        )
      );
    } else {
      setRisks([
        ...risks,
        updatedRisk,
      ]);
    }

    setIsModalOpen(false);
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="p-8">

      {/* ======================================================
          Header
      ====================================================== */}

      <div className="mb-8 flex items-start justify-between">

        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400">
            Risk Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Risk Register
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Identify, assess and manage organizational
            cybersecurity risks using likelihood,
            impact and residual-risk analysis.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={17} />
          Add Risk
        </button>

      </div>

      {/* ======================================================
          Statistics
      ====================================================== */}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

        <StatCard
          title="Total Risks"
          value={statistics.total}
          color="text-white"
        />

        <StatCard
          title="Critical"
          value={statistics.critical}
          color="text-red-400"
        />

        <StatCard
          title="High"
          value={statistics.high}
          color="text-orange-400"
        />

        <StatCard
          title="Medium"
          value={statistics.medium}
          color="text-amber-400"
        />

        <StatCard
          title="Low"
          value={statistics.low}
          color="text-emerald-400"
        />

      </div>

      {/* ======================================================
          Risk Matrix
      ====================================================== */}

      <RiskMatrix />

      {/* ======================================================
          Filters
      ====================================================== */}

      <div className="mb-6 mt-6 flex flex-col gap-3 lg:flex-row">

        <div className="relative flex-1">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search risks, assets, threats or owners..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
          />

        </div>

        <select
          value={levelFilter}
          onChange={(event) =>
            setLevelFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="All">
            All Risk Levels
          </option>

          <option value="Critical">
            Critical
          </option>

          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="All">
            All Status
          </option>

          <option value="Open">
            Open
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Closed">
            Closed
          </option>

          <option value="Accepted">
            Accepted
          </option>
        </select>

      </div>

      {/* ======================================================
          Risk Table
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">

        <div className="overflow-x-auto">

          <table className="w-full min-w-275 text-left">

            <thead className="border-b border-slate-800 bg-slate-950/60">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Risk
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Asset
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Likelihood
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Impact
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Inherent
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Residual
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Treatment
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {filteredRisks.map(
                (risk) => {
                  const asset =
                    assets.find(
                      (item) =>
                        item.id ===
                        risk.assetId
                    );

                  return (
                    <tr
                      key={risk.id}
                      className="transition hover:bg-slate-800/30"
                    >

                      {/* Risk */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                            <ShieldAlert
                              size={17}
                              className="text-red-400"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {risk.title}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {risk.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Asset */}

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {asset?.name ??
                          "Unknown Asset"}
                      </td>

                      {/* Likelihood */}

                      <td className="px-5 py-4 text-center">

                        <ScoreBadge
                          score={
                            risk.likelihood
                          }
                        />

                      </td>

                      {/* Impact */}

                      <td className="px-5 py-4 text-center">

                        <ScoreBadge
                          score={
                            risk.impact
                          }
                        />

                      </td>

                      {/* Inherent */}

                      <td className="px-5 py-4 text-center">

                        <RiskBadge
                          level={
                            risk.inherentLevel
                          }
                          score={
                            risk.inherentRisk
                          }
                        />

                      </td>

                      {/* Residual */}

                      <td className="px-5 py-4 text-center">

                        <RiskBadge
                          level={
                            risk.residualLevel
                          }
                          score={
                            risk.residualRisk
                          }
                        />

                      </td>

                      {/* Treatment */}

                      <td className="px-5 py-4 text-center">

                        <span className="text-xs text-slate-300">
                          {risk.treatment}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4 text-center">

                        <StatusBadge
                          status={
                            risk.status
                          }
                        />

                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              handleEdit(
                                risk
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-cyan-400"
                            title="Edit risk"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                risk.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                            title="Delete risk"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {filteredRisks.length === 0 && (
          <div className="p-12 text-center">

            <p className="text-sm text-slate-400">
              No risks found.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </div>

      {/* ======================================================
          Modal
      ====================================================== */}

      {isModalOpen && (
        <RiskModal
          risk={formData}
          assets={assets}
          editing={Boolean(
            editingRisk
          )}
          onChange={setFormData}
          onClose={() =>
            setIsModalOpen(false)
          }
          onSave={handleSave}
        />
      )}

    </div>
  );
}

// ============================================================
// Statistics Card
// ============================================================

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${color}`}
      >
        {value}
      </p>

    </div>
  );
}

// ============================================================
// Risk Badge
// ============================================================

function RiskBadge({
  level,
  score,
}: {
  level: RiskLevel;
  score: number;
}) {
  const styles: Record<
    RiskLevel,
    string
  > = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",

    High:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",

    Medium:
      "border-amber-500/30 bg-amber-500/10 text-amber-400",

    Low:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`inline-flex min-w-20 flex-col items-center rounded-lg border px-2.5 py-1.5 ${styles[level]}`}
    >
      <span className="text-xs font-semibold">
        {level}
      </span>

      <span className="text-[10px] opacity-70">
        Score: {score}
      </span>
    </span>
  );
}

// ============================================================
// Score Badge
// ============================================================

function ScoreBadge({
  score,
}: {
  score: number;
}) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200">
      {score}
    </span>
  );
}

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({
  status,
}: {
  status: RiskStatus;
}) {
  const styles: Record<
    RiskStatus,
    string
  > = {
    Open:
      "border-red-500/20 bg-red-500/10 text-red-400",

    "In Progress":
      "border-amber-500/20 bg-amber-500/10 text-amber-400",

    Closed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    Accepted:
      "border-slate-600 bg-slate-800 text-slate-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ============================================================
// Risk Matrix
// ============================================================

function RiskMatrix() {
  const { risks } = useGRC();

  const getCount = (
    likelihood: number,
    impact: number
  ) => {
    return risks.filter(
      (risk) =>
        risk.likelihood === likelihood &&
        risk.impact === impact
    ).length;
  };

  const getCellStyle = (
    likelihood: number,
    impact: number
  ) => {
    const score =
      likelihood * impact;

    if (score >= 17) {
      return "border-red-500/30 bg-red-500/10";
    }

    if (score >= 10) {
      return "border-orange-500/30 bg-orange-500/10";
    }

    if (score >= 5) {
      return "border-amber-500/30 bg-amber-500/10";
    }

    return "border-emerald-500/30 bg-emerald-500/10";
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">

      <div className="mb-5">

        <h2 className="text-lg font-semibold text-white">
          5 × 5 Risk Matrix
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Inherent risk distribution based on
          likelihood × impact.
        </p>

      </div>

      <div className="overflow-x-auto">

        <div className="min-w-130">

          <div className="mb-2 grid grid-cols-[100px_repeat(5,1fr)] gap-1">

            <div />

            {[1, 2, 3, 4, 5].map(
              (impact) => (
                <div
                  key={impact}
                  className="py-2 text-center text-xs font-medium text-slate-500"
                >
                  Impact {impact}
                </div>
              )
            )}

          </div>

          {[5, 4, 3, 2, 1].map(
            (likelihood) => (
              <div
                key={likelihood}
                className="grid grid-cols-[100px_repeat(5,1fr)] gap-1"
              >

                <div className="flex items-center justify-end pr-3 text-xs font-medium text-slate-500">
                  Likelihood {likelihood}
                </div>

                {[1, 2, 3, 4, 5].map(
                  (impact) => {
                    const count =
                      getCount(
                        likelihood,
                        impact
                      );

                    return (
                      <div
                        key={`${likelihood}-${impact}`}
                        className={`flex h-14 items-center justify-center rounded-md border ${getCellStyle(
                          likelihood,
                          impact
                        )}`}
                      >

                        <div className="text-center">

                          <p className="text-[10px] text-slate-500">
                            {likelihood *
                              impact}
                          </p>

                          {count > 0 && (
                            <p className="text-sm font-bold text-white">
                              {count}
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )
          )}

        </div>

      </div>

      <div className="mt-5 flex flex-wrap gap-4">

        <Legend
          label="Low"
          color="bg-emerald-500"
        />

        <Legend
          label="Medium"
          color="bg-amber-500"
        />

        <Legend
          label="High"
          color="bg-orange-500"
        />

        <Legend
          label="Critical"
          color="bg-red-500"
        />

      </div>

    </div>
  );
}

// ============================================================
// Legend
// ============================================================

function Legend({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span className="text-xs text-slate-400">
        {label}
      </span>

    </div>
  );
}

// ============================================================
// Risk Modal
// ============================================================

function RiskModal({
  risk,
  assets,
  editing,
  onChange,
  onClose,
  onSave,
}: {
  risk: Risk;
  assets: {
    id: string;
    name: string;
  }[];
  editing: boolean;
  onChange: (risk: Risk) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const update = (
    field: keyof Risk,
    value: string | number
  ) => {
    onChange({
      ...risk,
      [field]: value,
    });
  };

  const inherent =
    calculateRiskLevel(
      risk.likelihood,
      risk.impact
    );

  const residual =
    calculateRiskLevel(
      risk.residualLikelihood,
      risk.residualImpact
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

          <div>

            <h2 className="text-lg font-semibold text-white">
              {editing
                ? "Edit Risk"
                : "Add Risk"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Assess likelihood, impact,
              treatment and residual risk.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        {/* Form */}

        <div className="grid gap-5 p-6 md:grid-cols-2">

          {/* Title */}

          <FormField
            label="Risk Title"
            value={risk.title}
            onChange={(value) =>
              update(
                "title",
                value
              )
            }
            placeholder="e.g. Unauthorized Database Access"
          />

          {/* Asset */}

          <div>

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Related Asset
            </label>

            <select
              value={risk.assetId}
              onChange={(event) =>
                update(
                  "assetId",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >

              <option value="">
                Select asset
              </option>

              {assets.map(
                (asset) => (
                  <option
                    key={asset.id}
                    value={asset.id}
                  >
                    {asset.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* Threat */}

          <FormField
            label="Threat"
            value={risk.threat}
            onChange={(value) =>
              update(
                "threat",
                value
              )
            }
            placeholder="e.g. Credential compromise"
          />

          {/* Vulnerability */}

          <FormField
            label="Vulnerability"
            value={
              risk.vulnerability
            }
            onChange={(value) =>
              update(
                "vulnerability",
                value
              )
            }
            placeholder="e.g. Weak access controls"
          />

          {/* Owner */}

          <FormField
            label="Risk Owner"
            value={
              risk.riskOwner
            }
            onChange={(value) =>
              update(
                "riskOwner",
                value
              )
            }
            placeholder="e.g. Security Manager"
          />

          {/* Existing Control */}

          <FormField
            label="Existing Control"
            value={
              risk.existingControl
            }
            onChange={(value) =>
              update(
                "existingControl",
                value
              )
            }
            placeholder="e.g. MFA"
          />

          {/* Description */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Description
            </label>

            <textarea
              value={
                risk.description
              }
              onChange={(event) =>
                update(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Describe the risk..."
              className="w-full resize-none rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
            />

          </div>

          {/* ==================================================
              Inherent Risk
          ================================================== */}

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inherent Risk
            </p>

            <div className="grid grid-cols-2 gap-4">

              <NumberField
                label="Likelihood"
                value={
                  risk.likelihood
                }
                onChange={(value) =>
                  update(
                    "likelihood",
                    value
                  )
                }
              />

              <NumberField
                label="Impact"
                value={
                  risk.impact
                }
                onChange={(value) =>
                  update(
                    "impact",
                    value
                  )
                }
              />

            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4">

              <div>

                <p className="text-xs text-slate-500">
                  Calculated Risk
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {inherent.score}
                </p>

              </div>

              <RiskBadge
                level={
                  inherent.level
                }
                score={
                  inherent.score
                }
              />

            </div>

          </div>

          {/* ==================================================
              Residual Risk
          ================================================== */}

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Residual Risk
            </p>

            <div className="grid grid-cols-2 gap-4">

              <NumberField
                label="Residual Likelihood"
                value={
                  risk.residualLikelihood
                }
                onChange={(value) =>
                  update(
                    "residualLikelihood",
                    value
                  )
                }
              />

              <NumberField
                label="Residual Impact"
                value={
                  risk.residualImpact
                }
                onChange={(value) =>
                  update(
                    "residualImpact",
                    value
                  )
                }
              />

            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4">

              <div>

                <p className="text-xs text-slate-500">
                  Calculated Residual Risk
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {residual.score}
                </p>

              </div>

              <RiskBadge
                level={
                  residual.level
                }
                score={
                  residual.score
                }
              />

            </div>

          </div>

          {/* Treatment */}

          <div>

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Risk Treatment
            </label>

            <select
              value={
                risk.treatment
              }
              onChange={(event) =>
                update(
                  "treatment",
                  event.target
                    .value as RiskTreatment
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >

              <option value="Mitigate">
                Mitigate
              </option>

              <option value="Transfer">
                Transfer
              </option>

              <option value="Accept">
                Accept
              </option>

              <option value="Avoid">
                Avoid
              </option>

            </select>

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Risk Status
            </label>

            <select
              value={
                risk.status
              }
              onChange={(event) =>
                update(
                  "status",
                  event.target
                    .value as RiskStatus
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >

              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Closed">
                Closed
              </option>

              <option value="Accepted">
                Accepted
              </option>

            </select>

          </div>

          {/* Target Date */}

          <div>

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Target Date
            </label>

            <input
              type="date"
              value={
                risk.targetDate
              }
              onChange={(event) =>
                update(
                  "targetDate",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {editing
              ? "Save Changes"
              : "Create Risk"}
          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// Form Field
// ============================================================

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
      />

    </div>
  );
}

// ============================================================
// Number Field
// ============================================================

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label} (1–5)
      </label>

      <input
        type="number"
        min={1}
        max={5}
        value={value}
        onChange={(event) =>
          onChange(
            Math.min(
              5,
              Math.max(
                1,
                Number(
                  event.target.value
                )
              )
            )
          )
        }
        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
      />

    </div>
  );
}

// ============================================================
// Main Export
// ============================================================

export default Risks;