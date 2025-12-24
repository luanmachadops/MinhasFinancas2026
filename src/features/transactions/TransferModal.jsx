import React, { useState } from 'react';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { NeoButton, NeoInput, ModalOverlay } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

export const TransferModal = ({ onClose }) => {
    const { accounts, makeTransfer } = useData();
    const [formData, setFormData] = useState({
        from_account_id: '',
        to_account_id: '',
        amount: '',
        description: ''
    });

    const bankAccounts = accounts.filter(a => a.type === 'conta');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.from_account_id || !formData.to_account_id || !formData.amount) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
        if (formData.from_account_id === formData.to_account_id) {
            alert('Selecione contas diferentes');
            return;
        }

        makeTransfer(
            formData.from_account_id,
            formData.to_account_id,
            formData.amount,
            formData.description || 'Transferência'
        );
        onClose();
    };

    const fromAccount = bankAccounts.find(a => a.id === formData.from_account_id);
    const toAccount = bankAccounts.find(a => a.id === formData.to_account_id);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Value */}
            <div className="text-center py-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <label className="text-xs text-slate-500 uppercase tracking-widest">Valor da Transferência</label>
                <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-3xl text-blue-500">R$</span>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        autoFocus
                        className="bg-transparent text-5xl font-bold text-blue-400 placeholder-slate-700 outline-none w-48 text-center"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>
            </div>

            {/* From Account */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">De (Origem)</label>
                <select
                    value={formData.from_account_id}
                    onChange={(e) => setFormData({ ...formData, from_account_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    required
                >
                    <option value="">Selecione a conta...</option>
                    {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} {acc.bank ? `• ${acc.bank}` : ''} ({formatCurrency(acc.balance || 0)})
                        </option>
                    ))}
                </select>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {/* To Account */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Para (Destino)</label>
                <select
                    value={formData.to_account_id}
                    onChange={(e) => setFormData({ ...formData, to_account_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    required
                >
                    <option value="">Selecione a conta...</option>
                    {bankAccounts.filter(a => a.id !== formData.from_account_id).map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} {acc.bank ? `• ${acc.bank}` : ''} ({formatCurrency(acc.balance || 0)})
                        </option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <NeoInput
                label="Descrição (opcional)"
                placeholder="Ex: Pagamento de fatura"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {/* Preview */}
            {fromAccount && toAccount && formData.amount && (
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Prévia da transferência:</p>
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <p className="text-sm text-slate-300">{fromAccount.name}</p>
                            <p className="text-xs text-rose-400">-{formatCurrency(parseFloat(formData.amount))}</p>
                        </div>
                        <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                        <div className="text-center">
                            <p className="text-sm text-slate-300">{toAccount.name}</p>
                            <p className="text-xs text-emerald-400">+{formatCurrency(parseFloat(formData.amount))}</p>
                        </div>
                    </div>
                </div>
            )}

            <NeoButton type="submit" className="w-full">
                <ArrowLeftRight className="w-5 h-5 mr-2" />
                Transferir
            </NeoButton>
        </form>
    );
};
