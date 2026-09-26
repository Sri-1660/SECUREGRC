import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Server,
} from "lucide-react";

import { useGRC } from "../context/GRCContext";
import type {
  Asset,
  BusinessCriticality,
  DataClassification,
} from "../types/grc";

const emptyAsset: Asset = {
  id: "",
  name: "",
  type: "",
  owner: "",
  department: "",
  description: "",
  location: "",
  dataClassification: "Internal",
  businessCriticality: "Medium",
  confidentiality: 3,
  integrity: 3,
  availability: 3,
  status: "Active",
};

function Assets() {
  const { assets, setAssets } = useGRC();

  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] =
    useState("All");
  const [criticalityFilter, setCriticalityFilter] =
    useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] =
    useState<Asset | null>(null);

  const [formData, setFormData] =
    useState<Asset>(emptyAsset);

  // ==========================================================
  // Filtered Assets
  // ==========================================================

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        asset.owner
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        asset.type
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesClassification =
        classificationFilter === "All" ||
        asset.dataClassification ===
          classificationFilter;

      const matchesCriticality =
        criticalityFilter === "All" ||
        asset.businessCriticality ===
          criticalityFilter;

      return (
        matchesSearch &&
        matchesClassification &&
        matchesCriticality
      );
    });
  }, [
    assets,
    search,
    classificationFilter,
    criticalityFilter,
  ]);

  // ==========================================================
  // Open Add Modal
  // ==========================================================

  const handleAdd = () => {
    setEditingAsset(null);

    setFormData({
      ...emptyAsset,
      id: `AST-${String(assets.length + 1).padStart(
        3,
        "0"
      )}`,
    });

    setIsModalOpen(true);
  };

  // ==========================================================
  // Open Edit Modal
  // ==========================================================

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setIsModalOpen(true);
  };

  // ==========================================================
  // Delete
  // ==========================================================

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) {
      return;
    }

    setAssets(
      assets.filter((asset) => asset.id !== id)
    );
  };

  // ==========================================================
  // Save
  // ==========================================================

  const handleSave = () => {
    if (!formData.name.trim()) {
      window.alert("Asset name is required.");
      return;
    }

    if (editingAsset) {
      setAssets(
        assets.map((asset) =>
          asset.id === editingAsset.id
            ? formData
            : asset
        )
      );
    } else {
      setAssets([...assets, formData]);
    }

    setIsModalOpen(false);
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="p-8">

      {/* Header */}

      <div className="mb-8 flex items-start justify-between">

        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400">
            Asset Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Asset Register
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Maintain an inventory of organizational assets,
            their ownership, classification and business
            criticality.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={17} />
          Add Asset
        </button>

      </div>

      {/* Summary */}

      <div className="mb-6 grid gap-4 md:grid-cols-4">

        <SummaryCard
          title="Total Assets"
          value={assets.length}
        />

        <SummaryCard
          title="Critical"
          value={
            assets.filter(
              (asset) =>
                asset.businessCriticality ===
                "Critical"
            ).length
          }
        />

        <SummaryCard
          title="Confidential"
          value={
            assets.filter(
              (asset) =>
                asset.dataClassification ===
                "Confidential"
            ).length
          }
        />

        <SummaryCard
          title="Restricted"
          value={
            assets.filter(
              (asset) =>
                asset.dataClassification ===
                "Restricted"
            ).length
          }
        />

      </div>

      {/* Filters */}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">

        <div className="relative flex-1">

          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search assets, owners or types..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
          />

        </div>

        <select
          value={classificationFilter}
          onChange={(event) =>
            setClassificationFilter(
              event.target.value
            )
          }
          className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="All">All Classifications</option>
          <option value="Public">Public</option>
          <option value="Internal">Internal</option>
          <option value="Confidential">
            Confidential
          </option>
          <option value="Restricted">Restricted</option>
        </select>

        <select
          value={criticalityFilter}
          onChange={(event) =>
            setCriticalityFilter(event.target.value)
          }
          className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="All">All Criticality</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

      </div>

      {/* Asset Table */}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-slate-800 bg-slate-950/60">

              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Asset
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Owner
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Classification
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Criticality
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {filteredAssets.map((asset) => (

                <tr
                  key={asset.id}
                  className="transition hover:bg-slate-800/30"
                >

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                        <Server
                          size={17}
                          className="text-cyan-400"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          {asset.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {asset.id} · {asset.type}
                        </p>
                      </div>

                    </div>

                  </td>

                  <td className="px-5 py-4 text-sm text-slate-300">
                    {asset.owner}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      label={asset.dataClassification}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      label={asset.businessCriticality}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() =>
                          handleEdit(asset)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-cyan-400"
                        title="Edit asset"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(asset.id)
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                        title="Delete asset"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {filteredAssets.length === 0 && (
          <div className="p-12 text-center">

            <p className="text-sm text-slate-400">
              No assets found.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </div>

      {/* Modal */}

      {isModalOpen && (
        <AssetModal
          asset={formData}
          editing={Boolean(editingAsset)}
          onChange={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  );
}

// ============================================================
// Summary Card
// ============================================================

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// Badge
// ============================================================

function Badge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    Critical:
      "border-red-500/20 bg-red-500/10 text-red-400",

    High:
      "border-orange-500/20 bg-orange-500/10 text-orange-400",

    Medium:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",

    Low:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    Restricted:
      "border-red-500/20 bg-red-500/10 text-red-400",

    Confidential:
      "border-orange-500/20 bg-orange-500/10 text-orange-400",

    Internal:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",

    Public:
      "border-slate-600 bg-slate-800 text-slate-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
        styles[label] ??
        "border-slate-700 bg-slate-800 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

// ============================================================
// Asset Modal
// ============================================================

function AssetModal({
  asset,
  editing,
  onChange,
  onClose,
  onSave,
}: {
  asset: Asset;
  editing: boolean;
  onChange: (asset: Asset) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const update = (
    field: keyof Asset,
    value: string | number
  ) => {
    onChange({
      ...asset,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">

        {/* Modal Header */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              {editing ? "Edit Asset" : "Add Asset"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Maintain asset inventory information.
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

          <FormField
            label="Asset Name"
            value={asset.name}
            onChange={(value) =>
              update("name", value)
            }
            placeholder="e.g. Customer Database"
          />

          <FormField
            label="Asset Type"
            value={asset.type}
            onChange={(value) =>
              update("type", value)
            }
            placeholder="e.g. Database"
          />

          <FormField
            label="Owner"
            value={asset.owner}
            onChange={(value) =>
              update("owner", value)
            }
            placeholder="e.g. IT Security"
          />

          <FormField
            label="Department"
            value={asset.department}
            onChange={(value) =>
              update("department", value)
            }
            placeholder="e.g. Technology"
          />

          <FormField
            label="Location"
            value={asset.location}
            onChange={(value) =>
              update("location", value)
            }
            placeholder="e.g. Cloud"
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Data Classification
            </label>

            <select
              value={asset.dataClassification}
              onChange={(event) =>
                update(
                  "dataClassification",
                  event.target
                    .value as DataClassification
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              <option value="Public">Public</option>
              <option value="Internal">Internal</option>
              <option value="Confidential">
                Confidential
              </option>
              <option value="Restricted">
                Restricted
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Business Criticality
            </label>

            <select
              value={asset.businessCriticality}
              onChange={(event) =>
                update(
                  "businessCriticality",
                  event.target
                    .value as BusinessCriticality
                )
              }
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Description
            </label>

            <textarea
              value={asset.description}
              onChange={(event) =>
                update(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Describe the asset..."
              className="w-full resize-none rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          {/* CIA */}

          <div className="md:col-span-2">

            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              CIA Security Rating
            </p>

            <div className="grid gap-4 md:grid-cols-3">

              <NumberField
                label="Confidentiality"
                value={asset.confidentiality}
                onChange={(value) =>
                  update(
                    "confidentiality",
                    value
                  )
                }
              />

              <NumberField
                label="Integrity"
                value={asset.integrity}
                onChange={(value) =>
                  update("integrity", value)
                }
              />

              <NumberField
                label="Availability"
                value={asset.availability}
                onChange={(value) =>
                  update(
                    "availability",
                    value
                  )
                }
              />

            </div>

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
            {editing ? "Save Changes" : "Create Asset"}
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
  onChange: (value: string) => void;
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
          onChange(event.target.value)
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
  onChange: (value: number) => void;
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
                Number(event.target.value)
              )
            )
          )
        }
        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
      />
    </div>
  );
}

export default Assets;