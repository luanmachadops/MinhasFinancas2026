import React, { useState, useMemo, useRef } from 'react';
import { Search, Users } from 'lucide-react';
import { NeoButton, NeoCard, FloatingActionButton, ModalOverlay, IconRender, DonutChart, MonthSelector } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AddTransactionForm } from './AddTransactionForm';
import { EditTransactionModal } from './EditTransactionModal';
import { TransferModal } from './TransferModal';
import { CreditCardExpenseForm } from './CreditCardExpenseForm';
import { useData } from '../../contexts/DataContext';

export const TransactionsScreen = ({ transactions, categories, accounts = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction, onAddCategory, initialFilter = 'todos' }) => {
    const { isReadOnly, activeWorkspace } = useData();
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [activeTab, setActiveTab] = useState(initialFilter);
    const [newTransactionType, setNewTransactionType] = useState('saida');
    const [isCardExpense, setIsCardExpense] = useState(false);

    // Search
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // Date Logic
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleMonthChange = (newMonth, newYear) => {
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    // Filter Data
    const { filteredTransactions, chartData, totalEntrada, totalSaida, totalPending, totalPaid } = useMemo(() => {
        // Filter by month/year
        const allMonthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
        });

        // Filter by type if not 'todos'
        let filtered = activeTab === 'todos'
            ? allMonthTransactions
            : allMonthTransactions.filter(t => t.type === activeTab);

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => {
                const cat = categories.find(c => c.id === (t.category_id || t.categoryId));
                return t.description?.toLowerCase().includes(query) ||
                    cat?.name?.toLowerCase().includes(query);
            });
        }

        // Sort by date
        const sortedFiltered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate totals for entrada/saida
        const entrada = allMonthTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const saida = allMonthTransactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);

        // Calculate pending/paid for current filter
        const pending = sortedFiltered.filter(t => !t.is_paid).reduce((acc, t) => acc + t.amount, 0);
        const paid = sortedFiltered.filter(t => t.is_paid).reduce((acc, t) => acc + t.amount, 0);

        // Chart data
        let data;
        if (activeTab === 'todos') {
            // Gráfico comparativo entrada vs saída
            data = [
                { id: 'entrada', name: 'Receitas', value: entrada, color: '#10b981' },
                { id: 'saida', name: 'Despesas', value: saida, color: '#f43f5e' }
            ].filter(d => d.value > 0);
        } else {
            // Gráfico por categoria
            const categoryMap = {};
            sortedFiltered.forEach(t => {
                const catId = t.category_id || t.categoryId;
                if (!categoryMap[catId]) {
                    const cat = categories.find(c => c.id === catId);
                    categoryMap[catId] = {
                        id: catId,
                        name: cat?.name || 'Outros',
                        value: 0,
                        color: activeTab === 'entrada' ? '#10b981' : '#f43f5e'
                    };
                }
                categoryMap[catId].value += t.amount;
            });
            data = Object.values(categoryMap).sort((a, b) => b.value - a.value);
        }

        return {
            filteredTransactions: sortedFiltered,
            chartData: data,
            totalEntrada: entrada,
            totalSaida: saida,
            totalPending: pending,
            totalPaid: paid
        };

    }, [transactions, selectedMonth, selectedYear, activeTab, categories, searchQuery]);


    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex items-center justify-between gap-3">
                {showSearch ? (
                    <div className="flex-1 flex items-center gap-2 bg-slate-900 rounded-xl border border-slate-700 px-3 py-2">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por descrição ou categoria..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
                            autoFocus
                        />
                        <button
                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                            className="text-slate-500 hover:text-white text-xs"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">Extrato</h1>
                            {activeWorkspace?.type === 'shared' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                                    <Users className="w-3 h-3" /> Compartilhado
                                </span>
                            )}
                        </div>
                        <NeoButton
                            variant="ghost"
                            className="!p-2 !rounded-full"
                            onClick={() => setShowSearch(true)}
                        >
                            <Search className="w-5 h-5" />
                        </NeoButton>
                    </>
                )}
            </header>

            {/* Month Selector */}
            <MonthSelector
                month={selectedMonth}
                year={selectedYear}
                onChange={handleMonthChange}
            />

            {/* Summary Cards - Dinâmicos baseado no tab */}
            {activeTab === 'todos' ? (
                <>
                    {/* Para "Todos": Total Receitas / Total Despesas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-slate-400">Total Receitas</span>
                            </div>
                            <p className="text-lg font-bold text-emerald-400">
                                {formatCurrency(totalEntrada)}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl border bg-rose-500/5 border-rose-500/20">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-xs text-slate-400">Total Despesas</span>
                            </div>
                            <p className="text-lg font-bold text-rose-400">
                                {formatCurrency(totalSaida)}
                            </p>
                        </div>
                    </div>
                    {/* Saldo do mês */}
                    <div className={`p-3 rounded-xl border text-center ${(totalEntrada - totalSaida) >= 0
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                        }`}>
                        <span className="text-xs text-slate-400">Saldo do mês: </span>
                        <span className={`font-bold ${(totalEntrada - totalSaida) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(totalEntrada - totalSaida)}
                        </span>
                    </div>
                </>
            ) : (
                /* Para Receitas/Despesas: Pendente / Pago ou Recebido */
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl border ${activeTab === 'entrada'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${activeTab === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                            <span className="text-xs text-slate-400">
                                {activeTab === 'entrada' ? 'A Receber' : 'A Pagar'}
                            </span>
                        </div>
                        <p className={`text-lg font-bold ${activeTab === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                            {formatCurrency(totalPending)}
                        </p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${activeTab === 'entrada'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${activeTab === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                            <span className="text-xs text-slate-400">
                                {activeTab === 'entrada' ? 'Recebido' : 'Pago'}
                            </span>
                        </div>
                        <p className={`text-lg font-bold ${activeTab === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                            {formatCurrency(totalPaid)}
                        </p>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button onClick={() => setActiveTab('todos')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'todos' ? 'bg-slate-800 text-blue-400 shadow-lg' : 'text-slate-500'}`}>
                    Todos
                </button>
                <button onClick={() => setActiveTab('entrada')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'entrada' ? 'bg-slate-800 text-emerald-400 shadow-lg' : 'text-slate-500'}`}>
                    Receitas
                </button>
                <button onClick={() => setActiveTab('saida')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'saida' ? 'bg-slate-800 text-rose-400 shadow-lg' : 'text-slate-500'}`}>
                    Despesas
                </button>
            </div>

            {/* Chart Section - Only show when not 'todos' or has data */}
            {chartData.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4 relative">
                    <DonutChart data={chartData} size={180} thickness={18} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                            {activeTab === 'todos' ? 'BALANÇO' : activeTab === 'entrada' ? 'RECEITA' : 'DESPESA'}
                        </span>
                        <span className="text-xl font-bold text-white">
                            {formatCurrency(activeTab === 'todos' ? totalEntrada + totalSaida : activeTab === 'entrada' ? totalEntrada : totalSaida)}
                        </span>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-white font-bold text-lg">Transações</h3>
                    <span className="text-xs text-slate-500">{filteredTransactions.length} registros</span>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-slate-400 text-sm">Nenhuma transação neste mês.</p>
                    </div>
                )}

                {filteredTransactions.map(t => {
                    const catId = t.category_id || t.categoryId;
                    const cat = categories.find(c => c.id === catId) || {};
                    return (
                        <NeoCard
                            key={t.id}
                            onClick={() => setSelectedTransaction(t)}
                            className="!p-4 flex items-center justify-between group hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg
                                    ${t.type === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : t.type === 'investimento' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}
                                `}>
                                    <IconRender name={cat.icon} className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{t.description}</h4>
                                    <p className="text-xs text-slate-500">{formatDate(t.date)} • {cat.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`block font-bold 
                                    ${t.type === 'entrada' ? 'text-emerald-400' : t.type === 'investimento' ? 'text-blue-400' : 'text-white'}
                                `}>
                                    {t.type === 'saida' ? '-' : '+'} {formatCurrency(t.amount)}
                                </span>
                            </div>
                        </NeoCard>
                    )
                })}
            </div>

            {!isReadOnly && (
                <FloatingActionButton
                    expandable
                    onReceita={() => {
                        setNewTransactionType('entrada');
                        setIsCardExpense(false);
                        setShowModal(true);
                    }}
                    onDespesa={() => {
                        setNewTransactionType('saida');
                        setIsCardExpense(false);
                        setShowModal(true);
                    }}
                    onDespesaCartao={() => {
                        setNewTransactionType('saida');
                        setIsCardExpense(true);
                        setShowModal(true);
                    }}
                    onTransferencia={() => {
                        setShowTransferModal(true);
                    }}
                />
            )}

            {showModal && !isReadOnly && !isCardExpense && (
                <ModalOverlay
                    onClose={() => setShowModal(false)}
                    title={newTransactionType === 'entrada' ? 'Nova Receita' : 'Nova Despesa'}
                >
                    <AddTransactionForm
                        categories={categories}
                        accounts={accounts}
                        onClose={() => setShowModal(false)}
                        onAdd={onAddTransaction}
                        onAddCategory={onAddCategory}
                        initialType={newTransactionType}
                    />
                </ModalOverlay>
            )}

            {showModal && !isReadOnly && isCardExpense && (
                <CreditCardExpenseForm
                    categories={categories}
                    accounts={accounts}
                    onClose={() => {
                        setShowModal(false);
                        setIsCardExpense(false);
                    }}
                    onAdd={onAddTransaction}
                    onAddCategory={onAddCategory}
                />
            )}

            {selectedTransaction && (
                <ModalOverlay onClose={() => setSelectedTransaction(null)} title="Editar Transação">
                    <EditTransactionModal
                        transaction={selectedTransaction}
                        categories={categories}
                        onUpdate={onUpdateTransaction}
                        onDelete={onDeleteTransaction}
                        onClose={() => setSelectedTransaction(null)}
                        onAddCategory={onAddCategory}
                    />
                </ModalOverlay>
            )}

            {showTransferModal && (
                <ModalOverlay onClose={() => setShowTransferModal(false)} title="Transferência entre Contas">
                    <TransferModal onClose={() => setShowTransferModal(false)} />
                </ModalOverlay>
            )}
        </div>
    );
};

