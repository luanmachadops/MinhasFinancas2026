import React from 'react';

export const NeoInput = ({ label, id, ...props }) => (
    <div className="group">
        <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 group-focus-within:text-blue-400 transition-colors">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className="
        w-full bg-slate-950/50 border border-slate-800 
        text-slate-100 rounded-xl px-4 py-3.5
        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none
        placeholder-slate-600 transition-all
      "
        />
    </div>
);
