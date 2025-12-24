import React, { useState } from 'react';
import { Plus, X, ArrowUpRight, ArrowDownLeft, CreditCard, ArrowLeftRight } from 'lucide-react';
import { GRADIENTS } from '../../constants/theme';

export const FloatingActionButton = ({ onClick, onReceita, onDespesa, onDespesaCartao, onTransferencia, expandable = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Se não for expandable, usa comportamento original
    if (!expandable) {
        return (
            <button
                onClick={onClick}
                className={`
                    fixed bottom-28 right-6 z-40
                    w-14 h-14 rounded-full
                    ${GRADIENTS.primary}
                    flex items-center justify-center
                    shadow-2xl shadow-blue-600/40
                    text-white
                    transition-transform duration-300 hover:scale-110 active:scale-90 active:rotate-90
                `}
            >
                <Plus className="w-7 h-7" />
            </button>
        );
    }

    const actions = [
        { id: 'receita', label: 'Receita', icon: ArrowUpRight, color: 'bg-emerald-500', onClick: onReceita },
        { id: 'despesa-cartao', label: 'Despesa Cartão', icon: CreditCard, color: 'bg-violet-500', onClick: onDespesaCartao },
        { id: 'transferencia', label: 'Transferência', icon: ArrowLeftRight, color: 'bg-blue-500', onClick: onTransferencia },
        { id: 'despesa', label: 'Despesa', icon: ArrowDownLeft, color: 'bg-rose-500', onClick: onDespesa },
    ];

    const handleAction = (action) => {
        setIsOpen(false);
        action.onClick?.();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Action Buttons */}
            <div className="fixed bottom-28 right-6 z-50 flex flex-col-reverse items-end gap-3">
                {isOpen && actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <div
                            key={action.id}
                            className="flex items-center gap-3 animate-[slideUp_0.3s_ease-out]"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <span className="text-white text-sm font-medium bg-slate-900/90 px-3 py-1.5 rounded-full shadow-lg">
                                {action.label}
                            </span>
                            <button
                                onClick={() => handleAction(action)}
                                className={`
                                    w-12 h-12 rounded-full ${action.color}
                                    flex items-center justify-center
                                    shadow-xl text-white
                                    transition-transform hover:scale-110 active:scale-90
                                `}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        </div>
                    );
                })}

                {/* Main FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-14 h-14 rounded-full
                        ${isOpen ? 'bg-slate-700 rotate-45' : GRADIENTS.primary}
                        flex items-center justify-center
                        shadow-2xl ${isOpen ? 'shadow-slate-700/40' : 'shadow-blue-600/40'}
                        text-white
                        transition-all duration-300 hover:scale-110
                    `}
                >
                    {isOpen ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </button>
            </div>
        </>
    );
};
