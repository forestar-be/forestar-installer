'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  Settings,
  Package,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header with Logo */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo-70x70.png"
              alt="Forestar Logo"
              width={80}
              height={80}
              className="rounded-full shadow-lg"
            />
          </div>
          <h1 className="mb-2 text-lg font-bold text-gray-900">
            FORESTAR INSTALLATION
          </h1>
        </div>

        {/* Main Error Card */}
        <div className="rounded-2xl border border-gray-200/50 bg-white/95 p-8 text-center shadow-xl backdrop-blur-md">
          {/* Error Icon and Code */}
          <div className="mb-6">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
                <div className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                  404
                </div>
              </div>
            </div>

            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              Page introuvable
            </h2>

            <p className="mx-auto mb-6 max-w-md text-lg text-gray-600">
              La page que vous recherchez n&apos;existe pas ou a été déplacée.
              Vérifiez l&apos;URL ou retournez à la page principale.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
            >
              <Home className="mr-2 h-5 w-5" />
              Page d&apos;accueil
            </Link>

            <button
              onClick={handleGoBack}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 font-semibold text-gray-700 transition-all duration-200 hover:scale-105 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </button>
          </div>

          {/* Additional Navigation */}
          <div className="border-t border-gray-200 pt-6">
            <p className="mb-4 text-sm text-gray-600">
              Ou accédez directement à :
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/?view=pending"
                className="flex items-center justify-center rounded-lg px-4 py-2 font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <Package className="mr-2 h-4 w-4" />
                Installations en attente
              </Link>

              <Link
                href="/parametres"
                className="flex items-center justify-center rounded-lg px-4 py-2 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
              >
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Forestar. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
