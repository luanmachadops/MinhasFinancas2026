import React, { useState } from 'react';
import { ChevronLeft, Plus, Wallet, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { NeoButton, NeoCard, NeoInput, ModalOverlay, FloatingActionButton } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { BANKS, COLORS } from '../../constants/banks';

export const BankAccountsScreen = ({ accounts, onAddAccount, onUpdateAccount, onRemoveAccount, onBack, onAddTransaction }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit', 'create'
    const [selectedAccount, setSelectedAccount] = useState(null);

    const bankAccounts = accounts.filter(acc => !acc.type || acc.type === 'conta');

    const handleSave = (data) => {
        if (selectedAccount && viewMode === 'edit') {
            onUpdateAccount(selectedAccount.id, data);
        } else {
            const newAccountId = crypto.randomUUID();
            onAddAccount({
                id: newAccountId,
                ...data
            });

            // Create initial balance transaction if it has balance
            if (data.balance > 0 && onAddTransaction) {
                onAddTransaction({
                    id: crypto.randomUUID(),
                    description: `Saldo Inicial - ${data.name}`,
                    amount: parseFloat(data.balance),
                    type: 'entrada',
                    date: new Date().toISOString().split('T')[0],
                    category_id: null,
                    account_id: newAccountId
                });
            }
        }
        setViewMode('list');
        setSelectedAccount(null);
    };

    const handleViewDetail = (acc) => {
        setSelectedAccount(acc);
        setViewMode('detail');
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex items-center gap-4">
                <NeoButton variant="ghost" className="!p-2 rounded-full" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </NeoButton>
                <h1 className="text-2xl font-bold text-white">Contas Bancárias</h1>
            </header>

            <div className="space-y-3">
                {bankAccounts.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-slate-400 text-sm">Nenhuma conta encontrada.</p>
                    </div>
                )}

                {bankAccounts.map(acc => {
                    const predefinedBank = BANKS.find(b => b.name === acc.bank);
                    const bankStyle = predefinedBank || BANKS.find(b => b.id === 'other');
                    const gradient = acc.bank_gradient || bankStyle?.gradient || 'from-slate-800 to-slate-900';
                    const textColor = acc.bank_text || bankStyle?.text || 'text-white';

                    return (
                        <NeoCard key={acc.id} onClick={() => handleViewDetail(acc)} className="flex items-center justify-between !p-4 group cursor-pointer hover:border-blue-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold bg-gradient-to-br ${gradient} shadow-lg`}>
                                    <span className={`text-[10px] font-bold ${textColor}`}>{(acc.name || acc.bank || 'C').substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{acc.name}</h3>
                                    <p className="text-slate-400 text-xs font-mono">{formatCurrency(acc.balance)}</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-slate-600 rotate-180" />
                        </NeoCard>
                    );
                })}
            </div>

            <FloatingActionButton onClick={() => { setSelectedAccount(null); setViewMode('create'); }} />

            {/* Detail Modal */}
            {viewMode === 'detail' && selectedAccount && (
                <ModalOverlay title="Detalhes" onClose={() => setViewMode('list')}>
                    <AccountDetailView
                        account={selectedAccount}
                        onEdit={() => setViewMode('edit')}
                        onDelete={() => { onRemoveAccount(selectedAccount.id); setViewMode('list'); }}
                    />
                </ModalOverlay>
            )}

            {/* Edit/Create Modal */}
            {(viewMode === 'edit' || viewMode === 'create') && (
                <ModalOverlay
                    title={viewMode === 'create' ? 'Nova Conta' : 'Editar Conta'}
                    onClose={() => setViewMode('list')}
                >
                    <AccountForm
                        initialData={selectedAccount}
                        onSubmit={handleSave}
                    />
                </ModalOverlay>
            )}
        </div>
    );
};

const AccountDetailView = ({ account, onEdit, onDelete }) => {
    const predefinedBank = BANKS.find(b => b.name === account.bank);
    const bankStyle = predefinedBank || BANKS.find(b => b.id === 'other');
    const gradient = account.bank_gradient || bankStyle?.gradient || 'from-slate-800 to-slate-900';
    const textColor = account.bank_text || bankStyle?.text || 'text-white';

    return (
        <div className="space-y-6">
            <div className={`aspect-video w-full rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                    <span className={`text-lg font-bold ${textColor}`}>{account.bank || 'Banco'}</span>
                    <Wallet className={`w-8 h-8 ${textColor} opacity-50`} />
                </div>
                <div>
                    <p className={`text-sm ${textColor} opacity-80 mb-1`}>{account.name}</p>
                    <p className={`text-2xl font-mono font-bold ${textColor}`}>{formatCurrency(account.balance)}</p>
                </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 space-y-3 border border-slate-800">
                <DetailRow label="Tipo" value="Conta Corrente" />
                <DetailRow label="Saldo Atual" value={formatCurrency(account.balance)} />
            </div>

            <div className="flex gap-3">
                <NeoButton onClick={onEdit} className="flex-1" variant="primary">
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                </NeoButton>
                <NeoButton onClick={onDelete} className="flex-1" variant="danger">
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </NeoButton>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white font-medium">{value}</span>
    </div>
);

const AccountForm = ({ initialData, onSubmit }) => {
    const [selectedBankObj, setSelectedBankObj] = useState(() => {
        if (initialData?.bank) {
            return BANKS.find(b => b.name === initialData.bank) || BANKS.find(b => b.id === 'other');
        }
        return BANKS[0];
    });
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [customName, setCustomName] = useState(initialData?.bank && !BANKS.find(b => b.name === initialData.bank) ? initialData.bank : '');
    const [customColor, setCustomColor] = useState(initialData?.bank_gradient ? COLORS.find(c => c.gradient === initialData.bank_gradient) : COLORS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const isCustomBank = selectedBankObj.id === 'other';
        const finalBankName = isCustomBank ? customName : selectedBankObj.name;
        const finalGradient = isCustomBank ? customColor.gradient : selectedBankObj.gradient;
        const finalTextColor = isCustomBank ? 'text-white' : selectedBankObj.text;

        const data = {
            name: formData.get('name'),
            bank: finalBankName,
            bank_gradient: finalGradient,
            bank_text: finalTextColor,
            type: 'conta',
            balance: parseFloat(formData.get('balance') || 0),
        };
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instituição Financeira</label>
                <div
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedBankObj.gradient} flex items-center justify-center text-[10px] font-bold ${selectedBankObj.text} shadow-sm`}>
                            {selectedBankObj.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">{selectedBankObj.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showBankDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                        {BANKS.map((bank) => (
                            <div
                                key={bank.id}
                                onClick={() => {
                                    setSelectedBankObj(bank);
                                    setShowBankDropdown(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900 cursor-pointer border-b border-slate-900 last:border-0"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bank.gradient} flex items-center justify-center text-[8px] font-bold ${bank.text}`}>
                                    {bank.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-slate-200 text-sm flex-1">{bank.name}</span>
                                {selectedBankObj.id === bank.id && <Check className="w-4 h-4 text-blue-500" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedBankObj.id === 'other' && (
                <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <NeoInput
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        label="Nome do Banco Personalizado"
                        placeholder="Ex: Minha Carteira"
                        required
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setCustomColor(color)}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} transition-transform ${customColor.name === color.name ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <NeoInput name="name" label="Nome da Conta" defaultValue={initialData?.name} placeholder="Ex: Conta Principal" required />
            <NeoInput name="balance" label="Saldo Atual/Inicial" type="number" step="0.01" defaultValue={initialData?.balance} required />

            <NeoButton className="w-full mt-4" type="submit">Salvar</NeoButton>
        </form>
    );
};
