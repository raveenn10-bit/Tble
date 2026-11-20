'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { usePosStore } from '@/store/usePosStore';
import { MenuCategory } from '@/types/pos';
import { formatLKRCompact, toCents } from '@/lib/currency';

const CATEGORIES: MenuCategory[] = [
  'Rice & Curry',
  'Fried Rice',
  'Kottu',
  'Burgers',
  'Pizza',
  'Pasta',
  'Seafood',
  'Appetizers',
  'Desserts',
  'Hot Beverages',
  'Cold Beverages',
];

const CATEGORY_IMG: Record<MenuCategory, string> = {
  'Rice & Curry': '/images/food/rice-curry.jpg',
  'Fried Rice': '/images/food/fried-rice.jpg',
  Kottu: '/images/food/kottu.jpg',
  Burgers: '/images/food/burger.jpg',
  Pizza: '/images/food/pizza.jpg',
  Pasta: '/images/food/pasta.jpg',
  Seafood: '/images/food/seafood.jpg',
  Appetizers: '/images/food/appetizer.jpg',
  Desserts: '/images/food/dessert.jpg',
  'Hot Beverages': '/images/food/hot-beverage.jpg',
  'Cold Beverages': '/images/food/cold-beverage.jpg',
};

export function MenuManagementView() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = usePosStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Rice & Curry');
  const [priceLkr, setPriceLkr] = useState('1400');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMenuItem({
      name: name.trim(),
      category,
      priceCents: toCents(Number(priceLkr) || 0),
      description: description.trim() || 'House specialty prepared fresh to order',
      image: CATEGORY_IMG[category],
      available: true,
      isBeverage: category === 'Hot Beverages' || category === 'Cold Beverages',
      prepMinutes: 12,
    });
    setName('');
    setDescription('');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <form
        onSubmit={handleCreate}
        className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 h-fit"
      >
        <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#059669]" /> Add Menu Item
        </h3>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jaffna Crab Kottu"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price (LKR)</label>
            <input
              type="number"
              min={50}
              value={priceLkr}
              onChange={(e) => setPriceLkr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-sm"
        >
          Add to Menu
        </button>
      </form>

      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="p-3.5">Dish</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5">Available</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {menu.map((item) => (
              <tr key={item.id}>
                <td className="p-3.5 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <span className="font-bold text-[#0F172A]">{item.name}</span>
                </td>
                <td className="p-3.5 text-slate-600">{item.category}</td>
                <td className="p-3.5 font-bold text-[#059669]">{formatLKRCompact(item.priceCents)}</td>
                <td className="p-3.5">
                  <button
                    onClick={() => updateMenuItem(item.id, { available: !item.available })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {item.available ? 'Available' : 'Sold Out'}
                  </button>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-1.5 rounded-lg text-[#DC2626] hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
