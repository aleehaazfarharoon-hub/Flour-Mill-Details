import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit,
  Trash2,
  X,
  Layers,
  Thermometer,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Material, MaterialCategory } from '../types';
import { formatTons, exportToCSV } from '../utils/formatters';

interface MaterialInventoryProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onUpdateMaterial: (material: Material) => void;
  onDeleteMaterial: (batchId: string) => void;
  onNavigateToBlendLab: () => void;
}

export const MaterialInventory: React.FC<MaterialInventoryProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onNavigateToBlendLab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states
  const nextBatchId = `B0${materials.length + 1}`;
  const [formBatchId, setFormBatchId] = useState(nextBatchId);
  const [formItem, setFormItem] = useState('');
  const [formCategory, setFormCategory] = useState<MaterialCategory>('Raw Wheat');
  const [formStock, setFormStock] = useState<number>(100);
  const [formMoisture, setFormMoisture] = useState<number>(12.8);
  const [formGluten, setFormGluten] = useState<number>(27.5);
  const [formProtein, setFormProtein] = useState<number>(12.0);
  const [formAsh, setFormAsh] = useState<number>(1.4);
  const [formSilo, setFormSilo] = useState('Silo C');
  const [formMaxCap, setFormMaxCap] = useState<number>(180);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.siloLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || mat.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalRawWheat = materials
    .filter((m) => m.category === 'Raw Wheat')
    .reduce((sum, m) => sum + m.stockTons, 0);

  const totalFinishedFlour = materials
    .filter((m) => m.category === 'Finished Flour')
    .reduce((sum, m) => sum + m.stockTons, 0);

  const totalByProduct = materials
    .filter((m) => m.category === 'By-Product')
    .reduce((sum, m) => sum + m.stockTons, 0);

  const handleOpenAdd = () => {
    setFormBatchId(`B0${materials.length + 1}`);
    setFormItem('');
    setFormCategory('Raw Wheat');
    setFormStock(100);
    setFormMoisture(12.8);
    setFormGluten(27.5);
    setFormProtein(12.0);
    setFormAsh(1.4);
    setFormSilo('Silo C');
    setFormMaxCap(180);
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setFormBatchId(mat.batchId);
    setFormItem(mat.item);
    setFormCategory(mat.category);
    setFormStock(mat.stockTons);
    setFormMoisture(mat.moisturePercent);
    setFormGluten(mat.glutenPercent);
    setFormProtein(mat.proteinPercent || 11.5);
    setFormAsh(mat.ashPercent || 1.4);
    setFormSilo(mat.siloLocation);
    setFormMaxCap(mat.maxCapacityTons || 150);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.trim()) {
      setErrorMsg('Please enter an item/grain description');
      return;
    }

    const calculatedStatus: Material['status'] =
      formMoisture > 14.5 ? 'Action Required' : formMoisture > 13.5 ? 'Caution' : 'Optimal';

    if (editingMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        item: formItem.trim(),
        category: formCategory,
        stockTons: Number(formStock),
        moisturePercent: Number(formMoisture),
        glutenPercent: Number(formGluten),
        proteinPercent: Number(formProtein),
        ashPercent: Number(formAsh),
        siloLocation: formSilo.trim(),
        maxCapacityTons: Number(formMaxCap),
        status: calculatedStatus,
      });
      setEditingMaterial(null);
    } else {
      if (materials.some((m) => m.batchId.toLowerCase() === formBatchId.toLowerCase())) {
        setErrorMsg(`Batch ID ${formBatchId} already exists! Use a unique ID.`);
        return;
      }

      onAddMaterial({
        batchId: formBatchId.trim().toUpperCase(),
        item: formItem.trim(),
        category: formCategory,
        stockTons: Number(formStock),
        moisturePercent: Number(formMoisture),
        glutenPercent: Number(formGluten),
        proteinPercent: Number(formProtein),
        ashPercent: Number(formAsh),
        siloLocation: formSilo.trim(),
        maxCapacityTons: Number(formMaxCap),
        status: calculatedStatus,
        lastTestedDate: new Date().toISOString().split('T')[0],
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🌾</span> Wheat & Finished Flour Inventory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Raw wheat intake, lab quality assurance (Moisture & Gluten), and silo storage
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToBlendLab}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Wheat Blend Simulator</span>
          </button>
          <button
            onClick={() => exportToCSV(materials, 'flour_mill_materials')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Receive New Batch</span>
          </button>
        </div>
      </div>

      {/* Category Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Raw Wheat Silos</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {formatTons(totalRawWheat)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Hard & Soft Grains</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Wheat className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Finished Flour Milled</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {formatTons(totalFinishedFlour)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Patent Maida & Atta</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">By-Product (Bran/Choker)</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatTons(totalByProduct)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Animal Feed Stock</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Lab Parameters Reference Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Mill Lab Standards:</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>
            <strong className="text-emerald-400">&lt; 13.5%</strong> Safe Moisture
          </span>
          <span>
            <strong className="text-amber-400">13.5 - 14.5%</strong> High Moisture (Needs Aeration)
          </span>
          <span>
            <strong className="text-purple-400">&gt; 28%</strong> Strong Bakery Gluten
          </span>
          <span>
            <strong className="text-blue-400">&lt; 0.60%</strong> Superfine Patent Ash
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by batch ID, grain name, or silo location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
          {['All', 'Raw Wheat', 'Finished Flour', 'By-Product'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Material Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Batch ID</th>
                <th className="py-3.5 px-4">Item & Specification</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Stock (Tons)</th>
                <th className="py-3.5 px-4 text-right">Moisture (%)</th>
                <th className="py-3.5 px-4 text-right">Gluten (%)</th>
                <th className="py-3.5 px-4 text-right">Protein (%)</th>
                <th className="py-3.5 px-4 text-right">Ash (%)</th>
                <th className="py-3.5 px-4">Silo Location</th>
                <th className="py-3.5 px-4 text-center">Quality Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    No grain batches match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => (
                  <tr key={mat.batchId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{mat.batchId}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      {mat.item}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-400">{mat.category}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                      {mat.stockTons} T
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          mat.moisturePercent > 13.5
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-emerald-400'
                        }`}
                      >
                        {mat.moisturePercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {mat.glutenPercent > 0 ? `${mat.glutenPercent}%` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {mat.proteinPercent ? `${mat.proteinPercent}%` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {mat.ashPercent ? `${mat.ashPercent}%` : '--'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {mat.siloLocation}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                          mat.moisturePercent > 13.5
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {mat.moisturePercent > 13.5 ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Caution</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Optimal</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(mat)}
                          title="Edit batch"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Delete batch ${mat.batchId} (${mat.item}) with ${mat.stockTons} Tons?`
                              )
                            ) {
                              onDeleteMaterial(mat.batchId);
                            }
                          }}
                          title="Delete batch"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Batch Modal */}
      {(isAddOpen || editingMaterial) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-400" />
                <span>{editingMaterial ? 'Edit Batch & Quality Data' : 'Receive New Grain Intake / Batch'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingMaterial(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Batch ID</label>
                  <input
                    type="text"
                    value={formBatchId}
                    disabled={Boolean(editingMaterial)}
                    onChange={(e) => setFormBatchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono disabled:opacity-60 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Raw Wheat">Raw Wheat</option>
                    <option value="Finished Flour">Finished Flour</option>
                    <option value="By-Product">By-Product (Bran)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Item Description</label>
                <input
                  type="text"
                  value={formItem}
                  onChange={(e) => setFormItem(e.target.value)}
                  placeholder="e.g. Hard Wheat (Punjab Harvest Grade 1)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stock Quantity (Tons)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Storage Silo / Bin</label>
                  <input
                    type="text"
                    value={formSilo}
                    onChange={(e) => setFormSilo(e.target.value)}
                    placeholder="e.g. Silo A (Steel)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Lab Parameters */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Laboratory Test Quality Values
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Moisture %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="20"
                      value={formMoisture}
                      onChange={(e) => setFormMoisture(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Gluten %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      value={formGluten}
                      onChange={(e) => setFormGluten(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Protein %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="25"
                      value={formProtein}
                      onChange={(e) => setFormProtein(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Ash %</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="10"
                      value={formAsh}
                      onChange={(e) => setFormAsh(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
                >
                  {editingMaterial ? 'Update Batch' : 'Record Grain Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
