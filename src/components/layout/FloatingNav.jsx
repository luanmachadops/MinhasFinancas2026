import React from 'react';
import { LayoutGrid, ArrowLeftRight, Target, ListChecks, User, Calendar, PieChart } from 'lucide-react';

export const FloatingNav = ({ current, onChange }) => {
    const items = [
        { id: 'dashboard', icon: LayoutGrid },
        { id: 'movimentacao', icon: ArrowLeftRight },
        { id: 'contas', icon: Calendar },
        { id: 'orcamento', icon: PieChart },
        { id: 'metas', icon: Target },
        { id: 'lista', icon: ListChecks },
        { id: 'configuracao', icon: User },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <div className="
        flex items-center gap-1 p-2 rounded-full 
        bg-slate-900/80 backdrop-blur-xl border border-white/10 
        shadow-2xl shadow-black/50
      ">
                {items.map(item => {
                    const isActive = current === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`
                relative w-12 h-12 rounded-full flex items-center justify-center 
                transition-all duration-300
                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-1' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
                        >
                            <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                            {isActive && <span className="absolute -bottom-2 w-1 h-1 bg-blue-400 rounded-full" />}
                        </button>
                    )
                })}
            </div>
        </nav>
    );
};
