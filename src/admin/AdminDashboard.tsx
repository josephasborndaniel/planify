import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, Package, ShoppingBag, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../app/context/ThemeContext';
import QuotesManager from './components/QuotesManager';
import OrderCalendar from './components/OrderCalendar';
import PackageManager from './components/PackageManager';
import PlateArchitectManager from './components/PlateArchitectManager';
import DesignStudioManager from './components/DesignStudioManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { QuoteGenerator } from '../components/QuoteGenerator';
import { FileText, Sparkles } from 'lucide-react';

type AdminTab = 'overview' | 'packages' | 'plate_architect' | 'design_studio' | 'quote_builder';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-14 h-7 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #3d2860, #c09cde)'
          : 'linear-gradient(135deg, #2a7dd4, #5aa0e0)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-500"
        style={{ transform: isDark ? 'translateX(28px)' : 'translateX(0)' }}
      >
        {isDark
          ? <Moon className="w-3.5 h-3.5 text-[#3d2860]" />
          : <Sun className="w-3.5 h-3.5 text-[#2a7dd4]" />
        }
      </span>
    </button>
  );
}

export default function AdminDashboard() {
  const [vendorName, setVendorName] = useState('Vendor');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  useEffect(() => {
    // We will fetch vendor profile here later
  }, []);

  const handleLogout = async () => {
    if (supabase.auth) await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#1a1025] flex flex-col md:flex-row text-white font-sans w-full">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-[#231534] border-r border-purple-500/20 flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-purple-500/20">
          <h1 className="text-xl font-black tracking-tight">Planify Admin</h1>
          <p className="text-xs text-purple-300/60 mt-1">Vendor Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Overview & Orders" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          />
          <NavItem 
            icon={<Package className="w-5 h-5" />} 
            label="Event Packages" 
            active={activeTab === 'packages'}
            onClick={() => setActiveTab('packages')}
          />
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Plate Architect (Food)" 
            active={activeTab === 'plate_architect'}
            onClick={() => setActiveTab('plate_architect')}
          />
          <NavItem 
            icon={<Sparkles className="w-5 h-5" />} 
            label="Design Studio (Props)" 
            active={activeTab === 'design_studio'}
            onClick={() => setActiveTab('design_studio')}
          />
          <NavItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Quote Builder" 
            active={activeTab === 'quote_builder'}
            onClick={() => setActiveTab('quote_builder')}
          />
        </nav>

        <div className="p-4 border-t border-purple-500/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-64 pb-24 md:pb-8 w-full overflow-y-auto min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-500/10">
          <h2 className="text-2xl font-bold">
            {activeTab === 'overview' ? `Welcome back, ${vendorName}` : 
             activeTab === 'packages' ? 'Event Packages' :
             activeTab === 'plate_architect' ? 'Plate Architect' :
             activeTab === 'design_studio' ? 'Design Studio' : 'Quote Builder'}
          </h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            <AnalyticsDashboard />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuotesManager />
              </div>
              <div className="lg:col-span-1 h-[600px]">
                <OrderCalendar />
              </div>
            </div>
          </>
        )}

        {activeTab === 'packages' && <PackageManager />}
        
        {activeTab === 'plate_architect' && <PlateArchitectManager />}

        {activeTab === 'design_studio' && <DesignStudioManager />}

        {activeTab === 'quote_builder' && <QuoteGenerator />}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 bg-[#231534] border-t border-purple-500/20 pb-[max(env(safe-area-inset-bottom),8px)]">
        <MobileNavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <MobileNavItem icon={<Package className="w-5 h-5" />} label="Packages" active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
        <MobileNavItem icon={<ShoppingBag className="w-5 h-5" />} label="Food" active={activeTab === 'plate_architect'} onClick={() => setActiveTab('plate_architect')} />
        <MobileNavItem icon={<Sparkles className="w-5 h-5" />} label="Props" active={activeTab === 'design_studio'} onClick={() => setActiveTab('design_studio')} />
        <MobileNavItem icon={<FileText className="w-5 h-5" />} label="Quotes" active={activeTab === 'quote_builder'} onClick={() => setActiveTab('quote_builder')} />
        
        {/* Logout button for mobile */}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-red-400">
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </nav>
    </div>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active ? 'text-[#c09cde]' : 'text-purple-300/50'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${active ? 'bg-purple-500/20 text-[#c09cde]' : 'text-purple-300/60 hover:text-white hover:bg-purple-500/10'}`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-[#231534] rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-default">
      <h4 className="text-sm font-semibold text-purple-300/60 mb-2">{title}</h4>
      <div className="text-3xl font-black mb-1 text-white">{value}</div>
      <div className="text-xs font-medium text-emerald-400">{subtitle}</div>
    </div>
  );
}
