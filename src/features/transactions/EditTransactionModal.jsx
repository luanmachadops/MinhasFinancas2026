import React, { useState } from 'react';
import { Trash2, Clock, Tag, ChevronRight } from 'lucide-react';
import { NeoButton, NeoInput, ModalOverlay, IconRender, CategoryPicker } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const EditTransactionModal = ({ transaction, categories, accounts = [], onSave, onUpdate, onDelete, onClose, onAddCategory }) => {
    const [formData, setFormData] = useState({
        description: transaction.description || '',
        amount: transaction.amount || 0,
        category_id: transaction.category_id || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'saida',
        is_paid: transaction.is_paid ?? true
    });
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updateFn = onUpdate || onSave;
        if (updateFn) {
            updateFn(transaction.id, {
                ...formData,
                amount: parseFloat(formData.amount)
            });
        }
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            onDelete(transaction.id);
            onClose();
        }
    };

    const selectedCategory = categories.find(c => c.id === formData.category_id);
    const createdAt = transaction.created_at ? new Date(transaction.created_at) : null;

    // Helper for color styles
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

    const getColorStyle = (colorClass) => colorMap[colorClass] || { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Creation Info */}
                {createdAt && (
                    <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div className="flex-1">
                            <p className="text-slate-400 text-xs">Criado em</p>
                            <p className="text-white text-sm font-medium">
                                {formatDate(transaction.date)} às {createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Type Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                    <div className="flex gap-2">
                        {['entrada', 'saida', 'investimento'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${formData.type === type
                                    ? type === 'entrada' ? 'bg-emerald-600 text-white'
                                        : type === 'saida' ? 'bg-rose-600 text-white'
                                            : 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <NeoInput
                    label="Descrição"
                    id="edit-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />

                {/* Amount */}
                <NeoInput
                    label="Valor"
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                />

                {/* Category Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                    <button
                        type="button"
                        onClick={() => setShowCategoryPicker(true)}
                        className="w-full flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                        {selectedCategory ? (
                            <>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: getColorStyle(selectedCategory.color).bg,
                                        color: getColorStyle(selectedCategory.color).text
                                    }}
                                >
                                    <IconRender name={selectedCategory.icon} className="w-5 h-5" />
                                </div>
                                <span className="text-white text-sm font-medium">{selectedCategory.name}</span>
                            </>
                        ) : (
                            <>
                                <Tag className="w-5 h-5 text-slate-500" />
                                <span className="text-slate-500 text-sm">Selecionar categoria</span>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                    </button>
                </div>

                {/* Date */}
                <NeoInput
                    label="Data"
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />

                {/* Paid Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-300 text-sm">
                        {formData.type === 'entrada' ? 'Recebido' : 'Pago'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_paid: !formData.is_paid })}
                        className={`w-12 h-6 rounded-full transition-colors ${formData.is_paid ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.is_paid ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <NeoButton
                        type="button"
                        onClick={handleDelete}
                        variant="ghost"
                        className="flex-1 !bg-rose-500/10 !text-rose-500 hover:!bg-rose-500/20"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                    </NeoButton>
                    <NeoButton type="submit" variant="primary" className="flex-1">
                        Salvar Alterações
                    </NeoButton>
                </div>
            </form>

            {/* Category Picker Modal */}
            <CategoryPicker
                isOpen={showCategoryPicker}
                categories={categories}
                selectedId={formData.category_id}
                type={formData.type}
                onSelect={(cat) => {
                    setFormData(prev => ({ ...prev, category_id: cat.id }));
                }}
                onAdd={(newCat) => {
                    if (onAddCategory) {
                        onAddCategory(newCat);
                        setFormData(prev => ({ ...prev, category_id: newCat.id }));
                    }
                }}
                onClose={() => setShowCategoryPicker(false)}
            />
        </>
    );
};
