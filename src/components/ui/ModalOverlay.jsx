import React from 'react';
import { X, Sparkles } from 'lucide-react';

export const ModalOverlay = ({ children, onClose, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
        <div className="
      relative w-full max-w-md 
      bg-slate-900 border border-slate-800 
      rounded-3xl shadow-2xl shadow-black/50
      flex flex-col max-h-[85vh]
      animate-[scaleIn_0.3s_ease-out]
    ">
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    {title}
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);
