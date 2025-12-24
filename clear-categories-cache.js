// Script para limpar cache de categorias e atualizar com as novas
// Execute no console do navegador ou via node

const clearCategoriesCache = () => {
    // Limpar categorias do localStorage
    localStorage.removeItem('categories');
    localStorage.removeItem('sync_queue_categories');

    console.log('✅ Cache de categorias limpo!');
    console.log('Recarregue a página para ver as novas 42 categorias.');
};

// Se executando no navegador
if (typeof window !== 'undefined') {
    clearCategoriesCache();
} else {
    console.log('Execute este script no console do navegador (F12 > Console):');
    console.log(`
    localStorage.removeItem('categories');
    localStorage.removeItem('sync_queue_categories');
    location.reload();
    `);
}
