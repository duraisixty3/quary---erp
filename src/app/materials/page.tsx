'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStoreState, subscribeToStore, AppState, saveMaterial, deleteMaterial } from '@/lib/storage/store';
import { formatINR, formatWeight } from '@/lib/utils';
import { Material, MaterialCategory, UnitOfMeasurement } from '@/types';

export default function MaterialsPage() {
  const [state, setState] = useState<AppState>(getStoreState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('pebbles');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [grade, setGrade] = useState('');
  const [intendedApplication, setIntendedApplication] = useState('');
  const [defaultUnit, setDefaultUnit] = useState<UnitOfMeasurement>('MT');
  const [densityFactor, setDensityFactor] = useState(1.6);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(10);
  const [currentStock, setCurrentStock] = useState(0);
  const [stockLocation, setStockLocation] = useState('Attibele Main Yard');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setState(getStoreState());
    return subscribeToStore((s) => setState(s));
  }, []);

  const openCreateModal = () => {
    setEditingMaterial(null);
    setName('');
    setCode(`MAT-${Math.floor(Math.random() * 900 + 100)}`);
    setCategory('pebbles');
    setSize('10-20mm');
    setColor('Natural Grey');
    setGrade('Grade A Architectural');
    setIntendedApplication('Landscaping & Decorative Pathways');
    setDefaultUnit('MT');
    setDensityFactor(1.6);
    setPurchasePrice(7500);
    setSellingPrice(12000);
    setMinStockLevel(10);
    setCurrentStock(15);
    setStockLocation('Attibele Main Yard');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditingMaterial(mat);
    setName(mat.name);
    setCode(mat.code);
    setCategory(mat.category);
    setSize(mat.size || '');
    setColor(mat.color || '');
    setGrade(mat.grade || '');
    setIntendedApplication(mat.intendedApplication || '');
    setDefaultUnit(mat.defaultUnit);
    setDensityFactor(mat.densityFactor);
    setPurchasePrice(mat.standardPurchasePrice);
    setSellingPrice(mat.standardSellingPrice);
    setMinStockLevel(mat.minStockLevel);
    setCurrentStock(mat.currentStock);
    setStockLocation(mat.stockLocation);
    setIsActive(mat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Material name and code are required.');
      return;
    }

    const materialData: Material = {
      id: editingMaterial ? editingMaterial.id : `mat_${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      category,
      size: size.trim(),
      color: color.trim(),
      grade: grade.trim(),
      intendedApplication: intendedApplication.trim(),
      defaultUnit,
      densityFactor: Number(densityFactor),
      standardPurchasePrice: Number(purchasePrice),
      standardSellingPrice: Number(sellingPrice),
      minStockLevel: Number(minStockLevel),
      currentStock: Number(currentStock),
      stockLocation: stockLocation.trim(),
      isActive,
      createdAt: editingMaterial ? editingMaterial.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveMaterial(materialData);
    setIsModalOpen(false);
  };

  const filteredMaterials = state.materials.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.color && m.color.toLowerCase().includes(q)) ||
        (m.size && m.size.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Material & Aggregate Catalogue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure pebbles, jalli, gravel, M-sand, and stone specifications with densities and stock thresholds.
          </p>
        </div>

        <Button variant="orange" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Material
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code, colour, or size..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-4 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="pebbles">Polished River Pebbles</option>
                <option value="coloured_pebbles">Coloured Landscape Pebbles</option>
                <option value="jalli_aggregates">Blue Metal Jalli & Aggregates</option>
                <option value="m_sand">M-Sand & P-Sand</option>
                <option value="boulders">Gabion & Rock Boulders</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredMaterials.length}</strong> of {state.materials.length} materials
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Code / Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Specs (Size / Colour)</th>
                <th className="px-4 py-3 text-right">Standard Buy / Sell</th>
                <th className="px-4 py-3 text-right">Stock Level</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No materials found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isLowStock = mat.currentStock <= mat.minStockLevel;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs font-bold text-orange-600">{mat.code}</div>
                        <div className="font-semibold text-slate-900 text-sm">{mat.name}</div>
                        {mat.grade && <span className="text-[10px] text-slate-400">{mat.grade}</span>}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="capitalize font-medium text-slate-700">
                          {mat.category.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Density: {mat.densityFactor} MT/m³
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-800">{mat.size || 'Standard'}</div>
                        <div className="text-slate-500 text-[11px]">{mat.color || 'Natural'}</div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium">
                        <div className="text-slate-900 font-semibold">{formatINR(mat.standardSellingPrice)}</div>
                        <div className="text-[11px] text-slate-400">
                          Cost: {formatINR(mat.standardPurchasePrice)} / {mat.defaultUnit}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className={`font-bold text-sm ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                          {mat.currentStock} {mat.defaultUnit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Min Reorder: {mat.minStockLevel} {mat.defaultUnit}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {mat.stockLocation}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={mat.isActive ? 'success' : 'outline'} size="sm">
                          {mat.isActive ? 'Active' : 'Archived'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(mat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove material ${mat.name}?`)) {
                                deleteMaterial(mat.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </Card>

      {/* Material Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? `Edit Material: ${editingMaterial.name}` : 'Add New Material to Catalogue'}
        description="Specify material category, density factor, standard pricing, and minimum stock threshold."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Material Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Snow White Polished River Pebbles"
                className="w-full border rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unique Material Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PBL-WHT-POL"
                className="w-full border rounded-lg p-2 font-mono uppercase"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full border rounded-lg p-2"
              >
                <option value="pebbles">Polished River Pebbles</option>
                <option value="coloured_pebbles">Coloured Landscape Pebbles</option>
                <option value="jalli_aggregates">Blue Metal Jalli (RCC Aggregates)</option>
                <option value="m_sand">M-Sand / P-Sand</option>
                <option value="gravel">Gravel / Soling</option>
                <option value="boulders">Rock Boulders & Gabion</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Unit</label>
              <select
                value={defaultUnit}
                onChange={(e) => setDefaultUnit(e.target.value as UnitOfMeasurement)}
                className="w-full border rounded-lg p-2"
              >
                <option value="MT">Metric Tonnes (MT)</option>
                <option value="m3">Cubic Metres (m³)</option>
                <option value="brass">Brass (100 cu ft)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Size Specification</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 10-20mm, 20mm, 40mm"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Colour</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Snow White, Polished Black, Red"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade A Architectural, IS 383 Graded"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Density Factor (Tonnes / m³)
              </label>
              <input
                type="number"
                step="0.01"
                value={densityFactor}
                onChange={(e) => setDensityFactor(Number(e.target.value))}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Pricing & Stock Control (INR)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Standard Purchase Rate</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Standard Selling Rate</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-semibold text-orange-600"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Min Reorder Level</label>
                <input
                  type="number"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 block mb-1">Current Stock ({defaultUnit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Stock Location</label>
              <input
                type="text"
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
                placeholder="e.g. Attibele Main Yard - Bay 1"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Intended Application</label>
              <input
                type="text"
                value={intendedApplication}
                onChange={(e) => setIntendedApplication(e.target.value)}
                placeholder="e.g. Resort Landscaping, Concrete Mix"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="isActiveCheck" className="font-semibold text-slate-700">
              Active in sales catalogue and quotations
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              {editingMaterial ? 'Update Material' : 'Create Material'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
