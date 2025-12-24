import React, { useState } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';
import { IconRender } from './IconRender';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../constants/initialData';

/**
 * CategoryPicker - Componente reutilizável para seleção de categorias
 * Usado em: AddTransactionForm, EditTransactionModal, ScheduledTransactions, etc.
 * 
 * Props:
 * - categories: Array de categorias disponíveis
 * - selectedId: ID da categoria selecionada
 * - onSelect: Callback quando uma categoria é selecionada
 * - onAdd: Callback para adicionar nova categoria (opcional)
 * - type: 'entrada' | 'saida' - filtra categorias por tipo
 * - showCreateButton: boolean - mostra botão de criar nova
 */

// Mapa de cores para preview
const colorMap = {
    'text-red-400': { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' },
    'text-rose-400': { bg: 'rgba(251, 113, 133, 0.2)', text: '#fb7185' },
    'text-pink-400': { bg: 'rgba(244, 114, 182, 0.2)', text: '#f472b6' },
    'text-purple-400': { bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc' },
    'text-violet-400': { bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
    'text-violet-500': { bg: 'rgba(139, 92, 246, 0.2)', text: '#8b5cf6' },
    'text-indigo-400': { bg: 'rgba(129, 140, 248, 0.2)', text: '#818cf8' },
    'text-blue-400': { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa' },
    'text-blue-500': { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
    'text-sky-400': { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' },
    'text-cyan-400': { bg: 'rgba(34, 211, 238, 0.2)', text: '#22d3ee' },
    'text-teal-400': { bg: 'rgba(45, 212, 191, 0.2)', text: '#2dd4bf' },
    'text-emerald-400': { bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
    'text-green-400': { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' },
    'text-green-500': { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
    'text-lime-400': { bg: 'rgba(163, 230, 53, 0.2)', text: '#a3e635' },
    'text-yellow-400': { bg: 'rgba(250, 204, 21, 0.2)', text: '#facc15' },
    'text-amber-400': { bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
    'text-orange-400': { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c' },
    'text-slate-400': { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
};

const getColorStyle = (colorClass) => {
    return colorMap[colorClass] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };
};

export const CategoryPicker = ({
    categories,
    selectedId,
    onSelect,
    onAdd,
    type,
    showCreateButton = true,
    isOpen,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filtrar categorias por tipo e busca
    const filteredCategories = categories
        .filter(c => !type || c.type === type)
        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const selectedCategory = categories.find(c => c.id === selectedId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900 rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-slate-800 shadow-2xl animate-[fadeIn_0.2s_ease-out] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                    <h3 className="text-lg font-bold text-white">Selecione uma categoria</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                        <Search className="w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar categoria..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white outline-none placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-3">
                        {filteredCategories.map(cat => {
                            const colors = getColorStyle(cat.color);
                            const isSelected = cat.id === selectedId;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        onSelect(cat);
                                        onClose();
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isSelected
                                            ? 'bg-slate-700 ring-2 ring-blue-500'
                                            : 'bg-slate-800/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: colors.bg, color: colors.text }}
                                    >
                                        <IconRender name={cat.icon} className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-slate-300 text-center truncate w-full">
                                        {cat.name}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Nenhuma categoria encontrada</p>
                        </div>
                    )}
                </div>

                {/* Create Button */}
                {showCreateButton && onAdd && (
                    <div className="p-4 border-t border-slate-800 shrink-0">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${type === 'entrada'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            Criar nova categoria
                        </button>
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            {showCreateModal && (
                <CreateCategoryModal
                    type={type}
                    onSave={(data) => {
                        onAdd({ id: crypto.randomUUID(), type, ...data });
                        setShowCreateModal(false);
                    }}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

// Modal de criação de categoria inline
const CreateCategoryModal = ({ type, onSave, onClose }) => {
    const baseQuickColors = AVAILABLE_COLORS.slice(0, 3);
    const baseQuickIcons = type === 'entrada'
        ? ['Briefcase', 'Laptop', 'LineChart']
        : ['ShoppingCart', 'Home', 'Car'];

    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(baseQuickIcons[0]);
    const [selectedColor, setSelectedColor] = useState(baseQuickColors[0].value);
    const [showAllIcons, setShowAllIcons] = useState(false);
    const [showAllColors, setShowAllColors] = useState(false);

    const quickColors = React.useMemo(() => {
        const selectedColorObj = AVAILABLE_COLORS.find(c => c.value === selectedColor);
        if (selectedColorObj && !baseQuickColors.find(c => c.value === selectedColor)) {
            return [selectedColorObj, ...baseQuickColors.slice(0, 2)];
        }
        return baseQuickColors;
    }, [selectedColor]);

    const quickIcons = React.useMemo(() => {
        if (!baseQuickIcons.includes(selectedIcon)) {
            return [selectedIcon, ...baseQuickIcons.slice(0, 2)];
        }
        return baseQuickIcons;
    }, [selectedIcon]);

    const previewColors = getColorStyle(selectedColor);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name: name.trim(), icon: selectedIcon, color: selectedColor });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Criar categoria</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-5">
                    {/* Preview + Name */}
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                            style={{ backgroundColor: previewColors.bg, color: previewColors.text }}
                        >
                            <IconRender name={selectedIcon} className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Nome da categoria"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 bg-transparent text-white outline-none placeholder-slate-600 text-lg"
                            autoFocus
                        />
                    </div>

                    {/* Color */}
                    <div className="flex items-center gap-4">
                        <div className="p-2 text-slate-500">
                            <IconRender name="Sparkles" className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 text-sm w-12">Cor</span>
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                            {quickColors.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center transition-transform ${selectedColor === color.value ? 'ring-2 ring-white scale-110' : ''
                                        }`}
                                >
                                    {selectedColor === color.value && (
                                        <Check className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowAllColors(true)}
                                className="px-3 py-2 bg-slate-800 rounded-full text-slate-400 text-xs hover:bg-slate-700"
                            >
                                Outros...
                            </button>
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="flex items-center gap-4">
                        <div className="p-2 text-slate-500">
                            <IconRender name="Grid3X3" className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 text-sm w-12">Ícone</span>
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                            {quickIcons.map(iconName => {
                                const iconColors = getColorStyle(selectedColor);
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => setSelectedIcon(iconName)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                                        style={selectedIcon === iconName
                                            ? { backgroundColor: iconColors.text, color: 'white' }
                                            : { backgroundColor: 'rgb(30, 41, 59)', color: '#94a3b8' }
                                        }
                                    >
                                        <IconRender name={iconName} className="w-5 h-5" />
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowAllIcons(true)}
                                className="px-3 py-2 bg-slate-800 rounded-full text-slate-400 text-xs hover:bg-slate-700"
                            >
                                Outros...
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`flex-1 py-3 rounded-xl text-white font-medium transition-colors ${type === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                            }`}
                    >
                        CRIAR
                    </button>
                </div>

                {/* Full Icon Picker */}
                {showAllIcons && (
                    <div className="absolute inset-4 bg-slate-900 rounded-3xl z-10 border border-slate-800 overflow-hidden">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-800">
                            <button onClick={() => setShowAllIcons(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-white font-bold">Selecionar Ícone</h3>
                        </div>
                        <div className="grid grid-cols-6 gap-2 p-4 max-h-[60vh] overflow-y-auto">
                            {AVAILABLE_ICONS.map(iconName => {
                                const iconColors = getColorStyle(selectedColor);
                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => {
                                            setSelectedIcon(iconName);
                                            setShowAllIcons(false);
                                        }}
                                        className="p-3 rounded-xl transition-all"
                                        style={selectedIcon === iconName
                                            ? { backgroundColor: iconColors.text, color: 'white' }
                                            : { backgroundColor: 'rgb(30, 41, 59)', color: '#94a3b8' }
                                        }
                                    >
                                        <IconRender name={iconName} className="w-5 h-5 mx-auto" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Full Color Picker */}
                {showAllColors && (
                    <div className="absolute inset-4 bg-slate-900 rounded-3xl z-10 border border-slate-800 overflow-hidden">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-800">
                            <button onClick={() => setShowAllColors(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-white font-bold">Selecionar Cor</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-6">
                            {AVAILABLE_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => {
                                        setSelectedColor(color.value);
                                        setShowAllColors(false);
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${selectedColor === color.value ? 'bg-slate-800 ring-2 ring-white' : 'hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full ${color.bg}`} />
                                    <span className="text-[10px] text-slate-500">{color.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPicker;
