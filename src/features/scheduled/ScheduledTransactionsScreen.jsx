import React, { useState, useMemo } from 'react';
import {
    Calendar, Plus, Check, Clock, AlertCircle, Filter,
    CreditCard, FileText, Banknote, ArrowUpRight, ArrowDownLeft,
    ChevronDown
} from 'lucide-react';
import { NeoCard, NeoButton, NeoInput, ModalOverlay, FloatingActionButton, IconRender, MonthSelector } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

const PAYMENT_METHODS = [
    { id: 'cartao_credito', name: 'Cartão Crédito', icon: CreditCard, color: 'text-violet-400' },
    { id: 'debito', name: 'Débito', icon: CreditCard, color: 'text-blue-400' },
    { id: 'boleto', name: 'Boleto', icon: FileText, color: 'text-orange-400' },
    { id: 'pix', name: 'PIX', icon: Banknote, color: 'text-emerald-400' },
    { id: 'dinheiro', name: 'Dinheiro', icon: Banknote, color: 'text-green-400' },
];

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48];

export const ScheduledTransactionsScreen = () => {
    const {
        scheduledTransactions,
        addScheduledTransaction,
        markAsPaid,
        removeScheduledTransaction,
        categories,
        accounts,
        isReadOnly
    } = useData();

    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('pendente');

    // Date state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleMonthChange = (newMonth, newYear) => {
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const today = new Date().toISOString().split('T')[0];

    // Atualizar status de atrasados e filtrar por mês
    const processedTransactions = useMemo(() => {
        return scheduledTransactions
            .filter(t => {
                const dueDate = new Date(t.due_date);
                return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
            })
            .map(t => {
                if (t.status === 'pendente' && t.due_date < today) {
                    return { ...t, status: 'atrasado' };
                }
                return t;
            });
    }, [scheduledTransactions, selectedMonth, selectedYear, today]);

    // Filtrar transações
    const filteredTransactions = useMemo(() => {
        let filtered = processedTransactions;

        if (activeTab === 'pendente') {
            filtered = filtered.filter(t => t.status === 'pendente' || t.status === 'atrasado');
        } else {
            filtered = filtered.filter(t => t.status === 'pago');
        }

        if (filter === 'pagar') filtered = filtered.filter(t => t.type === 'pagar');
        if (filter === 'receber') filtered = filtered.filter(t => t.type === 'receber');
        if (filter === 'atrasado') filtered = filtered.filter(t => t.status === 'atrasado');

        return filtered.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }, [processedTransactions, filter, activeTab]);

    // Stats
    const stats = useMemo(() => {
        const pending = processedTransactions.filter(t => t.status === 'pendente' || t.status === 'atrasado');
        const totalPagar = pending.filter(t => t.type === 'pagar').reduce((acc, t) => acc + t.installment_amount, 0);
        const totalReceber = pending.filter(t => t.type === 'receber').reduce((acc, t) => acc + t.installment_amount, 0);
        const atrasados = pending.filter(t => t.status === 'atrasado').length;
        return { totalPagar, totalReceber, atrasados };
    }, [processedTransactions]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pago': return 'bg-emerald-500/20 text-emerald-400';
            case 'atrasado': return 'bg-rose-500/20 text-rose-400';
            default: return 'bg-slate-700/50 text-slate-400';
        }
    };

    const getPaymentMethod = (methodId) => PAYMENT_METHODS.find(m => m.id === methodId) || PAYMENT_METHODS[4];

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header>
                <h1 className="text-2xl font-bold text-white">Contas</h1>
                <p className="text-slate-400 text-sm">Gerencie suas contas a pagar e receber</p>
            </header>

            {/* Month Selector */}
            <MonthSelector
                month={selectedMonth}
                year={selectedYear}
                onChange={handleMonthChange}
            />

            {/* Summary Cards - Clicáveis para filtrar */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setFilter(filter === 'pagar' ? 'all' : 'pagar')}
                    className={`p-4 rounded-2xl border text-left transition-all ${filter === 'pagar'
                        ? 'bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                        <span className="text-xs text-slate-400">A Pagar</span>
                    </div>
                    <p className="text-xl font-bold text-rose-400">{formatCurrency(stats.totalPagar)}</p>
                </button>
                <button
                    onClick={() => setFilter(filter === 'receber' ? 'all' : 'receber')}
                    className={`p-4 rounded-2xl border text-left transition-all ${filter === 'receber'
                        ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">A Receber</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats.totalReceber)}</p>
                </button>
            </div>

            {/* Alerta de atrasados - Clicável */}
            {stats.atrasados > 0 && (
                <button
                    onClick={() => setFilter(filter === 'atrasado' ? 'all' : 'atrasado')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${filter === 'atrasado'
                        ? 'bg-rose-500/30 border-2 border-rose-500'
                        : 'bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                >
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-rose-300 text-sm font-medium">
                        {stats.atrasados} conta{stats.atrasados > 1 ? 's' : ''} atrasada{stats.atrasados > 1 ? 's' : ''}
                    </span>
                </button>
            )}

            {/* Tabs - Simplificados */}
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('pendente')}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'pendente' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                        Pendentes
                    </button>
                    <button
                        onClick={() => setActiveTab('pago')}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'pago' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                        Pagas
                    </button>
                </div>

                {filter !== 'all' && (
                    <button
                        onClick={() => setFilter('all')}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Limpar filtro
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10">
                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Nenhuma conta encontrada</p>
                    </div>
                ) : (
                    filteredTransactions.map(item => {
                        const method = getPaymentMethod(item.payment_method);
                        const MethodIcon = method.icon;
                        const category = categories.find(c => c.id === item.category_id);

                        return (
                            <div
                                key={item.id}
                                className={`p-4 rounded-xl border transition-all ${item.status === 'atrasado'
                                    ? 'bg-rose-950/30 border-rose-500/30'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${item.type === 'pagar' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                                            {category?.icon ? (
                                                <IconRender name={category.icon} className={`w-5 h-5 ${item.type === 'pagar' ? 'text-rose-400' : 'text-emerald-400'}`} />
                                            ) : (
                                                item.type === 'pagar'
                                                    ? <ArrowDownLeft className="w-5 h-5 text-rose-400" />
                                                    : <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                                    {item.status === 'atrasado' ? 'Atrasado' : item.status === 'pago' ? 'Pago' : 'Pendente'}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[10px] ${method.color}`}>
                                                    <MethodIcon className="w-3 h-3" />
                                                    {method.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${item.type === 'pagar' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {item.type === 'pagar' ? '-' : '+'}{formatCurrency(item.installment_amount)}
                                        </p>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(item.due_date)}
                                        </p>
                                    </div>
                                </div>

                                {item.status !== 'pago' && !isReadOnly && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                                        <button
                                            onClick={() => markAsPaid(item.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Marcar como Pago
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {!isReadOnly && <FloatingActionButton onClick={() => setShowAddModal(true)} icon={Plus} />}

            {/* Add Modal */}
            {showAddModal && (
                <ModalOverlay title="Nova Conta" onClose={() => setShowAddModal(false)}>
                    <AddScheduledForm
                        categories={categories}
                        accounts={accounts}
                        onSubmit={(data) => {
                            addScheduledTransaction(data);
                            setShowAddModal(false);
                        }}
                        onClose={() => setShowAddModal(false)}
                    />
                </ModalOverlay>
            )}
        </div>
    );
};

const AddScheduledForm = ({ categories, accounts, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        description: '',
        total_amount: '',
        type: 'pagar',
        payment_method: 'cartao_credito',
        installments: 1,
        due_date: new Date().toISOString().split('T')[0],
        account_id: '',
        category_id: '',
        recurring: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description || !formData.total_amount || !formData.account_id) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
        onSubmit({
            ...formData,
            total_amount: parseFloat(formData.total_amount)
        });
    };

    const installmentAmount = formData.total_amount
        ? (parseFloat(formData.total_amount) / formData.installments).toFixed(2)
        : 0;

    // Filtrar contas por tipo de pagamento
    const availableAccounts = formData.payment_method === 'cartao_credito'
        ? accounts.filter(a => a.type === 'cartao')
        : accounts.filter(a => a.type === 'conta');

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo */}
            <div className="flex bg-slate-900 p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'pagar' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'pagar' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                >
                    A Pagar
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'receber' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === 'receber' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
                >
                    A Receber
                </button>
            </div>

            <NeoInput
                label="Descrição"
                placeholder="Ex: TV Samsung 55 polegadas"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
            />

            <NeoInput
                label="Valor Total"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
            />

            {/* Método de Pagamento */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Método de Pagamento</label>
                <div className="grid grid-cols-5 gap-2">
                    {PAYMENT_METHODS.map(method => {
                        const Icon = method.icon;
                        return (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_method: method.id, account_id: '' })}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${formData.payment_method === method.id
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'border-slate-800 text-slate-500 hover:border-slate-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[9px]">{method.name.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Parcelas */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Parcelamento</label>
                <div className="flex flex-wrap gap-2">
                    {INSTALLMENT_OPTIONS.slice(0, 12).map(n => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setFormData({ ...formData, installments: n })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.installments === n
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {n}x
                        </button>
                    ))}
                </div>
                {formData.total_amount && formData.installments > 1 && (
                    <p className="text-sm text-slate-400">
                        {formData.installments}x de <span className="text-white font-bold">{formatCurrency(parseFloat(installmentAmount))}</span>
                    </p>
                )}
            </div>

            <NeoInput
                label="Primeiro Vencimento"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
            />

            {/* Conta */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {formData.payment_method === 'cartao_credito' ? 'Cartão' : 'Conta'} <span className="text-rose-500">*</span>
                </label>
                <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    required
                >
                    <option value="">Selecione...</option>
                    {availableAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} {acc.bank ? `• ${acc.bank}` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                >
                    <option value="">Selecione...</option>
                    {categories.filter(c => formData.type === 'pagar' ? c.type === 'saida' : c.type === 'entrada').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <NeoButton type="submit" className="w-full">
                Criar Conta
            </NeoButton>
        </form>
    );
};
