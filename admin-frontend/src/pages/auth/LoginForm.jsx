import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../../helpers/AuthContent';
import AuthLayout from './AuthLayout';

const LoginForm = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const auth = useAuth();
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loginSuccess = await auth.login(identifier, password);
            if (loginSuccess) {
                if (auth.usertype === "admin") {
                    history.push('/admin/dashboard');
                } else {
                    history.push('/'); 
                }
            } else {
                setError('Invalid credentials.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full bg-[#131313] p-8 md:p-10 rounded-sm border border-[#484848]/15 shadow-2xl">
                <div className="mb-8">
                    <h2 className="font-headline text-3xl font-black text-[#fafdfa] mb-2">Login</h2>
                    <p className="font-body text-[#a8acaa] text-sm">
                        Welcome back to ZuriMarket.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-xs font-bold uppercase tracking-wider">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="identifier">Username or Email</label>
                        <input
                            required
                            className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm"
                            id="identifier" name="identifier" placeholder="architect@zurimarket.com" type="text"
                            value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="password">Password</label>
                            <Link to="#" className="text-[10px] font-black text-[#ddff5c] uppercase tracking-widest hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <input
                                required
                                className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm"
                                id="password" name="password" placeholder="••••••••••••" type={showPassword ? "text" : "password"}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#ddff5c] transition-colors" type="button">
                                <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            className="w-full bg-[#ddff5c] text-[#0b0f0e] py-4 rounded-sm font-body font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                            type="submit"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="font-body text-sm text-[#a8acaa]">
                        New to ZuriMarket?
                        <Link to="/register" className="text-[#ddff5c] font-black ml-2 hover:underline">Create Account</Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default LoginForm;
