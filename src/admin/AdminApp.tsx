import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase.auth) {
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a1025] text-white">Loading Admin...</div>;
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="admin-portal min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        {/* More admin routes will go here later */}
      </Routes>
    </div>
  );
}
