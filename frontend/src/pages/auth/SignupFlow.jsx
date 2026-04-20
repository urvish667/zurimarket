import React, { useEffect, useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../helpers/AuthContent';
import { API_URL } from '../../config';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const SignupFlow = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        password: '',
        otp: '',
        referralCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(45);
    const [showPassword, setShowPassword] = useState(false);
    const otpInputRefs = useRef([]);

    const history = useHistory();
    const auth = useAuth();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const maskPhoneNumber = (phoneNumber) => {
        const digits = phoneNumber.replace(/\D/g, '');
        if (!digits) return 'your mobile number';
        const hiddenDigits = '\u2022'.repeat(Math.max(digits.length - 2, 2));
        return `+21 ${hiddenDigits}${digits.slice(-2)}`;
    };

    const calculateAge = (dobString) => {
        if (!dobString) return 0;
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleOtpDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const otpDigits = Array.from({ length: 6 }, (_, otpIndex) => formData.otp[otpIndex] || '');
        otpDigits[index] = digit;
        const nextOtp = otpDigits.join('').slice(0, 6);

        setFormData((prev) => ({ ...prev, otp: nextOtp }));

        if (digit && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (formData.otp[index]) {
                const otpDigits = Array.from({ length: 6 }, (_, otpIndex) => formData.otp[otpIndex] || '');
                otpDigits[index] = '';
                setFormData((prev) => ({ ...prev, otp: otpDigits.join('') }));
                return;
            }

            if (index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            otpInputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'ArrowRight' && index < 5) {
            e.preventDefault();
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pastedDigits) return;

        setFormData((prev) => ({ ...prev, otp: pastedDigits }));
        otpInputRefs.current[Math.min(pastedDigits.length, 5)]?.focus();
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setFormData(prev => ({ ...prev, referralCode: ref }));
        }
    }, []);

    useEffect(() => {
        if (step !== 2 || resendTimer <= 0) return undefined;

        const timerId = window.setTimeout(() => {
            setResendTimer((current) => current - 1);
        }, 1000);

        return () => window.clearTimeout(timerId);
    }, [step, resendTimer]);

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const initiateRegistration = async () => {
        const response = await fetch(`${API_URL}/v0/register/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.username,
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                referralCode: formData.referralCode
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
    };

    const handleInitiate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (calculateAge(formData.dateOfBirth) < 18) {
            setError("PROTOCOL RESTRICTION: You must be at least 18 years old to join.");
            setLoading(false);
            return;
        }

        try {
            await initiateRegistration();
            setResendTimer(45);
            setFormData((prev) => ({ ...prev, otp: '' }));
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0 || resendLoading) return;

        setError('');
        setResendLoading(true);

        try {
            await initiateRegistration();
            setFormData((prev) => ({ ...prev, otp: '' }));
            setResendTimer(45);
            otpInputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message);
        } finally {
            setResendLoading(false);
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
        <div className="w-full bg-[#131313] p-8 md:p-10 rounded-sm border border-[#484848]/15 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ddff5c]/20"></div>
            <div className="mb-8">
                <h2 className="font-headline text-3xl font-black text-[#fafdfa] mb-2">Create Account</h2>
                <p className="font-body text-[#a8acaa] text-sm">Join ZuriMarket today.</p>
            </div>

            <form onSubmit={handleInitiate} className="space-y-5">
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-xs font-bold uppercase tracking-wider">{error}</div>}

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="username">Username</label>
                    <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="username" name="username" placeholder="johndoe" type="text" value={formData.username} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="fullName">Full Name</label>
                    <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="fullName" name="fullName" placeholder="John Doe" type="text" value={formData.fullName} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="dateOfBirth">Date of Birth</label>
                    <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="email">Email Address</label>
                    <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="email" name="email" placeholder="architect@zurimarket.com" type="email" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="mobile">Mobile Number</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a8acaa] font-black text-xs tracking-widest">+21</span>
                        <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 pl-14 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="mobile" name="phoneNumber" placeholder="123 456 7890" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="password">Password</label>
                    <div className="relative">
                        <input required className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="password" name="password" placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#ddff5c] transition-colors">
                            <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block font-body text-[10px] font-black text-[#a8acaa] uppercase tracking-[0.2em]" htmlFor="referralCode">Referral Code (Optional)</label>
                    <input className="w-full bg-[#0b0f0e] border border-white/5 rounded-sm p-4 text-[#fafdfa] placeholder:text-white/20 focus:ring-1 focus:ring-[#ddff5c]/30 transition-all outline-none font-body text-sm" id="referralCode" name="referralCode" placeholder="Enter code" type="text" value={formData.referralCode} onChange={handleInputChange} />
                </div>

                <div className="pt-4">
                    <button disabled={loading} className="w-full bg-[#ddff5c] text-[#0b0f0e] py-4 rounded-sm font-body font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50" type="submit">
                        {loading ? 'Processing...' : 'Sign Up Now'}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="font-body text-sm text-[#a8acaa]">
                    Already have an account?
                    <Link to="/login" className="text-[#ddff5c] font-black ml-2 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="w-full bg-[#131313] p-8 md:p-10 rounded-sm border border-[#484848]/15 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ddff5c]/20"></div>
            <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ddff5c]/10 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[#ddff5c] text-3xl">phonelink_ring</span>
                </div>
                <h2 className="font-headline text-3xl font-black text-[#fafdfa] mb-2">Verify Mobile</h2>
                <p className="font-body text-[#a8acaa] text-sm leading-relaxed px-4">
                    Enter the code sent to <span className="text-[#fafdfa] font-black">{maskPhoneNumber(formData.phoneNumber)}</span>
                </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-8">
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-xs font-bold uppercase tracking-wider">{error}</div>}
                
                <div className="flex justify-between gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <input
                            key={index}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            className="w-full aspect-square text-center text-xl font-headline font-black bg-[#0b0f0e] border border-white/5 rounded-sm focus:ring-1 focus:ring-[#ddff5c] text-[#ddff5c] transition-all placeholder:text-white/5 outline-none"
                            maxLength="1"
                            placeholder="•"
                            type="text"
                            value={formData.otp[index] || ''}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                        />
                    ))}
                </div>

                <button
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full bg-[#ddff5c] text-[#0b0f0e] py-4 rounded-sm font-body font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    type="submit"
                >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="font-body text-[10px] text-[#a8acaa] uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {resendTimer > 0 ? (
                            <>Resend in <span className="text-[#fafdfa] font-black">{formatTimer(resendTimer)}</span></>
                        ) : (
                            'Ready to resend'
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || resendLoading}
                        className="text-[#ddff5c] font-black text-xs uppercase tracking-[0.2em] hover:underline disabled:opacity-30 disabled:no-underline transition-all"
                    >
                        {resendLoading ? 'Resending...' : 'Resend Code'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="w-full bg-[#131313] p-8 md:p-10 rounded-sm border border-[#484848]/15 shadow-2xl text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ddff5c]"></div>
            <div className="w-20 h-20 rounded-full bg-[#ddff5c]/10 flex items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-[#ddff5c] text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>

            <div className="space-y-4">
                <h2 className="font-headline text-3xl font-black text-[#fafdfa]">Account Ready</h2>
                <p className="font-body text-[#a8acaa] text-sm max-w-[240px] mx-auto leading-relaxed">
                    Strategy synchronized. Your ZuriMarket journey begins now.
                </p>
            </div>

            <div className="p-6 bg-[#0b0f0e] rounded-sm border border-white/5 relative overflow-hidden group text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#ddff5c]/40"></div>
                <h3 className="font-body text-[10px] uppercase tracking-[0.3em] text-[#a8acaa] mb-2 font-black">Initial Capital</h3>
                <p className="font-headline text-4xl font-black text-[#ddff5c] tracking-tighter flex items-center justify-center">
                    <CoinIcon size="text-3xl" />
                    {formatCurrency(25000)}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[8px] font-black text-[#ddff5c] uppercase tracking-widest bg-[#ddff5c]/5 px-2 py-1 rounded">
                    <span className="w-1 h-1 rounded-full bg-[#ddff5c] animate-ping"></span>
                    Instantly Credited
                </div>
            </div>

            <button
                onClick={() => history.push('/')}
                className="w-full bg-[#ddff5c] text-[#0b0f0e] py-5 rounded-sm font-body font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(221,255,92,0.15)]"
            >
                Launch Dashboard
            </button>
        </div>
    );

    return (
        <AuthLayout>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </AuthLayout>
    );
};

export default SignupFlow;
