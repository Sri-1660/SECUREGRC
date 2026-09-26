import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

import type { Policy } from "../types/grc";
import { useGRC } from "../context/GRCContext";

const emptyPolicy: Omit<Policy, "id"> = {
  name: "",
  category: "",
  owner: "",
  version: "1.0",
  status: "Draft",
  reviewDate: "",
  description: "",
};

const statusStyles: Record<Policy["status"], string> = {
  Draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Under Review":
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Retired: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Policies() {
  const { policies, setPolicies } = useGRC();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const [form, setForm] =
    useState<Omit<Policy, "id">>(emptyPolicy);

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const query = search.toLowerCase();

      const matchesSearch =
        policy.id.toLowerCase().includes(query) ||
        policy.name.toLowerCase().includes(query) ||
        policy.category.toLowerCase().includes(query) ||
        policy.owner.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        policy.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        policy.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [policies, search, statusFilter, categoryFilter]);

  const categories = Array.from(
    new Set(policies.map((policy) => policy.category))
  );

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === "Active").length,
    review: policies.filter(
      (p) => p.status === "Under Review"
    ).length,
    draft: policies.filter((p) => p.status === "Draft").length,
  };

  function openAddModal() {
    setEditingPolicy(null);
    setForm(emptyPolicy);
    setShowModal(true);
  }

  function openEditModal(policy: Policy) {
    setEditingPolicy(policy);

    setForm({
      name: policy.name,
      category: policy.category,
      owner: policy.owner,
      version: policy.version,
      status: policy.status,
      reviewDate: policy.reviewDate,
      description: policy.description,
    });

    setShowModal(true);
  }

  function savePolicy() {
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.owner.trim()
    ) {
      alert("Please fill in Policy Name, Category and Owner.");
      return;
    }

    if (editingPolicy) {
      setPolicies(
        policies.map((policy) =>
          policy.id === editingPolicy.id
            ? {
                ...editingPolicy,
                ...form,
              }
            : policy
        )
      );
    } else {
      const newPolicy: Policy = {
        id: `POL-${String(policies.length + 1).padStart(3, "0")}`,
        ...form,
      };

      setPolicies([...policies, newPolicy]);
    }

    setShowModal(false);
    setEditingPolicy(null);
    setForm(emptyPolicy);
  }

  function deletePolicy(id: string) {
    if (!window.confirm("Delete this policy?")) {
      return;
    }

    setPolicies(
      policies.filter((policy) => policy.id !== id)
    );

    if (selectedPolicy?.id === id) {
      setSelectedPolicy(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Policy Library
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Manage security, privacy, access and compliance policies.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Policies"
          value={stats.total}
          icon={<FileText className="w-5 h-5" />}
        />

        <StatCard
          title="Active"
          value={stats.active}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          title="Under Review"
          value={stats.review}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />

        <StatCard
          title="Draft"
          value={stats.draft}
          icon={<Clock3 className="w-5 h-5" />}
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
              placeholder="Search policies..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="bg-slate-950/70 border-b border-slate-800">
              <tr>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Policy
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Category
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Owner
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Version
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase">
                  Review Date
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
              {filteredPolicies.map((policy) => (
                <tr
                  key={policy.id}
                  className="hover:bg-slate-800/30 transition"
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        setSelectedPolicy(policy)
                      }
                      className="text-left"
                    >
                      <p className="font-semibold text-cyan-400 hover:text-cyan-300">
                        {policy.id}
                      </p>

                      <p className="text-sm text-slate-300 mt-1">
                        {policy.name}
                      </p>
                    </button>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-300">
                    {policy.category}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-300">
                    {policy.owner}
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-400">
                      v{policy.version}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-400">
                    {policy.reviewDate || "Not set"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${statusStyles[policy.status]}`}
                    >
                      {policy.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditModal(policy)
                        }
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          deletePolicy(policy.id)
                        }
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPolicies.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No policies found.
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
                  {editingPolicy
                    ? "Edit Policy"
                    : "Add Policy"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Maintain the policy metadata and review information.
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
                <FormField label="Policy Name">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Information Security Policy"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Category">
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g. Information Security"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Owner">
                  <input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        owner: e.target.value,
                      })
                    }
                    placeholder="e.g. CISO"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Version">
                  <input
                    value={form.version}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        version: e.target.value,
                      })
                    }
                    placeholder="1.0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Review Date">
                  <input
                    type="date"
                    value={form.reviewDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reviewDate: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value as Policy["status"],
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Under Review">
                      Under Review
                    </option>
                    <option value="Retired">
                      Retired
                    </option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the purpose and scope of this policy..."
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
                onClick={savePolicy}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
              >
                {editingPolicy
                  ? "Save Changes"
                  : "Create Policy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedPolicy.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedPolicy.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <Detail
                label="Category"
                value={selectedPolicy.category}
              />

              <Detail
                label="Owner"
                value={selectedPolicy.owner}
              />

              <Detail
                label="Version"
                value={`v${selectedPolicy.version}`}
              />

              <Detail
                label="Review Date"
                value={
                  selectedPolicy.reviewDate ||
                  "Not specified"
                }
              />

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
                  Status
                </p>

                <span
                  className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${statusStyles[selectedPolicy.status]}`}
                >
                  {selectedPolicy.status}
                </span>
              </div>

              <Detail
                label="Description"
                value={
                  selectedPolicy.description ||
                  "No description available."
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
        {label}
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
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