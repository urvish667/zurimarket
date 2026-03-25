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
                    history.push('/home'); 
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
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-xl relative border border-outline-variant/10 shadow-2xl">
                <div className="mb-8">
                    <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Login</h2>
                    <p className="font-body text-on-surface-variant text-sm flex justify-between">
                        <span>Enter your credentials.</span>
                        <Link to="#" className="text-xs font-bold text-primary tracking-widest uppercase hover:text-white transition-colors text-right flex items-end">Forgot?</Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-error-container/20 border border-error/30 text-error-dim rounded text-sm font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                        <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="identifier">Username or Email</label>
                        <input
                            required
                            className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                            id="identifier" name="identifier" placeholder="architect@stadia.io" type="text"
                            value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                required
                                className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                                id="password" name="password" placeholder="••••••••••••" type={showPassword ? "text" : "password"}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full primary-gradient py-4 rounded font-headline font-bold text-on-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                            type="submit"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <span className="material-symbols-outlined">trending_flat</span>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col items-center gap-4">
                    <p className="font-body text-sm text-on-surface-variant">
                        New to the platform?
                        <Link to="/register" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
                    </p>
                    <div className="flex items-center gap-6 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                        <Link to="/admin/login" className="text-[10px] font-label text-on-surface-variant tracking-tighter uppercase hover:text-primary">Admin Portal</Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default LoginForm;
