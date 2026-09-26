import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import { frameworks } from "../data/frameworks";
import { frameworkRequirements } from "../data/frameworkRequirements";

import type {
  ComplianceAssessment,
  ComplianceStatus,
  RiskLevel,
} from "../types/grc";

const emptyAssessment: ComplianceAssessment = {
  id: "",
  frameworkId: "nist-csf",
  controlId: "",
  requirement: "",
  status: "Non-Compliant",
  evidenceIds: [],
  gap: "",
  risk: "Medium",
  owner: "",
  comments: "",
};

const statusStyles: Record<ComplianceStatus, string> = {
  Compliant:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

  "Partially Compliant":
    "border-amber-500/20 bg-amber-500/10 text-amber-400",

  "Non-Compliant":
    "border-red-500/20 bg-red-500/10 text-red-400",

  "Not Applicable":
    "border-slate-700 bg-slate-800/50 text-slate-400",
};

export default function Compliance() {
  const {
    complianceAssessments,
    setComplianceAssessments,
    controls,
    evidence,
  } = useGRC();

  const [search, setSearch] = useState("");
  const [frameworkFilter, setFrameworkFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingAssessment, setEditingAssessment] =
    useState<ComplianceAssessment | null>(null);

  const [form, setForm] =
    useState<ComplianceAssessment>(emptyAssessment);

  /*
   * Framework requirements currently available
   * in the project.
   */
  const availableRequirements =
    frameworkRequirements.filter(
      (requirement) =>
        form.frameworkId === "All" ||
        requirement.frameworkId === form.frameworkId
    );

  const filteredAssessments = useMemo(() => {
    return complianceAssessments.filter((assessment) => {
      const framework =
        frameworks.find(
          (item) =>
            item.id === assessment.frameworkId
        );

      const control =
        controls.find(
          (item) =>
            item.id === assessment.controlId
        );

      const matchesSearch =
        assessment.requirement
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        assessment.owner
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        assessment.comments
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        framework?.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        control?.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFramework =
        frameworkFilter === "All" ||
        assessment.frameworkId === frameworkFilter;

      const matchesStatus =
        statusFilter === "All" ||
        assessment.status === statusFilter;

      return (
        matchesSearch &&
        matchesFramework &&
        matchesStatus
      );
    });
  }, [
    complianceAssessments,
    controls,
    search,
    frameworkFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const total =
      complianceAssessments.length;

    const compliant =
      complianceAssessments.filter(
        (item) =>
          item.status === "Compliant"
      ).length;

    const partial =
      complianceAssessments.filter(
        (item) =>
          item.status ===
          "Partially Compliant"
      ).length;

    const nonCompliant =
      complianceAssessments.filter(
        (item) =>
          item.status ===
          "Non-Compliant"
      ).length;

    const applicable =
      complianceAssessments.filter(
        (item) =>
          item.status !==
          "Not Applicable"
      ).length;

    const percentage =
      applicable === 0
        ? 0
        : Math.round(
            (compliant / applicable) * 100
          );

    return {
      total,
      compliant,
      partial,
      nonCompliant,
      percentage,
    };
  }, [complianceAssessments]);

  const getFrameworkName = (
    frameworkId: string
  ) => {
    return (
      frameworks.find(
        (framework) =>
          framework.id === frameworkId
      )?.name ?? "Unknown Framework"
    );
  };

  const getControlName = (
    controlId: string
  ) => {
    return (
      controls.find(
        (control) =>
          control.id === controlId
      )?.name ?? "Unmapped Control"
    );
  };

  const getEvidenceCount = (
    assessment: ComplianceAssessment
  ) => {
    return assessment.evidenceIds.filter(
      (evidenceId) =>
        evidence.some(
          (item) =>
            item.id === evidenceId
        )
    ).length;
  };

  const openAddModal = () => {
    setEditingAssessment(null);

    setForm({
      ...emptyAssessment,
      id: `CMP-${String(
        complianceAssessments.length + 1
      ).padStart(3, "0")}`,
    });

    setShowModal(true);
  };

  const openEditModal = (
    assessment: ComplianceAssessment
  ) => {
    setEditingAssessment(assessment);
    setForm({ ...assessment });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssessment(null);
    setForm(emptyAssessment);
  };

  const handleSave = () => {
    if (
      !form.frameworkId ||
      !form.controlId ||
      !form.requirement.trim() ||
      !form.owner.trim()
    ) {
      return;
    }

    if (editingAssessment) {
      setComplianceAssessments(
        complianceAssessments.map(
          (assessment) =>
            assessment.id ===
            editingAssessment.id
              ? form
              : assessment
        )
      );
    } else {
      setComplianceAssessments([
        ...complianceAssessments,
        {
          ...form,
          id:
            form.id ||
            `CMP-${String(
              complianceAssessments.length + 1
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
        "Are you sure you want to delete this compliance assessment?"
      );

    if (!confirmed) return;

    setComplianceAssessments(
      complianceAssessments.filter(
        (assessment) =>
          assessment.id !== id
      )
    );
  };

  const toggleEvidence = (
    evidenceId: string
  ) => {
    const exists =
      form.evidenceIds.includes(
        evidenceId
      );

    setForm({
      ...form,
      evidenceIds: exists
        ? form.evidenceIds.filter(
            (id) =>
              id !== evidenceId
          )
        : [
            ...form.evidenceIds,
            evidenceId,
          ],
    });
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <ClipboardCheck className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Compliance Assessment
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Assess controls against frameworks,
              requirements and supporting evidence.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Add Assessment
        </button>

      </div>

      {/* Compliance Overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl border border-cyan-500/10 bg-slate-900/70 p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Compliance
          </p>

          <p className="mt-2 text-3xl font-bold text-cyan-400">
            {stats.percentage}%
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{
                width: `${stats.percentage}%`,
              }}
            />
          </div>

        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">

          <p className="text-xs uppercase tracking-wider text-slate-500">
            Assessments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-100">
            {stats.total}
          </p>

        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-slate-900/70 p-5">

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Compliant
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {stats.compliant}
          </p>

        </div>

        <div className="rounded-xl border border-amber-500/10 bg-slate-900/70 p-5">

          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-amber-400" />

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Partial
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {stats.partial}
          </p>

        </div>

        <div className="rounded-xl border border-red-500/10 bg-slate-900/70 p-5">

          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Non-Compliant
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {stats.nonCompliant}
          </p>

        </div>

      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search requirements, controls or owners..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
            />

          </div>

          <select
            value={frameworkFilter}
            onChange={(e) =>
              setFrameworkFilter(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="All">
              All Frameworks
            </option>

            {frameworks.map(
              (framework) => (
                <option
                  key={framework.id}
                  value={framework.id}
                >
                  {framework.name}
                </option>
              )
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Compliant">
              Compliant
            </option>

            <option value="Partially Compliant">
              Partially Compliant
            </option>

            <option value="Non-Compliant">
              Non-Compliant
            </option>

            <option value="Not Applicable">
              Not Applicable
            </option>
          </select>

        </div>

      </div>

      {/* Assessment Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">

        <div className="overflow-x-auto">

          <table className="w-full min-w-250 text-left">

            <thead className="border-b border-slate-800 bg-slate-950/70">

              <tr>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Requirement
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Framework
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Control
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Evidence
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Owner
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {filteredAssessments.map(
                (assessment) => (
                  <tr
                    key={assessment.id}
                    className="transition hover:bg-slate-800/30"
                  >

                    {/* Requirement */}
                    <td className="px-5 py-4">

                      <div className="max-w-sm">

                        <p className="font-medium text-slate-100">
                          {assessment.requirement}
                        </p>

                        {assessment.gap && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            Gap identified
                          </p>
                        )}

                      </div>

                    </td>

                    {/* Framework */}
                    <td className="px-5 py-4">

                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-400">
                        {getFrameworkName(
                          assessment.frameworkId
                        )}
                      </span>

                    </td>

                    {/* Control */}
                    <td className="px-5 py-4">

                      <p className="max-w-52 text-sm text-slate-300">
                        {getControlName(
                          assessment.controlId
                        )}
                      </p>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          statusStyles[
                            assessment.status
                          ]
                        }`}
                      >
                        {assessment.status}
                      </span>

                    </td>

                    {/* Evidence */}
                    <td className="px-5 py-4">

                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">

                        <FileCheck2 className="h-4 w-4 text-cyan-400" />

                        {getEvidenceCount(
                          assessment
                        )} linked

                      </span>

                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {assessment.owner}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              assessment
                            )
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400"
                          title="Edit assessment"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              assessment.id
                            )
                          }
                          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete assessment"
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
        {filteredAssessments.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <ClipboardCheck className="h-10 w-10 text-slate-600" />

            <h3 className="mt-4 font-medium text-slate-300">
              No assessments found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or add a new assessment.
            </p>

          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {editingAssessment
                    ? "Edit Compliance Assessment"
                    : "Add Compliance Assessment"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Assess a requirement against a mapped security control.
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
                        frameworkId:
                          e.target.value,
                        controlId: "",
                        requirement: "",
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    {frameworks.map(
                      (framework) => (
                        <option
                          key={framework.id}
                          value={framework.id}
                        >
                          {framework.name}
                        </option>
                      )
                    )}

                  </select>
                </div>

                {/* Control */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Mapped Control
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    <option value="">
                      Select a control
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

                {/* Requirement */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Framework Requirement
                  </label>

                  <select
                    value={form.requirement}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        requirement:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    <option value="">
                      Select a requirement
                    </option>

                    {availableRequirements.map(
                      (requirement) => (
                        <option
                          key={requirement.id}
                          value={`${requirement.identifier} — ${requirement.title}`}
                        >
                          {requirement.identifier} —{" "}
                          {requirement.title}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Status */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Compliance Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value as ComplianceStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
                  >

                    <option value="Compliant">
                      Compliant
                    </option>

                    <option value="Partially Compliant">
                      Partially Compliant
                    </option>

                    <option value="Non-Compliant">
                      Non-Compliant
                    </option>

                    <option value="Not Applicable">
                      Not Applicable
                    </option>

                  </select>

                </div>

                {/* Owner */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Assessment Owner
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

                {/* Risk */}
<div>

  <label className="mb-2 block text-sm font-medium text-slate-300">
    Risk Level
  </label>

  <select
    value={form.risk}
    onChange={(e) =>
      setForm({
        ...form,
        risk: e.target.value as RiskLevel,
      })
    }
    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-400"
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

                {/* Gap */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Gap
                  </label>

                  <input
                    value={form.gap}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gap: e.target.value,
                      })
                    }
                    placeholder="Describe the compliance gap"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

                </div>

                {/* Evidence */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Supporting Evidence
                  </label>

                  <div className="grid gap-2 md:grid-cols-2">

                    {evidence.length === 0 ? (
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500 md:col-span-2">
                        No evidence has been added yet.
                      </div>
                    ) : (
                      evidence.map(
                        (item) => {
                          const selected =
                            form.evidenceIds.includes(
                              item.id
                            );

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                toggleEvidence(
                                  item.id
                                )
                              }
                              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                                selected
                                  ? "border-cyan-500/40 bg-cyan-500/10"
                                  : "border-slate-700 bg-slate-950 hover:border-slate-600"
                              }`}
                            >

                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded border ${
                                  selected
                                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                                    : "border-slate-600"
                                }`}
                              >
                                {selected && (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm text-slate-200">
                                  {item.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {item.type}
                                </p>

                              </div>

                            </button>
                          );
                        }
                      )
                    )}

                  </div>

                </div>

                {/* Comments */}
                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Analyst Comments
                  </label>

                  <textarea
                    value={form.comments}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        comments:
                          e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Add assessment notes, observations or justification..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />

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
                {editingAssessment
                  ? "Save Changes"
                  : "Create Assessment"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}