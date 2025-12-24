import React, { useState, useMemo } from 'react';
import { Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { NeoCard, NeoButton, NeoInput } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { useData } from '../../contexts/DataContext';

export const ShoppingList = ({ list, onAdd, onUpdate, onDelete, onClear }) => {
    const { isReadOnly } = useData();
    const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const stats = useMemo(() => {
        const total = list.reduce((acc, i) => acc + ((i.expected_price || 0) * (i.quantity || 1)), 0);
        const paid = list.filter(i => i.purchased).reduce((acc, i) => acc + ((i.actual_price || 0) * (i.quantity || 1)), 0);
        const expectedPaid = list.filter(i => i.purchased).reduce((acc, i) => acc + ((i.expected_price || 0) * (i.quantity || 1)), 0);
        const diff = paid - expectedPaid;
        return { total, paid, diff };
    }, [list]);

    const addItem = (e) => {
        e.preventDefault();
        if (!newItem.name) return;
        onAdd({
            id: crypto.randomUUID(),
            name: newItem.name,
            expected_price: parseFloat(newItem.price || 0),
            actual_price: 0,
            quantity: parseInt(newItem.quantity || 1),
            purchased: false
        });
        setNewItem({ name: '', price: '', quantity: '1' });
    }

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditData({
            name: item.name,
            expected_price: item.expected_price,
            quantity: item.quantity || 1
        });
    };

    const saveEdit = (itemId) => {
        onUpdate(itemId, {
            name: editData.name,
            expected_price: parseFloat(editData.expected_price),
            quantity: parseInt(editData.quantity)
        });
        setEditingId(null);
        setEditData({});
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    return (
        <div className="space-y-6 pt-2 pb-24 animate-[fadeIn_0.5s_ease-out]">
            <header>
                <h1 className="text-2xl font-bold text-white">Mercado</h1>
            </header>

            {/* Summary Card */}
            <NeoCard className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                <div>
                    <p className="text-slate-400 text-xs">Previsto Total</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(stats.total)}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs">Gasto Real</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats.paid)}</p>
                </div>
                <div className={`text-right px-3 py-1 rounded-lg ${stats.diff > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <p className="text-[10px] font-bold uppercase">Diferença</p>
                    <p className="font-bold text-sm">{stats.diff > 0 ? '+' : ''}{formatCurrency(stats.diff)}</p>
                </div>
            </NeoCard>

            {/* Add Input */}
            {!isReadOnly && (
                <form onSubmit={addItem} className="flex gap-2">
                    <div className="flex-1">
                        <NeoInput id="prod" placeholder="Adicionar produto..." value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} label="Item" />
                    </div>
                    <div className="w-20">
                        <NeoInput id="qty" type="number" min="1" placeholder="Qtd" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} label="Qtd" />
                    </div>
                    <div className="w-24">
                        <NeoInput id="price" type="number" step="0.01" placeholder="R$" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} label="Preço" />
                    </div>
                    <NeoButton type="submit" className="!px-3 mt-6 rounded-xl self-start h-[50px]"><Plus /></NeoButton>
                </form>
            )}

            {/* List */}
            <div className="space-y-2">
                {list.map(item => (
                    <div key={item.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${item.purchased ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-700 hover:border-blue-500/50'}`}>
                        <button
                            onClick={() => onUpdate(item.id, { purchased: !item.purchased, actual_price: item.purchased ? 0 : item.expected_price })}
                            disabled={editingId === item.id}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.purchased ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 hover:border-blue-400'}`}
                        >
                            {item.purchased && <Check className="w-3 h-3" />}
                        </button>

                        {editingId === item.id ? (
                            /* Edit Mode */
                            <div className="flex-1 flex gap-2 items-center">
                                <input
                                    type="text"
                                    className="flex-1 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    autoFocus
                                />
                                <input
                                    type="number"
                                    min="1"
                                    className="w-14 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white text-center outline-none"
                                    value={editData.quantity}
                                    onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                />
                                <span className="text-xs text-slate-500">x</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-20 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white text-right outline-none"
                                    value={editData.expected_price}
                                    onChange={(e) => setEditData({ ...editData, expected_price: e.target.value })}
                                />
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => saveEdit(item.id)}
                                        className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div className="flex-1" onClick={() => !item.purchased && startEdit(item)}>
                                    <p className={`font-medium text-sm ${item.purchased ? 'text-slate-500 line-through' : 'text-slate-200 cursor-pointer hover:text-blue-400'}`}>
                                        {item.name} {item.quantity > 1 && <span className="text-xs text-slate-500">(x{item.quantity})</span>}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {item.quantity > 1 ? `${item.quantity} x ${formatCurrency(item.expected_price)} = ` : 'Est: '}
                                        {formatCurrency((item.expected_price || 0) * (item.quantity || 1))}
                                    </p>
                                </div>

                                {item.purchased ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Pago:</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-emerald-400 text-right outline-none focus:border-emerald-500"
                                            value={item.actual_price}
                                            onChange={(e) => onUpdate(item.id, { actual_price: parseFloat(e.target.value) })}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="p-2 text-slate-600 hover:text-blue-400"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 text-slate-600 hover:text-rose-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {list.some(i => i.purchased) && (
                <div className="flex justify-center">
                    <button onClick={onClear} className="text-xs text-slate-500 hover:text-rose-400 underline decoration-dashed">Limpar itens comprados</button>
                </div>
            )}
        </div>
    );
};
