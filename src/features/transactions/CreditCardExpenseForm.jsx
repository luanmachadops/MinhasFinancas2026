import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ChevronRight, Check, Mic, Calendar, Tag, Image as ImageIcon,
    CreditCard, Receipt, RotateCcw, Pin, FileText, HelpCircle,
    ChevronDown, X, ArrowLeft
} from 'lucide-react';
import { IconRender, CategoryPicker } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';

// Helper color map
const colorMap = {
    'text-red-400': { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' },
    'text-rose-400': { bg: 'rgba(251, 113, 133, 0.2)', text: '#fb7185' },
    'text-pink-400': { bg: 'rgba(244, 114, 182, 0.2)', text: '#f472b6' },
    'text-purple-400': { bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc' },
    'text-violet-400': { bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
    'text-indigo-400': { bg: 'rgba(129, 140, 248, 0.2)', text: '#818cf8' },
    'text-blue-400': { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa' },
    'text-sky-400': { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' },
    'text-cyan-400': { bg: 'rgba(34, 211, 238, 0.2)', text: '#22d3ee' },
    'text-teal-400': { bg: 'rgba(45, 212, 191, 0.2)', text: '#2dd4bf' },
    'text-emerald-400': { bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
    'text-green-400': { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' },
    'text-yellow-400': { bg: 'rgba(250, 204, 21, 0.2)', text: '#facc15' },
    'text-amber-400': { bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
    'text-orange-400': { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c' },
    'text-slate-400': { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
};
const getColorStyle = (colorClass) => colorMap[colorClass] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };

export const CreditCardExpenseForm = ({
    categories,
    accounts = [],
    onClose,
    onAdd,
    onAddCategory
}) => {
    const amountInputRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        account_id: '',
        notes: '',
        is_recurring: false,
        is_installment: false,
        installments: 1,
        invoice_date: '',
        ignore_expense: false,
        tags: []
    });

    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showCardPicker, setShowCardPicker] = useState(false);
    const [showInvoicePicker, setShowInvoicePicker] = useState(false);
    const [showInstallmentPicker, setShowInstallmentPicker] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // Focus amount input on mount
    useEffect(() => {
        if (amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, []);

    // Get credit cards only
    const creditCards = useMemo(() =>
        accounts.filter(a => a.type === 'cartao'),
        [accounts]);

    // Generate invoice dates (current and next 3 months)
    const invoiceDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        const selectedCard = creditCards.find(c => c.id === formData.account_id);
        const dueDay = selectedCard?.due_day || selectedCard?.dueDate || 10;

        for (let i = 0; i < 4; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, dueDay);
            dates.push({
                id: date.toISOString(),
                label: `Fatura: ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`,
                value: date.toISOString().split('T')[0]
            });
        }
        return dates;
    }, [creditCards, formData.account_id]);

    // Generate installment options
    const installmentOptions = useMemo(() => {
        const amount = parseFloat(formData.amount) || 0;
        const options = [];
        for (let i = 2; i <= 12; i++) {
            options.push({
                count: i,
                value: amount / i,
                label: `${i}x de ${formatCurrency(amount / i)}`
            });
        }
        return options;
    }, [formData.amount]);

    // Quick dates
    const quickDates = useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return [
            { id: 'hoje', label: 'Hoje', date: today.toISOString().split('T')[0] },
            { id: 'ontem', label: 'Ontem', date: yesterday.toISOString().split('T')[0] },
            { id: 'outros', label: 'Outros...', date: null },
        ];
    }, []);

    const [selectedQuickDate, setSelectedQuickDate] = useState('hoje');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const selectedCategory = categories.find(c => c.id === formData.category_id);
    const selectedCard = creditCards.find(c => c.id === formData.account_id);
    const selectedInvoice = invoiceDates.find(d => d.value === formData.invoice_date) || invoiceDates[1];

    // Auto-select first card if only one
    useEffect(() => {
        if (creditCards.length === 1 && !formData.account_id) {
            setFormData(prev => ({ ...prev, account_id: creditCards[0].id }));
        }
        // Auto-select first invoice
        if (invoiceDates.length > 0 && !formData.invoice_date) {
            setFormData(prev => ({ ...prev, invoice_date: invoiceDates[1]?.value || invoiceDates[0].value }));
        }
    }, [creditCards, invoiceDates]);

    const handleQuickDate = (qd) => {
        setSelectedQuickDate(qd.id);
        if (qd.date) {
            setFormData({ ...formData, date: qd.date });
            setShowDatePicker(false);
        } else {
            setShowDatePicker(true);
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!formData.description || !formData.amount) return;

        // Dados base compatíveis com o banco
        const baseTransactionData = {
            id: crypto.randomUUID(),
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date,
            category_id: formData.category_id || null,
            account_id: formData.account_id || null,
            notes: formData.notes || '',
            is_recurring: formData.is_recurring,
            type: 'saida',
            payment_method: 'cartao_credito',
            is_paid: false // Cartão sempre é "não pago" até fechar a fatura
        };

        // Se parcelado, gerar múltiplas transações
        if (formData.is_installment && formData.installments > 1) {
            const installmentAmount = parseFloat(formData.amount) / formData.installments;
            for (let i = 0; i < formData.installments; i++) {
                const installmentDate = new Date(formData.date);
                installmentDate.setMonth(installmentDate.getMonth() + i);

                onAdd({
                    ...baseTransactionData,
                    id: crypto.randomUUID(),
                    amount: installmentAmount,
                    description: `${formData.description} (${i + 1}/${formData.installments})`,
                    date: installmentDate.toISOString().split('T')[0]
                });
            }
        } else {
            onAdd(baseTransactionData);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-800">
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-white">Nova despesa cartão</h1>
            </div>

            {/* Amount Input - Hero */}
            <div className="p-6 border-b border-slate-800">
                <p className="text-slate-500 text-xs mb-1">Valor da despesa cartão</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-slate-400 text-2xl">R$</span>
                        <input
                            ref={amountInputRef}
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            className="bg-transparent text-5xl font-bold text-white placeholder-slate-700 outline-none w-48"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                        BRL <ChevronDown className="w-4 h-4" />
                    </span>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-slate-800">
                    {/* Quick Date */}
                    <div className="flex items-center gap-3 p-4">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <div className="flex gap-2 flex-1">
                            {quickDates.map(qd => (
                                <button
                                    key={qd.id}
                                    type="button"
                                    onClick={() => handleQuickDate(qd)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedQuickDate === qd.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {qd.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {showDatePicker && (
                        <div className="px-4 pb-4">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="flex items-center gap-3 p-4">
                        <Mic className="w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Descrição"
                            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Category */}
                    <button
                        type="button"
                        onClick={() => setShowCategoryPicker(true)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/50 transition-colors"
                    >
                        <Tag className="w-5 h-5 text-slate-500" />
                        {selectedCategory ? (
                            <span
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700"
                                style={{
                                    backgroundColor: getColorStyle(selectedCategory.color).bg,
                                    borderColor: getColorStyle(selectedCategory.color).text
                                }}
                            >
                                <IconRender name={selectedCategory.icon} className="w-4 h-4" style={{ color: getColorStyle(selectedCategory.color).text }} />
                                <span className="text-white text-sm">{selectedCategory.name}</span>
                            </span>
                        ) : (
                            <span className="text-slate-500">Categoria</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-600 ml-auto" />
                    </button>

                    {/* Card Selector */}
                    <button
                        type="button"
                        onClick={() => setShowCardPicker(true)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/50 transition-colors"
                    >
                        <CreditCard className="w-5 h-5 text-slate-500" />
                        {selectedCard ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                                <div className="w-5 h-5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" />
                                <span className="text-white text-sm">{selectedCard.bank || selectedCard.name}</span>
                            </span>
                        ) : (
                            <span className="text-slate-500">Selecionar cartão</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-600 ml-auto" />
                    </button>

                    {/* Invoice Date */}
                    <button
                        type="button"
                        onClick={() => setShowInvoicePicker(true)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/50 transition-colors"
                    >
                        <Receipt className="w-5 h-5 text-slate-500" />
                        <span className="text-white">{selectedInvoice?.label || 'Selecionar fatura'}</span>
                        <ChevronRight className="w-5 h-5 text-slate-600 ml-auto" />
                    </button>

                    {/* Attach */}
                    <button
                        type="button"
                        onClick={() => setShowAttachMenu(true)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/50 transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-500">Anexar</span>
                        <div className="ml-auto p-2 text-emerald-400">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                    </button>

                    {/* More Details Button */}
                    {!showMoreDetails && (
                        <button
                            type="button"
                            onClick={() => setShowMoreDetails(true)}
                            className="w-full p-4 text-center"
                        >
                            <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
                                Mais Detalhes
                            </span>
                        </button>
                    )}

                    {/* Extended Options */}
                    {showMoreDetails && (
                        <>
                            {/* Installments Toggle */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <RotateCcw className="w-5 h-5 text-slate-500" />
                                    <span className="text-white">Parcelado</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!formData.is_installment) {
                                            setFormData({ ...formData, is_installment: true });
                                            setShowInstallmentPicker(true);
                                        } else {
                                            setFormData({ ...formData, is_installment: false, installments: 1 });
                                        }
                                    }}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.is_installment ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.is_installment ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Fixed Expense Toggle */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <Pin className="w-5 h-5 text-slate-500" />
                                    <span className="text-white">Despesa fixa</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.is_recurring ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.is_recurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Notes */}
                            <div className="flex items-start gap-3 p-4">
                                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                                <textarea
                                    placeholder="Observação"
                                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none resize-none"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            {/* Tags */}
                            <button
                                type="button"
                                className="w-full flex items-center gap-3 p-4 hover:bg-slate-900/50 transition-colors"
                            >
                                <Tag className="w-5 h-5 text-slate-500" />
                                <span className="text-slate-500">Tags</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 ml-auto" />
                            </button>

                            {/* Ignore Expense Toggle */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-slate-500" />
                                    <span className="text-white">Ignorar despesa</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, ignore_expense: !formData.ignore_expense })}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.ignore_expense ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.ignore_expense ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* Save & Continue */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-full p-4 text-center"
                            >
                                <span className="text-emerald-400 font-medium text-sm uppercase tracking-wider">
                                    Salvar e Continuar
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 pb-24 flex justify-center relative z-50">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform"
                >
                    <Check className="w-8 h-8 text-white" />
                </button>
            </div>

            {/* Category Picker */}
            <CategoryPicker
                isOpen={showCategoryPicker}
                categories={categories}
                selectedId={formData.category_id}
                type="saida"
                onSelect={(cat) => setFormData(prev => ({ ...prev, category_id: cat.id }))}
                onAdd={onAddCategory}
                onClose={() => setShowCategoryPicker(false)}
            />

            {/* Card Picker Modal */}
            {showCardPicker && (
                <div className="fixed inset-0 z-[60] flex items-end">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowCardPicker(false)} />
                    <div className="relative w-full bg-slate-900 rounded-t-3xl p-6 animate-[slideUp_0.3s_ease-out]">
                        <h3 className="text-white font-bold text-lg mb-4">Selecionar cartão</h3>
                        <div className="space-y-2">
                            {creditCards.map(card => (
                                <button
                                    key={card.id}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, account_id: card.id }));
                                        setShowCardPicker(false);
                                    }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${formData.account_id === card.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-medium">{card.name}</p>
                                        <p className="text-slate-500 text-sm">{card.bank}</p>
                                    </div>
                                    {formData.account_id === card.id && (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Picker Modal */}
            {showInvoicePicker && (
                <div className="fixed inset-0 z-[60] flex items-end">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowInvoicePicker(false)} />
                    <div className="relative w-full bg-slate-900 rounded-t-3xl p-6 animate-[slideUp_0.3s_ease-out]">
                        <div className="space-y-2">
                            {invoiceDates.map(inv => (
                                <button
                                    key={inv.id}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, invoice_date: inv.value }));
                                        setShowInvoicePicker(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${formData.invoice_date === inv.value ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className="text-white">{inv.label}</span>
                                    {formData.invoice_date === inv.value && (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Installment Picker Modal */}
            {showInstallmentPicker && (
                <div className="fixed inset-0 z-[60] flex items-end">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowInstallmentPicker(false)} />
                    <div className="relative w-full bg-slate-900 rounded-t-3xl animate-[slideUp_0.3s_ease-out]">
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-white font-bold text-lg">Como sua transação se repete?</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                            <button
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, is_installment: false, installments: 1 }));
                                    setShowInstallmentPicker(false);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50"
                            >
                                <RotateCcw className="w-5 h-5 text-slate-500" />
                                <span className="text-white">Número de vezes</span>
                            </button>
                            {installmentOptions.map(opt => (
                                <button
                                    key={opt.count}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, installments: opt.count }));
                                        setShowInstallmentPicker(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${formData.installments === opt.count ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className="text-white">{opt.label}</span>
                                    {formData.installments === opt.count && (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-800">
                            <button
                                onClick={() => setShowInstallmentPicker(false)}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl"
                            >
                                CONCLUÍDO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attach Menu */}
            {showAttachMenu && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowAttachMenu(false)} />
                    <div className="relative bg-slate-800 rounded-2xl w-full max-w-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="text-white font-medium">Escolher ação</h3>
                        </div>
                        <button className="w-full p-4 text-left text-white hover:bg-slate-700">
                            Tirar foto
                        </button>
                        <button className="w-full p-4 text-left text-white hover:bg-slate-700">
                            Galeria
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardExpenseForm;
