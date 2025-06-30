'use client';

import { LogOut, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

interface HeaderProps {
  showToggle?: boolean;
  viewMode?: 'pending' | 'completed';
  onViewModeChange?: (mode: 'pending' | 'completed') => void;
}

export const Header = ({
  showToggle = false,
  viewMode = 'pending',
  onViewModeChange,
}: HeaderProps) => {
  const { logOut } = useAuth();

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logOut();
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <div className="rounded-2xl border border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo-70x70.png"
              alt="Forestar Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-gray-900 sm:text-base md:text-lg lg:text-xl">
                FORESTAR INSTALLATION
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {showToggle && (
              <div className="flex cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-1 transition-all duration-200 hover:shadow-md">
                <button
                  onClick={() => onViewModeChange?.('pending')}
                  className={`flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    viewMode === 'pending'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Package className="mr-2 h-4 w-4" />À installer
                </button>
                <button
                  onClick={() => onViewModeChange?.('completed')}
                  className={`flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                    viewMode === 'completed'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Installées
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex h-[42px] cursor-pointer items-center rounded-md border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-700 transition-all duration-200 hover:from-gray-100 hover:to-gray-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
