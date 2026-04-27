import React, { useState, useEffect } from 'react';
import { useAuth } from '../../helpers/AuthContent';
import useUserData from '../../hooks/useUserData';
import { API_URL } from '../../config';

const ProfilePage = () => {
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
    const [activeSection, setActiveSection] = useState('profile');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

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

            const updatedUser = await response.json();
            // Update local form data if the server returned it
            if (updatedUser) {
                setFormData({
                    fullName: updatedUser.fullName || '',
                    dateOfBirth: updatedUser.dateOfBirth || '',
                    gender: updatedUser.gender || '',
                    streetAddress: updatedUser.streetAddress || '',
                    country: updatedUser.country || '',
                    state: updatedUser.state || '',
                    city: updatedUser.city || '',
                    postalCode: updatedUser.postalCode || ''
                });
            }

            // Trigger re-fetch of user data globally
            refetch();

            setMessage('SYNC SUCCESSFUL');
            setTimeout(() => setMessage(''), 3000);

            // To be sure the UI refreshes fully, we can reload or rely on state updates
            // But state updates here *should* be enough if the components use formData or updatedUser
        } catch (error) {
            setMessage('ERROR: ' + error.message.toUpperCase());
        } finally {
            setSaving(false);
        }
    };

    if (userLoading) return (
        <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
            <div className="w-8 h-8 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin rounded-none"></div>
        </div>
    );

    if (userError) return (
        <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
            <div className="text-red-500 font-black uppercase tracking-widest text-[10px]">SYSTEM ERROR: {userError}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-satoshi pb-20">
            {/* Navigation - Responsive Sidebar / Mobile Tabs */}
            <div className="w-full md:w-56 flex flex-col pt-4 md:pt-8 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-[#0b0f0e] md:bg-transparent sticky top-16 z-40 md:static">
                <nav className="flex md:flex-col px-4 space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0">
                    {[
                        { id: 'profile', label: 'Profile', icon: 'person' },
                        { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet' },
                        { id: 'earn', label: 'Earn', icon: 'payments' },
                        { id: 'xp', label: 'XP', icon: 'stars' },
                        { id: 'password', label: 'Security', icon: 'lock_reset' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all whitespace-nowrap min-w-fit ${activeSection === item.id
                                ? 'bg-[#ddff5c] text-[#0b0f0e]'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined mr-3 text-base text-inherit">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                    <div className="hidden md:block h-[1px] bg-white/5 my-4 mx-2"></div>
                    <button className="hidden md:flex items-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#ff4d4f]/60 hover:text-[#ff4d4f] hover:bg-[#ff4d4f]/5 rounded-none transition-all whitespace-nowrap">
                        <span className="material-symbols-outlined mr-3 text-base">delete_forever</span>
                        Deactivate
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 md:px-10 pt-6 md:pt-8">
                <div className="max-w-[1000px] mx-auto">
                    {/* Breadcrumbs - Simplified on Mobile */}
                    <div className="flex items-center mb-8 gap-4 md:gap-6 border-b border-white/5 origin-left">
                        <button className="text-[9px] font-black border-b-2 border-[#ddff5c] pb-3 uppercase tracking-[0.3em] text-white">IDENTITY</button>
                        <button className="text-[9px] font-black pb-3 uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors">SETTINGS</button>
                    </div>

                    {/* Profile Header Block - Responsive Stacking */}
                    <div className="flex flex-col md:flex-row items-center md:items-start mb-10 bg-[#131313] border border-white/5 p-6 md:p-8 rounded-none relative overflow-hidden text-center md:text-left gap-6 md:gap-0">
                        <div className="absolute top-0 left-0 w-full h-[2px] md:w-[2px] md:h-full bg-[#ddff5c]"></div>

                        <div className="relative shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 border border-white/10 p-1 bg-black overflow-hidden shadow-2xl">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`}
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
                                {formData.fullName || userData.username}
                            </h1>
                            <div className="text-[#ddff5c]/60 font-black text-[9px] mb-4 flex items-center justify-center md:justify-start gap-1 uppercase tracking-widest">
                                @{userData.username}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="px-2 py-0.5 bg-[#ddff5c]/10 border border-[#ddff5c]/20 rounded-none text-[8px] font-black text-[#ddff5c] uppercase tracking-[0.2em]">
                                    TIER 1 NODE
                                </div>
                                <div className="flex items-center gap-2 text-white/20">
                                    <span className="material-symbols-outlined text-base text-[#ddff5c]">smartphone</span>
                                    <button className="text-[8px] font-black text-[#ddff5c] underline tracking-widest hover:text-white transition-colors uppercase">Verify Hash</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 pb-20">
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

                        {/* Location Section */}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">City</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="sp-input !p-3"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1">Postal Hash</label>
                                        <input
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            className="sp-input !p-3"
                                            placeholder="POSTAL"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Bar - Sticky on Bottom Mobile */}
                        <div className="fixed bottom-0 left-0 w-full md:relative md:w-auto p-4 md:p-0 bg-[#0b0f0e] md:bg-transparent border-t border-white/5 md:border-none z-50">
                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black border border-[#ddff5c]/20 p-3 shadow-2xl max-w-[1000px] mx-auto w-full">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`w-full sm:flex-1 py-4 md:py-3 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all ${saving || (message && !message.includes('ERROR')) ? 'bg-[#ddff5c] text-[#0b0f0e]' : 'bg-white text-black hover:bg-[#ddff5c]'
                                        }`}
                                >
                                    {saving ? 'SYNCING...' : message && !message.includes('ERROR') ? 'SYNC COMPLETE' : 'UPDATE PROFILE'}
                                </button>

                                {message && (
                                    <div className={`px-4 text-[9px] font-black uppercase tracking-widest ${message.includes('ERROR') ? 'text-red-500' : 'text-[#ddff5c]'
                                        }`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
