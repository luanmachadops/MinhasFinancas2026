import React, { useMemo, useState } from 'react';
import {
    User, Wallet, ShieldCheck, ArrowUpRight, ArrowDownLeft,
    CreditCard as CardIcon, ChevronDown, Check, Users, Edit2, Save, X
} from 'lucide-react';
import { NeoCard, IconRender, ModalOverlay, NeoButton, NeoInput } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';
import { EditTransactionModal } from '../transactions/EditTransactionModal';

export const Dashboard = ({ transactions, categories, goals, accounts, onNavigate, user, onUpdateTransaction, onDeleteTransaction, onAddCategory }) => {
    const { activeWorkspace, setActiveWorkspace, availableWorkspaces, updateWorkspaceAlias } = useData();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Rename Modal State
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [workspaceToRename, setWorkspaceToRename] = useState(null);
    const [newName, setNewName] = useState('');

    const handleOpenRename = (ws) => {
        setWorkspaceToRename(ws);
        setNewName(ws.ownerName || '');
        setShowRenameModal(true);
        setShowProfileMenu(false); // Close menu
    };

    const handleSaveRename = () => {
        if (workspaceToRename && newName.trim()) {
            updateWorkspaceAlias(workspaceToRename.id, newName.trim());
            setShowRenameModal(false);
        }
    };

    const summary = useMemo(() => {
        // O saldo das contas bancárias já reflete todas as transações (entradas e saídas)
        // porque é atualizado automaticamente no addTransactionWithBalance
        const saldoContas = accounts
            .filter(acc => acc.type === 'conta')
            .reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

        // Totais de transações - apenas para exibição
        const entradas = transactions
            .filter(t => t.type === 'entrada')
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const saidas = transactions
            .filter(t => t.type === 'saida' && !accounts.find(a => a.id === t.account_id && a.type === 'cartao'))
            .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

        const guardado = goals.reduce((acc, g) => acc + (parseFloat(g.current_amount) || parseFloat(g.currentAmount) || 0), 0);

        // Disponível = saldo atual das contas - valor guardado em metas
        const disponivel = saldoContas - guardado;

        return { entradas, saidas, disponivel, guardado };
    }, [transactions, goals, accounts]);

    return (
        <div className="space-y-6 pb-24 animate-[fadeIn_0.5s_ease-out]">
            {/* Hero Header */}
            <div className="flex items-center justify-between mb-2 relative z-50">
                <div onClick={() => availableWorkspaces.length > 1 && setShowProfileMenu(!showProfileMenu)} className="cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {activeWorkspace?.type === 'personal'
                                ? `Olá, ${user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}`
                                : `Olá, ${activeWorkspace?.ownerName || 'Usuário'}`}
                        </h1>
                        {activeWorkspace?.type === 'shared' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                                <Users className="w-3 h-3" /> Compartilhado
                            </span>
                        )}
                        {availableWorkspaces.length > 1 && <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />}
                    </div>
                    <p className="text-slate-400 text-sm">
                        {activeWorkspace?.type === 'personal'
                            ? 'Resumo financeiro de hoje'
                            : 'Visualizando dados compartilhados'}
                    </p>

                    {/* Workspace Dropdown */}
                    {showProfileMenu && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden p-2 z-50">
                            {availableWorkspaces.map(ws => (
                                <button
                                    key={ws.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveWorkspace(ws);
                                        setShowProfileMenu(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${activeWorkspace.id === ws.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden relative shrink-0 ${ws.type === 'personal'
                                        ? 'bg-gradient-to-br from-blue-500 to-violet-600'
                                        : 'bg-gradient-to-br from-pink-500 to-rose-600'
                                        }`}>
                                        {ws.type === 'personal' && user?.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt={ws.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : ws.type === 'shared' && ws.ownerAvatar ? (
                                            <img
                                                src={ws.ownerAvatar}
                                                alt={ws.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : (
                                            ws.type === 'personal'
                                                ? (user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()
                                                : (ws.ownerName?.charAt(0) || 'C').toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">
                                            {ws.type === 'personal'
                                                ? (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Minha Conta')
                                                : ws.ownerName || 'Conta Compartilhada'}
                                        </p>
                                        <p className={`text-xs ${activeWorkspace.id === ws.id ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {ws.type === 'personal' ? 'Conta Pessoal' : 'Visualização Compartilhada'}
                                        </p>
                                    </div>

                                    {/* Edit Alias for Shared */}
                                    {ws.type === 'shared' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenRename(ws);
                                            }}
                                            className="p-1.5 hover:bg-slate-700/50 rounded-full text-slate-500 hover:text-white transition-colors mr-1"
                                            title="Renomear exibição"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    {activeWorkspace.id === ws.id && <Check className="w-5 h-5 text-blue-400" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Avatar - Shows current workspace owner */}
                <div
                    className={`w-10 h-10 rounded-full p-[2px] ${activeWorkspace?.type === 'shared'
                        ? 'bg-gradient-to-tr from-pink-500 to-rose-600'
                        : 'bg-gradient-to-tr from-blue-500 to-purple-600'
                        }`}
                    onClick={() => onNavigate('configuracao')}
                >
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer">
                        {activeWorkspace?.type === 'personal' && user?.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : activeWorkspace?.type === 'shared' && activeWorkspace?.ownerAvatar ? (
                            <img
                                src={activeWorkspace.ownerAvatar}
                                alt="Owner Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                        <div
                            className={`w-full h-full flex items-center justify-center text-white font-bold ${(activeWorkspace?.type === 'personal' && user?.user_metadata?.avatar_url) ||
                                (activeWorkspace?.type === 'shared' && activeWorkspace?.ownerAvatar) ? 'hidden' : ''
                                }`}
                        >
                            {activeWorkspace?.type === 'shared'
                                ? (activeWorkspace?.ownerName?.charAt(0) || 'C').toUpperCase()
                                : (user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                        </div>
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

            {/* Rename Modal */}
            {showRenameModal && (
                <ModalOverlay title="Renomear Conexão" onClose={() => setShowRenameModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Defina um nome para identificar esta conta compartilhada.
                            Este nome será visível apenas para você.
                        </p>
                        <NeoInput
                            label="Nome de Exibição"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex: Esposa, Marido..."
                            autoFocus
                        />
                        <div className="flex gap-3 pt-2">
                            <NeoButton onClick={handleSaveRename} className="flex-1">
                                <Save className="w-4 h-4 mr-2" /> Salvar
                            </NeoButton>
                            <NeoButton onClick={() => setShowRenameModal(false)} variant="ghost" className="flex-1">
                                <X className="w-4 h-4 mr-2" /> Cancelar
                            </NeoButton>
                        </div>
                    </div>
                </ModalOverlay>
            )}

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
