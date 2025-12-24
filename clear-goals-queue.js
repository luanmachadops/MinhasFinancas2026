// Script para limpar fila de sincronização corrompida
console.log('Limpando fila de sincronização de goals...');
localStorage.removeItem('sync_queue_goals');
console.log('Fila limpa! Recarregue a página.');
