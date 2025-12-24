import React, { useState, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronDown, MoreVertical, Plus,
    CreditCard as CardIcon, Calendar, CalendarCheck, FileText, DollarSign,
    Check, Edit2, Trash2
} from 'lucide-react';
import { IconRender, FloatingActionButton } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import { EditTransactionModal } from '../transactions/EditTransactionModal';
import { CreditCardExpenseForm } from '../transactions/CreditCardExpenseForm';

export const CreditCardDetailsScreen = ({ cardId, accounts, transactions, categories, onNavigate, onUpdateTransaction, onDeleteTransaction, onAddTransaction, onAddCategory }) => {
    const creditCards = useMemo(() => accounts.filter(a => a.type === 'cartao'), [accounts]);

    const [selectedCardId, setSelectedCardId] = useState(cardId || creditCards[0]?.id);
    const [showCardDropdown, setShowCardDropdown] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Current month/year for invoice navigation
    const [currentDate, setCurrentDate] = useState(() => {
        const now = new Date();
        return { month: now.getMonth(), year: now.getFullYear() };
    });

    const selectedCard = useMemo(() =>
        creditCards.find(c => c.id === selectedCardId) || creditCards[0],
        [creditCards, selectedCardId]
    );

    // Calculate invoice dates based on card's closing/due day
    const invoiceInfo = useMemo(() => {
        if (!selectedCard) return null;

        const closingDay = selectedCard.closing_day || 7;
        const dueDay = selectedCard.due_day || selectedCard.dueDate || 14;

        // Create closing date for current month view
        const closingDate = new Date(currentDate.year, currentDate.month, closingDay);

        // Due date is typically in the next month after closing
        const dueDate = new Date(currentDate.year, currentDate.month, dueDay);
        if (dueDay <= closingDay) {
            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        // Invoice period: from previous closing to current closing
        const periodStart = new Date(closingDate);
        periodStart.setMonth(periodStart.getMonth() - 1);
        periodStart.setDate(closingDay + 1);

        const periodEnd = new Date(closingDate);

        // Check if invoice is open (current date is before closing)
        const now = new Date();
        const isOpen = now <= closingDate || (now.getMonth() <= currentDate.month && now.getFullYear() <= currentDate.year);

        return {
            closingDate,
            dueDate,
            periodStart,
            periodEnd,
            isOpen
        };
    }, [selectedCard, currentDate]);

    // Filter transactions for the current invoice period
    const invoiceTransactions = useMemo(() => {
        if (!invoiceInfo || !selectedCard) return [];

        return transactions.filter(t => {
            // Must be credit card expense for this card
            if (t.account_id !== selectedCard.id) return false;
            if (t.payment_method !== 'cartao_credito') return false;

            const txDate = new Date(t.date);
            return txDate >= invoiceInfo.periodStart && txDate <= invoiceInfo.periodEnd;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, selectedCard, invoiceInfo]);

    // Calculate invoice total
    const invoiceTotal = useMemo(() =>
        invoiceTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        [invoiceTransactions]
    );

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups = {};
        invoiceTransactions.forEach(t => {
            const dateKey = t.date;
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(t);
        });
        return groups;
    }, [invoiceTransactions]);

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.year, prev.month + direction, 1);
            return { month: newDate.getMonth(), year: newDate.getFullYear() };
        });
    };

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const formatInvoiceDate = (date) => {
        if (!date) return '-';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (!selectedCard) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Nenhum cartão cadastrado</p>
            </div>
        );
    }

    const gradient = selectedCard.bank_gradient || 'from-slate-800 to-slate-900';
    const textColor = selectedCard.bank_text || 'text-white';

    return (
        <div className="space-y-4 pb-24 animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Card Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCardDropdown(!showCardDropdown)}
                            className="flex items-center gap-2 text-white font-bold text-lg"
                        >
                            <span>{selectedCard.bank || selectedCard.name}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform ${showCardDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showCardDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                {creditCards.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => {
                                            setSelectedCardId(card.id);
                                            setShowCardDropdown(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${selectedCardId === card.id ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.bank_gradient || 'from-violet-500 to-purple-600'} flex items-center justify-center`}>
                                                <CardIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-medium">{card.bank || card.name}</span>
                                        </div>
                                        {selectedCardId === card.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Options Menu */}
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showOptionsMenu && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setShowOptionsMenu(false);
                                        onNavigate('gerenciar-contas');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span className="text-sm">Editar cartão</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-medium">
                    {monthNames[currentDate.month]}  {currentDate.year}
                </span>
                <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Invoice Summary Card */}
            <div className={`relative w-full rounded-3xl overflow-hidden p-6 bg-gradient-to-br ${gradient} shadow-2xl`}>
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-3xl" />

                {/* Card Header */}
                <div className="relative z-10 flex justify-center mb-6">
                    <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl">
                        <CardIcon className={`w-8 h-8 ${textColor}`} />
                    </div>
                </div>

                <h2 className={`relative z-10 text-center text-xl font-bold ${textColor} mb-6`}>
                    {selectedCard.bank || selectedCard.name}
                </h2>

                {/* Invoice Details Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Calendar className={`w-4 h-4 ${textColor} opacity-80`} />
                        </div>
                        <div>
                            <p className={`text-xs ${textColor} opacity-70`}>Dia do fechamento</p>
                            <p className={`text-sm font-medium ${textColor}`}>
                                Fecha em {formatInvoiceDate(invoiceInfo?.closingDate)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <CalendarCheck className={`w-4 h-4 ${textColor} opacity-80`} />
                        </div>
                        <div>
                            <p className={`text-xs ${textColor} opacity-70`}>Data vencimento</p>
                            <p className={`text-sm font-medium ${textColor}`}>
                                {formatInvoiceDate(invoiceInfo?.dueDate)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FileText className={`w-4 h-4 ${textColor} opacity-80`} />
                        </div>
                        <div>
                            <p className={`text-xs ${textColor} opacity-70`}>Status da fatura</p>
                            <p className={`text-sm font-medium ${textColor}`}>
                                {invoiceInfo?.isOpen ? 'Fatura aberta' : 'Fatura fechada'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <DollarSign className={`w-4 h-4 ${textColor} opacity-80`} />
                        </div>
                        <div>
                            <p className={`text-xs ${textColor} opacity-70`}>Total fatura</p>
                            <p className={`text-sm font-bold text-emerald-400`}>
                                {formatCurrency(invoiceTotal)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500">Nenhuma transação neste período</p>
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([date, txs]) => (
                        <div key={date}>
                            <p className="text-slate-500 text-sm mb-2 px-1">
                                {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </p>
                            <div className="space-y-2">
                                {txs.map(t => {
                                    const cat = categories.find(c => c.id === t.category_id) || {};
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTransaction(t)}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-rose-400">
                                                    <IconRender name={cat.icon} className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">{t.description}</p>
                                                    <p className="text-slate-500 text-xs">{cat.name || 'Sem categoria'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm text-rose-400">
                                                    {formatCurrency(t.amount)}
                                                </p>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <div className="w-4 h-4 rounded bg-slate-700 flex items-center justify-center">
                                                        <CardIcon className="w-2.5 h-2.5 text-slate-400" />
                                                    </div>
                                                    {t.is_recurring && (
                                                        <div className="w-4 h-4 rounded bg-rose-500/20 flex items-center justify-center">
                                                            <Trash2 className="w-2.5 h-2.5 text-rose-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <FloatingActionButton onClick={() => setShowAddExpense(true)} />

            {/* Edit Transaction Modal */}
            {selectedTransaction && (
                <EditTransactionModal
                    transaction={selectedTransaction}
                    categories={categories}
                    accounts={accounts}
                    onSave={(updated) => {
                        onUpdateTransaction(updated);
                        setSelectedTransaction(null);
                    }}
                    onDelete={(id) => {
                        onDeleteTransaction(id);
                        setSelectedTransaction(null);
                    }}
                    onClose={() => setSelectedTransaction(null)}
                    onAddCategory={onAddCategory}
                />
            )}

            {/* Add Credit Card Expense */}
            {showAddExpense && (
                <CreditCardExpenseForm
                    categories={categories}
                    accounts={accounts}
                    onClose={() => setShowAddExpense(false)}
                    onAdd={onAddTransaction}
                    onAddCategory={onAddCategory}
                />
            )}

            {/* Close dropdowns on outside click */}
            {(showCardDropdown || showOptionsMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowCardDropdown(false);
                        setShowOptionsMenu(false);
                    }}
                />
            )}
        </div>
    );
};
