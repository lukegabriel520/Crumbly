import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, User, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CreateRecipeModal } from './CreateRecipeModal';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    { icon: Home, path: '/feed', label: 'Feed' },
    { icon: Search, path: '/discover', label: 'Discover' },
    { icon: Plus, path: '/create', label: 'Create', isCreate: true },
    { icon: Heart, path: '/saved', label: 'Saved' },
    { icon: User, path: `/profile/${user?.id}`, label: 'Profile' },
  ];

  const handleNavClick = (item: any) => {
    if (item.isCreate) {
      setShowCreateModal(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0C7D0] px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isCreate = item.isCreate;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                  isCreate
                    ? 'bg-[#EF6D9F] text-white scale-110'
                    : isActive
                    ? 'text-[#EF6D9F] bg-[#FFF5F7]'
                    : 'text-[#5E5E5E] hover:text-[#EF6D9F]'
                }`}
              >
                <Icon size={isCreate ? 28 : 24} />
                <span className={`text-xs mt-1 ${isCreate ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <CreateRecipeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}