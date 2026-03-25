import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../../helpers/AuthContent';
import AuthLayout from './AuthLayout';

const AdminLoginForm = () => {
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
                if (auth.usertype === 'ADMIN') {
                    history.push('/admin');
                } else {
                    history.push('/home'); // Fallback if regular user stumbled here
                }
            } else {
                setError('Invalid admin credentials.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during secure authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-xl relative border border-outline-variant/10 shadow-2xl">
                {/* Admin Accent Line */}
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-colors duration-500"></div>

                <div className="mb-8">
                    <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center text-amber-500 mb-6">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                    </div>
                    <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Systems Key</h2>
                    <p className="font-body text-amber-500/80 text-sm font-medium tracking-wide">
                        Restricted Access Portal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-error-container/20 border border-error/30 text-error-dim rounded text-sm font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-1.5">
                        <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="identifier">Admin Identifier</label>
                        <input
                            required
                            className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-amber-500/40 transition-all outline-none"
                            id="identifier" name="identifier" placeholder="root@stadia.io" type="text"
                            value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="password">Access Code</label>
                        <div className="relative">
                            <input
                                required
                                className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-amber-500/40 transition-all outline-none"
                                id="password" name="password" placeholder="••••••••••••" type={showPassword ? "text" : "password"}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-amber-500 transition-colors" type="button">
                                <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-amber-400 to-amber-600 py-4 rounded font-headline font-bold text-black hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                            type="submit"
                        >
                            {loading ? 'Decrypting...' : 'Authorize Login'}
                            {!loading && <span className="material-symbols-outlined">vpn_key</span>}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col items-center gap-4">
                    <p className="font-body text-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <Link to="/login" className="text-amber-500 font-bold hover:underline">Return to User Portal</Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AdminLoginForm;
