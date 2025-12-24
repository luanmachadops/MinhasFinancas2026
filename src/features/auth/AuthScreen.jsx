import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NeoButton, NeoInput, NeoCard } from '../../components/ui';
import { Loader2 } from 'lucide-react';

export const AuthScreen = () => {
    const { signIn, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(formData.email, formData.password);
            } else {
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
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                        <NeoInput
                            label="Senha"
                            id="password"
                            type="password"
                            placeholder="******"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <NeoButton type="submit" className="w-full py-4 text-lg" disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Acessar' : 'Cadastrar')}
                        </NeoButton>
                    </form>
                </NeoCard>
            </div>
        </div>
    );
};
