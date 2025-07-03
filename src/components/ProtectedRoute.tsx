'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Global state to avoid flash on subsequent navigations
let hasEverBeenAuthenticated = false;

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);

  // Update global state if the user is authenticated
  if (isAuthenticated) {
    hasEverBeenAuthenticated = true;
  }

  useEffect(() => {
    // Only show loading if the user has never been authenticated
    if (!hasEverBeenAuthenticated && !isAuthenticated) {
      setShowLoading(true);
      const timer = setTimeout(() => {
        setShowLoading(false);
        if (!isAuthenticated) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      // If the user was authenticated before but not anymore, redirect immediately
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, router, pathname]);

  // If the user is authenticated, display the content immediately
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading only if necessary
  if (showLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-blue-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-gray-600">
            Vérification de l&apos;authentification...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated after verification, display nothing during redirection
  return null;
};
