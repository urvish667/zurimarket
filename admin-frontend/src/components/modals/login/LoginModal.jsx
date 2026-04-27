import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import { PersonInput, LockInput } from '../../inputs/InputBar';
import SiteButton from '../../buttons/SiteButtons';
import { useAuth } from '../../../helpers/AuthContent';

const LoginModal = ({ isOpen, onClose, onLogin, redirectAfterLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const { login, changePasswordNeeded } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const loginSuccess = await onLogin(username, password);
            if (loginSuccess) {
                onClose();
                history.push(redirectAfterLogin);
                // window.location.reload(); // this is a hack which goes against the principle of reloading the state
            } else {
                console.error('Login failed:', response.status, await response.text());
                setError('Error logging in.');
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            setError('An error occurred during login. Please try again.');
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="relative bg-[#131313] p-8 rounded-sm border border-[#484848]/15 text-[#fafdfa] max-w-sm w-full mx-4 shadow-2xl">
                <h2 className="text-3xl font-headline font-black mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <PersonInput value={username} onChange={(e) => {
                        setUsername(e.target.value);
                    }} />

                    <LockInput value={password} onChange={(e) => {
                        setPassword(e.target.value);
                    }} />
                    {error && <div className='error-message'>{error}</div>}
                    <div className="flex items-center justify-between">
                        <SiteButton type="submit">Login</SiteButton>
                    </div>
                </form>
                <button className="absolute top-4 right-4 text-white/40 hover:text-[#ddff5c] transition-colors" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default LoginModal;