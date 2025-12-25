import React, { useState, useMemo } from 'react';
import { Plus, MoreVertical, ArrowLeft, ChevronRight, X, Users } from 'lucide-react';
import { NeoCard, IconRender, FloatingActionButton, ModalOverlay } from '../../components/ui';
import { useData } from '../../contexts/DataContext';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../constants/initialData';

export const CategoriesScreen = ({ onBack }) => {
    const { categories, addCategory, removeCategory, updateCategory, activeWorkspace } = useData();
    const [activeTab, setActiveTab] = useState('saida');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Filter categories by type
    const filteredCategories = categories.filter(c => c.type === activeTab);

    const handleDelete = (id) => {
        if (confirm('Deseja remover esta categoria?')) {
            removeCategory(id);
        }
    };

    return (
        <div className="space-y-4 pb-24 animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Categorias</h1>
                    {activeWorkspace?.type === 'shared' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded-full">
                            <Users className="w-3 h-3" /> Compartilhado
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
                <div className="flex bg-slate-900 p-1 rounded-full border border-slate-800">
                    <button
                        onClick={() => setActiveTab('saida')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'saida'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        DESPESAS
                    </button>
                    <button
                        onClick={() => setActiveTab('entrada')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'entrada'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        RECEITAS
                    </button>
                </div>
            </div>

            {/* Categories List */}
            <div className="space-y-1">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Nenhuma categoria encontrada</p>
                        <p className="text-slate-600 text-sm mt-1">Clique no + para adicionar</p>
                    </div>
                ) : (
                    filteredCategories.map(category => (
                        <div
                            key={category.id}
                            className="flex items-center gap-4 p-4 hover:bg-slate-800/50 rounded-xl transition-colors group"
                        >
                            {/* Icon */}
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center ${category.color?.replace('text-', 'bg-').replace('-400', '-500/20') || 'bg-slate-700'
                                    } ${category.color || 'text-slate-400'}`}
                            >
                                <IconRender name={category.icon} className="w-5 h-5" />
                            </div>

                            {/* Name */}
                            <span className="flex-1 text-white font-medium">{category.name}</span>

                            {/* Menu */}
                            <button
                                onClick={() => setEditingCategory(category)}
                                className="p-2 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded-full transition-all"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowAddModal(true)}
                className={`fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95 ${activeTab === 'entrada' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
            >
                <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Add/Edit Modal */}
            {(showAddModal || editingCategory) && (
                <CategoryModal
                    type={activeTab}
                    category={editingCategory}
                    onSave={(data) => {
                        if (editingCategory) {
                            updateCategory(editingCategory.id, data);
                        } else {
                            addCategory({ id: crypto.randomUUID(), type: activeTab, ...data });
                        }
                        setShowAddModal(false);
                        setEditingCategory(null);
                    }}
                    onDelete={editingCategory ? () => {
                        handleDelete(editingCategory.id);
                        setEditingCategory(null);
                    } : null}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingCategory(null);
                    }}
                />
            )}
        </div>
    );
};

// Modal de criação/edição de categoria
const CategoryModal = ({ type, category, onSave, onDelete, onClose }) => {
    // Base quick options
    const baseQuickColors = AVAILABLE_COLORS.slice(0, 3);
    const baseQuickIcons = type === 'entrada'
        ? ['Briefcase', 'Laptop', 'LineChart']
        : ['ShoppingCart', 'Home', 'Car'];

    // State with defaults from first quick option
    const [name, setName] = useState(category?.name || '');
    const [selectedIcon, setSelectedIcon] = useState(category?.icon || baseQuickIcons[0]);
    const [selectedColor, setSelectedColor] = useState(category?.color || baseQuickColors[0].value);
    const [showAllIcons, setShowAllIcons] = useState(false);
    const [showAllColors, setShowAllColors] = useState(false);

    // Dynamic quick options - include selected item first if not already in base
    const quickColors = useMemo(() => {
        const selectedColorObj = AVAILABLE_COLORS.find(c => c.value === selectedColor);
        if (selectedColorObj && !baseQuickColors.find(c => c.value === selectedColor)) {
            return [selectedColorObj, ...baseQuickColors.slice(0, 2)];
        }
        return baseQuickColors;
    }, [selectedColor]);

    const quickIcons = useMemo(() => {
        if (!baseQuickIcons.includes(selectedIcon)) {
            return [selectedIcon, ...baseQuickIcons.slice(0, 2)];
        }
        return baseQuickIcons;
    }, [selectedIcon]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({ name: name.trim(), icon: selectedIcon, color: selectedColor });
    };

    // Get background and text colors for preview
    const getPreviewColors = (textColor) => {
        const colorMap = {
            'text-red-400': { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' },
            'text-rose-400': { bg: 'rgba(251, 113, 133, 0.2)', text: '#fb7185' },
            'text-pink-400': { bg: 'rgba(244, 114, 182, 0.2)', text: '#f472b6' },
            'text-purple-400': { bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc' },
            'text-violet-400': { bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
            'text-indigo-400': { bg: 'rgba(129, 140, 248, 0.2)', text: '#818cf8' },
            'text-blue-400': { bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa' },
            'text-sky-400': { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' },
            'text-cyan-400': { bg: 'rgba(34, 211, 238, 0.2)', text: '#22d3ee' },
            'text-teal-400': { bg: 'rgba(45, 212, 191, 0.2)', text: '#2dd4bf' },
            'text-emerald-400': { bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399' },
            'text-green-400': { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' },
            'text-lime-400': { bg: 'rgba(163, 230, 53, 0.2)', text: '#a3e635' },
            'text-yellow-400': { bg: 'rgba(250, 204, 21, 0.2)', text: '#facc15' },
            'text-amber-400': { bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24' },
            'text-orange-400': { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c' },
            'text-slate-400': { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
        };
        return colorMap[textColor] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };
    };

    const previewColors = getPreviewColors(selectedColor);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">
                        {category ? 'Editar categoria' : 'Criar nova categoria'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-5">
                    {/* Name with Preview */}
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                        {/* Preview Icon */}
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
                                        <IconRender name="Check" className="w-5 h-5 text-white" />
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
                            {quickIcons.map(iconName => (
                                <button
                                    key={iconName}
                                    onClick={() => setSelectedIcon(iconName)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === iconName
                                        ? `${selectedColor.replace('text-', 'bg-').replace('-400', '-500')} text-white`
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    <IconRender name={iconName} className="w-5 h-5" />
                                </button>
                            ))}
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
                        CONCLUÍDO
                    </button>
                </div>

                {/* Delete option for editing */}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="w-full py-3 text-rose-500 text-sm font-medium hover:bg-rose-500/10 transition-colors border-t border-slate-800"
                    >
                        Excluir categoria
                    </button>
                )}
            </div>

            {/* Full Icon Picker */}
            {showAllIcons && (
                <div className="absolute inset-4 bg-slate-900 rounded-3xl z-10 border border-slate-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center gap-4 p-4 border-b border-slate-800">
                        <button onClick={() => setShowAllIcons(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-white font-bold">Selecionar Ícone</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-2 p-4 max-h-[60vh] overflow-y-auto">
                        {AVAILABLE_ICONS.map(iconName => (
                            <button
                                key={iconName}
                                onClick={() => {
                                    setSelectedIcon(iconName);
                                    setShowAllIcons(false);
                                }}
                                className={`p-3 rounded-xl transition-all ${selectedIcon === iconName
                                    ? `${selectedColor.replace('text-', 'bg-').replace('-400', '-500')} text-white`
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                <IconRender name={iconName} className="w-5 h-5 mx-auto" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Full Color Picker */}
            {showAllColors && (
                <div className="absolute inset-4 bg-slate-900 rounded-3xl z-10 border border-slate-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
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
    );
};

export default CategoriesScreen;
