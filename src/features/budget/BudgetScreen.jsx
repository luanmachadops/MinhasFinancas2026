import React, { useState, useMemo } from 'react';
import {
    Target, Plus, ChevronLeft, ChevronRight,
    Edit2, Trash2, Check, X, Copy, Users
} from 'lucide-react';
import { NeoCard, NeoButton, NeoInput, ModalOverlay, FloatingActionButton, IconRender, MonthSelector } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

export const BudgetScreen = () => {
    const {
        budgets, addBudget, updateBudget, removeBudget,
        categories, transactions, isReadOnly, activeWorkspace
    } = useData();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    // Filter budgets for current month
    const monthlyBudgets = useMemo(() => {
        return budgets.filter(b => b.month === selectedMonth + 1 && b.year === selectedYear);
    }, [budgets, selectedMonth, selectedYear]);

    // Calculate spending per category
    const categorySpending = useMemo(() => {
        const spending = {};
        transactions
            .filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === selectedMonth &&
                    date.getFullYear() === selectedYear &&
                    t.type === 'saida';
            })
            .forEach(t => {
                const catId = t.category_id || t.categoryId;
                spending[catId] = (spending[catId] || 0) + t.amount;
            });
        return spending;
    }, [transactions, selectedMonth, selectedYear]);

    const handleMonthChange = (newMonth, newYear) => {
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const copyFromPreviousMonth = () => {
        let prevMonth = selectedMonth;
        let prevYear = selectedYear;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear--;
        }

        const previousBudgets = budgets.filter(b => b.month === prevMonth && b.year === prevYear);

        if (previousBudgets.length === 0) {
            alert('Nenhum orçamento encontrado no mês anterior');
            return;
        }

        previousBudgets.forEach(pb => {
            // Check if already exists
            const exists = monthlyBudgets.find(mb => mb.category_id === pb.category_id);
            if (!exists) {
                addBudget({
                    id: crypto.randomUUID(),
                    category_id: pb.category_id,
                    month: selectedMonth + 1,
                    year: selectedYear,
                    limit_amount: pb.limit_amount
                });
            }
        });
    };

    // Stats
    const totalBudget = monthlyBudgets.reduce((acc, b) => acc + (b.limit_amount || 0), 0);
    const totalSpent = Object.values(categorySpending).reduce((acc, v) => acc + v, 0);
    const remaining = totalBudget - totalSpent;

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">Orçamento</h1>
                    {activeWorkspace?.type === 'shared' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                            <Users className="w-3 h-3" /> Compartilhado
                        </span>
                    )}
                </div>
                <p className="text-slate-400 text-sm">Planeje seus gastos mensais</p>
            </header>

            {/* Month Selector - Clicável com modal */}
            <MonthSelector
                month={selectedMonth}
                year={selectedYear}
                onChange={handleMonthChange}
            />

            {/* Summary Card */}
            <NeoCard className="!p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Orçamento</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Gasto</p>
                        <p className="text-lg font-bold text-rose-400">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Restante</p>
                        <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(remaining)}
                        </p>
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                    />
                </div>
            </NeoCard>

            {/* Copy Button */}
            {monthlyBudgets.length === 0 && (
                <button
                    onClick={copyFromPreviousMonth}
                    className="w-full py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium flex items-center justify-center gap-2 hover:bg-violet-500/30 transition-colors"
                >
                    <Copy className="w-5 h-5" />
                    Copiar do Mês Anterior
                </button>
            )}

            {/* Budget List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold">Categorias</h3>
                    <span className="text-xs text-slate-500">{monthlyBudgets.length} itens</span>
                </div>

                {monthlyBudgets.length === 0 ? (
                    <div className="text-center py-10">
                        <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Nenhum orçamento definido</p>
                        <p className="text-slate-500 text-xs mt-1">Clique no + para adicionar</p>
                    </div>
                ) : (
                    monthlyBudgets.map(budget => {
                        const category = categories.find(c => c.id === budget.category_id);
                        const spent = categorySpending[budget.category_id] || 0;
                        const percentage = (spent / budget.limit_amount) * 100;
                        const isOver = spent > budget.limit_amount;

                        return (
                            <NeoCard key={budget.id} className="!p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOver ? 'bg-rose-500/20' : 'bg-slate-800'}`}>
                                            <IconRender name={category?.icon} className={`w-5 h-5 ${isOver ? 'text-rose-400' : 'text-slate-400'}`} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{category?.name || 'Categoria'}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatCurrency(spent)} / {formatCurrency(budget.limit_amount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {percentage.toFixed(0)}%
                                        </span>
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => setEditingBudget(budget)}
                                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                            </NeoCard>
                        );
                    })
                )}
            </div>

            {!isReadOnly && <FloatingActionButton onClick={() => setShowAddModal(true)} />}

            {/* Add/Edit Modal */}
            {(showAddModal || editingBudget) && (
                <ModalOverlay
                    title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                    onClose={() => { setShowAddModal(false); setEditingBudget(null); }}
                >
                    <BudgetForm
                        budget={editingBudget}
                        categories={categories.filter(c => c.type === 'saida')}
                        existingBudgets={monthlyBudgets}
                        month={selectedMonth + 1}
                        year={selectedYear}
                        onSubmit={(data) => {
                            if (editingBudget) {
                                updateBudget(editingBudget.id, data);
                            } else {
                                addBudget({ id: crypto.randomUUID(), ...data });
                            }
                            setShowAddModal(false);
                            setEditingBudget(null);
                        }}
                        onDelete={editingBudget ? () => {
                            removeBudget(editingBudget.id);
                            setEditingBudget(null);
                        } : null}
                        onClose={() => { setShowAddModal(false); setEditingBudget(null); }}
                    />
                </ModalOverlay>
            )}
        </div>
    );
};

const BudgetForm = ({ budget, categories, existingBudgets, month, year, onSubmit, onDelete, onClose }) => {
    const [formData, setFormData] = useState({
        category_id: budget?.category_id || '',
        limit_amount: budget?.limit_amount || '',
        month,
        year
    });

    const availableCategories = categories.filter(c =>
        !existingBudgets.find(b => b.category_id === c.id) ||
        (budget && budget.category_id === c.id)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.category_id || !formData.limit_amount) return;
        onSubmit({
            ...formData,
            limit_amount: parseFloat(formData.limit_amount)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    required
                    disabled={!!budget}
                >
                    <option value="">Selecione...</option>
                    {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <NeoInput
                label="Limite Mensal"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                required
            />

            <div className="flex gap-3">
                {onDelete && (
                    <NeoButton type="button" variant="danger" onClick={onDelete} className="flex-1">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                    </NeoButton>
                )}
                <NeoButton type="submit" className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    {budget ? 'Salvar' : 'Adicionar'}
                </NeoButton>
            </div>
        </form>
    );
};
