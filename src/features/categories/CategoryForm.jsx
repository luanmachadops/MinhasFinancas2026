import React, { useState } from 'react';
import { NeoInput, NeoButton, IconRender, IconPicker } from '../../components/ui';

export const CategoryForm = ({ onAdd, onClose, type = 'saida' }) => {
    const [name, setName] = useState('');
    const [catType, setCatType] = useState(type);
    const [selectedIcon, setSelectedIcon] = useState('Tag');
    const [selectedColor, setSelectedColor] = useState('text-blue-400');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        const newCategory = {
            id: crypto.randomUUID(),
            name: name.trim(),
            icon: selectedIcon,
            type: catType,
            color: selectedColor
        };

        onAdd(newCategory);
        if (onClose) onClose();
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <NeoInput
                    label="Nome da Categoria"
                    placeholder="Ex: Assinaturas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                />

                {/* Icon Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ícone e Cor</label>
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(true)}
                        className="w-full flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center ${selectedColor}`}>
                            <IconRender name={selectedIcon} className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 text-sm">Toque para personalizar</span>
                    </button>
                </div>

                {/* Type Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setCatType('saida')}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${catType === 'saida'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                                }`}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => setCatType('entrada')}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${catType === 'entrada'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                                }`}
                        >
                            Receita
                        </button>
                    </div>
                </div>

                <NeoButton className="w-full" type="submit">Adicionar</NeoButton>
            </form>

            {showIconPicker && (
                <IconPicker
                    selectedIcon={selectedIcon}
                    selectedColor={selectedColor}
                    onSelectIcon={(icon) => setSelectedIcon(icon)}
                    onSelectColor={(color) => setSelectedColor(color)}
                    onClose={() => setShowIconPicker(false)}
                />
            )}
        </>
    );
};
