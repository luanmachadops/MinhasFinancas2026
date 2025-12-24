import React, { useMemo, useState } from 'react';
import {
    User, Wallet, ShieldCheck, ArrowUpRight, ArrowDownLeft,
    CreditCard as CardIcon, ChevronDown, Check
} from 'lucide-react';
import { NeoCard, IconRender, ModalOverlay } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import { EditTransactionModal } from '../transactions/EditTransactionModal';

export const Dashboard = ({ transactions, categories, goals, accounts, onNavigate, user, onUpdateTransaction, onDeleteTransaction, onAddCategory }) => {
    const { activeWorkspace, setActiveWorkspace, availableWorkspaces } = useData();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const summary = useMemo(() => {
        const saldoInicialContas = accounts
            .filter(acc => acc.type === 'conta')
            .reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

        const entradas = transactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const saidas = transactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
        const guardado = goals.reduce((acc, g) => acc + (g.current_amount || g.currentAmount || 0), 0);

        const disponivel = saldoInicialContas + entradas - saidas - guardado;

        return { entradas, saidas, disponivel, guardado };
    }, [transactions, goals, accounts]);

    return (
        <div className="space-y-6 pb-24 animate-[fadeIn_0.5s_ease-out]">
            {/* Hero Header */}
            <div className="flex items-center justify-between mb-2 relative z-50">
                <div onClick={() => availableWorkspaces.length > 1 && setShowProfileMenu(!showProfileMenu)} className="cursor-pointer">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        {activeWorkspace?.type === 'personal' ? 'Olá, Usuário' : activeWorkspace?.name}
                        {availableWorkspaces.length > 1 && <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {activeWorkspace?.type === 'personal' ? 'Resumo financeiro de hoje' : 'Modo Convidado (Leitura)'}
                    </p>

                    {/* Workspace Dropdown */}
                    {showProfileMenu && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-1">
                            {availableWorkspaces.map(ws => (
                                <button
                                    key={ws.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveWorkspace(ws);
                                        setShowProfileMenu(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeWorkspace.id === ws.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <span>{ws.name}</span>
                                    {activeWorkspace.id === ws.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]" onClick={() => onNavigate('configuracao')}>
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer">
                        {user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <User
                            className="text-white w-5 h-5"
                            style={{ display: user?.user_metadata?.avatar_url ? 'none' : 'block' }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Balance Card - Glassmorphic Hero */}
            <div className="relative w-full h-48 rounded-[2rem] overflow-hidden p-6 flex flex-col justify-between shadow-2xl shadow-blue-900/20 group">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-violet-800" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

                <div className="relative z-10">
                    <p className="text-blue-100 font-medium text-sm flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Saldo Disponível
                    </p>
                    <h2 className="text-4xl font-bold text-white mt-1 tracking-tight">
                        {formatCurrency(summary.disponivel)}
                    </h2>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs text-blue-100">
                        <ShieldCheck className="w-3 h-3" />
                        {formatCurrency(summary.guardado)} em reservas
                    </div>
                </div>
            </div>

            {/* Quick Stats (Bento) */}
            <div className="grid grid-cols-2 gap-4">
                <NeoCard onClick={() => onNavigate('movimentacao', { initialFilter: 'entrada' })}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Entradas</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatCurrency(summary.entradas)}</p>
                </NeoCard>

                <NeoCard onClick={() => onNavigate('movimentacao', { initialFilter: 'saida' })}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-rose-500/10 text-rose-400">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Saídas</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatCurrency(summary.saidas)}</p>
                </NeoCard>
            </div>

            {/* Mini Cartão de Crédito Preview */}
            <div className="flex items-center justify-between mt-2">
                <h3 className="text-lg font-bold text-white">Meus Cartões</h3>
                <button onClick={() => onNavigate('configuracao')} className="text-xs text-blue-400 hover:text-blue-300">Ver todos</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar snap-x">
                {accounts.filter(a => a.type === 'cartao').map(card => {
                    const percentage = (card.balance / card.limit) * 100;
                    const gradient = card.bank_gradient || 'from-slate-800 to-slate-900';
                    const textColor = card.bank_text || 'text-white';

                    return (
                        <div
                            key={card.id}
                            onClick={() => onNavigate('cartao-detalhes', { cardId: card.id })}
                            className={`snap-center shrink-0 w-72 h-44 bg-gradient-to-br ${gradient} rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all shadow-xl`}
                        >
                            {/* Decorative blobs */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-3xl" />

                            <div className="flex justify-between items-start z-10">
                                <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl">
                                    <CardIcon className={`w-6 h-6 ${textColor}`} />
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
                                    <div className={`h-full rounded-full transition-all ${percentage > 80 ? 'bg-rose-400' : 'bg-white/80'}`} style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className={`text-[10px] opacity-70 ${textColor}`}>Disp: {formatCurrency(card.limit - card.balance)}</span>
                                    <span className={`text-[10px] opacity-70 ${textColor}`}>Venc: {card.due_day || card.dueDate}/11</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Transactions List */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Últimas Movimentações</h3>
                <div className="space-y-3">
                    {transactions.slice(0, 5).map(t => {
                        const cat = categories.find(c => c.id === (t.category_id || t.categoryId)) || {};
                        return (
                            <div
                                key={t.id}
                                onClick={() => setSelectedTransaction(t)}
                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 ${t.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <IconRender name={cat.icon} className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{t.description}</p>
                                        <p className="text-slate-500 text-xs">{cat.name} • {formatDate(t.date)}</p>
                                    </div>
                                </div>
                                <p className={`font-semibold text-sm ${t.type === 'entrada' ? 'text-emerald-400' : 'text-white'}`}>
                                    {t.type === 'saida' && '- '}
                                    {formatCurrency(t.amount)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

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
        </div>
    );
};
