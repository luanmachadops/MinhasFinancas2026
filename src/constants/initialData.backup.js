// Estados Iniciais da Aplicação

// Banco completo de categorias padrão com ícones
export const DEFAULT_CATEGORIES = {
    // Categorias de SAÍDA (Despesas)
    saida: [
        { name: 'Alimentação', icon: 'Utensils', color: 'text-orange-400' },
        { name: 'Mercado', icon: 'ShoppingCart', color: 'text-amber-400' },
        { name: 'Restaurante', icon: 'Coffee', color: 'text-orange-500' },
        { name: 'Moradia', icon: 'Home', color: 'text-rose-400' },
        { name: 'Aluguel', icon: 'Building2', color: 'text-rose-500' },
        { name: 'Energia', icon: 'Zap', color: 'text-yellow-400' },
        { name: 'Água', icon: 'Droplets', color: 'text-blue-400' },
        { name: 'Internet', icon: 'Wifi', color: 'text-cyan-400' },
        { name: 'Telefone', icon: 'Phone', color: 'text-green-400' },
        { name: 'Transporte', icon: 'Car', color: 'text-blue-500' },
        { name: 'Combustível', icon: 'Fuel', color: 'text-amber-500' },
        { name: 'Uber/99', icon: 'MapPin', color: 'text-slate-400' },
        { name: 'Estacionamento', icon: 'ParkingCircle', color: 'text-gray-400' },
        { name: 'Saúde', icon: 'HeartPulse', color: 'text-red-400' },
        { name: 'Farmácia', icon: 'Pill', color: 'text-green-500' },
        { name: 'Academia', icon: 'Dumbbell', color: 'text-purple-400' },
        { name: 'Educação', icon: 'GraduationCap', color: 'text-indigo-400' },
        { name: 'Cursos', icon: 'BookOpen', color: 'text-indigo-500' },
        { name: 'Lazer', icon: 'Smile', color: 'text-purple-500' },
        { name: 'Cinema', icon: 'Film', color: 'text-violet-400' },
        { name: 'Streaming', icon: 'Tv', color: 'text-red-500' },
        { name: 'Jogos', icon: 'Gamepad2', color: 'text-emerald-400' },
        { name: 'Viagem', icon: 'Plane', color: 'text-sky-400' },
        { name: 'Hospedagem', icon: 'Hotel', color: 'text-sky-500' },
        { name: 'Roupas', icon: 'Shirt', color: 'text-pink-400' },
        { name: 'Beleza', icon: 'Sparkles', color: 'text-pink-500' },
        { name: 'Pet', icon: 'PawPrint', color: 'text-amber-300' },
        { name: 'Presentes', icon: 'Gift', color: 'text-rose-300' },
        { name: 'Festas', icon: 'PartyPopper', color: 'text-yellow-500' },
        { name: 'Impostos', icon: 'Receipt', color: 'text-slate-500' },
        { name: 'Seguros', icon: 'Shield', color: 'text-teal-400' },
        { name: 'Assinaturas', icon: 'CreditCard', color: 'text-violet-500' },
        { name: 'Banco/Taxas', icon: 'Landmark', color: 'text-gray-500' },
        { name: 'Doações', icon: 'Heart', color: 'text-red-300' },
        { name: 'Outros', icon: 'MoreHorizontal', color: 'text-slate-400' },
    ],
    // Categorias de ENTRADA (Receitas)
    entrada: [
        { name: 'Salário', icon: 'Briefcase', color: 'text-emerald-400' },
        { name: 'Freelance', icon: 'Laptop', color: 'text-blue-400' },
        { name: 'Comissão', icon: 'TrendingUp', color: 'text-green-500' },
        { name: 'Bônus', icon: 'Award', color: 'text-yellow-400' },
        { name: '13º Salário', icon: 'Gift', color: 'text-emerald-500' },
        { name: 'Férias', icon: 'Palmtree', color: 'text-cyan-400' },
        { name: 'Investimentos', icon: 'LineChart', color: 'text-violet-400' },
        { name: 'Dividendos', icon: 'PiggyBank', color: 'text-pink-400' },
        { name: 'Rendimentos', icon: 'Percent', color: 'text-teal-400' },
        { name: 'Aluguel Recebido', icon: 'Building', color: 'text-amber-400' },
        { name: 'Venda', icon: 'ShoppingBag', color: 'text-orange-400' },
        { name: 'Reembolso', icon: 'RefreshCcw', color: 'text-blue-500' },
        { name: 'Empréstimo', icon: 'Banknote', color: 'text-slate-400' },
        { name: 'Presente Recebido', icon: 'PartyPopper', color: 'text-rose-400' },
        { name: 'Prêmio', icon: 'Trophy', color: 'text-yellow-500' },
        { name: 'Outros', icon: 'MoreHorizontal', color: 'text-slate-400' },
    ]
};

