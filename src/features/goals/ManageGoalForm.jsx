import React, { useState } from 'react';
import { NeoButton, NeoInput } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';

export const ManageGoalForm = ({ goal, onProcess }) => {
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState('add'); // add | remove

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-slate-400 text-sm">Saldo na caixinha</p>
                <h2 className="text-3xl font-bold text-white">{formatCurrency(goal.current_amount)}</h2>
            </div>

            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button type="button" onClick={() => setMode('add')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'add' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Guardar</button>
                <button type="button" onClick={() => setMode('remove')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'remove' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Resgatar</button>
            </div>

            <div className="space-y-4">
                <NeoInput
                    label="Valor"
                    id="mAmount"
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    autoFocus
                />
                <NeoButton
                    className="w-full"
                    onClick={() => onProcess(mode === 'add' ? amount : -amount)}
                    variant={mode === 'add' ? 'primary' : 'ghost'}
                >
                    {mode === 'add' ? 'Confirmar Depósito' : 'Confirmar Resgate'}
                </NeoButton>
            </div>
        </div>
    )
}
