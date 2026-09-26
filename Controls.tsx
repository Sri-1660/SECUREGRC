import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import { frameworks } from "../data/frameworks";

import type {
  Control,
  ControlStatus,
} from "../types/grc";

const emptyControl: Control = {
  id: "",
  frameworkId: "iso-27001",
  controlId: "",
  name: "",
  description: "",
  category: "",
  owner: "",
  implementationStatus: "Not Implemented",
  evidenceRequired: true,
  riskIds: [],
};

const statusStyles: Record<ControlStatus, string> = {
  Implemented:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

  "Partially Implemented":
    "border-amber-500/20 bg-amber-500/10 text-amber-400",

  "Not Implemented":
    "border-red-500/20 bg-red-500/10 text-red-400",

  "Not Applicable":
    "border-slate-700 bg-slate-800/50 text-slate-400",
};

const frameworkStyles: Record<string, string> = {
  "iso-27001":
    "border-blue-500/20 bg-blue-500/10 text-blue-400",

  "nist-csf":
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",

  "cis-controls":
    "border-purple-500/20 bg-purple-500/10 text-purple-400",
};

export default function Controls() {
  const {
    controls,
    risks,
    setControls,
  } = useGRC();

  const [search, setSearch] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingControl, setEditingControl] =
    useState<Control | null>(null);

  const [form, setForm] = useState<Control>(emptyControl);

  const filteredControls = useMemo(() => {
    return controls.filter((control) => {
      const matchesSearch =
        control.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        control.controlId
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        control.owner
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFramework =
        frameworkFilter === "All" ||
        control.frameworkId === frameworkFilter;

      const matchesStatus =
        statusFilter === "All" ||
        control.implementationStatus === statusFilter;

      return (
        matchesSearch &&
        matchesFramework &&
        matchesStatus
      );
    });
  }, [
    controls,
    search,
    frameworkFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: controls.length,

      implemented: controls.filter(
        (c) => c.implementationStatus === "Implemented"
      ).length,

      partial: controls.filter(
        (c) =>
          c.implementationStatus ===
          "Partially Implemented"
      ).length,

      missing: controls.filter(
        (c) =>
          c.implementationStatus ===
          "Not Implemented"
      ).length,
    };
  }, [controls]);

  const getFramework = (frameworkId: string) => {
    return frameworks.find(
      (framework) => framework.id === frameworkId
    );
  };

  const openAddModal = () => {
    setEditingControl(null);

    setForm({
      ...emptyControl,
      id: `CTL-${String(controls.length + 1).padStart(
        3,
        "0"
      )}`,
    });

    setShowModal(true);
  };

  const openEditModal = (control: Control) => {
    setEditingControl(control);
    setForm({ ...control });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingControl(null);
    setForm(emptyControl);
  };

  const handleSave = () => {
    if (
      !form.name.trim() ||
      !form.controlId.trim() ||
      !form.owner.trim()
    ) {
      return;
    }

    if (editingControl) {
      setControls(
        controls.map((control) =>
          control.id === editingControl.id
            ? form
            : control
        )
      );
    } else {
      setControls([
        ...controls,
        {
          ...form,
          id:
            form.id ||
            `CTL-${String(controls.length + 1).padStart(
              3,
              "0"
            )}`,
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this control?"
    );

    if (!confirmed) return;

    setControls(
      controls.filter((control) => control.id !== id)
    );
  };

  const getRiskCount = (control: Control) => {
    return control.riskIds.length;
  };

  const getLinkedRiskNames = (control: Control) => {
    return control.riskIds
      .map(
        (riskId) =>
          risks.find((risk) => risk.id === riskId)?.title
      )
      .filter(Boolean);
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Controls Library
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage security controls, implementation
              status and risk mappings.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Add Control
        </button>

      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total Controls
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-100">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Implemented
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {stats.implemented}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Partially Implemented
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {stats.partial}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Not Implemented
          </p>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {stats.missing}
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
              placeholder="Search controls, IDs or owners..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
            />

          </div>

          {/* Framework */}
          <select
            value={frameworkFilter}
            onChange={(e) =>
              setFrameworkFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
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

            <option value="Implemented">
              Implemented
            </option>

            <option value="Partially Implemented">
              Partially Implemented
            </option>

            <option value="Not Implemented">
              Not Implemented
            </option>

            <option value="Not Applicable">
              Not Applicable
            </option>
          </select>

        </div>

      </div>

      {/* Controls Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">

        <div className="overflow-x-auto">

          <table className="w-full min-w-250 text-left">

            <thead className="border-b border-slate-800 bg-slate-950/70">

              <tr>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Control
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Framework
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Owner
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Risks
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Evidence
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {filteredControls.map((control) => {

                const framework =
                  getFramework(control.frameworkId);

                const linkedRisks =
                  getLinkedRiskNames(control);

                return (
                  <tr
                    key={control.id}
                    className="transition hover:bg-slate-800/30"
                  >

                    {/* Control */}
                    <td className="px-5 py-4">

                      <div>
                        <div className="font-medium text-slate-100">
                          {control.name}
                        </div>

                        <div className="mt-1 text-xs text-cyan-400">
                          {control.controlId}
                        </div>

                        <div className="mt-1 max-w-md text-xs text-slate-500">
                          {control.description}
                        </div>

                      </div>

                    </td>

                    {/* Framework */}
                    <td className="px-5 py-4">

                      {framework && (
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            frameworkStyles[
                              framework.id
                            ] ??
                            "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          {framework.name}
                        </span>
                      )}

                      <p className="mt-2 text-xs text-slate-500">
                        {control.category}
                      </p>

                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {control.owner}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          statusStyles[
                            control.implementationStatus
                          ]
                        }`}
                      >
                        {control.implementationStatus}
                      </span>

                    </td>

                    {/* Risks */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                          {getRiskCount(control)}
                        </span>

                        <span className="text-xs text-slate-500">
                          linked
                        </span>

                      </div>

                      {linkedRisks.length > 0 && (
                        <p
                          className="mt-2 max-w-48 truncate text-xs text-slate-600"
                          title={linkedRisks.join(", ")}
                        >
                          {linkedRisks.join(", ")}
                        </p>
                      )}

                    </td>

                    {/* Evidence */}
                    <td className="px-5 py-4">

                      {control.evidenceRequired ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400">
                          <FileCheck2 className="h-4 w-4" />
                          Required
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Optional
                        </span>
                      )}

                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(control)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                          title="Edit control"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(control.id)
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete control"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* Empty State */}
        {filteredControls.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <AlertCircle className="h-10 w-10 text-slate-600" />

            <h3 className="mt-4 font-medium text-slate-300">
              No controls found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {editingControl
                    ? "Edit Control"
                    : "Add Control"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure the security control and its
                  implementation status.
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

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6">

              <div className="grid gap-5 md:grid-cols-2">

                {/* Control ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Control ID
                  </label>

                  <input
                    value={form.controlId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        controlId: e.target.value,
                      })
                    }
                    placeholder="e.g. ISMS-ACCESS"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

                  <p className="mt-1 text-xs text-slate-600">
                    Internal application mapping ID.
                  </p>
                </div>

                {/* Framework */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Framework
                  </label>

                  <select
                    value={form.frameworkId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frameworkId: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
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

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Control Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter control name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Describe what this control is intended to achieve..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>

                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g. Access Control"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Owner */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Control Owner
                  </label>

                  <input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        owner: e.target.value,
                      })
                    }
                    placeholder="e.g. Security Team"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Implementation Status
                  </label>

                  <select
                    value={form.implementationStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        implementationStatus:
                          e.target.value as ControlStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >
                    <option value="Implemented">
                      Implemented
                    </option>

                    <option value="Partially Implemented">
                      Partially Implemented
                    </option>

                    <option value="Not Implemented">
                      Not Implemented
                    </option>

                    <option value="Not Applicable">
                      Not Applicable
                    </option>
                  </select>
                </div>

                {/* Evidence */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Evidence Requirement
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3">

                    <input
                      type="checkbox"
                      checked={form.evidenceRequired}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          evidenceRequired:
                            e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-cyan-500"
                    />

                    <span className="text-sm text-slate-300">
                      Evidence required
                    </span>

                  </label>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
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
                {editingControl
                  ? "Save Changes"
                  : "Create Control"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}