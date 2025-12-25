import React, { useState } from 'react';
import {
    Settings, CreditCard, Tags, ChevronRight, LogOut, Trash2, Users,
    Wallet, Grid3X3, Target, FileDown, FileUp, Calculator, Bell, Moon, AlertTriangle
} from 'lucide-react';
import { NeoButton, NeoCard, NeoInput, ModalOverlay, IconRender } from '../../components/ui';
import { CategoryForm } from '../categories/CategoryForm';
import { formatCurrency } from '../../utils/formatters';
import { ProfileEditModal } from './ProfileEditModal';
import { useData } from '../../contexts/DataContext';

export const SettingsScreen = ({ user, accounts, onAddAccount, categories, onAddCategory, onRemoveCategory, onLogout, onNavigate }) => {
    const { activeWorkspace } = useData();
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [activeTab, setActiveTab] = useState('gerenciar');

    const CONFIRM_PHRASE = 'APAGAR TUDO';

    const handleDeleteAllData = () => {
        if (deleteConfirmText === CONFIRM_PHRASE) {
            // Clear all localStorage
            const keysToKeep = ['supabase.auth.token']; // Keep auth
            Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.some(k => key.includes(k))) {
                    localStorage.removeItem(key);
                }
            });
            // Reload to reset state
            window.location.reload();
        }
    };

    const MenuItem = ({ icon: Icon, label, onClick, color = 'blue', badge, toggle }) => (
        <NeoCard onClick={onClick} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-500/10 text-${color}-400 rounded-lg`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-white font-medium">{label}</span>
                {badge && (
                    <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-bold rounded-full">
                        {badge}
                    </span>
                )}
            </div>
            {toggle !== undefined ? (
                <div className={`w-10 h-6 rounded-full transition-colors ${toggle ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${toggle ? 'ml-5' : 'ml-1'}`} />
                </div>
            ) : (
                <ChevronRight className="text-slate-600" />
            )}
        </NeoCard>
    );

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Ajustes</h1>
                {activeWorkspace?.type === 'shared' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                        <Users className="w-3 h-3" /> Compartilhado
                    </span>
                )}
            </div>

            {/* Profile Card */}
            <div
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-4 p-4 bg-slate-900 rounded-3xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors group"
            >
                {user?.user_metadata?.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-slate-700"
                    style={{ display: user?.user_metadata?.avatar_url ? 'none' : 'flex' }}
                >
                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{user?.user_metadata?.name || 'Usuário'}</h3>
                    <p className="text-slate-400 text-xs">{user?.email}</p>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-slate-500 transition-colors" />
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                    onClick={() => setActiveTab('gerenciar')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'gerenciar' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
                >
                    GERENCIAR
                </button>
                <button
                    onClick={() => setActiveTab('geral')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'geral' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                    GERAL
                </button>
                <button
                    onClick={() => setActiveTab('sobre')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'sobre' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                >
                    SOBRE
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'gerenciar' && (
                <div className="space-y-2">
                    <MenuItem icon={Wallet} label="Contas" onClick={() => onNavigate('contas-bancarias')} color="emerald" />
                    <MenuItem icon={CreditCard} label="Cartão de Crédito" onClick={() => onNavigate('cartoes')} color="violet" />
                    <MenuItem icon={Grid3X3} label="Categorias" onClick={() => onNavigate('categorias')} color="orange" />
                    <MenuItem icon={Tags} label="Tags" onClick={() => { }} color="pink" badge="EM BREVE" />
                    <MenuItem icon={Target} label="Objetivos" onClick={() => onNavigate('metas')} color="blue" />
                    <MenuItem icon={FileUp} label="Importar dados" onClick={() => { }} color="cyan" />
                    <MenuItem icon={FileDown} label="Exportar relatório" onClick={() => { }} color="teal" />
                    <MenuItem icon={Calculator} label="Calculadoras" onClick={() => { }} color="amber" badge="EM BREVE" />
                </div>
            )}

            {activeTab === 'geral' && (
                <div className="space-y-2">
                    <MenuItem icon={Users} label="Compartilhamento" onClick={() => onNavigate('compartilhar')} color="pink" />
                    <MenuItem icon={Bell} label="Lembrete diário" onClick={() => { }} color="yellow" toggle={false} />
                    <MenuItem icon={Moon} label="Tema escuro" onClick={() => { }} color="indigo" toggle={true} />

                    {/* Danger Zone - Only for personal workspace owner */}
                    {activeWorkspace?.type === 'personal' && (
                        <div className="pt-4 mt-4 border-t border-slate-800">
                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Zona de Perigo</p>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center gap-3 p-4 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 rounded-2xl transition-colors group"
                            >
                                <div className="p-2 bg-rose-500/10 rounded-lg">
                                    <Trash2 className="w-5 h-5 text-rose-400" />
                                </div>
                                <span className="text-rose-400 font-medium">Apagar Todos os Dados</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sobre' && (
                <div className="space-y-4">
                    <NeoCard className="text-center !py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-xl">App Finanças</h3>
                        <p className="text-slate-500 text-sm">Versão 1.0.0</p>
                        <p className="text-slate-600 text-xs mt-4">
                            Desenvolvido com ❤️ para controle financeiro pessoal
                        </p>
                    </NeoCard>
                </div>
            )}

            {/* Logout Button - Always visible at bottom */}
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-3 p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl transition-colors group"
            >
                <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-300" />
                <span className="text-rose-400 font-medium group-hover:text-rose-300">Sair da Conta</span>
            </button>

            {showAccountModal && (
                <ModalOverlay title="Gerenciar Contas" onClose={() => setShowAccountModal(false)}>
                    <div className="space-y-4">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onAddAccount({ id: crypto.randomUUID(), name: 'Nova Conta', type: 'conta', balance: 0, bank: 'NuBank' });
                            setShowAccountModal(false);
                        }} className="space-y-4">
                            <NeoInput label="Nome" id="accName" placeholder="Ex: Nubank" />
                            <NeoInput label="Saldo Inicial" id="accBal" type="number" />
                            <NeoButton className="w-full" type="submit">Adicionar Conta</NeoButton>
                        </form>

                        <div className="border-t border-slate-800 pt-4">
                            <h3 className="text-white font-bold mb-2">Contas Existentes</h3>
                            {accounts.map(acc => (
                                <div key={acc.id} className="flex justify-between p-3 bg-slate-950 rounded-xl mb-2">
                                    <span className="text-slate-300">{acc.name}</span>
                                    <span className="text-white font-mono">{formatCurrency(acc.balance)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {showCategoryModal && (
                <ModalOverlay title="Gerenciar Categorias" onClose={() => setShowCategoryModal(false)}>
                    <div className="space-y-6">
                        <CategoryForm onAdd={onAddCategory} onClose={() => setShowCategoryModal(false)} />

                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suas Categorias</h3>
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 ${cat.color || 'text-slate-400'}`}>
                                            <IconRender name={cat.icon} className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-slate-200 text-sm font-medium">{cat.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{cat.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemoveCategory(cat.id)}
                                        className="p-2 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {showProfileModal && (
                <ProfileEditModal onClose={() => setShowProfileModal(false)} />
            )}

            {/* Delete All Data Confirmation Modal */}
            {showDeleteModal && (
                <ModalOverlay
                    title="⚠️ Apagar Todos os Dados"
                    onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-rose-300 font-semibold">Esta ação é irreversível!</p>
                                    <p className="text-rose-400/80 text-sm mt-1">
                                        Todos os seus dados serão apagados permanentemente, incluindo transações, contas, categorias e metas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-sm">
                                Digite <span className="text-rose-400 font-bold">{CONFIRM_PHRASE}</span> para confirmar:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                placeholder={CONFIRM_PHRASE}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAllData}
                                disabled={deleteConfirmText !== CONFIRM_PHRASE}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${deleteConfirmText === CONFIRM_PHRASE
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Apagar Tudo
                            </button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </div>
    )
}
