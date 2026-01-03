import React, { useState, useMemo, useRef } from 'react';
import {
    ChevronLeft, Calendar, Download, FileText,
    ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp
} from 'lucide-react';
import { NeoButton, NeoCard } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import { DonutChart, BarChart, StatCard } from './ReportCharts';
import { generateReportPDF } from '../../utils/generateReportPDF';

// Color palette for categories
const CATEGORY_COLORS = [
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#EF4444', // red
    '#06B6D4', // cyan
    '#F97316', // orange
    '#6366F1', // indigo
    '#14B8A6', // teal
];

const PERIOD_PRESETS = [
    { id: 'this-month', label: 'Este mês' },
    { id: 'last-month', label: 'Mês anterior' },
    { id: 'last-3-months', label: 'Últimos 3 meses' },
    { id: 'this-year', label: 'Este ano' },
    { id: 'custom', label: 'Personalizado' }
];

export const ExportReportScreen = ({ onBack }) => {
    const { transactions, categories, accounts } = useData();
    const reportRef = useRef(null);

    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Calculate date range based on selected period
    const dateRange = useMemo(() => {
        const now = new Date();
        let start, end;

        switch (selectedPeriod) {
            case 'this-month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last-month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last-3-months':
                start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'this-year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                start = customStartDate ? new Date(customStartDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                end = customEndDate ? new Date(customEndDate) : now;
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = now;
        }

        return { start, end };
    }, [selectedPeriod, customStartDate, customEndDate]);

    // Filter transactions by date range
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= dateRange.start && txDate <= dateRange.end;
        });
    }, [transactions, dateRange]);

    // Calculate summary
    const summary = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'entrada')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const expense = filteredTransactions
            .filter(t => t.type === 'saida')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        return {
            income,
            expense,
            balance: income - expense,
            transactionCount: filteredTransactions.length
        };
    }, [filteredTransactions]);

    // Category breakdown for donut chart
    const categoryData = useMemo(() => {
        const expenseByCategory = {};

        filteredTransactions
            .filter(t => t.type === 'saida')
            .forEach(t => {
                const catId = t.category_id || 'other';
                if (!expenseByCategory[catId]) {
                    expenseByCategory[catId] = 0;
                }
                expenseByCategory[catId] += parseFloat(t.amount) || 0;
            });

        return Object.entries(expenseByCategory)
            .map(([catId, value], index) => {
                const category = categories.find(c => c.id === catId);
                return {
                    name: category?.name || 'Outros',
                    value,
                    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, categories]);

    // Monthly data for bar chart
    const monthlyData = useMemo(() => {
        const months = {};
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            if (!months[key]) {
                months[key] = {
                    label: monthNames[date.getMonth()],
                    income: 0,
                    expense: 0,
                    order: date.getFullYear() * 12 + date.getMonth()
                };
            }

            if (t.type === 'entrada') {
                months[key].income += parseFloat(t.amount) || 0;
            } else if (t.type === 'saida') {
                months[key].expense += parseFloat(t.amount) || 0;
            }
        });

        return Object.values(months).sort((a, b) => a.order - b.order);
    }, [filteredTransactions]);

    // Format period label
    const periodLabel = useMemo(() => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return `${dateRange.start.toLocaleDateString('pt-BR', options)} - ${dateRange.end.toLocaleDateString('pt-BR', options)}`;
    }, [dateRange]);

    // Generate PDF
    const handleGeneratePDF = async () => {
        if (!reportRef.current) return;

        setIsGenerating(true);
        try {
            await generateReportPDF(reportRef.current, {
                periodLabel,
                summary,
                fileName: `relatorio-financeiro-${selectedPeriod}.pdf`
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        }
        setIsGenerating(false);
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <header className="flex items-center gap-4">
                <NeoButton variant="ghost" className="!p-2 rounded-full" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </NeoButton>
                <div>
                    <h1 className="text-2xl font-bold text-white">Exportar Relatório</h1>
                    <p className="text-slate-400 text-sm">Gere um PDF com seu resumo financeiro</p>
                </div>
            </header>

            {/* Period Selector */}
            <NeoCard>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Período</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {PERIOD_PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => setSelectedPeriod(preset.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedPeriod === preset.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Range */}
                {selectedPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">De</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full mt-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Até</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full mt-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                <p className="text-slate-500 text-sm mt-3">
                    📅 {periodLabel}
                </p>
            </NeoCard>

            {/* Report Preview */}
            <div ref={reportRef} className="space-y-6 p-1">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        label="Entradas"
                        value={formatCurrency(summary.income)}
                        type="income"
                        icon={ArrowUpRight}
                    />
                    <StatCard
                        label="Saídas"
                        value={formatCurrency(summary.expense)}
                        type="expense"
                        icon={ArrowDownLeft}
                    />
                </div>

                {/* Balance Card */}
                <div className="relative w-full rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-blue-600 to-violet-700 shadow-xl">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Saldo do Período
                            </p>
                            <p className={`text-3xl font-bold mt-1 ${summary.balance >= 0 ? 'text-white' : 'text-rose-300'}`}>
                                {formatCurrency(summary.balance)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-200 text-xs">{summary.transactionCount} transações</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Expenses by Category */}
                    <NeoCard>
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-violet-400" />
                            Despesas por Categoria
                        </h3>
                        <div className="flex justify-center">
                            <DonutChart data={categoryData} size={180} />
                        </div>
                    </NeoCard>

                    {/* Monthly Comparison */}
                    {monthlyData.length > 0 && (
                        <NeoCard>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Comparativo Mensal
                            </h3>
                            <BarChart data={monthlyData} height={180} />
                        </NeoCard>
                    )}
                </div>

                {/* Top Transactions */}
                <NeoCard>
                    <h3 className="text-white font-semibold mb-4">Maiores Transações</h3>
                    <div className="space-y-3">
                        {filteredTransactions
                            .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
                            .slice(0, 5)
                            .map(t => {
                                const cat = categories.find(c => c.id === t.category_id);
                                return (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                        <div>
                                            <p className="text-white text-sm font-medium">{t.description}</p>
                                            <p className="text-slate-500 text-xs">{cat?.name || 'Sem categoria'} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <p className={`font-semibold text-sm ${t.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {t.type === 'saida' && '- '}
                                            {formatCurrency(t.amount)}
                                        </p>
                                    </div>
                                );
                            })
                        }
                        {filteredTransactions.length === 0 && (
                            <p className="text-slate-500 text-center py-4">Nenhuma transação no período</p>
                        )}
                    </div>
                </NeoCard>
            </div>

            {/* Generate Button */}
            <NeoButton
                onClick={handleGeneratePDF}
                className="w-full !py-4"
                disabled={isGenerating}
            >
                <Download className="w-5 h-5 mr-2" />
                {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
            </NeoButton>
        </div>
    );
};
