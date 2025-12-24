import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, CreditCard, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { NeoButton, NeoCard, NeoInput, ModalOverlay, FloatingActionButton } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { BANKS, COLORS } from '../../constants/banks';

export const CreditCardsScreen = ({ accounts, onAddAccount, onUpdateAccount, onRemoveAccount, onBack, onNavigate }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit', 'create'
    const [selectedCard, setSelectedCard] = useState(null);

    const creditCards = useMemo(() => accounts.filter(acc => acc.type === 'cartao'), [accounts]);
    const bankAccounts = useMemo(() => accounts.filter(acc => !acc.type || acc.type === 'conta'), [accounts]);

    const handleSave = (data) => {
        if (selectedCard && viewMode === 'edit') {
            onUpdateAccount(selectedCard.id, data);
        } else {
            onAddAccount({
                id: crypto.randomUUID(),
                ...data
            });
        }
        setViewMode('list');
        setSelectedCard(null);
    };

    const handleCardClick = (card) => {
        // Navigate to card details screen
        onNavigate('cartao-detalhes', { cardId: card.id });
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex items-center gap-4">
                <NeoButton variant="ghost" className="!p-2 rounded-full" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </NeoButton>
                <h1 className="text-2xl font-bold text-white">Cartões de Crédito</h1>
            </header>

            <div className="space-y-4">
                {creditCards.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-slate-400 text-sm">Nenhum cartão encontrado.</p>
                    </div>
                )}

                {creditCards.map(card => {
                    const gradient = card.bank_gradient || 'from-slate-800 to-slate-900';
                    const textColor = card.bank_text || 'text-white';
                    const percentage = card.limit ? (card.balance / card.limit) * 100 : 0;

                    return (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card)}
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
                                    <p className={`text-xs opacity-80 ${textColor}`}>{card.bank || 'Cartão'}</p>
                                    <span className={`text-xs font-mono opacity-60 ${textColor}`}>**** 8842</span>
                                </div>
                            </div>

                            <div className="z-10">
                                <p className={`text-xs mb-1 opacity-80 ${textColor}`}>Fatura Atual</p>
                                <p className={`text-3xl font-bold tracking-tight ${textColor}`}>{formatCurrency(card.balance)}</p>

                                <div className="w-full h-2 bg-black/20 rounded-full mt-3 overflow-hidden backdrop-blur-sm">
                                    <div className={`h-full rounded-full transition-all ${percentage > 80 ? 'bg-rose-400' : 'bg-white/80'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className={`text-[10px] opacity-70 ${textColor}`}>Disp: {formatCurrency((card.limit || 0) - card.balance)}</span>
                                    <span className={`text-[10px] opacity-70 ${textColor}`}>Venc: {card.due_day || card.dueDate || '10'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <FloatingActionButton onClick={() => { setSelectedCard(null); setViewMode('create'); }} />

            {/* Edit/Create Modal */}
            {(viewMode === 'edit' || viewMode === 'create') && (
                <ModalOverlay
                    title={viewMode === 'create' ? 'Novo Cartão' : 'Editar Cartão'}
                    onClose={() => setViewMode('list')}
                >
                    <CardForm
                        initialData={selectedCard}
                        bankAccounts={bankAccounts}
                        onSubmit={handleSave}
                    />
                </ModalOverlay>
            )}
        </div>
    );
};

const CardForm = ({ initialData, bankAccounts, onSubmit }) => {
    const [selectedBankObj, setSelectedBankObj] = useState(() => {
        if (initialData?.bank) {
            return BANKS.find(b => b.name === initialData.bank) || BANKS.find(b => b.id === 'other');
        }
        return BANKS[0];
    });
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [customName, setCustomName] = useState(initialData?.bank && !BANKS.find(b => b.name === initialData.bank) ? initialData.bank : '');
    const [customColor, setCustomColor] = useState(initialData?.bank_gradient ? COLORS.find(c => c.gradient === initialData.bank_gradient) : COLORS[0]);
    const [linkedAccountId, setLinkedAccountId] = useState(initialData?.linked_account_id || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (!linkedAccountId) {
            alert('Por favor, vincule uma Conta Bancária.');
            return;
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
            type: 'cartao',
            balance: parseFloat(formData.get('balance') || 0),
            limit: parseFloat(formData.get('limit') || 0),
            due_day: parseInt(formData.get('due_day') || 1),
            card_type: formData.get('card_type'),
            linked_account_id: linkedAccountId
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor do Cartão</label>
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

            <NeoInput name="name" label="Nome do Cartão" defaultValue={initialData?.name} placeholder="Ex: Cartão Principal" required />

            {/* Linked Account */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conta Bancária Vinculada <span className="text-rose-500">*</span></label>
                <p className="text-[10px] text-slate-400 mb-2">Necessário para compras no débito.</p>

                {bankAccounts.length === 0 ? (
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
                            {bankAccounts.map(acc => (
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
                            <div className="h-10 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 text-xs font-bold uppercase transition-all hover:bg-slate-800 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500">
                                {opt === 'ambos' ? 'Ambos' : opt === 'credito' ? 'Crédito' : 'Débito'}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <NeoButton className="w-full mt-4" type="submit" disabled={!linkedAccountId}>Salvar</NeoButton>
        </form>
    );
};
