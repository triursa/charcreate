import React, { useState } from 'react';
import { rollDice } from '../utils/dice';

interface RollHistoryEntry {
  expression: string;
  options: string[];
  total: number;
  detail: string;
  rolls: number[];
}

const DiceRoller: React.FC = () => {
  const [expression, setExpression] = useState('2d6+3');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [rerollOnes, setRerollOnes] = useState(false);
  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = () => {
    try {
      const result = rollDice(expression, {
        advantage,
        disadvantage,
        rerollOnes,
      });
      const options: string[] = [];
      if (advantage) options.push('Advantage');
      if (disadvantage) options.push('Disadvantage');
      if (rerollOnes) options.push('Reroll 1s');
      setHistory((prev) => [
        {
          expression,
          options,
          total: result.total,
          detail: result.detail,
          rolls: result.rolls,
        },
        ...prev,
      ]);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div>
        <h2 className="step-title">Dice Roller</h2>
        <p className="text-sm text-slate-300">
          Supports NdX±K expressions with optional advantage, disadvantage, and rerolling 1s once.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Expression</label>
          <input value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="e.g. 5d4+10" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={advantage} onChange={(event) => setAdvantage(event.target.checked)} />
          Advantage
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={disadvantage} onChange={(event) => setDisadvantage(event.target.checked)} />
          Disadvantage
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={rerollOnes} onChange={(event) => setRerollOnes(event.target.checked)} />
          Reroll 1s
        </label>
      </div>
      <div className="flex justify-end">
        <button type="button" className="primary" onClick={handleRoll}>
          Roll Dice
        </button>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="space-y-2">
        {history.length === 0 && <p className="text-sm text-slate-500">No rolls yet.</p>}
        {history.map((entry, index) => (
          <div key={index} className="rounded-lg border border-surface-400/40 bg-surface-200/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">{entry.expression}</p>
              <p className="text-lg font-bold text-slate-50">{entry.total}</p>
            </div>
            <p className="text-xs text-slate-400">Rolls: {entry.rolls.join(', ')} • {entry.detail}</p>
            {entry.options.length > 0 && (
              <p className="text-xs text-slate-500">Options: {entry.options.join(', ')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
