import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Wheat,
  Droplet,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Material } from '../types';

interface MillingBlendLabProps {
  materials: Material[];
  onConsultAi: (prompt: string) => void;
}

export const MillingBlendLab: React.FC<MillingBlendLabProps> = ({ materials, onConsultAi }) => {
  const hardWheat = materials.find((m) => m.item.toLowerCase().includes('hard')) || materials[0];
  const softWheat = materials.find((m) => m.item.toLowerCase().includes('soft')) || materials[1] || materials[0];

  const [hardRatio, setHardRatio] = useState<number>(65); // 65% Hard wheat
  const softRatio = 100 - hardRatio;

  const [batchTons, setBatchTons] = useState<number>(50); // 50 tons grist batch
  const [targetConditioningMoisture, setTargetConditioningMoisture] = useState<number>(16.0); // 16.0% target tempering moisture

  // Weighted Averages
  const hardMoisture = hardWheat?.moisturePercent ?? 12.5;
  const softMoisture = softWheat?.moisturePercent ?? 14.1;
  const blendedInitialMoisture = (hardRatio * hardMoisture + softRatio * softMoisture) / 100;

  const hardGluten = hardWheat?.glutenPercent ?? 28.0;
  const softGluten = softWheat?.glutenPercent ?? 24.5;
  const blendedGluten = (hardRatio * hardGluten + softRatio * softGluten) / 100;

  // Water addition formula:
  // Water to add (kg per ton) = 1000 * (Target% - Initial%) / (100 - Target%)
  const waterKgPerTon = Math.max(
    0,
    (1000 * (targetConditioningMoisture - blendedInitialMoisture)) / (100 - targetConditioningMoisture)
  );
  const totalWaterLiters = Math.round(waterKgPerTon * batchTons);

  // Theoretical Milling Yield (Standard 74% Patent Flour, 22% Bran, 4% Semolina/Shorts)
  const estimatedPatentFlourTons = (batchTons * 0.74).toFixed(1);
  const estimatedBranTons = (batchTons * 0.22).toFixed(1);
  const estimatedSemolinaTons = (batchTons * 0.04).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🔬</span> Milling Grise & Wheat Blend Simulator
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate grain blending ratios, tempering water injection, and predicted flour extraction yields
          </p>
        </div>

        <button
          onClick={() =>
            onConsultAi(
              `Analyze our active wheat blend: ${hardRatio}% ${hardWheat?.item || 'Hard Wheat'} (Moisture: ${hardMoisture}%, Gluten: ${hardGluten}%) blended with ${softRatio}% ${softWheat?.item || 'Soft Wheat'} (Moisture: ${softMoisture}%, Gluten: ${softGluten}%). Resulting initial moisture is ${blendedInitialMoisture.toFixed(
                1
              )}% and gluten is ${blendedGluten.toFixed(
                1
              )}%. We target ${targetConditioningMoisture}% conditioned moisture. Advise on roller mill break roll settings, tempering resting time, and final flour suitability for commercial bakeries.`
            )
          }
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Ask Gemini to Optimize Blend</span>
        </button>
      </div>

      {/* Main Interactive Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              <span>Grist Blending Proportion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust the proportion between Hard High-Gluten Wheat and Soft Wheat for this milling run.
            </p>
          </div>

          {/* Hard vs Soft Slider */}
          <div className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="font-bold text-amber-400">
                  Hard Wheat ({hardWheat?.batchId || 'B01'}): {hardRatio}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({((batchTons * hardRatio) / 100).toFixed(1)} Tons)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="font-bold text-blue-400">
                  Soft Wheat ({softWheat?.batchId || 'B02'}): {softRatio}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({((batchTons * softRatio) / 100).toFixed(1)} Tons)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={hardRatio}
              onChange={(e) => setHardRatio(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>0% (100% Soft Wheat)</span>
              <span>50% Balanced Blend</span>
              <span>100% (100% Hard Wheat)</span>
            </div>
          </div>

          {/* Batch Size & Conditioning Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Total Milling Batch Size (Tons)
              </label>
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={batchTons}
                onChange={(e) => setBatchTons(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Standard day run: 50 - 150 Tons
              </span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Tempering / Conditioning Moisture (%)
              </label>
              <input
                type="number"
                min="14.0"
                max="17.5"
                step="0.1"
                value={targetConditioningMoisture}
                onChange={(e) => setTargetConditioningMoisture(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Optimal conditioning target: 15.5% - 16.5%
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Commercial Recipe Presets:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => {
                  setHardRatio(80);
                  setTargetConditioningMoisture(16.2);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                🥖 Supreme Bread & Bakery (80% Hard / 20% Soft)
              </button>
              <button
                onClick={() => {
                  setHardRatio(60);
                  setTargetConditioningMoisture(15.8);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                🫓 Commercial Chakki Atta (60% Hard / 40% Soft)
              </button>
              <button
                onClick={() => {
                  setHardRatio(30);
                  setTargetConditioningMoisture(15.0);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                🍪 Biscuit & Pastry Soft Flour (30% Hard / 70% Soft)
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Simulated Lab & Yield Output</span>
            </h3>

            {/* Calculated Gluten */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Resulting Wet Gluten
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {blendedGluten.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-400">
                {blendedGluten >= 27.5
                  ? 'High Gluten (Excellent for bread volume & puff pastry)'
                  : blendedGluten >= 25.0
                  ? 'Standard Gluten (Good for general household flour)'
                  : 'Low Gluten (Ideal for crisp biscuits & cookies)'}
              </p>
            </div>

            {/* Initial Blended Moisture & Water injection */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Intake Moisture
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {blendedInitialMoisture.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Conditioning Water Needed
                </span>
                <span className="text-base font-mono font-bold text-blue-400 flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  {totalWaterLiters.toLocaleString()} L
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ~{waterKgPerTon.toFixed(1)} Liters per Ton. Rest time: 18-24 hours in dampening silo.
              </p>
            </div>

            {/* Estimated Flour Extraction Output */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <span className="text-xs text-slate-400 uppercase font-semibold block">
                Estimated Mill Yields ({batchTons} T Batch)
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-300">Patent Flour (74%):</span>
                  <span className="text-white font-bold">{estimatedPatentFlourTons} Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Wheat Bran / Choker (22%):</span>
                  <span className="text-emerald-400 font-bold">{estimatedBranTons} Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Suji / Semolina (4%):</span>
                  <span className="text-amber-400 font-bold">{estimatedSemolinaTons} Tons</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-slate-500 italic text-center">
              *Calculated based on standard industrial roll milling extraction parameters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
