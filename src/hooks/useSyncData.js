import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSyncData = (tableName, initialData = []) => {
    const { user } = useAuth();
    const STORAGE_KEY = `offline_${tableName}`;

    // Usar ref para estabilizar initialData (evitar loops)
    const initialDataRef = useRef(initialData);
    const hasSeededRef = useRef(false);

    // Load initial state from LocalStorage or Fallback
    const [data, setData] = useState(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        return cached ? JSON.parse(cached) : initialData;
    });

    const [isSyncing, setIsSyncing] = useState(false);

    // Persist to LocalStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data, STORAGE_KEY]);

    // Fetch from Supabase when online and user is logged in
    const pullData = useCallback(async () => {
        if (!user || !navigator.onLine) return;

        setIsSyncing(true);
        const { data: serverData, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && serverData) {
            // Para categorias: merge inicial para garantir que padrões sempre existam
            // Usando refs para evitar loop infinito
            const currentInitialData = initialDataRef.current;

            if (tableName === 'categories' && currentInitialData.length > 0 && !hasSeededRef.current) {
                // Encontrar categorias padrão que não existem no servidor
                const serverIds = serverData.map(c => c.id);
                const serverNames = serverData.map(c => c.name.toLowerCase());

                const missingDefaults = currentInitialData.filter(defaultCat =>
                    !serverIds.includes(defaultCat.id) &&
                    !serverNames.includes(defaultCat.name.toLowerCase())
                );

                if (missingDefaults.length > 0) {
                    hasSeededRef.current = true; // Marcar que já fez seed
                    console.log(`Seeding ${missingDefaults.length} default categories...`);

                    // Gerar UUIDs válidos para cada categoria
                    const categoriesWithUserId = missingDefaults.map(cat => ({
                        id: crypto.randomUUID(),
                        name: cat.name,
                        icon: cat.icon,
                        type: cat.type,
                        color: cat.color,
                        user_id: user.id,
                        created_at: new Date().toISOString()
                    }));

                    const { error: insertError } = await supabase
                        .from('categories')
                        .insert(categoriesWithUserId);

                    if (!insertError) {
                        setData([...serverData, ...categoriesWithUserId]);
                    } else {
                        console.log('Error seeding categories:', insertError);
                        setData(serverData);
                    }
                } else {
                    hasSeededRef.current = true;
                    setData(serverData);
                }
            } else {
                setData(serverData);
            }
        }
        setIsSyncing(false);
    }, [user, tableName]); // Removido initialData das dependências!

    // Initial Fetch
    useEffect(() => {
        pullData();
    }, [pullData]);

    // Sync Queue Processor
    const processQueue = useCallback(async () => {
        if (!user || !navigator.onLine) return;

        const queueKey = `sync_queue_${tableName}`;
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');

        if (queue.length === 0) return;

        console.log(`Processing ${queue.length} items for ${tableName}...`);

        const newQueue = [];

        for (const action of queue) {
            const { type, payload } = action;
            let error = null;

            if (type === 'INSERT') {
                // Sanitize payload for legacy keys
                let validPayload = { ...payload };
                if (tableName === 'transactions' && validPayload.categoryId) {
                    validPayload.category_id = validPayload.categoryId;
                    delete validPayload.categoryId;
                }
                if (tableName === 'goals') {
                    if (validPayload.targetAmount) {
                        validPayload.target_amount = validPayload.targetAmount;
                        delete validPayload.targetAmount;
                    }
                    if (validPayload.currentAmount !== undefined) {
                        validPayload.current_amount = validPayload.currentAmount;
                        delete validPayload.currentAmount;
                    }
                }
                const { error: err } = await supabase.from(tableName).insert(validPayload);
                error = err;
            } else if (type === 'UPDATE') {
                const { id, ...updates } = payload;
                // Sanitize updates
                let validUpdates = { ...updates };
                if (tableName === 'transactions' && validUpdates.categoryId) {
                    validUpdates.category_id = validUpdates.categoryId;
                    delete validUpdates.categoryId;
                }
                if (tableName === 'goals') {
                    if (validUpdates.targetAmount) {
                        validUpdates.target_amount = validUpdates.targetAmount;
                        delete validUpdates.targetAmount;
                    }
                    if (validUpdates.currentAmount !== undefined) {
                        validUpdates.current_amount = validUpdates.currentAmount;
                        delete validUpdates.currentAmount;
                    }
                }
                const { error: err } = await supabase.from(tableName).update(validUpdates).eq('id', id);
                error = err;
            } else if (type === 'DELETE') {
                const { error: err } = await supabase.from(tableName).delete().eq('id', payload);
                error = err;
            }

            if (error) {
                console.error('Sync error:', error);
                newQueue.push(action); // Keep in queue to retry
            }
        }

        localStorage.setItem(queueKey, JSON.stringify(newQueue));

        // After processing queue, pull latest data to ensure consistency
        if (newQueue.length === 0) {
            pullData();
        }
    }, [user, tableName, pullData]);

    // Listen for online status
    useEffect(() => {
        const handleOnline = () => processQueue();
        window.addEventListener('online', handleOnline);

        // Also try to process queue on mount
        processQueue();

        return () => window.removeEventListener('online', handleOnline);
    }, [processQueue]);

    // API to modify data
    const add = (item) => {
        const newItem = { user_id: user?.id, ...item }; // Allow user_id override if present in item

        // Optimistic Update
        setData(prev => [newItem, ...prev]);

        // Add to Queue
        const queueKey = `sync_queue_${tableName}`;
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        queue.push({ type: 'INSERT', payload: newItem });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        // Try to Sync
        processQueue();
    };

    const update = (id, updates) => {
        // Optimistic Update
        setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

        // Add to Queue
        const queueKey = `sync_queue_${tableName}`;
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        queue.push({ type: 'UPDATE', payload: { id, ...updates } });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        // Try to Sync
        processQueue();
    };

    const remove = (id) => {
        // Optimistic Update
        setData(prev => prev.filter(item => item.id !== id));

        // Add to Queue
        const queueKey = `sync_queue_${tableName}`;
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        queue.push({ type: 'DELETE', payload: id });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        // Try to Sync
        processQueue();
    };

    return { data, add, update, remove, isSyncing, refresh: pullData };
};
