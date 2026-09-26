import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
} from "lucide-react";

import type { Audit } from "../types/grc";
import { useGRC } from "../context/GRCContext";

const emptyAudit: Omit<Audit, "id"> = {
  frameworkId: "",
  controlId: "",
  question: "",
  evidence: "",
  finding: "",
  status: "Not Tested",
  auditorNotes: "",
};

const statusStyles: Record<Audit["status"], string> = {
  Pass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Fail: "bg-red-500/10 text-red-400 border-red-500/20",
  "Not Tested": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Audits() {
  const { audits, setAudits } = useGRC();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const [form, setForm] =
    useState<Omit<Audit, "id">>(emptyAudit);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        audit.id.toLowerCase().includes(searchText) ||
        audit.question.toLowerCase().includes(searchText) ||
        audit.finding.toLowerCase().includes(searchText) ||
        audit.controlId.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || audit.status === statusFilter;

      const matchesFramework =
        frameworkFilter === "All" ||
        audit.frameworkId === frameworkFilter;

      return matchesSearch && matchesStatus && matchesFramework;
    });
  }, [audits, search, statusFilter, frameworkFilter]);

  const stats = {
    total: audits.length,
    pass: audits.filter((a) => a.status === "Pass").length,
    partial: audits.filter((a) => a.status === "Partial").length,
    fail: audits.filter((a) => a.status === "Fail").length,
    notTested: audits.filter((a) => a.status === "Not Tested").length,
  };

  const frameworks = Array.from(
    new Set(audits.map((audit) => audit.frameworkId))
  );

  function openAddModal() {
    setEditingAudit(null);
    setForm(emptyAudit);
    setShowModal(true);
  }

  function openEditModal(audit: Audit) {
    setEditingAudit(audit);

    setForm({
      frameworkId: audit.frameworkId,
      controlId: audit.controlId,
      question: audit.question,
      evidence: audit.evidence,
      finding: audit.finding,
      status: audit.status,
      auditorNotes: audit.auditorNotes,
    });

    setShowModal(true);
  }

  function saveAudit() {
    if (
      !form.frameworkId ||
      !form.controlId ||
      !form.question.trim()
    ) {
      alert("Please fill in Framework, Control ID and Audit Question.");
      return;
    }

    if (editingAudit) {
      setAudits(
        audits.map((audit) =>
          audit.id === editingAudit.id
            ? { ...editingAudit, ...form }
            : audit
        )
      );
    } else {
      const newAudit: Audit = {
        id: `AUD-${String(audits.length + 1).padStart(3, "0")}`,
        ...form,
      };

      setAudits([...audits, newAudit]);
    }

    setShowModal(false);
    setEditingAudit(null);
    setForm(emptyAudit);
  }

  function deleteAudit(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this audit?"
    );

    if (!confirmed) return;

    setAudits(audits.filter((audit) => audit.id !== id));

    if (selectedAudit?.id === id) {
      setSelectedAudit(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <ClipboardCheck className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Internal Audits
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Assess controls, review evidence, record findings and track audit results.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
        >
          <Plus className="w-4 h-4" />
          Add Audit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Audits"
          value={stats.total}
          icon={<ClipboardCheck className="w-5 h-5" />}
        />

        <StatCard
          title="Passed"
          value={stats.pass}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          title="Partial"
          value={stats.partial}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />

        <StatCard
          title="Failed"
          value={stats.fail}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />

        <StatCard
          title="Not Tested"
          value={stats.notTested}
          icon={<FileSearch className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audits..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Frameworks</option>

            {frameworks.map((framework) => (
              <option key={framework} value={framework}>
                {framework}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pass">Pass</option>
            <option value="Partial">Partial</option>
            <option value="Fail">Fail</option>
            <option value="Not Tested">Not Tested</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Audit
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Framework
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Control
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Question
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Status
                </th>

                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredAudits.map((audit) => (
                <tr
                  key={audit.id}
                  className="hover:bg-slate-800/30 transition"
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      {audit.id}
                    </button>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-300">
                    {audit.frameworkId}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-300">
                      {audit.controlId}
                    </span>
                  </td>

                  <td className="px-5 py-4 max-w-md">
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {audit.question}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${
                        statusStyles[audit.status]
                      }`}
                    >
                      {audit.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(audit)}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteAudit(audit.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAudits.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No audits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingAudit ? "Edit Audit" : "Add Audit"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Record the audit assessment and supporting evidence.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Framework ID">
                  <input
                    value={form.frameworkId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frameworkId: e.target.value,
                      })
                    }
                    placeholder="e.g. NIST-CSF-2.0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Control ID">
                  <input
                    value={form.controlId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        controlId: e.target.value,
                      })
                    }
                    placeholder="e.g. NIST-IDENTIFY"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <FormField label="Audit Question">
                <textarea
                  value={form.question}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      question: e.target.value,
                    })
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Enter the control assessment question..."
                />
              </FormField>

              <FormField label="Evidence">
                <textarea
                  value={form.evidence}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      evidence: e.target.value,
                    })
                  }
                  rows={4}
                  className={inputClass}
                  placeholder="Describe the evidence reviewed..."
                />
              </FormField>

              <FormField label="Finding">
                <textarea
                  value={form.finding}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      finding: e.target.value,
                    })
                  }
                  rows={4}
                  className={inputClass}
                  placeholder="Record the audit finding..."
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Audit["status"],
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Pass">Pass</option>
                    <option value="Partial">Partial</option>
                    <option value="Fail">Fail</option>
                    <option value="Not Tested">Not Tested</option>
                  </select>
                </FormField>

                <div />
              </div>

              <FormField label="Auditor Notes">
                <textarea
                  value={form.auditorNotes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      auditorNotes: e.target.value,
                    })
                  }
                  rows={4}
                  className={inputClass}
                  placeholder="Add auditor observations or follow-up actions..."
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={saveAudit}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
              >
                {editingAudit ? "Save Changes" : "Create Audit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedAudit.id}
                </h2>

                <p className="text-sm text-slate-500">
                  Audit assessment details
                </p>
              </div>

              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <DetailBlock
                title="Framework"
                value={selectedAudit.frameworkId}
              />

              <DetailBlock
                title="Control"
                value={selectedAudit.controlId}
              />

              <DetailBlock
                title="Audit Question"
                value={selectedAudit.question}
              />

              <DetailBlock
                title="Evidence"
                value={selectedAudit.evidence || "No evidence recorded."}
              />

              <DetailBlock
                title="Finding"
                value={selectedAudit.finding || "No finding recorded."}
              />

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
                  Status
                </p>

                <span
                  className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${
                    statusStyles[selectedAudit.status]
                  }`}
                >
                  {selectedAudit.status}
                </span>
              </div>

              <DetailBlock
                title="Auditor Notes"
                value={
                  selectedAudit.auditorNotes ||
                  "No auditor notes recorded."
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

function DetailBlock({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
        {title}
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color = "cyan",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "cyan" | "emerald" | "amber" | "red";
}) {
  const colors = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    emerald:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber:
      "text-amber-400 bg-amber-500/10 border-amber-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {value}
          </p>
        </div>

        <div
          className={`p-2.5 rounded-xl border ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}