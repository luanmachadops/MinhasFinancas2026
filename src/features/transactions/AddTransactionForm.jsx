import React, { useState, useMemo } from 'react';
import {
    ChevronDown, Plus, Check, Mic, Calendar, Tag,
    Paperclip, RotateCcw, Pin, FileText, Heart,
    CreditCard, Wallet, ChevronRight
} from 'lucide-react';
import { NeoButton, NeoInput, ModalOverlay, IconRender, CategoryPicker } from '../../components/ui';
import { getTodayDate, formatCurrency } from '../../utils/formatters';
import { CategoryForm } from '../categories/CategoryForm';
import { useData } from '../../contexts/DataContext';

export const AddTransactionForm = ({
    categories,
    accounts = [],
    onClose,
    onAdd,
    onAddCategory,
    initialType = 'saida',
    isCardExpense = false
}) => {
    const { isReadOnly } = useData();
    const [type, setType] = useState(initialType);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: getTodayDate(),
        category_id: '',
        account_id: '',
        notes: '',
        is_paid: true,
        is_recurring: false,
        payment_method: isCardExpense ? 'cartao_credito' : 'dinheiro'
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    // Quick date options
    const getQuickDates = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        return [
            { id: 'hoje', label: 'Hoje', date: today.toISOString().split('T')[0] },
            { id: 'ontem', label: 'Ontem', date: yesterday.toISOString().split('T')[0] },
            { id: 'outros', label: 'Outros...', date: null },
        ];
    };

    const quickDates = getQuickDates();
    const [selectedQuickDate, setSelectedQuickDate] = useState('hoje');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Filter accounts based on payment method
    const filteredAccounts = useMemo(() => {
        if (formData.payment_method === 'cartao_credito') {
            return accounts.filter(a => a.type === 'cartao');
        }
        return accounts.filter(a => a.type === 'conta');
    }, [accounts, formData.payment_method]);

    const handleQuickDate = (quickDate) => {
        setSelectedQuickDate(quickDate.id);
        if (quickDate.date) {
            setFormData({ ...formData, date: quickDate.date });
            setShowDatePicker(false);
        } else {
            setShowDatePicker(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        onAdd({
            ...formData,
            id: crypto.randomUUID(),
            amount: parseFloat(formData.amount),
            type,
            // Convert categoryId to category_id for consistency
            category_id: formData.category_id || null
        });
        onClose();
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'new_category') {
            setShowCategoryModal(true);
        } else {
            setFormData({ ...formData, category_id: value });
        }
    };

    const handleNewCategory = (newCategory) => {
        if (onAddCategory) {
            onAddCategory(newCategory);
            setFormData(prev => ({ ...prev, category_id: newCategory.id }));
            if (newCategory.type !== type) {
                setType(newCategory.type);
            }
        }
        setShowCategoryModal(false);
    };

    const selectedCategory = categories.find(c => c.id === formData.category_id);
    const selectedAccount = filteredAccounts.find(a => a.id === formData.account_id);

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Tabs - only show if not card expense */}
                {!isCardExpense && (
                    <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                        <button type="button" onClick={() => setType('saida')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'saida' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Despesa</button>
                        <button type="button" onClick={() => setType('entrada')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'entrada' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Receita</button>
                        <button type="button" onClick={() => setType('investimento')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'investimento' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Investimento</button>
                    </div>
                )}

                {/* Big Value Input */}
                <div className="text-center py-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <label className="text-xs text-slate-500 uppercase tracking-widest">
                        Valor da {type === 'entrada' ? 'Receita' : type === 'investimento' ? 'Aplicação' : 'Despesa'}
                    </label>
                    <div className="flex items-center justify-center gap-1 mt-2">
                        <span className={`text-3xl ${type === 'entrada' ? 'text-emerald-500' : type === 'saida' ? 'text-rose-500' : 'text-blue-500'}`}>R$</span>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            autoFocus
                            className={`bg-transparent text-5xl font-bold placeholder-slate-700 outline-none w-48 text-center ${type === 'entrada' ? 'text-emerald-400' : type === 'saida' ? 'text-rose-400' : 'text-blue-400'}`}
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <span className="text-xs text-slate-600">BRL</span>
                </div>

                {/* Paid Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <Check className={`w-5 h-5 ${formData.is_paid ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-slate-300 text-sm">
                            {type === 'entrada' ? 'Recebido' : 'Pago'}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}
                        className={`w-12 h-6 rounded-full transition-colors ${formData.is_paid ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.is_paid ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                {/* Quick Date */}
                <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div className="flex gap-2 flex-1">
                        {quickDates.map(qd => (
                            <button
                                key={qd.id}
                                type="button"
                                onClick={() => handleQuickDate(qd)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedQuickDate === qd.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {qd.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Picker (conditional) */}
                {showDatePicker && (
                    <NeoInput
                        label="Data"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                )}

                {/* Description */}
                <div className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                    <Mic className="w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Descrição"
                        className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    <Heart className="w-5 h-5 text-slate-600 hover:text-rose-400 cursor-pointer transition-colors" />
                </div>

                {/* Category Selector */}
                <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                    <Tag className="w-5 h-5 text-slate-500" />
                    {selectedCategory ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full">
                            <IconRender name={selectedCategory.icon} className={`w-4 h-4 ${selectedCategory.color}`} />
                            <span className="text-white text-sm">{selectedCategory.name}</span>
                        </span>
                    ) : (
                        <span className="text-slate-500 text-sm">Categoria</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                </button>

                {/* Account Selector */}
                <button
                    type="button"
                    onClick={() => document.getElementById('account-select')?.click()}
                    className="w-full flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                    {formData.payment_method === 'cartao_credito' ? (
                        <CreditCard className="w-5 h-5 text-violet-400" />
                    ) : (
                        <Wallet className="w-5 h-5 text-slate-500" />
                    )}
                    {selectedAccount ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full">
                            <span className="text-white text-sm">{selectedAccount.name}</span>
                            {selectedAccount.bank && <span className="text-slate-500 text-xs">• {selectedAccount.bank}</span>}
                        </span>
                    ) : (
                        <span className="text-slate-500 text-sm">
                            {formData.payment_method === 'cartao_credito' ? 'Cartão' : 'Conta'}
                        </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                    <select
                        id="account-select"
                        className="absolute opacity-0"
                        value={formData.account_id}
                        onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                    >
                        <option value="">Selecione...</option>
                        {filteredAccounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name} {a.bank ? `• ${a.bank}` : ''}</option>
                        ))}
                    </select>
                </button>

                {/* Anexar */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800 text-slate-500 cursor-pointer hover:border-slate-700 transition-colors">
                    <Paperclip className="w-5 h-5" />
                    <span className="text-sm">Anexar</span>
                    <div className="ml-auto w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-400" />
                    </div>
                </div>

                {/* More Details Toggle */}
                <button
                    type="button"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="w-full text-center text-blue-400 text-sm font-medium py-2 hover:text-blue-300 transition-colors"
                >
                    {showMoreDetails ? 'MENOS DETALHES' : 'MAIS DETALHES'}
                </button>

                {/* Extra Fields */}
                {showMoreDetails && (
                    <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                        {/* Recurring Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-5 h-5 text-slate-500" />
                                <span className="text-slate-300 text-sm">Despesa Fixa</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
                                className={`w-12 h-6 rounded-full transition-colors ${formData.is_recurring ? 'bg-blue-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.is_recurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {/* Notes */}
                        <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                            <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                            <textarea
                                placeholder="Observação"
                                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm resize-none"
                                rows={2}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-xl ${type === 'entrada' ? 'bg-emerald-500' : type === 'saida' ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                    >
                        <Check className="w-7 h-7 text-white" />
                    </button>
                </div>
            </form>

            {/* Category Picker Modal */}
            <CategoryPicker
                isOpen={showCategoryModal}
                categories={categories}
                selectedId={formData.category_id}
                type={type}
                onSelect={(cat) => {
                    setFormData(prev => ({ ...prev, category_id: cat.id }));
                }}
                onAdd={(newCat) => {
                    if (onAddCategory) {
                        onAddCategory(newCat);
                        setFormData(prev => ({ ...prev, category_id: newCat.id }));
                    }
                }}
                onClose={() => setShowCategoryModal(false)}
            />
        </>
    );
};
