'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

export const Header = () => {
  const { logOut } = useAuth();

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logOut();
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <div className="rounded-2xl border border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src="/logo-70x70.png"
                alt="Forestar Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                FORESTAR INSTALLATION
              </h1>
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:from-gray-100 hover:to-gray-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
