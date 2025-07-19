import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthModal } from './components/AuthModal';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';
import { Discover } from './pages/Discover';
import { Saved } from './pages/Saved';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    setSupabaseConfigured(!!supabase);
    
    if (!loading && !user) {
      setShowWelcome(true);
    }
  }, [user, loading]);

  const handleGetStarted = () => {
    setShowWelcome(false);
    if (supabaseConfigured) {
      setShowAuth(true);
    } else {
      // If Supabase is not configured, show demo mode
      console.log('Demo mode - Supabase not configured');
    }
  };

  const handleAuthClose = () => {
    setShowAuth(false);
    if (!user) {
      setShowWelcome(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F8BFCB] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">👨‍🍳</span>
          </div>
          <p className="text-[#5E5E5E]">Loading Crumbly...</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (!user && supabaseConfigured) {
    return (
      <>
        <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-[#F8BFCB] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">👨‍🍳</span>
            </div>
            <h1 className="text-3xl font-bold text-[#3B3B3B] mb-4">Welcome to Crumbly</h1>
            <p className="text-[#5E5E5E] mb-6">Your AI-powered baking companion</p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-3 bg-[#EF6D9F] text-white rounded-xl font-medium hover:bg-[#d85a8a] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal isOpen={showAuth} onClose={handleAuthClose} />
      </>
    );
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-[#F8BFCB] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#3B3B3B] mb-4">Setup Required</h1>
          <p className="text-[#5E5E5E] mb-6">
            To use Crumbly, you need to configure your Supabase connection. 
            Please set up your environment variables and database.
          </p>
          <div className="bg-white border border-[#E0C7D0] rounded-xl p-4 text-left">
            <p className="text-sm text-[#5E5E5E] mb-2">Required environment variables:</p>
            <code className="text-xs text-[#3B3B3B] block">
              VITE_SUPABASE_URL<br/>
              VITE_SUPABASE_ANON_KEY
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<Feed />} />
          <Route path="discover" element={<Discover />} />
          <Route path="saved" element={<Saved />} />
          <Route path="profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;