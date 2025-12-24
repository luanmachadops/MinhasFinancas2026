import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { IconRender } from './IconRender';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../constants/initialData';

export const IconPicker = ({ selectedIcon, selectedColor, onSelectIcon, onSelectColor, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('icons');

    const filteredIcons = searchQuery
        ? AVAILABLE_ICONS.filter(icon => icon.toLowerCase().includes(searchQuery.toLowerCase()))
        : AVAILABLE_ICONS;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-slate-800 animate-[slideUp_0.3s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white">Personalizar</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-950 p-1 m-4 rounded-xl">
                    <button
                        onClick={() => setActiveTab('icons')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'icons' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                        Ícones
                    </button>
                    <button
                        onClick={() => setActiveTab('colors')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'colors' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                        Cores
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-6 max-h-[50vh] overflow-y-auto">
                    {activeTab === 'icons' && (
                        <>
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-slate-950 rounded-xl px-3 py-2 mb-4 border border-slate-800">
                                <Search className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar ícone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
                                />
                            </div>

                            {/* Icons Grid */}
                            <div className="grid grid-cols-6 gap-2">
                                {filteredIcons.map((iconName) => (
                                    <button
                                        key={iconName}
                                        onClick={() => onSelectIcon(iconName)}
                                        className={`p-3 rounded-xl transition-all ${selectedIcon === iconName
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        title={iconName}
                                    >
                                        <IconRender name={iconName} className="w-5 h-5 mx-auto" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'colors' && (
                        <div className="grid grid-cols-4 gap-3">
                            {AVAILABLE_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => onSelectColor(color.value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${selectedColor === color.value
                                            ? 'bg-slate-800 ring-2 ring-blue-400'
                                            : 'hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full ${color.bg}`} />
                                    <span className="text-[10px] text-slate-500">{color.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-sm text-slate-500">Preview:</span>
                        <div className={`w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center ${selectedColor}`}>
                            <IconRender name={selectedIcon} className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
