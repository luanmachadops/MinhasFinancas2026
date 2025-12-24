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
    const [sharedWorkspaces, setSharedWorkspaces] = useState([]);

    // Fetch Shared Workspaces
    useEffect(() => {
        if (!user) return;

        const fetchWorkspaces = async () => {
            // Find shared_access where I am the guest (accepted)
            // Join with owner to get their email/name
            const { data: invites } = await supabase
                .from('shared_access')
                .select('*')
                .eq('guest_email', user.email)
                .eq('status', 'accepted');

            if (invites) {
                const workspaces = invites.map(inv => ({
                    id: inv.owner_id,
                    name: `Compartilhado (${inv.owner_id.slice(0, 5)}...)`,
                    type: 'shared',
                    permissions: inv.permissions || { read: true, write: false }
                }));
                setSharedWorkspaces(workspaces);
            }
        };

        fetchWorkspaces();
        // Reset to personal on login
        setActiveWorkspace({ id: user.id, name: 'Pessoal', type: 'personal', permissions: { read: true, write: true } });
    }, [user]);

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

    // Add Wrapper
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

    const isReadOnly = activeWorkspace.type === 'shared' && !activeWorkspace.permissions?.write;

    const value = {
        // Workspace Management
        activeWorkspace,
        setActiveWorkspace,
        sharedWorkspaces,
        availableWorkspaces: [{ id: user?.id, name: 'Pessoal', type: 'personal', permissions: { read: true, write: true } }, ...sharedWorkspaces],
        isReadOnly,

        // Filtered Data
        transactions: filterByWorkspace(transactions.data),
        addTransaction: createAddWrapper(transactions.add),
        updateTransaction: transactions.update,
        removeTransaction: transactions.remove,

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
