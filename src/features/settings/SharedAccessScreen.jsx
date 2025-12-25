import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Check, X, Shield, Mail, UserCheck, RefreshCw } from 'lucide-react';
import { NeoButton, NeoCard, NeoInput, ModalOverlay } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SharedAccessScreen = ({ onBack }) => {
    const { user } = useAuth();
    const [invitesSent, setInvitesSent] = useState([]);
    const [invitesReceived, setInvitesReceived] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchInvites = async () => {
        try {
            setLoading(true);
            // Fetch invites I sent
            const { data: sent } = await supabase
                .from('shared_access')
                .select('*')
                .eq('owner_id', user.id);
            setInvitesSent(sent || []);

            // Fetch invites received - try to get owner info if available
            const { data: receivedRaw, error } = await supabase
                .from('shared_access')
                .select('*')
                .eq('guest_email', user.email);

            if (receivedRaw) {
                // Try to enrich with owner name from our stored data or metadata
                const enrichedInvites = receivedRaw.map(invite => ({
                    ...invite,
                    ownerDisplayName: invite.owner_name || invite.owner_email?.split('@')[0] || invite.owner_id.slice(0, 8)
                }));
                setInvitesReceived(enrichedInvites);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, [user]);

    const handleSendInvite = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const canWrite = formData.get('can_write') === 'on';

        if (!email) return;

        const { error } = await supabase.from('shared_access').insert({
            owner_id: user.id,
            owner_name: user.user_metadata?.name || user.email?.split('@')[0],
            owner_email: user.email,
            owner_avatar: user.user_metadata?.avatar_url || null,
            guest_email: email.toLowerCase().trim(),
            permissions: { read: true, write: canWrite }
        });

        if (error) {
            alert('Erro ao enviar convite: ' + error.message);
        } else {
            setShowInviteModal(false);
            fetchInvites();
        }
    };

    const handleAccept = async (inviteId) => {
        const { error } = await supabase
            .from('shared_access')
            .update({ status: 'accepted', guest_id: user.id })
            .eq('id', inviteId);

        if (!error) {
            fetchInvites();
            alert('Convite aceito! Agora você pode ver os dados compartilhados.');
            window.location.reload(); // Force reload to sync data with new permissions
        }
    };

    const handleReject = async (inviteId) => {
        const { error } = await supabase
            .from('shared_access')
            .update({ status: 'rejected' })
            .eq('id', inviteId);

        if (!error) fetchInvites();
    };

    const handleRemoveAccess = async (inviteId) => {
        if (confirm('Tem certeza que deseja remover este acesso?')) {
            const { error } = await supabase.from('shared_access').delete().eq('id', inviteId);
            if (!error) fetchInvites();
        }
    };

    const handleUpdatePermissions = async (canWrite) => {
        if (!selectedInvite) return;

        const { error } = await supabase
            .from('shared_access')
            .update({ permissions: { read: true, write: canWrite } })
            .eq('id', selectedInvite.id);

        if (error) {
            alert('Erro ao atualizar permissões: ' + error.message);
        } else {
            setShowEditModal(false);
            setSelectedInvite(null);
            fetchInvites();
            alert('Permissões atualizadas com sucesso!');
        }
    };

    const handleSyncProfile = async () => {
        try {
            setSyncing(true);
            const updates = {
                owner_name: user?.user_metadata?.name || user?.email?.split('@')[0],
                owner_email: user?.email,
                owner_avatar: user?.user_metadata?.avatar_url || null
            };

            // We update all invites where I am the owner
            const { error } = await supabase
                .from('shared_access')
                .update(updates)
                .eq('owner_id', user.id);

            if (error) {
                // If error is about missing column, ignore/alert
                console.error(error);
                alert('Erro ao sincronizar. Certifique-se de executar o SQL de atualização no Supabase.');
            } else {
                alert('Perfil sincronizado com sucesso nos convites!');
                fetchInvites();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6 pt-2 h-full animate-[fadeIn_0.5s_ease-out]">
            <header className="flex items-center gap-4">
                <NeoButton variant="ghost" className="!p-2 rounded-full" onClick={onBack}>
                    <ChevronLeft className="w-6 h-6" />
                </NeoButton>
                <h1 className="text-2xl font-bold text-white">Compartilhamento</h1>
            </header>

            {/* Received Invites */}
            {invitesReceived.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Convites Recebidos</h3>
                    {invitesReceived.map(invite => (
                        <NeoCard key={invite.id} className="border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white font-medium text-sm">Convite de Acesso</p>
                                    <p className="text-slate-400 text-xs">De: {invite.ownerDisplayName || invite.owner_id.slice(0, 8)}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                            {invite.permissions.write ? 'Leitura + Escrita' : 'Somente Leitura'}
                                        </span>
                                    </div>
                                </div>
                                {invite.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAccept(invite.id)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Check className="w-4 h-4" /></button>
                                        <button onClick={() => handleReject(invite.id)} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <span className={`text-xs font-bold ${invite.status === 'accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {invite.status === 'accepted' ? 'Aceito' : 'Rejeitado'}
                                    </span>
                                )}
                            </div>
                        </NeoCard>
                    ))}
                </div>
            )}

            {/* Sent Invites - Share YOUR OWN data */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meus Compartilhamentos</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSyncProfile}
                            disabled={syncing}
                            className={`text-slate-400 text-xs flex items-center gap-1 hover:text-white transition-colors ${syncing ? 'opacity-50' : ''}`}
                            title="Atualizar seu nome/foto nos convites enviados"
                        >
                            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} /> Sincronizar Perfil
                        </button>
                        <button onClick={() => setShowInviteModal(true)} className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300">
                            <Plus className="w-3 h-3" /> Convidar
                        </button>
                    </div>
                </div>

                <p className="text-slate-500 text-xs px-2">
                    Pessoas que têm acesso aos <span className="text-blue-400">seus dados pessoais</span>.
                </p>

                {invitesSent.length === 0 ? (
                    <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                        <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Ninguém tem acesso aos seus dados.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invitesSent.map(invite => (
                            <NeoCard key={invite.id} className="flex items-center justify-between group">
                                <div
                                    onClick={() => {
                                        setSelectedInvite(invite);
                                        setShowEditModal(true);
                                    }}
                                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-slate-500" />
                                        <p className="text-white text-sm font-medium">{invite.guest_email}</p>
                                    </div>
                                    <div className="flex gap-2 mt-1.5">
                                        <StatusBadge status={invite.status} />
                                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                                            {invite.permissions.write ? 'Editor' : 'Leitor'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveAccess(invite.id);
                                    }}
                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </NeoCard>
                        ))}
                    </div>
                )}
            </div>

            {showEditModal && selectedInvite && (
                <ModalOverlay title="Editar Permissões" onClose={() => {
                    setShowEditModal(false);
                    setSelectedInvite(null);
                }}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <p className="text-white text-sm font-medium">{selectedInvite.guest_email}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nível de Acesso</label>

                            <button
                                onClick={() => handleUpdatePermissions(false)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${!selectedInvite.permissions.write
                                    ? 'bg-blue-500/10 border-blue-500'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-white text-sm font-medium">Somente Leitura</p>
                                    <p className="text-slate-500 text-xs">Pode visualizar mas não editar.</p>
                                </div>
                                {!selectedInvite.permissions.write && <Check className="w-5 h-5 text-blue-500" />}
                            </button>

                            <button
                                onClick={() => handleUpdatePermissions(true)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedInvite.permissions.write
                                    ? 'bg-blue-500/10 border-blue-500'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-white text-sm font-medium">Leitura e Escrita</p>
                                    <p className="text-slate-500 text-xs">Pode criar, editar e excluir registros.</p>
                                </div>
                                {selectedInvite.permissions.write && <Check className="w-5 h-5 text-blue-500" />}
                            </button>
                        </div>

                        <p className="text-[10px] text-slate-500 italic px-1">
                            * Alterações serão aplicadas imediatamente após seleção.
                        </p>
                    </div>
                </ModalOverlay>
            )}

            {showInviteModal && (
                <ModalOverlay title="Convidar Usuário" onClose={() => setShowInviteModal(false)}>
                    <form onSubmit={handleSendInvite} className="space-y-4">
                        <NeoInput
                            name="email"
                            type="email"
                            label="E-mail do Usuário"
                            placeholder="exemplo@email.com"
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Permissões</label>

                            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">Controle Total</p>
                                    <p className="text-slate-500 text-xs">Pode criar, editar e excluir registros.</p>
                                </div>
                                <input type="checkbox" name="can_write" className="w-5 h-5 accent-blue-500 rounded" />
                            </label>

                            <p className="text-[10px] text-slate-500 italic px-1">
                                * Por padrão, o usuário terá acesso apenas de visualização.
                            </p>
                        </div>

                        <NeoButton type="submit" className="w-full mt-2">Enviar Convite</NeoButton>
                    </form>
                </ModalOverlay>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };

    const labels = {
        pending: 'Pendente',
        accepted: 'Aceito',
        rejected: 'Recusado'
    };

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
};
