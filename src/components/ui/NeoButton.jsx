import React from 'react';
import { GRADIENTS } from '../../constants/theme';

export const NeoButton = ({ children, variant = 'primary', className = "", onClick, icon: Icon, type = "button" }) => {
    const variants = {
        primary: `${GRADIENTS.primary} text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-500/20`,
        success: `${GRADIENTS.success} text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/20`,
        danger: `${GRADIENTS.danger} text-white shadow-lg shadow-rose-900/30 hover:shadow-rose-500/20`,
        ghost: `bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white`,
        glass: `${GRADIENTS.glass} text-white hover:bg-white/20`,
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`
        relative overflow-hidden group
        px-4 py-3 rounded-2xl font-semibold text-sm tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-300 active:scale-95
        ${variants[variant]}
        ${className}
      `}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
            {/* Efeito de Brilho ao passar o mouse */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
        </button>
    );
};
