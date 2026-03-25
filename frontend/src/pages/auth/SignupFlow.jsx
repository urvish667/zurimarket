import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../helpers/AuthContent';
import { API_URL } from '../../config';

const SignupFlow = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        otp: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const history = useHistory();
    const auth = useAuth();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInitiate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/v0/register/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password
                })
            });

            const text = await response.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                data = { message: text || 'Unknown error occurred' };
            }

            if (!response.ok) throw new Error(data.message || 'Failed to initiate registration.');
            
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/v0/register/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                    otp: formData.otp
                })
            });

            const text = await response.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                data = { message: text || 'Unknown error occurred' };
            }

            if (!response.ok) throw new Error(data.message || 'Invalid OTP.');
            
            await auth.login(formData.username, formData.password);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <React.Fragment>
            <div className="mb-8">
                <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Create Account</h2>
                <p className="font-body text-on-surface-variant text-sm">Enter your credentials to begin trading.</p>
            </div>
            
            <form onSubmit={handleInitiate} className="space-y-5">
                {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error-dim rounded text-sm font-medium">{error}</div>}

                <div className="space-y-1.5">
                    <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="username">Username</label>
                    <input required className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none" id="username" name="username" placeholder="johndoe" type="text" value={formData.username} onChange={handleInputChange} />
                </div>
                
                <div className="space-y-1.5">
                    <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="email">Email Address</label>
                    <input required className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none" id="email" name="email" placeholder="architect@stadia.io" type="email" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="space-y-1.5">
                    <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="mobile">Mobile Number</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body">+27</span>
                        <input required className="w-full bg-surface-container-highest border-none rounded p-4 pl-14 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none" id="mobile" name="phoneNumber" placeholder="82 123 4567" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                    <div className="relative">
                        <input required className="w-full bg-surface-container-highest border-none rounded p-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/30 transition-all outline-none" id="password" name="password" placeholder="••••••••••••" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button disabled={loading} className="w-full primary-gradient py-4 rounded font-headline font-bold text-on-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale" type="submit">
                        {loading ? 'Processing...' : 'Sign Up Now'}
                        {!loading && <span className="material-symbols-outlined">trending_flat</span>}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col items-center gap-4">
                <p className="font-body text-sm text-on-surface-variant">
                    Already have an account? 
                    <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login instead</Link>
                </p>
                <div className="flex items-center gap-6 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                    <span className="text-[10px] font-label tracking-tighter uppercase">Enterprise Grade Security</span>
                </div>
            </div>
        </React.Fragment>
    );

    const renderStep2 = () => (
        <React.Fragment>
            <div className="mb-8 text-center text-primary flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl mb-4 bg-primary/20 p-4 rounded-xl">phonelink_ring</span>
                <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Verify Mobile</h2>
                <p className="font-body text-on-surface-variant text-sm max-w-xs">
                    Protected channel open. Code dispatched to <span className="font-semibold text-primary">{formData.phoneNumber}</span>
                </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-5">
                {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error-dim rounded text-sm font-medium">{error}</div>}

                <div className="space-y-3">
                    <label className="block text-center font-label text-xs font-medium text-on-surface-variant uppercase tracking-widest" htmlFor="otp">Enter 6-Digit Code</label>
                    <div className="flex justify-center">
                        <input 
                            required 
                            maxLength={6}
                            className="w-48 h-16 text-center text-3xl tracking-[0.5em] font-headline bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary text-on-surface transition-all placeholder:text-outline-variant/30 outline-none" 
                            id="otp" name="otp" placeholder="••••••" type="text"
                            value={formData.otp} onChange={handleInputChange} 
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button disabled={loading} className="w-full primary-gradient py-4 rounded font-headline font-bold text-on-primary hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale" type="submit">
                        {loading ? 'Verifying...' : 'Verify & Complete'}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
                <p className="text-on-surface-variant font-body text-xs opacity-60">Check backend console for mock SMS OTP.</p>
            </div>
        </React.Fragment>
    );

    const renderStep3 = () => (
        <div className="text-center space-y-8 py-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex flex-col items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-3xl font-headline font-bold text-on-surface">Registration Complete</h2>
                <p className="text-on-surface-variant font-body text-sm max-w-sm mx-auto">
                    Your account strategy has been fully synchronized. Let's make some predictions.
                </p>
            </div>

            <div className="p-6 bg-surface-container-highest rounded border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full primary-gradient opacity-60"></div>
                <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Onboarding Capital</h3>
                <p className="text-4xl font-headline font-bold text-primary tracking-tighter">R250</p>
                <p className="text-xs text-on-surface-variant mt-2 font-body">Instantly credited and available.</p>
            </div>

            <button 
                onClick={() => history.push('/home')} 
                className="w-full primary-gradient py-4 rounded font-headline font-bold text-on-primary hover:brightness-105 active:scale-[0.98] transition-all"
            >
                Launch Dashboard
            </button>
        </div>
    );

    return (
        <AuthLayout>
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-xl relative border border-outline-variant/10 shadow-2xl">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </AuthLayout>
    );
};

export default SignupFlow;

