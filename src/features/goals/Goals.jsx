import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Users } from 'lucide-react';
import { NeoButton, NeoCard, ModalOverlay, IconRender } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { AddGoalForm } from './AddGoalForm';
import { ManageGoalForm } from './ManageGoalForm';
import { useData } from '../../contexts/DataContext';

export const Goals = ({ goals, onUpdateGoal, onAddGoal }) => {
    const { isReadOnly, activeWorkspace } = useData();
    const [showModal, setShowModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleDeposit = (amount) => {
        const newAmount = (selectedGoal.current_amount || 0) + parseFloat(amount);
        onUpdateGoal(selectedGoal.id, { current_amount: newAmount });
        setSelectedGoal(null);
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">Metas & Sonhos</h1>
                        {activeWorkspace?.type === 'shared' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                                <Users className="w-3 h-3" /> Compartilhado
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Seu dinheiro, separado e rendendo.</p>
                </div>
                {!isReadOnly && (
                    <NeoButton onClick={() => setShowModal(true)} variant="primary" className="!p-2 rounded-full"><Plus /></NeoButton>
                )}
            </header>

            <div className="grid gap-4">
                {goals.map(goal => {
                    const current = goal.current_amount || 0;
                    const target = goal.target_amount || 1;
                    const percent = Math.min(100, (current / target) * 100);
                    return (
                        <NeoCard key={goal.id} onClick={() => setSelectedGoal(goal)} className="group relative overflow-hidden">
                            {/* Progress Background */}
                            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000" style={{ width: `${percent}%` }} />

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <IconRender name={goal.icon} className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{goal.name}</h3>
                                        <p className="text-slate-400 text-xs">Alvo: {formatCurrency(target)}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono text-blue-400">
                                    {percent.toFixed(0)}%
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Guardado Atual</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(current)}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ArrowLeftRight className="w-4 h-4" />
                                </div>
                            </div>
                        </NeoCard>
                    );
                })}
            </div>

            {showModal && (
                <ModalOverlay title="Nova Meta" onClose={() => setShowModal(false)}>
                    <AddGoalForm onAdd={onAddGoal} onClose={() => setShowModal(false)} />
                </ModalOverlay>
            )}

            {selectedGoal && (
                <ModalOverlay title={selectedGoal.name} onClose={() => setSelectedGoal(null)}>
                    <ManageGoalForm goal={selectedGoal} onProcess={handleDeposit} />
                </ModalOverlay>
            )}
        </div>
    );
};