// Lista de ícones disponíveis para seleção (apenas ícones válidos do lucide-react)
export const AVAILABLE_ICONS = [
    // Finanças
    'Wallet', 'CreditCard', 'Banknote', 'PiggyBank', 'Landmark', 'Receipt', 'Coins', 'DollarSign', 'TrendingUp', 'TrendingDown', 'LineChart', 'BarChart3', 'Percent',
    // Casa e Moradia
    'Home', 'Building', 'Building2', 'Hotel', 'Key', 'Sofa', 'Lamp', 'Bed',
    // Transporte
    'Car', 'Bike', 'Bus', 'Train', 'Plane', 'Ship', 'Fuel', 'ParkingCircle', 'MapPin', 'Navigation',
    // Alimentação
    'Utensils', 'Coffee', 'Pizza', 'Wine', 'Beer', 'Apple', 'Carrot', 'IceCream2', 'Cake', 'Cookie', 'ShoppingCart', 'ShoppingBag', 'ShoppingBasket',
    // Saúde e Bem-estar
    'HeartPulse', 'Heart', 'Hospital', 'Pill', 'Stethoscope', 'Activity', 'Dumbbell', 'PersonStanding',
    // Educação
    'GraduationCap', 'BookOpen', 'Book', 'Library', 'Pencil', 'PenTool', 'Lightbulb',
    // Trabalho
    'Briefcase', 'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Mic', 'Video', 'Newspaper',
    // Comunicação
    'Phone', 'Smartphone', 'Mail', 'MessageCircle', 'Send', 'Wifi', 'Globe',
    // Entretenimento
    'Tv', 'Film', 'Music', 'Gamepad2', 'Dice1', 'Ticket',
    // Natureza e Viagem
    'Sun', 'Moon', 'Cloud', 'Umbrella', 'Snowflake', 'Palmtree', 'Mountain', 'Waves', 'Fish', 'Leaf', 'Flower2',
    // Pessoas e Família
    'User', 'Users', 'Baby',
    // Pet
    'PawPrint', 'Dog', 'Cat', 'Bird',
    // Serviços
    'Zap', 'Droplets', 'Flame', 'Wrench', 'Hammer', 'Scissors', 'Brush',
    // Vestuário
    'Shirt', 'Watch', 'Glasses', 'Crown', 'Gem', 'Sparkles',
    // Festas e Eventos
    'PartyPopper', 'Gift',
    // Outros
    'Tag', 'Star', 'Flag', 'Bookmark', 'Pin', 'Award', 'Trophy', 'Medal', 'Target', 'Shield', 'Lock', 'Settings', 'MoreHorizontal', 'Plus', 'Check', 'X', 'AlertCircle'
];

// Cores disponíveis
export const AVAILABLE_COLORS = [
    { name: 'Vermelho', value: 'text-red-400', bg: 'bg-red-500' },
    { name: 'Rosa', value: 'text-rose-400', bg: 'bg-rose-500' },
    { name: 'Pink', value: 'text-pink-400', bg: 'bg-pink-500' },
    { name: 'Roxo', value: 'text-purple-400', bg: 'bg-purple-500' },
    { name: 'Violeta', value: 'text-violet-400', bg: 'bg-violet-500' },
    { name: 'Índigo', value: 'text-indigo-400', bg: 'bg-indigo-500' },
    { name: 'Azul', value: 'text-blue-400', bg: 'bg-blue-500' },
    { name: 'Céu', value: 'text-sky-400', bg: 'bg-sky-500' },
    { name: 'Ciano', value: 'text-cyan-400', bg: 'bg-cyan-500' },
    { name: 'Teal', value: 'text-teal-400', bg: 'bg-teal-500' },
    { name: 'Esmeralda', value: 'text-emerald-400', bg: 'bg-emerald-500' },
    { name: 'Verde', value: 'text-green-400', bg: 'bg-green-500' },
    { name: 'Lima', value: 'text-lime-400', bg: 'bg-lime-500' },
    { name: 'Amarelo', value: 'text-yellow-400', bg: 'bg-yellow-500' },
    { name: 'Âmbar', value: 'text-amber-400', bg: 'bg-amber-500' },
    { name: 'Laranja', value: 'text-orange-400', bg: 'bg-orange-500' },
    { name: 'Cinza', value: 'text-slate-400', bg: 'bg-slate-500' },
];

