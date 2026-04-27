import React, { useState, useEffect } from 'react';
import AccountSectionLayout from '../../components/layouts/profile/AccountSectionLayout';
import { useAuth } from '../../helpers/AuthContent';
import useUserData from '../../hooks/useUserData';
import { API_URL } from '../../config';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const ProfileSettingsPage = () => {
    const { token } = useAuth();
    const { userData, userLoading, userError, refetch } = useUserData(null, true);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        streetAddress: '',
        country: '',
        state: '',
        city: '',
        postalCode: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                dateOfBirth: userData.dateOfBirth || '',
                gender: userData.gender || '',
                streetAddress: userData.streetAddress || '',
                country: userData.country || '',
                state: userData.state || '',
                city: userData.city || '',
                postalCode: userData.postalCode || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        if (!formData.dateOfBirth) {
            setMessage('ERROR: DATE OF BIRTH IS COMPULSORY');
            setSaving(false);
            return;
        }

        if (calculateAge(formData.dateOfBirth) < 18) {
            setMessage('ERROR: YOU MUST BE 18+ TO USE THIS PROTOCOL');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/v0/profilechange/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            refetch();
            setMessage('SYNC SUCCESSFUL');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('ERROR: ' + error.message.toUpperCase());
        } finally {
            setSaving(false);
        }
    };

    if (userLoading) return (
        <AccountSectionLayout>
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin rounded-none"></div>
            </div>
        </AccountSectionLayout>
    );

    return (
        <AccountSectionLayout>
            {/* Breadcrumbs / Sections */}
            <div className="flex items-center mb-8 gap-4 md:gap-6 border-b border-white/5 origin-left">
                <button className="text-[9px] font-black border-b-2 border-[#ddff5c] pb-3 uppercase tracking-[0.3em] text-white">IDENTITY</button>
            </div>

            {/* Profile Header Block */}
            <div className="flex flex-col md:flex-row items-center md:items-start mb-10 bg-[#131313] border border-white/5 p-6 md:p-8 rounded-none relative overflow-hidden text-center md:text-left gap-6 md:gap-0">
                <div className="absolute top-0 left-0 w-full h-[2px] md:w-[2px] md:h-full bg-[#ddff5c]"></div>

                <div className="relative shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 border border-white/10 p-1 bg-black overflow-hidden shadow-2xl">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.username}`}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-none opacity-90"
                        />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ddff5c] border border-[#0b0f0e] rounded-none flex items-center justify-center text-[#0b0f0e] shadow-xl">
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                    </button>
                </div>

                <div className="md:ml-8 flex-1">
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter font-headline mb-1">
                        {formData.fullName || userData?.username}
                    </h1>
                    <div className="text-[#ddff5c]/60 font-black text-[9px] mb-4 flex items-center justify-center md:justify-start gap-1 uppercase tracking-widest">
                        @{userData?.username}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="px-2 py-0.5 bg-[#ddff5c]/10 border border-[#ddff5c]/20 rounded-none text-[8px] font-black text-[#ddff5c] uppercase tracking-[0.2em]">
                            TIER 1 NODE
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                {/* Core Info Section */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-5 md:p-8 rounded-none">
                    <div className="flex items-center mb-8 gap-3">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] shrink-0">Core Parameters</h3>
                        <div className="h-[1px] bg-white/5 flex-1"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">Legal Full Name</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="sp-input !p-3"
                                placeholder="Enter identity"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">DOB</label>
                                <input
                                    required
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="sp-input !p-3 invert opacity-80"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">Gender</label>
                                <div className="relative">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="sp-input !p-3 appearance-none pr-12"
                                    >
                                        <option value="">SELECT</option>
                                        <option value="Male">MALE</option>
                                        <option value="Female">FEMALE</option>
                                        <option value="Other">OTHER</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Geography Section */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-5 md:p-8 rounded-none">
                    <div className="flex items-center mb-8 gap-3">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] shrink-0">Geography</h3>
                        <div className="h-[1px] bg-white/5 flex-1"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">Address</label>
                            <input
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleChange}
                                className="sp-input !p-3"
                                placeholder="Street"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">Country</label>
                                <input
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="sp-input !p-3"
                                    placeholder="Country"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">State</label>
                                <input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="sp-input !p-3"
                                    placeholder="State"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Section */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-5 md:p-8 rounded-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#ddff5c]/5 -mr-12 -mt-12 rotate-45 border border-[#ddff5c]/10"></div>
                    
                    <div className="flex items-center mb-8 gap-3">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] shrink-0">Protocol Outreach</h3>
                        <div className="h-[1px] bg-white/5 flex-1"></div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex-1 w-full">
                            <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1 mb-2">Unique Referral Identifier</label>
                            <div className="flex items-stretch gap-2">
                                <div className="flex-1 bg-black border border-white/10 p-4 font-mono text-xl md:text-2xl text-[#ddff5c] tracking-[0.2em] font-black uppercase flex items-center justify-center">
                                    {userData?.referralCode || '-------'}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (userData?.referralCode) {
                                            navigator.clipboard.writeText(userData.referralCode);
                                            setMessage('REFERRAL CODE COPIED');
                                            setTimeout(() => setMessage(''), 3000);
                                        }
                                    }}
                                    className="px-5 bg-white text-black hover:bg-[#ddff5c] transition-all flex items-center justify-center"
                                    title="Copy to clipboard"
                                >
                                    <span className="material-symbols-outlined text-lg">content_copy</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-auto bg-[#ddff5c]/5 border border-[#ddff5c]/10 p-6 flex flex-col items-center md:items-start text-center md:text-left min-w-[280px]">
                            <div className="flex items-center gap-2 mb-2">
                                <p className="text-[9px] font-black text-[#ddff5c] uppercase tracking-[0.3em]">Network Bonus</p>
                                <div className="h-px w-8 bg-[#ddff5c]/20"></div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <CoinIcon size="text-xl" />
                                <span className="text-2xl font-black text-white uppercase tracking-tighter">{formatCurrency(10000).split('.')[0]}</span>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest self-end pb-1 ml-1">Coins / Invite</span>
                            </div>
                            <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                                Credit issued upon referee's <span className="text-white">first verified prediction</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-black border border-[#ddff5c]/20 p-3 shadow-2xl">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full sm:flex-1 py-4 md:py-3 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all ${saving || (message && !message.includes('ERROR')) ? 'bg-[#ddff5c] text-[#0b0f0e]' : 'bg-white text-black hover:bg-[#ddff5c]'
                            }`}
                    >
                        {saving ? 'SYNCING...' : message && !message.includes('ERROR') ? 'SYNC COMPLETE' : 'UPDATE IDENTITY'}
                    </button>

                    {message && (
                        <div className={`px-4 text-[9px] font-black uppercase tracking-widest ${message.includes('ERROR') ? 'text-red-500' : 'text-[#ddff5c]'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>
            </form>
        </AccountSectionLayout>
    );
};

export default ProfileSettingsPage;
