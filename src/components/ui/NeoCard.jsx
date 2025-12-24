import React from 'react';
import { GRADIENTS } from '../../constants/theme';

export const NeoCard = ({ children, className = "", onClick }) => (
    <div
        onClick={onClick}
        className={`
      ${GRADIENTS.card} 
      rounded-3xl p-5 shadow-2xl shadow-black/20 
      transition-all duration-300 
      ${onClick ? 'cursor-pointer hover:bg-slate-800/60 hover:scale-[1.02] active:scale-95' : ''}
      ${className}
    `}
    >
        {children}
    </div>
);
