// Formatação de moeda
export const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numericValue);
};

// Formatação de data
export const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() + userTimezoneOffset);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(correctedDate);
    } catch (e) {
        return 'Data Inválida';
    }
};

// Obter data de hoje
export const getTodayDate = () => new Date().toISOString().split('T')[0];
