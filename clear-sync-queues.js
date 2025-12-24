// Script completo para limpar todas as filas de sincronização corrompidas
// Execute este código no console do navegador (F12)

console.log('🔧 Limpando filas de sincronização...');

// Limpar fila de goals
localStorage.removeItem('sync_queue_goals');
console.log('✅ Fila de goals limpa');

// Limpar dados offline de goals (opcional - vai forçar re-download do servidor)
// localStorage.removeItem('offline_goals');
// console.log('✅ Cache offline de goals limpo');

console.log('✨ Limpeza concluída! Recarregando página em 2 segundos...');

setTimeout(() => {
    location.reload();
}, 2000);
