import {
    // Finanças
    Wallet, CreditCard, Banknote, PiggyBank, Landmark, Receipt, Coins, DollarSign,
    TrendingUp, TrendingDown, LineChart, BarChart3, Percent,
    // Casa e Moradia
    Home, Building, Building2, Hotel, Key, Sofa, Lamp, Bed,
    // Transporte
    Car, Bike, Bus, Train, Plane, Ship, Fuel, ParkingCircle, MapPin, Navigation,
    // Alimentação
    Utensils, Coffee, Pizza, Wine, Beer, Apple, Carrot, IceCream2, Cake, Cookie,
    ShoppingCart, ShoppingBag, ShoppingBasket,
    // Saúde e Bem-estar
    HeartPulse, Heart, Hospital, Pill, Stethoscope, Activity, Dumbbell, PersonStanding,
    // Educação
    GraduationCap, BookOpen, Book, Library, Pencil, PenTool, Lightbulb,
    // Trabalho
    Briefcase, Laptop, Monitor, Keyboard, Mouse, Headphones, Mic, Video, Newspaper,
    // Comunicação
    Phone, Smartphone, Mail, MessageCircle, Send, Wifi, Globe,
    // Entretenimento
    Tv, Film, Music, Gamepad2, Dice1, Ticket,
    // Natureza e Viagem
    Sun, Moon, Cloud, Umbrella, Snowflake, Palmtree, Mountain, Waves, Fish, Leaf, Flower2,
    // Pessoas e Família
    User, Users, Baby,
    // Pet
    PawPrint, Dog, Cat, Bird,
    // Serviços
    Zap, Droplets, Flame, Wrench, Hammer, Scissors, Brush,
    // Vestuário
    Shirt, Watch, Glasses, Crown, Gem, Sparkles,
    // Festas e Eventos
    PartyPopper, Gift,
    // Outros
    Tag, Tags, Star, Flag, Bookmark, Pin, Award, Trophy, Medal, Target, Shield,
    Lock, Settings, MoreHorizontal, Plus, Check, X, AlertCircle,
    ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
    RefreshCcw, FileDown, FileUp, Calculator, Bell, Grid3X3,
    ShieldCheck, LogOut, Trash2, Edit2
} from 'lucide-react';

// Mapeamento completo de ícones
export const iconMap = {
    // Default fallback
    Default: Tag,

    // Finanças
    Wallet, CreditCard, Banknote, PiggyBank, Landmark, Receipt, Coins, DollarSign,
    TrendingUp, TrendingDown, LineChart, BarChart3, Percent,

    // Casa e Moradia
    Home, Building, Building2, Hotel, Key, Sofa, Lamp, Bed,

    // Transporte
    Car, Bike, Bus, Train, Plane, Ship, Fuel, ParkingCircle, MapPin, Navigation,

    // Alimentação
    Utensils, Coffee, Pizza, Wine, Beer, Apple, Carrot, IceCream2, Cake, Cookie,
    ShoppingCart, ShoppingBag, ShoppingBasket,

    // Saúde e Bem-estar
    HeartPulse, Heart, Hospital, Pill, Stethoscope, Activity, Dumbbell, PersonStanding,

    // Educação
    GraduationCap, BookOpen, Book, Library, Pencil, PenTool, Lightbulb,

    // Trabalho
    Briefcase, Laptop, Monitor, Keyboard, Mouse, Headphones, Mic, Video, Newspaper,

    // Comunicação
    Phone, Smartphone, Mail, MessageCircle, Send, Wifi, Globe,

    // Entretenimento
    Tv, Film, Music, Gamepad2, Dice1, Ticket,

    // Natureza e Viagem
    Sun, Moon, Cloud, Umbrella, Snowflake, Palmtree, Mountain, Waves, Fish, Leaf, Flower2,

    // Pessoas e Família
    User, Users, Baby,

    // Pet
    PawPrint, Dog, Cat, Bird,

    // Serviços
    Zap, Droplets, Flame, Wrench, Hammer, Scissors, Brush,

    // Vestuário
    Shirt, Watch, Glasses, Crown, Gem, Sparkles,

    // Festas e Eventos
    PartyPopper, Gift,

    // Outros
    Tag, Tags, Star, Flag, Bookmark, Pin, Award, Trophy, Medal, Target, Shield,
    Lock, Settings, MoreHorizontal, Plus, Check, X, AlertCircle,
    ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
    RefreshCcw, FileDown, FileUp, Calculator, Bell, Grid3X3,
    ShieldCheck, LogOut, Trash2, Edit2,

    // Aliases para compatibilidade
    Smile: PartyPopper, // Fallback
};

export const iconList = Object.keys(iconMap);
