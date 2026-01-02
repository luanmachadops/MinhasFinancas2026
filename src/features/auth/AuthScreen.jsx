import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NeoButton, NeoInput, NeoCard } from '../../components/ui';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AuthScreen = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Função para aplicar máscara de telefone brasileiro
    const formatPhone = (value) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        // Limita a 11 dígitos
        const limited = numbers.slice(0, 11);

        // Aplica a máscara
        if (limited.length <= 2) {
            return `(${limited}`;
        } else if (limited.length <= 7) {
            return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
        } else {
            return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
        }
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('As senhas não coincidem!');
                }
                if (formData.password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres!');
                }
                await signUp(formData.email, formData.password, { name: formData.name, phone: formData.phone });
                alert('Conta criada! Verifique seu email ou faça login se a confirmação não for necessária.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Digite seu email para recuperar a senha.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Finanças 2026</h1>
                    <p className="text-slate-400">Gerencie seu patrimônio com inteligência.</p>
                </div>

                <NeoCard className="space-y-6">
                    <div className="flex bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
                        >
                            Criar Conta
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <NeoInput
                                    label="Nome Completo"
                                    id="name"
                                    placeholder="Seu Nome"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required={!isLogin}
                                />
                                <NeoInput
                                    label="Whatsapp"
                                    id="phone"
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    required={!isLogin}
                                />
                            </>
                        )}
                        <NeoInput
                            label="Email"
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        {/* Campo de Senha com ícone de olho */}
                        <div className="group">
                            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 group-focus-within:text-blue-400 transition-colors">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="******"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none placeholder-slate-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Campo de Confirmar Senha (apenas no cadastro) */}
                        {!isLogin && (
                            <div className="group">
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-400 mb-1.5 ml-1 group-focus-within:text-blue-400 transition-colors">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="******"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none placeholder-slate-600 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Link de Recuperar Senha (apenas no login) */}
                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors hover:underline"
                                    disabled={loading}
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}

                        <NeoButton type="submit" className="w-full py-4 text-lg" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Acessar' : 'Cadastrar')}
                        </NeoButton>
                    </form>
                </NeoCard>
            </div>
        </div>
    );
};