// Gerar categorias iniciais com IDs únicos
export const INITIAL_CATEGORIES = [
    // === CATEGORIAS DE SAÍDA (Despesas) ===
    // Alimentação
    { id: 'c1', name: 'Alimentação', icon: 'Utensils', type: 'saida', color: 'text-orange-400' },
    { id: 'c2', name: 'Mercado', icon: 'ShoppingCart', type: 'saida', color: 'text-amber-400' },
    { id: 'c3', name: 'Restaurante', icon: 'Coffee', type: 'saida', color: 'text-orange-400' },
    // Moradia
    { id: 'c4', name: 'Moradia', icon: 'Home', type: 'saida', color: 'text-rose-400' },
    { id: 'c5', name: 'Aluguel', icon: 'Building2', type: 'saida', color: 'text-rose-400' },
    { id: 'c6', name: 'Energia', icon: 'Zap', type: 'saida', color: 'text-yellow-400' },
    { id: 'c7', name: 'Água', icon: 'Droplets', type: 'saida', color: 'text-blue-400' },
    { id: 'c8', name: 'Internet', icon: 'Wifi', type: 'saida', color: 'text-cyan-400' },
    { id: 'c9', name: 'Telefone', icon: 'Phone', type: 'saida', color: 'text-green-400' },
    // Transporte
    { id: 'c10', name: 'Transporte', icon: 'Car', type: 'saida', color: 'text-blue-400' },
    { id: 'c11', name: 'Combustível', icon: 'Fuel', type: 'saida', color: 'text-amber-400' },
    { id: 'c12', name: 'Uber/99', icon: 'MapPin', type: 'saida', color: 'text-slate-400' },
    // Saúde
    { id: 'c13', name: 'Saúde', icon: 'HeartPulse', type: 'saida', color: 'text-red-400' },
    { id: 'c14', name: 'Farmácia', icon: 'Pill', type: 'saida', color: 'text-green-400' },
    { id: 'c15', name: 'Academia', icon: 'Dumbbell', type: 'saida', color: 'text-purple-400' },
    // Educação
    { id: 'c16', name: 'Educação', icon: 'GraduationCap', type: 'saida', color: 'text-indigo-400' },
    { id: 'c17', name: 'Cursos', icon: 'BookOpen', type: 'saida', color: 'text-indigo-400' },
    // Lazer
    { id: 'c18', name: 'Lazer', icon: 'Smile', type: 'saida', color: 'text-purple-400' },
    { id: 'c19', name: 'Streaming', icon: 'Tv', type: 'saida', color: 'text-red-400' },
    { id: 'c20', name: 'Viagem', icon: 'Plane', type: 'saida', color: 'text-sky-400' },
    // Outros
    { id: 'c21', name: 'Roupas', icon: 'Shirt', type: 'saida', color: 'text-pink-400' },
    { id: 'c22', name: 'Beleza', icon: 'Sparkles', type: 'saida', color: 'text-pink-400' },
    { id: 'c23', name: 'Pet', icon: 'PawPrint', type: 'saida', color: 'text-amber-400' },
    { id: 'c24', name: 'Presentes', icon: 'Gift', type: 'saida', color: 'text-rose-400' },
    { id: 'c25', name: 'Assinaturas', icon: 'CreditCard', type: 'saida', color: 'text-violet-400' },
    { id: 'c26', name: 'Impostos', icon: 'Receipt', type: 'saida', color: 'text-slate-400' },
    { id: 'c27', name: 'Seguros', icon: 'Shield', type: 'saida', color: 'text-teal-400' },
    { id: 'c28', name: 'Outros', icon: 'MoreHorizontal', type: 'saida', color: 'text-slate-400' },

    // === CATEGORIAS DE ENTRADA (Receitas) ===
    { id: 'c50', name: 'Salário', icon: 'Briefcase', type: 'entrada', color: 'text-emerald-400' },
    { id: 'c51', name: 'Freelance', icon: 'Laptop', type: 'entrada', color: 'text-blue-400' },
    { id: 'c52', name: 'Comissão', icon: 'TrendingUp', type: 'entrada', color: 'text-green-400' },
    { id: 'c53', name: 'Bônus', icon: 'Award', type: 'entrada', color: 'text-yellow-400' },
    { id: 'c54', name: '13º Salário', icon: 'Gift', type: 'entrada', color: 'text-emerald-400' },
    { id: 'c55', name: 'Férias', icon: 'Palmtree', type: 'entrada', color: 'text-cyan-400' },
    { id: 'c56', name: 'Investimentos', icon: 'LineChart', type: 'entrada', color: 'text-violet-400' },
    { id: 'c57', name: 'Dividendos', icon: 'PiggyBank', type: 'entrada', color: 'text-pink-400' },
    { id: 'c58', name: 'Rendimentos', icon: 'Percent', type: 'entrada', color: 'text-teal-400' },
    { id: 'c59', name: 'Aluguel Recebido', icon: 'Building', type: 'entrada', color: 'text-amber-400' },
    { id: 'c60', name: 'Venda', icon: 'ShoppingBag', type: 'entrada', color: 'text-orange-400' },
    { id: 'c61', name: 'Reembolso', icon: 'RefreshCcw', type: 'entrada', color: 'text-blue-400' },
    { id: 'c62', name: 'Presente Recebido', icon: 'PartyPopper', type: 'entrada', color: 'text-rose-400' },
    { id: 'c63', name: 'Outros', icon: 'MoreHorizontal', type: 'entrada', color: 'text-slate-400' },
];

export const INITIAL_ACCOUNTS = [
    { id: 'a1', name: 'Carteira', type: 'conta', balance: 500.00, bank: 'Dinheiro' },
    { id: 'a2', name: 'Nubank', type: 'conta', balance: 2500.00, bank: 'Nubank' },
    { id: 'a3', name: 'Cartão Nubank', type: 'cartao', balance: 0, limit: 8000, dueDate: 10, bank: 'Nubank' },
];

export const INITIAL_TRANSACTIONS = [];

export const INITIAL_GOALS = [
    { id: 'g1', name: 'Reserva de Emergência', target_amount: 10000, current_amount: 0, icon: 'ShieldCheck' },
];
