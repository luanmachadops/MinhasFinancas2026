import React, { useState } from 'react';
import { FloatingNav } from './components/layout/FloatingNav';
import { Dashboard } from './features/dashboard/Dashboard';
import { TransactionsScreen } from './features/transactions/TransactionsScreen';
import { Goals } from './features/goals/Goals';
import { ShoppingList } from './features/shopping/ShoppingList';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { ManageAccountsScreen } from './features/settings/ManageAccountsScreen';
import { BankAccountsScreen } from './features/settings/BankAccountsScreen';
import { CreditCardsScreen } from './features/settings/CreditCardsScreen';
import { SharedAccessScreen } from './features/settings/SharedAccessScreen';
import { ScheduledTransactionsScreen } from './features/scheduled/ScheduledTransactionsScreen';
import { BudgetScreen } from './features/budget/BudgetScreen';
import { CategoriesScreen } from './features/categories/CategoriesScreen';
import { CreditCardDetailsScreen } from './features/creditCard/CreditCardDetailsScreen';
import { AuthScreen } from './features/auth/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { RefreshCw } from 'lucide-react';
import './styles/global.css';

function App() {
    const { user, signOut } = useAuth();
    const {
        transactions, addTransaction, updateTransaction, removeTransaction,
        categories, addCategory, removeCategory,
        goals, addGoal, updateGoal,
        shoppingList, addShoppingItem, updateShoppingItem, removeShoppingItem,
        accounts, addAccount, updateAccount, removeAccount,
        isSyncing
    } = useData();

    const [page, setPage] = useState('dashboard');
    const [pageProps, setPageProps] = useState({});

    if (!user) {
        return <AuthScreen />;
    }

    const handleNavigate = (newPage, props = {}) => {
        setPage(newPage);
        setPageProps(props);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Background ambient glow */}
            <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-900/20 rounded-full blur-[120px]" />
            </div>

            {/* Sync Indicator */}
            {isSyncing && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900/80 backdrop-blur rounded-full p-2 shadow-xl border border-white/10">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                </div>
            )}

            <main className="relative z-10 max-w-md mx-auto p-6 min-h-screen">
                {page === 'dashboard' && <Dashboard transactions={transactions} categories={categories} goals={goals} accounts={accounts} user={user} onNavigate={handleNavigate} onUpdateTransaction={updateTransaction} onDeleteTransaction={removeTransaction} onAddCategory={addCategory} />}
                {page === 'movimentacao' && <TransactionsScreen transactions={transactions} categories={categories} accounts={accounts} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={removeTransaction} onAddCategory={addCategory} {...pageProps} />}
                {page === 'metas' && <Goals goals={goals} onAddGoal={addGoal} onUpdateGoal={updateGoal} />}
                {page === 'lista' && <ShoppingList list={shoppingList} onAdd={addShoppingItem} onUpdate={updateShoppingItem} onDelete={removeShoppingItem} onClear={() => shoppingList.filter(i => i.purchased).forEach(i => removeShoppingItem(i.id))} />}
                {page === 'configuracao' && <SettingsScreen user={user} accounts={accounts} onAddAccount={addAccount} categories={categories} onAddCategory={addCategory} onRemoveCategory={removeCategory} onLogout={signOut} onNavigate={handleNavigate} />}
                {page === 'gerenciar-contas' && <ManageAccountsScreen accounts={accounts} onAddAccount={addAccount} onUpdateAccount={updateAccount} onRemoveAccount={removeAccount} onBack={() => handleNavigate('configuracao')} onAddTransaction={addTransaction} />}
                {page === 'compartilhar' && <SharedAccessScreen onBack={() => handleNavigate('configuracao')} />}
                {page === 'categorias' && <CategoriesScreen onBack={() => handleNavigate('configuracao')} />}
                {page === 'contas' && <ScheduledTransactionsScreen />}
                {page === 'orcamento' && <BudgetScreen />}
                {page === 'contas-bancarias' && <BankAccountsScreen accounts={accounts} onAddAccount={addAccount} onUpdateAccount={updateAccount} onRemoveAccount={removeAccount} onBack={() => handleNavigate('configuracao')} onAddTransaction={addTransaction} />}
                {page === 'cartoes' && <CreditCardsScreen accounts={accounts} onAddAccount={addAccount} onUpdateAccount={updateAccount} onRemoveAccount={removeAccount} onBack={() => handleNavigate('configuracao')} onNavigate={handleNavigate} />}
                {page === 'cartao-detalhes' && <CreditCardDetailsScreen cardId={pageProps.cardId} accounts={accounts} transactions={transactions} categories={categories} onNavigate={handleNavigate} onUpdateTransaction={updateTransaction} onDeleteTransaction={removeTransaction} onAddTransaction={addTransaction} onAddCategory={addCategory} />}
            </main>

            <FloatingNav current={page} onChange={p => handleNavigate(p)} />
        </div>
    );
}

export default App;

