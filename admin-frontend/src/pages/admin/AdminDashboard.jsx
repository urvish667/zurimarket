import { useLocation } from 'react-router-dom';
import AdminAddUser from '../../components/layouts/admin/AddUser';
import UserManagement from '../../components/layouts/admin/UserManagement';
import MarketModeration from '../../components/layouts/admin/MarketModeration';
import AuditLog from '../../components/layouts/admin/AuditLog';
import SystemStatus from '../../components/layouts/admin/SystemStatus';
import EconomicsSettings from '../../components/layouts/admin/EconomicsSettings';
import ChallengeControlCenter from '../../components/layouts/admin/ChallengeControlCenter';

function AdminDashboard() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const activeTab = query.get('tab') || 'users';

    const renderContent = () => {
        switch (activeTab) {
            case 'system':
                return <SystemStatus />;
            case 'users':
                return <UserManagement />;
            case 'markets':
                return <MarketModeration />;
            case 'audit':
                return <AuditLog />;
            case 'adduser':
                return <AdminAddUser />;
            case 'economics':
                return <EconomicsSettings />;
            case 'challenges':
                return <ChallengeControlCenter />;
            default:
                return <UserManagement />;
        }
    };

    return (
        <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-[#ddff5c]/50"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ddff5c]">ZuriMarket Terminal</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                    {activeTab === 'system' && 'Command Center'}
                    {activeTab === 'users' && 'User Registry'}
                    {activeTab === 'markets' && 'Market Liquidation'}
                    {activeTab === 'audit' && 'Transaction Ledger'}
                    {activeTab === 'adduser' && 'Identity Provisioning'}
                    {activeTab === 'economics' && 'Economic Policy'}
                    {activeTab === 'challenges' && 'Challenge Control Center'}
                </h1>
            </header>
            
            <div className="relative">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ddff5c]/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
