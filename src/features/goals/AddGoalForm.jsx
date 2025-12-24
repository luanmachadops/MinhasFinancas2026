import React, { useState } from 'react';
import { NeoButton, NeoInput } from '../../components/ui';

export const AddGoalForm = ({ onAdd, onClose }) => {
    const [data, setData] = useState({ name: '', target: '', initial: '' });

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onAdd({ id: crypto.randomUUID(), name: data.name, target_amount: parseFloat(data.target), current_amount: parseFloat(data.initial || 0), icon: 'Target' });
            onClose();
        }} className="space-y-4">
            <NeoInput label="Nome da Meta" id="gName" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
            <NeoInput label="Valor Alvo" id="gTarget" type="number" value={data.target} onChange={e => setData({ ...data, target: e.target.value })} />
            <NeoInput label="Depósito Inicial (Opcional)" id="gInit" type="number" value={data.initial} onChange={e => setData({ ...data, initial: e.target.value })} />
            <NeoButton className="w-full" type="submit">Criar Caixinha</NeoButton>
        </form>
    )
}
