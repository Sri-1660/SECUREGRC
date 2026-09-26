import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import type { Remediation, RemediationStatus, RiskLevel } from "../types/grc";

type Priority = Remediation["priority"];

const emptyRemediation: Omit<Remediation, "id"> = {
  finding: "",
  risk: "Medium",
  recommendation: "",
  owner: "",
  priority: "Medium",
  dueDate: "",
  status: "Open",
  completionDate: "",
  notes: "",
};

const riskBadge: Record<RiskLevel, string> = {
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  High: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  Critical: "border-red-500/20 bg-red-500/10 text-red-400",
};

const statusBadge: Record<RemediationStatus, string> = {
  Open: "border-red-500/20 bg-red-500/10 text-red-400",
  "In Progress": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Blocked: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  Completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "Accepted Risk": "border-purple-500/20 bg-purple-500/10 text-purple-400",
};

const priorityBadge: Record<Priority, string> = {
  Low: "text-emerald-400",
  Medium: "text-amber-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};

export default function Remediation() {
  const { remediations, setRemediations } = useGRC();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemediation, setEditingRemediation] =
    useState<Remediation | null>(null);
  const [form, setForm] =
    useState<Omit<Remediation, "id">>(emptyRemediation);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isOverdue = (dueDate: string, status: RemediationStatus) => {
    if (!dueDate) return false;

    return (
      dueDate < today &&
      status !== "Completed" &&
      status !== "Accepted Risk"
    );
  };

  const filteredRemediations = useMemo(() => {
    return remediations.filter((item) => {
      const searchableText = [
        item.id,
        item.finding,
        item.recommendation,
        item.owner,
        item.notes,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesRisk =
        riskFilter === "All" || item.risk === riskFilter;

      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesPriority
      );
    });
  }, [
    remediations,
    search,
    statusFilter,
    riskFilter,
    priorityFilter,
  ]);

  const stats = useMemo(() => {
    const overdue = remediations.filter((item) =>
      isOverdue(item.dueDate, item.status),
    ).length;

    const upcoming = remediations.filter((item) => {
      if (!item.dueDate) return false;

      if (
        item.status === "Completed" ||
        item.status === "Accepted Risk"
      ) {
        return false;
      }

      const due = new Date(item.dueDate);
      const current = new Date(today);

      const difference =
        (due.getTime() - current.getTime()) /
        (1000 * 60 * 60 * 24);

      return difference >= 0 && difference <= 30;
    }).length;

    return {
      total: remediations.length,
      open: remediations.filter((item) => item.status === "Open").length,
      inProgress: remediations.filter(
        (item) => item.status === "In Progress",
      ).length,
      completed: remediations.filter(
        (item) => item.status === "Completed",
      ).length,
      overdue,
      upcoming,
    };
  }, [remediations, today]);

  const openAddModal = () => {
    setEditingRemediation(null);
    setForm({ ...emptyRemediation });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Remediation) => {
    setEditingRemediation(item);
    setForm({
      finding: item.finding,
      risk: item.risk,
      recommendation: item.recommendation,
      owner: item.owner,
      priority: item.priority,
      dueDate: item.dueDate,
      status: item.status,
      completionDate: item.completionDate,
      notes: item.notes,
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRemediation(null);
    setForm({ ...emptyRemediation });
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.finding.trim()) {
      setError("Finding is required.");
      return;
    }

    if (!form.owner.trim()) {
      setError("Owner is required.");
      return;
    }

    const normalizedForm = {
      ...form,
      finding: form.finding.trim(),
      recommendation: form.recommendation.trim(),
      owner: form.owner.trim(),
      notes: form.notes.trim(),
      completionDate:
        form.status === "Completed" && !form.completionDate
          ? today
          : form.completionDate,
    };

    if (editingRemediation) {
      const updated = remediations.map((item) =>
        item.id === editingRemediation.id
          ? {
              ...normalizedForm,
              id: editingRemediation.id,
            }
          : item,
      );

      setRemediations(updated);
    } else {
      const nextNumber =
        remediations.reduce((max, item) => {
          const match = item.id.match(/(\d+)$/);
          const number = match ? Number(match[1]) : 0;
          return Math.max(max, number);
        }, 0) + 1;

      const newItem: Remediation = {
        ...normalizedForm,
        id: `REM-${String(nextNumber).padStart(3, "0")}`,
      };

      setRemediations([...remediations, newItem]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Delete this remediation action?",
    );

    if (!confirmed) return;

    setRemediations(
      remediations.filter((item) => item.id !== id),
    );
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setRiskFilter("All");
    setPriorityFilter("All");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
              <CheckCircle2
                size={22}
                className="text-blue-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                Remediation Tracker
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Track remediation actions, deadlines, ownership and
                completion.
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
          Add Action
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-red-400">
            Open
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-400">
            {stats.open}
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-blue-400">
            In Progress
          </p>
          <p className="mt-2 text-3xl font-semibold text-blue-400">
            {stats.inProgress}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-emerald-400">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-400">
            {stats.completed}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-orange-400">
            Overdue
          </p>
          <p className="mt-2 text-3xl font-semibold text-orange-400">
            {stats.overdue}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-xs uppercase tracking-wider text-cyan-400">
            Next 30 Days
          </p>
          <p className="mt-2 text-3xl font-semibold text-cyan-400">
            {stats.upcoming}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search remediation actions..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
            <option value="Accepted Risk">Accepted Risk</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {(search ||
          statusFilter !== "All" ||
          riskFilter !== "All" ||
          priorityFilter !== "All") && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/70">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Action
                </th>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Finding
                </th>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Risk
                </th>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Owner
                </th>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Priority
                </th>
                <th className="px-5 py-4 font-medium text-slate-400">
                  Due Date
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
              {filteredRemediations.length === 0 ? (
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
                      No remediation actions found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRemediations.map((item) => {
                  const overdue = isOverdue(
                    item.dueDate,
                    item.status,
                  );

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-200">
                          {item.id}
                        </p>
                      </td>

                      <td className="max-w-65 px-5 py-4">
                        <p className="font-medium text-slate-300">
                          {item.finding}
                        </p>
                        {item.recommendation && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {item.recommendation}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs ${riskBadge[item.risk]}`}
                        >
                          {item.risk}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {item.owner}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-medium ${priorityBadge[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          {overdue && (
                            <Clock
                              size={14}
                              className="text-red-400"
                            />
                          )}

                          <span
                            className={
                              overdue
                                ? "text-red-400"
                                : "text-slate-400"
                            }
                          >
                            {item.dueDate || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs ${statusBadge[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                            title="Edit remediation"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete remediation"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingRemediation
                    ? "Edit Remediation"
                    : "Add Remediation Action"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Track the action required to resolve a GRC
                  finding.
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
              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Finding / Owner */}
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
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dueDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Finding */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Finding
                </label>

                <textarea
                  value={form.finding}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      finding: e.target.value,
                    })
                  }
                  required
                  rows={3}
                  placeholder="Describe the finding requiring remediation..."
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
                      recommendation: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Describe the remediation required..."
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
                        risk: e.target.value as RiskLevel,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
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
                        priority: e.target.value as Priority,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
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
                        status: e.target.value as RemediationStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                    <option value="Accepted Risk">
                      Accepted Risk
                    </option>
                  </select>
                </div>
              </div>

              {/* Completion Date */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Completion Date
                </label>

                <input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      completionDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Add implementation notes, evidence references or status updates..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                />
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
                  {editingRemediation
                    ? "Save Changes"
                    : "Create Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
