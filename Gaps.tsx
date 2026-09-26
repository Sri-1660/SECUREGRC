import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import { frameworks } from "../data/frameworks";
import type { Gap, RiskLevel } from "../types/grc";

const emptyGap: Omit<Gap, "id"> = {
  frameworkId: "iso-27001",
  controlId: "",
  currentState: "",
  requiredState: "",
  description: "",
  risk: "Medium",
  businessImpact: "",
  recommendation: "",
  owner: "",
  priority: "Medium",
  targetDate: "",
  status: "Open",
};

const riskBadge: Record<RiskLevel, string> = {
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  High: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  Critical: "border-red-500/20 bg-red-500/10 text-red-400",
};

const statusBadge: Record<Gap["status"], string> = {
  Open: "border-red-500/20 bg-red-500/10 text-red-400",
  "In Progress":
    "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Closed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

export default function Gaps() {
  const { gaps, controls, setGaps } = useGRC();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGap, setEditingGap] = useState<Gap | null>(null);

  const [form, setForm] =
    useState<Omit<Gap, "id">>(emptyGap);

  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      const framework = frameworks.find(
        (item) => item.id === gap.frameworkId
      );

      const control = controls.find(
        (item) => item.id === gap.controlId
      );

      const searchableText = [
        gap.id,
        gap.description,
        gap.currentState,
        gap.requiredState,
        gap.businessImpact,
        gap.recommendation,
        gap.owner,
        framework?.name ?? "",
        control?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(search.toLowerCase());

      const matchesRisk =
        riskFilter === "All" ||
        gap.risk === riskFilter;

      const matchesStatus =
        statusFilter === "All" ||
        gap.status === statusFilter;

      const matchesFramework =
        frameworkFilter === "All" ||
        gap.frameworkId === frameworkFilter;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus &&
        matchesFramework
      );
    });
  }, [
    gaps,
    controls,
    search,
    riskFilter,
    statusFilter,
    frameworkFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: gaps.length,

      critical: gaps.filter(
        (gap) => gap.risk === "Critical"
      ).length,

      high: gaps.filter(
        (gap) => gap.risk === "High"
      ).length,

      open: gaps.filter(
        (gap) =>
          gap.status === "Open" ||
          gap.status === "In Progress"
      ).length,

      closed: gaps.filter(
        (gap) => gap.status === "Closed"
      ).length,
    };
  }, [gaps]);

  const getFrameworkName = (frameworkId: string) => {
    return (
      frameworks.find(
        (framework) => framework.id === frameworkId
      )?.name ?? frameworkId
    );
  };

  const getControlName = (controlId: string) => {
    return (
      controls.find(
        (control) => control.id === controlId
      )?.name ?? "Unmapped Control"
    );
  };

  const openAddModal = () => {
    setEditingGap(null);
    setForm({ ...emptyGap });
    setIsModalOpen(true);
  };

  const openEditModal = (gap: Gap) => {
    setEditingGap(gap);

    setForm({
      frameworkId: gap.frameworkId,
      controlId: gap.controlId,
      currentState: gap.currentState,
      requiredState: gap.requiredState,
      description: gap.description,
      risk: gap.risk,
      businessImpact: gap.businessImpact,
      recommendation: gap.recommendation,
      owner: gap.owner,
      priority: gap.priority,
      targetDate: gap.targetDate,
      status: gap.status,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGap(null);
    setForm({ ...emptyGap });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (
      !form.description.trim() ||
      !form.owner.trim()
    ) {
      return;
    }

    if (editingGap) {
      const updatedGaps = gaps.map((gap) =>
        gap.id === editingGap.id
          ? {
              ...form,
              id: editingGap.id,
            }
          : gap
      );

      setGaps(updatedGaps);
    } else {
      const newGap: Gap = {
        ...form,
        id: `GAP-${String(gaps.length + 1).padStart(
          3,
          "0"
        )}`,
      };

      setGaps([...gaps, newGap]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Delete this GRC gap?"
    );

    if (!confirmed) {
      return;
    }

    setGaps(
      gaps.filter((gap) => gap.id !== id)
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
              <AlertTriangle
                size={22}
                className="text-amber-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Gap Analysis
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Identify control deficiencies and
                compliance gaps across security
                frameworks.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Add Gap
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total Gaps
          </p>

          <p className="mt-2 text-3xl font-semibold text-white">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-red-400">
            Critical
          </p>

          <p className="mt-2 text-3xl font-semibold text-red-400">
            {stats.critical}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-orange-400">
            High Risk
          </p>

          <p className="mt-2 text-3xl font-semibold text-orange-400">
            {stats.high}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-blue-400">
            Open / Active
          </p>

          <p className="mt-2 text-3xl font-semibold text-blue-400">
            {stats.open}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-emerald-400">
            Closed
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-400">
            {stats.closed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search gaps..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          <select
            value={frameworkFilter}
            onChange={(e) =>
              setFrameworkFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">
              All Frameworks
            </option>

            {frameworks.map((framework) => (
              <option
                key={framework.id}
                value={framework.id}
              >
                {framework.name}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">
              All Risk Levels
            </option>
            <option value="Critical">
              Critical
            </option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">
              All Statuses
            </option>
            <option value="Open">Open</option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/70">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Gap
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Framework
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Control
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Risk
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Owner
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Target Date
                </th>

                <th className="px-5 py-4 font-medium text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-right font-medium text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredGaps.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <AlertTriangle
                      size={28}
                      className="mx-auto mb-3 text-slate-600"
                    />

                    <p className="text-sm text-slate-400">
                      No gaps found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGaps.map((gap) => (
                  <tr
                    key={gap.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="max-w-65 px-5 py-4">
                      <p className="font-medium text-slate-200">
                        {gap.id}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {gap.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
                        {getFrameworkName(
                          gap.frameworkId
                        )}
                      </span>
                    </td>

                    <td className="max-w-55 px-5 py-4 text-xs text-slate-400">
                      {getControlName(gap.controlId)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md border px-2 py-1 text-xs ${riskBadge[gap.risk]}`}
                      >
                        {gap.risk}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {gap.owner}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {gap.targetDate || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md border px-2 py-1 text-xs ${statusBadge[gap.status]}`}
                      >
                        {gap.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(gap)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                          title="Edit gap"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(gap.id)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete gap"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingGap
                    ? "Edit Gap"
                    : "Add Compliance Gap"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Document the deficiency and
                  required remediation.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              {/* Framework / Control */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Framework
                  </label>

                  <select
                    value={form.frameworkId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frameworkId:
                          e.target.value,
                        controlId: "",
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    {frameworks.map((framework) => (
                      <option
                        key={framework.id}
                        value={framework.id}
                      >
                        {framework.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Related Control
                  </label>

                  <select
                    value={form.controlId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        controlId:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="">
                      Select control
                    </option>

                    {controls
                      .filter(
                        (control) =>
                          control.frameworkId ===
                          form.frameworkId
                      )
                      .map((control) => (
                        <option
                          key={control.id}
                          value={control.id}
                        >
                          {control.controlId} —{" "}
                          {control.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Current / Required */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Current State
                  </label>

                  <textarea
                    value={form.currentState}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currentState:
                          e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Describe the current control state..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Required State
                  </label>

                  <textarea
                    value={form.requiredState}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        requiredState:
                          e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Describe the required state..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Gap Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  rows={3}
                  required
                  placeholder="Describe the compliance or security deficiency..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>

              {/* Risk / Priority / Status */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Risk
                  </label>

                  <select
                    value={form.risk}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        risk: e.target
                          .value as RiskLevel,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority:
                          e.target
                            .value as Gap["priority"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target
                            .value as Gap["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
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
                  </select>
                </div>
              </div>

              {/* Business Impact */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Business Impact
                </label>

                <textarea
                  value={form.businessImpact}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      businessImpact:
                        e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Explain the business, security, compliance or operational impact..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Recommendation
                </label>

                <textarea
                  value={form.recommendation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      recommendation:
                        e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Describe the recommended remediation..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>

              {/* Owner / Target Date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Owner
                  </label>

                  <input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        owner: e.target.value,
                      })
                    }
                    required
                    placeholder="e.g. Security Team"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Target Date
                  </label>

                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        targetDate:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                >
                  {editingGap
                    ? "Save Changes"
                    : "Create Gap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}