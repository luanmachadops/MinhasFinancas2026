import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useSyncData } from '../hooks/useSyncData';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_GOALS } from '../constants/initialData';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();

    // Workspaces State
    const [activeWorkspace, setActiveWorkspace] = useState({ id: user?.id, name: 'Pessoal', type: 'personal', permissions: { read: true, write: true } });
    const [loading, setLoading] = useState(true);
    const [sharedWorkspaces, setSharedWorkspaces] = useState([]);
    const [workspaceAliases, setWorkspaceAliases] = useState(() => {
        const saved = localStorage.getItem('workspace_aliases');
        return saved ? JSON.parse(saved) : {};
    });

    // Save aliases whenever they change
    useEffect(() => {
        localStorage.setItem('workspace_aliases', JSON.stringify(workspaceAliases));
    }, [workspaceAliases]);

    const updateWorkspaceAlias = (workspaceId, newName) => {
        setWorkspaceAliases(prev => {
            const newAliases = { ...prev, [workspaceId]: newName };
            return newAliases;
        });
        // Force refresh of workspaces list with new name
        setSharedWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                return { ...ws, ownerName: newName, name: `Compartilhado (${newName})` };
            }
            return ws;
        }));
    };

    // Fetch Shared Workspaces
    useEffect(() => {
        if (!user) return;

        const fetchWorkspaces = async () => {
            try {
                // Fetch shared_access where I am the guest and status is accepted
                const { data: invites, error } = await supabase
                    .from('shared_access')
                    .select('*')
                    .eq('guest_email', user.email)
                    .eq('status', 'accepted');

                if (error) {
                    console.error('Error fetching shared workspaces:', error);
                    return;
                }

                if (invites && invites.length > 0) {
                    const workspaces = invites.map(inv => {
                        // Check for local alias first
                        const alias = workspaceAliases[inv.owner_id];

                        // Use alias, OR owner_name/email if available, OR fallback to ID
                        const ownerName = alias
                            || inv.owner_name
                            || inv.owner_email?.split('@')[0]
                            || `Usuário ${inv.owner_id.slice(0, 4)}`;

                        const ownerAvatar = inv.owner_avatar || null;

                        return {
                            id: inv.owner_id,
                            name: `Compartilhado (${ownerName})`,
                            ownerName: ownerName,
                            ownerAvatar: ownerAvatar, // Avatar needs SQL update, but name can be alliased
                            type: 'shared',
                            permissions: inv.permissions || { read: true, write: false }
                        };
                    });
                    setSharedWorkspaces(workspaces);
                } else {
                    setSharedWorkspaces([]);
                }
            } catch (err) {
                console.error("Unexpected error fetching workspaces:", err);
            }
        };

        fetchWorkspaces();

        // Inscrever para mudanças em convites
        const savedChanges = supabase
            .channel('shared_access_changes_context')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'shared_access', filter: `guest_email=eq.${user.email}` },
                () => fetchWorkspaces()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(savedChanges);
        };
    }, [user, workspaceAliases]);

    // We use the initial data as fallback for the first load
    const transactions = useSyncData('transactions', INITIAL_TRANSACTIONS);
    const categories = useSyncData('categories', INITIAL_CATEGORIES);
    const accounts = useSyncData('accounts', INITIAL_ACCOUNTS);
    const goals = useSyncData('goals', INITIAL_GOALS);
    const shoppingList = useSyncData('shopping_items', []);
    const scheduledTransactions = useSyncData('scheduled_transactions', []);
    const tags = useSyncData('tags', []);
    const budgets = useSyncData('budgets', []);
    const transfers = useSyncData('transfers', []);

    // Função para realizar transferência entre contas
    const makeTransfer = (fromAccountId, toAccountId, amount, description = 'Transferência') => {
        const fromAccount = accounts.data.find(a => a.id === fromAccountId);
        const toAccount = accounts.data.find(a => a.id === toAccountId);

        if (!fromAccount || !toAccount) return;

        // Registrar a transferência
        transfers.add({
            id: crypto.randomUUID(),
            user_id: activeWorkspace.id,
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            description
        });

        // Atualizar saldos
        accounts.update(fromAccountId, { balance: (fromAccount.balance || 0) - parseFloat(amount) });
        accounts.update(toAccountId, { balance: (toAccount.balance || 0) + parseFloat(amount) });
    };

    // Função para gerar parcelas automaticamente
    const generateInstallments = (baseData, totalInstallments) => {
        const parcelas = [];
        const baseDate = new Date(baseData.due_date);
        const parentId = crypto.randomUUID();

        for (let i = 0; i < totalInstallments; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setMonth(dueDate.getMonth() + i);

            parcelas.push({
                id: i === 0 ? parentId : crypto.randomUUID(),
                user_id: activeWorkspace.id,
                description: totalInstallments > 1
                    ? `${baseData.description} (${i + 1}/${totalInstallments})`
                    : baseData.description,
                total_amount: baseData.total_amount,
                installment_amount: baseData.total_amount / totalInstallments,
                installments: totalInstallments,
                current_installment: i + 1,
                type: baseData.type,
                payment_method: baseData.payment_method,
                due_date: dueDate.toISOString().split('T')[0],
                account_id: baseData.account_id,
                category_id: baseData.category_id,
                status: 'pendente',
                parent_id: i === 0 ? null : parentId,
                recurring: baseData.recurring || false
            });
        }

        return parcelas;
    };

    // Função para adicionar conta com parcelas
    const addScheduledTransaction = (data) => {
        const parcelas = generateInstallments(data, data.installments || 1);
        parcelas.forEach(p => scheduledTransactions.add(p));
    };

    // Função para marcar como pago e atualizar saldo
    const markAsPaid = async (scheduledId) => {
        const scheduled = scheduledTransactions.data.find(s => s.id === scheduledId);
        if (!scheduled) return;

        const account = accounts.data.find(a => a.id === scheduled.account_id);
        if (!account) return;

        // Atualizar status da conta agendada
        scheduledTransactions.update(scheduledId, {
            status: 'pago',
            paid_date: new Date().toISOString().split('T')[0]
        });

        // Criar transação real no histórico
        transactions.add({
            id: crypto.randomUUID(),
            description: scheduled.description,
            amount: scheduled.installment_amount,
            type: scheduled.type === 'pagar' ? 'saida' : 'entrada',
            date: new Date().toISOString().split('T')[0],
            category_id: scheduled.category_id,
            account_id: scheduled.account_id,
            payment_method: scheduled.payment_method,
            scheduled_id: scheduledId
        });

        // Atualizar saldo da conta
        const amount = scheduled.installment_amount;
        if (scheduled.type === 'pagar') {
            if (scheduled.payment_method === 'cartao_credito') {
                // Cartão de crédito: aumenta a fatura
                accounts.update(account.id, { balance: (account.balance || 0) + amount });
            } else {
                // Outros métodos: diminui saldo da conta
                accounts.update(account.id, { balance: (account.balance || 0) - amount });
            }
        } else {
            // Receita: aumenta saldo
            accounts.update(account.id, { balance: (account.balance || 0) + amount });
        }
    };

    // Filter Logic
    const filterByWorkspace = (items) => {
        if (!items) return [];
        return items.filter(item => item.user_id === activeWorkspace.id);
    };

    // Add Wrapper with balance tracking for transactions
    const createAddWrapper = (addFn) => (item) => {
        const descriptionSuffix = (activeWorkspace.type === 'shared' && activeWorkspace.permissions?.write)
            ? ` (por ${user?.email || 'convidado'})`
            : '';

        const newItem = { ...item, user_id: activeWorkspace.id };
        if (descriptionSuffix && newItem.description) {
            newItem.description += descriptionSuffix;
        }

        addFn(newItem);
    };

    // Wrapper específico para transações que atualiza o saldo da conta
    const addTransactionWithBalance = (item) => {
        const newItem = { ...item, user_id: activeWorkspace.id };

        // Adicionar a transação
        transactions.add(newItem);

        // Se a transação está paga e tem uma conta vinculada, atualizar o saldo
        if (newItem.is_paid !== false && newItem.account_id) {
            const account = accounts.data.find(a => a.id === newItem.account_id);
            if (account) {
                const amount = parseFloat(newItem.amount) || 0;
                let newBalance = account.balance || 0;

                if (newItem.type === 'entrada') {
                    // Receita: aumenta o saldo
                    newBalance += amount;
                } else if (newItem.type === 'saida') {
                    if (account.type === 'cartao') {
                        // Cartão de crédito: aumenta a fatura (balance é o valor da fatura)
                        newBalance += amount;
                    } else {
                        // Conta bancária: diminui o saldo
                        newBalance -= amount;
                    }
                } else if (newItem.type === 'investimento') {
                    // Investimento: diminui saldo (saída para investimento)
                    newBalance -= amount;
                }

                accounts.update(account.id, { balance: newBalance });
            }
        }
    };

    // Wrapper para remover transação e reverter o saldo
    const removeTransactionWithBalance = (transactionId) => {
        const transaction = transactions.data.find(t => t.id === transactionId);

        // Se a transação existe, estava paga e tinha conta, reverter o saldo
        if (transaction && transaction.is_paid !== false && transaction.account_id) {
            const account = accounts.data.find(a => a.id === transaction.account_id);
            if (account) {
                const amount = parseFloat(transaction.amount) || 0;
                let newBalance = account.balance || 0;

                if (transaction.type === 'entrada') {
                    // Receita removida: diminui o saldo
                    newBalance -= amount;
                } else if (transaction.type === 'saida') {
                    if (account.type === 'cartao') {
                        // Despesa de cartão removida: diminui a fatura
                        newBalance -= amount;
                    } else {
                        // Despesa de conta removida: aumenta o saldo
                        newBalance += amount;
                    }
                } else if (transaction.type === 'investimento') {
                    // Investimento removido: aumenta o saldo
                    newBalance += amount;
                }

                accounts.update(account.id, { balance: newBalance });
            }
        }

        // Remover a transação
        transactions.remove(transactionId);
    };

    const isReadOnly = activeWorkspace.type === 'shared' && !activeWorkspace.permissions?.write;

    const value = {
        // Workspace Management
        activeWorkspace,
        setActiveWorkspace,
        sharedWorkspaces,
        availableWorkspaces: [{ id: user?.id, name: 'Pessoal', type: 'personal', permissions: { read: true, write: true } }, ...sharedWorkspaces],
        updateWorkspaceAlias,
        isReadOnly,

        // Filtered Data
        transactions: filterByWorkspace(transactions.data),
        addTransaction: addTransactionWithBalance,
        updateTransaction: transactions.update,
        removeTransaction: removeTransactionWithBalance,

        categories: filterByWorkspace(categories.data),
        addCategory: createAddWrapper(categories.add),
        updateCategory: categories.update,
        removeCategory: categories.remove,

        accounts: filterByWorkspace(accounts.data),
        addAccount: createAddWrapper(accounts.add),
        updateAccount: accounts.update,
        removeAccount: accounts.remove,

        goals: filterByWorkspace(goals.data),
        addGoal: createAddWrapper(goals.add),
        updateGoal: goals.update,
        removeGoal: goals.remove,

        shoppingList: filterByWorkspace(shoppingList.data),
        addShoppingItem: createAddWrapper(shoppingList.add),
        updateShoppingItem: shoppingList.update,
        removeShoppingItem: shoppingList.remove,

        scheduledTransactions: filterByWorkspace(scheduledTransactions.data),
        addScheduledTransaction,
        updateScheduledTransaction: scheduledTransactions.update,
        removeScheduledTransaction: scheduledTransactions.remove,
        markAsPaid,

        tags: filterByWorkspace(tags.data),
        addTag: createAddWrapper(tags.add),
        updateTag: tags.update,
        removeTag: tags.remove,

        budgets: filterByWorkspace(budgets.data),
        addBudget: createAddWrapper(budgets.add),
        updateBudget: budgets.update,
        removeBudget: budgets.remove,

        transfers: filterByWorkspace(transfers.data),
        makeTransfer,

        isSyncing: transactions.isSyncing || accounts.isSyncing
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
