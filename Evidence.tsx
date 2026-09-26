import { useMemo, useState } from "react";
import {
  FileSearch,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileCheck2,
  Calendar,
  ShieldCheck,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";

import type { Evidence } from "../types/grc";

const emptyEvidence: Evidence = {
  id: "",
  name: "",
  relatedControlId: "",
  type: "Document",
  owner: "",
  uploadDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  status: "Valid",
  notes: "",
};

const evidenceTypes = [
  "Document",
  "Screenshot",
  "Configuration",
  "Report",
  "Log",
  "Policy",
  "Certificate",
  "Other",
];

const evidenceStatuses = [
  "Valid",
  "Expired",
  "Pending Review",
];

const statusStyles: Record<string, string> = {
  Valid:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

  Expired:
    "border-red-500/20 bg-red-500/10 text-red-400",

  "Pending Review":
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export default function Evidence() {
  const {
    evidence,
    setEvidence,
    controls,
  } = useGRC();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingEvidence, setEditingEvidence] =
    useState<Evidence | null>(null);

  const [form, setForm] =
    useState<Evidence>(emptyEvidence);

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const control = controls.find(
        (control) =>
          control.id === item.relatedControlId
      );

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.owner
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.type
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        control?.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        item.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    evidence,
    controls,
    search,
    typeFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: evidence.length,

      valid: evidence.filter(
        (item) => item.status === "Valid"
      ).length,

      pending: evidence.filter(
        (item) =>
          item.status === "Pending Review"
      ).length,

      expired: evidence.filter(
        (item) => item.status === "Expired"
      ).length,

      linked: evidence.filter(
        (item) => item.relatedControlId
      ).length,
    };
  }, [evidence]);

  const openAddModal = () => {
    setEditingEvidence(null);

    setForm({
      ...emptyEvidence,
      id: `EVD-${String(
        evidence.length + 1
      ).padStart(3, "0")}`,
      uploadDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowModal(true);
  };

  const openEditModal = (
    item: Evidence
  ) => {
    setEditingEvidence(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvidence(null);
    setForm(emptyEvidence);
  };

  const handleSave = () => {
    if (
      !form.name.trim() ||
      !form.owner.trim() ||
      !form.type
    ) {
      return;
    }

    if (editingEvidence) {
      setEvidence(
        evidence.map((item) =>
          item.id === editingEvidence.id
            ? form
            : item
        )
      );
    } else {
      setEvidence([
        ...evidence,
        {
          ...form,
          id:
            form.id ||
            `EVD-${String(
              evidence.length + 1
            ).padStart(3, "0")}`,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this evidence item?"
      );

    if (!confirmed) return;

    setEvidence(
      evidence.filter(
        (item) => item.id !== id
      )
    );
  };

  const getControlName = (
    controlId: string
  ) => {
    if (!controlId) {
      return "Unlinked";
    }

    return (
      controls.find(
        (control) =>
          control.id === controlId
      )?.name ?? "Unknown Control"
    );
  };

  const getControlId = (
    controlId: string
  ) => {
    if (!controlId) {
      return "";
    }

    return (
      controls.find(
        (control) =>
          control.id === controlId
      )?.controlId ?? ""
    );
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <FileSearch className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Evidence Repository
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage compliance evidence and control
              supporting documentation.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Add Evidence
        </button>

      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total Evidence
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-100">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Valid
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {stats.valid}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Pending Review
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Expired
          </p>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {stats.expired}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Linked to Controls
          </p>

          <p className="mt-2 text-2xl font-bold text-cyan-400">
            {stats.linked}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search evidence, owners or controls..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
            />

          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="All">
              All Types
            </option>

            {evidenceTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="All">
              All Statuses
            </option>

            {evidenceStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

        </div>

      </div>

      {/* Evidence Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">

        <div className="overflow-x-auto">

          <table className="w-full min-w-250 text-left">

            <thead className="border-b border-slate-800 bg-slate-950/70">

              <tr>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Evidence
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Type
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Linked Control
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Owner
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {filteredEvidence.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-800/30"
                  >

                    {/* Evidence */}
                    <td className="px-5 py-4">

                      <div className="flex items-start gap-3">

                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
                          <FileCheck2 className="h-4 w-4 text-cyan-400" />
                        </div>

                        <div className="max-w-sm">

                          <p className="font-medium text-slate-100">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.id}
                          </p>

                          {item.notes && (
                            <p className="mt-1 truncate text-xs text-slate-600">
                              {item.notes}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">

                      <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300">
                        {item.type}
                      </span>

                    </td>

                    {/* Control */}
                    <td className="px-5 py-4">

                      {item.relatedControlId ? (
                        <div>

                          <p className="max-w-52 text-sm text-slate-300">
                            {getControlName(
                              item.relatedControlId
                            )}
                          </p>

                          <p className="mt-1 text-xs text-cyan-400">
                            {getControlId(
                              item.relatedControlId
                            )}
                          </p>

                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Unlinked
                        </span>
                      )}

                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {item.owner}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">

                      <div className="space-y-1 text-xs">

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.uploadDate}
                        </div>

                        {item.expiryDate && (
                          <p className="text-slate-600">
                            Expires: {item.expiryDate}
                          </p>
                        )}

                      </div>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          statusStyles[
                            item.status
                          ] ??
                          "border-slate-700 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                          title="Edit evidence"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete evidence"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Empty State */}
        {filteredEvidence.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <FileSearch className="h-10 w-10 text-slate-600" />

            <h3 className="mt-4 font-medium text-slate-300">
              No evidence found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or add new evidence.
            </p>

          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

              <div>

                <h2 className="text-lg font-semibold text-slate-100">
                  {editingEvidence
                    ? "Edit Evidence"
                    : "Add Evidence"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Register evidence supporting a security control.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6">

              <div className="grid gap-5 md:grid-cols-2">

                {/* Evidence Name */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Evidence Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Quarterly Access Review Report"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

                </div>

                {/* Type */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Evidence Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    {evidenceTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Control */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Related Control
                  </label>

                  <select
                    value={form.relatedControlId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        relatedControlId:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    <option value="">
                      No linked control
                    </option>

                    {controls.map(
                      (control) => (
                        <option
                          key={control.id}
                          value={control.id}
                        >
                          {control.controlId} —{" "}
                          {control.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Owner */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Evidence Owner
                  </label>

                  <input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        owner: e.target.value,
                      })
                    }
                    placeholder="e.g. GRC Team"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

                </div>

                {/* Status */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Evidence["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    {evidenceStatuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Upload Date */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Evidence Date
                  </label>

                  <input
                    type="date"
                    value={form.uploadDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        uploadDate:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  />

                </div>

                {/* Expiry */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    value={form.expiryDate ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expiryDate:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  />

                </div>

                {/* Notes */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
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
                    rows={3}
                    placeholder="Add evidence description, review notes or source information..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {editingEvidence
                  ? "Save Changes"
                  : "Add Evidence"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Security Note */}
      <div className="mt-6 flex max-w-5xl items-start gap-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

        <div>
          <p className="text-sm font-medium text-cyan-300">
            Evidence management
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            This portfolio implementation stores evidence
            metadata locally. It does not upload sensitive
            organizational documents to an external service.
          </p>
        </div>

      </div>

    </div>
  );
}