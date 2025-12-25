import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, CreditCard, Wallet, Trash2, Edit2, Check, ExternalLink, ChevronDown, Search, Users } from 'lucide-react';
import { NeoButton, NeoCard, NeoInput, ModalOverlay, FloatingActionButton, IconRender } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { BANKS, COLORS } from '../../constants/banks';
import { useData } from '../../contexts/DataContext';

export const ManageAccountsScreen = ({ accounts, onAddAccount, onUpdateAccount, onRemoveAccount, onBack, onAddTransaction }) => {
    const { activeWorkspace } = useData();
    const [activeTab, setActiveTab] = useState('conta');
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit', 'create'
    const [selectedAccount, setSelectedAccount] = useState(null);

    const filteredAccounts = accounts.filter(acc =>
        activeTab === 'conta' ? (!acc.type || acc.type === 'conta') : acc.type === 'cartao'
    );

    const handleSave = (data) => {
        if (selectedAccount && viewMode === 'edit') {
            onUpdateAccount(selectedAccount.id, data);
        } else {
            const newAccountId = crypto.randomUUID();
            onAddAccount({
                id: newAccountId,
                ...data
            });

            // Create initial balance transaction if it's a "conta" and has balance
            if (activeTab === 'conta' && data.balance > 0 && onAddTransaction) {
                onAddTransaction({
                    id: crypto.randomUUID(),
                    description: `Saldo Inicial - ${data.name}`,
                    amount: parseFloat(data.balance),
                    type: 'entrada',
                    date: new Date().toISOString().split('T')[0], // Simple formatted date
                    category_id: null, // No specific category or 'Outros'
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

    const handleEdit = () => {
        setViewMode('edit');
    };

    const handleCreate = () => {
        setSelectedAccount(null);
        setViewMode('create');
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex items-center gap-4">
                <NeoButton variant="ghost" className="!p-2 rounded-full" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </NeoButton>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">Gerenciar {activeTab === 'conta' ? 'Contas' : 'Cartões'}</h1>
                    {activeWorkspace?.type === 'shared' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                            <Users className="w-3 h-3" /> Compartilhado
                        </span>
                    )}
                </div>
            </header>

            {/* Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button onClick={() => setActiveTab('conta')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'conta' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    Contas
                </button>
                <button onClick={() => setActiveTab('cartao')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'cartao' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500'}`}>
                    Cartões
                </button>
            </div>

            {/* List */}
            <div className={activeTab === 'cartao' ? 'space-y-4' : 'space-y-3'}>
                {filteredAccounts.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-slate-400 text-sm">Nenhum registro encontrado.</p>
                    </div>
                )}

                {activeTab === 'cartao' ? (
                    // Dashboard-style cards for credit cards
                    filteredAccounts.map(acc => {
                        const gradient = acc.bank_gradient || 'from-slate-800 to-slate-900';
                        const textColor = acc.bank_text || 'text-white';
                        const percentage = acc.limit ? (acc.balance / acc.limit) * 100 : 0;

                        return (
                            <div
                                key={acc.id}
                                onClick={() => handleViewDetail(acc)}
                                className={`w-full h-44 bg-gradient-to-br ${gradient} rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition-all shadow-xl`}
                            >
                                {/* Decorative blobs */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-3xl" />

                                <div className="flex justify-between items-start z-10">
                                    <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
                                        <CreditCard className={`w-6 h-6 ${textColor}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs opacity-80 ${textColor}`}>{acc.bank || 'Cartão'}</p>
                                        <span className={`text-xs font-mono opacity-60 ${textColor}`}>**** 8842</span>
                                    </div>
                                </div>

                                <div className="z-10">
                                    <p className={`text-xs mb-1 opacity-80 ${textColor}`}>Fatura Atual</p>
                                    <p className={`text-3xl font-bold tracking-tight ${textColor}`}>{formatCurrency(acc.balance)}</p>

                                    <div className="w-full h-2 bg-black/20 rounded-full mt-3 overflow-hidden backdrop-blur-sm">
                                        <div className={`h-full rounded-full transition-all ${percentage > 80 ? 'bg-rose-400' : 'bg-white/80'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className={`text-[10px] opacity-70 ${textColor}`}>Disp: {formatCurrency((acc.limit || 0) - acc.balance)}</span>
                                        <span className={`text-[10px] opacity-70 ${textColor}`}>Venc: {acc.due_day || acc.dueDate || '10'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Simple list for regular accounts
                    filteredAccounts.map(acc => {
                        const predefinedBank = BANKS.find(b => b.name === acc.bank);
                        const bankStyle = predefinedBank || BANKS.find(b => b.id === 'other');
                        const gradient = acc.bank_gradient || bankStyle.gradient;
                        const textColor = acc.bank_text || bankStyle.text;

                        return (
                            <NeoCard key={acc.id} onClick={() => handleViewDetail(acc)} className="flex items-center justify-between !p-4 group cursor-pointer hover:border-blue-500/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold bg-gradient-to-br ${gradient} shadow-lg`}>
                                        <span className={`text-[10px] font-bold ${textColor}`}>{(acc.name || acc.bank).substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{acc.name}</h3>
                                        <p className="text-slate-400 text-xs font-mono">
                                            {formatCurrency(acc.balance)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <ChevronLeft className="w-5 h-5 text-slate-600 rotate-180" />
                                </div>
                            </NeoCard>
                        );
                    })
                )}
            </div>

            <FloatingActionButton onClick={handleCreate} icon={Plus} />

            {/* Detail Modal */}
            {viewMode === 'detail' && selectedAccount && (
                <ModalOverlay title="Detalhes" onClose={() => setViewMode('list')}>
                    <AccountDetailView
                        account={selectedAccount}
                        onEdit={handleEdit}
                        onDelete={() => { onRemoveAccount(selectedAccount.id); setViewMode('list'); }}
                    />
                </ModalOverlay>
            )}

            {/* Edit/Create Modal */}
            {(viewMode === 'edit' || viewMode === 'create') && (
                <ModalOverlay
                    title={viewMode === 'create' ? `Nova ${activeTab === 'conta' ? 'Conta' : 'Conta/Cartão'}` : 'Editar'}
                    onClose={() => setViewMode('list')}
                >
                    <AccountForm
                        initialData={selectedAccount}
                        type={activeTab}
                        accounts={accounts} // Pass accounts for linking
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
    const gradient = account.bank_gradient || bankStyle.gradient;
    const textColor = account.bank_text || bankStyle.text;

    return (
        <div className="space-y-6">
            <div className={`aspect-video w-full rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                    <span className={`text-lg font-bold ${textColor}`}>{account.bank || 'Banco'}</span>
                    <Wallet className={`w-8 h-8 ${textColor} opacity-50`} />
                </div>
                <div>
                    <p className={`text-sm ${textColor} opacity-80 mb-1`}>{account.name}</p>
                    <p className={`text-2xl font-mono font-bold ${textColor}`}>
                        {account.type === 'cartao' ? '**** **** **** 0000' : formatCurrency(account.balance)}
                    </p>
                </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 space-y-3 border border-slate-800">
                <DetailRow label="Tipo" value={account.type === 'cartao' ? 'Cartão de Crédito' : 'Conta Corrente'} />
                {account.type === 'cartao' && (
                    <>
                        <DetailRow label="Fatura Atual" value={formatCurrency(account.balance)} />
                        <DetailRow label="Limite Total" value={formatCurrency(account.limit)} />
                        <DetailRow label="Vencimento" value={`Dia ${account.due_day || '01'}`} />
                        <DetailRow label="Modalidade" value={account.card_type === 'ambos' ? 'Crédito e Débito' : account.card_type === 'debito' ? 'Débito' : 'Crédito'} />
                    </>
                )}
                {account.type === 'conta' && (
                    <DetailRow label="Saldo Atual" value={formatCurrency(account.balance)} />
                )}
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
    )
}

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white font-medium">{value}</span>
    </div>
)

const AccountForm = ({ initialData, type, accounts = [], onSubmit }) => {
    // Bank Selection State
    const [selectedBankObj, setSelectedBankObj] = useState(() => {
        if (initialData?.bank) {
            return BANKS.find(b => b.name === initialData.bank) || BANKS.find(b => b.id === 'other');
        }
        return BANKS[0]; // Default to Nubank
    });

    // Custom Bank State
    const [isCustom, setIsCustom] = useState(() => {
        const found = BANKS.find(b => b.name === initialData?.bank);
        return !found && !!initialData?.bank; // If bank name exists but not in list, it was custom
    });
    const [customName, setCustomName] = useState(initialData?.bank && !BANKS.find(b => b.name === initialData.bank) ? initialData.bank : '');
    const [customColor, setCustomColor] = useState(initialData?.bank_gradient ? COLORS.find(c => c.gradient === initialData.bank_gradient) : COLORS[0]);

    // UI States
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Linked Account State
    const [linkedAccountId, setLinkedAccountId] = useState(initialData?.linked_account_id || '');
    const availableAccounts = accounts.filter(a => a.type === 'conta');

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowBankDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        let limit = 0;
        let due_day = 1;
        let card_type = 'credito';
        let linked_account_id = null;

        if (type === 'cartao') {
            limit = parseFloat(formData.get('limit') || 0);
            due_day = parseInt(formData.get('due_day') || 1);
            card_type = formData.get('card_type');

            // Require Linked Account if creating/editing a Card
            if (!linkedAccountId) {
                alert('Por favor, vincule uma Conta Bancária para movimentações de débito deste cartão.');
                return;
            }
            linked_account_id = linkedAccountId;
        }

        const isCustomBank = selectedBankObj.id === 'other';
        const finalBankName = isCustomBank ? customName : selectedBankObj.name;
        const finalGradient = isCustomBank ? customColor.gradient : selectedBankObj.gradient;
        const finalTextColor = isCustomBank ? 'text-white' : selectedBankObj.text;

        const data = {
            name: formData.get('name'),
            bank: finalBankName,
            bank_gradient: finalGradient,
            bank_text: finalTextColor,
            type: type,
            balance: parseFloat(formData.get('balance') || 0),
            limit,
            due_day,
            card_type,
            linked_account_id
        };
        onSubmit(data);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Bank Selector */}
            <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instituição Financeira</label>

                <div
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedBankObj.gradient} flex items-center justify-center text-[10px] font-bold ${selectedBankObj.text} shadow-sm`}>
                            {selectedBankObj.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">{selectedBankObj.name}</span>
                            {selectedBankObj.code !== '000' && <span className="text-slate-500 text-xs">Cód. {selectedBankObj.code}</span>}
                        </div>
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
                                    if (bank.id === 'other') setCustomName('');
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900 cursor-pointer border-b border-slate-900 last:border-0"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bank.gradient} flex items-center justify-center text-[8px] font-bold ${bank.text}`}>
                                    {bank.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-200 text-sm">{bank.name}</span>
                                        {bank.code !== '000' && <span className="text-slate-600 text-[10px] font-mono">{bank.code}</span>}
                                    </div>
                                </div>
                                {selectedBankObj.id === bank.id && <Check className="w-4 h-4 text-blue-500" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Bank Fields */}
            {selectedBankObj.id === 'other' && (
                <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 animate-[fadeIn_0.3s_ease-out]">
                    <NeoInput
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        label="Nome do Banco Personalizado"
                        placeholder="Ex: Minha Carteira"
                        required
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor do Cartão</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setCustomColor(color)}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} transition-transform ${customColor.name === color.name ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <NeoInput name="name" label="Nome da Conta/Cartão" defaultValue={initialData?.name} placeholder="Ex: Cartão Principal" required />

            {type === 'cartao' ? (
                <>
                    {/* Linked Account Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conta Bancária Vinculada <span className="text-rose-500">*</span></label>
                        <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                            Necessário para compras no débito. O valor será descontado desta conta.
                        </p>

                        {availableAccounts.length === 0 ? (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                                ⚠️ Nenhuma conta encontrada. Crie uma Conta Bancária primeiro.
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 appearance-none outline-none focus:border-blue-500"
                                    value={linkedAccountId}
                                    onChange={(e) => setLinkedAccountId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione a conta...</option>
                                    {availableAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name}{acc.bank ? ` • ${acc.bank}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <NeoInput name="balance" label="Fatura Atual" type="number" step="0.01" defaultValue={initialData?.balance} />
                    <div className="grid grid-cols-2 gap-4">
                        <NeoInput name="limit" label="Limite Total" type="number" defaultValue={initialData?.limit} />
                        <NeoInput name="due_day" label="Dia Vencimento" type="number" min="1" max="31" defaultValue={initialData?.due_day} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Função</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['credito', 'debito', 'ambos'].map((opt) => (
                                <label key={opt} className="cursor-pointer">
                                    <input type="radio" name="card_type" value={opt} defaultChecked={(initialData?.card_type || 'credito') === opt} className="peer hidden" />
                                    <div className="h-10 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 text-xs font-bold uppercase transition-all hover:bg-slate-800 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 peer-checked:shadow-lg">
                                        {opt === 'ambos' ? 'Ambos' : opt === 'credito' ? 'Crédito' : 'Débito'}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <NeoInput name="balance" label="Saldo Atual/Inicial" type="number" step="0.01" defaultValue={initialData?.balance} required />
            )}

            <NeoButton className="w-full mt-4" type="submit" disabled={type === 'cartao' && !linkedAccountId}>Salvar</NeoButton>
        </form>
    )
}
