'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatPrice } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { usePurchaseOrders } from '@/lib/hooks';
import {
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function HomePage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const router = useRouter();
  const { orders, loading, error, refetch } = usePurchaseOrders();

  const handleStartInstallation = () => {
    if (selectedOrderId) {
      router.push(`/install/${selectedOrderId}`);
    }
  };
  // Filter orders for installations
  const pendingOrders = orders.filter(
    order => !order.isInstalled && order.needsInstaller
  );
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {' '}
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Erreur de chargement
            </h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Réessayer
            </button>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {' '}
      <Header />
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Orders List */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Commandes à installer
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Cliquez sur une commande pour la sélectionner
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingOrders.length}
                  </p>
                  <p className="text-sm text-gray-600">En attente</p>
                </div>
              </div>
            </div>{' '}
            <div className="divide-y divide-gray-100">
              {pendingOrders.map(order => (
                <div
                  key={order.id}
                  className={`relative cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedOrderId === order.id
                      ? 'border-l-4 border-l-blue-500 bg-blue-50 py-6 pr-6 pl-6'
                      : 'border-l-4 border-l-transparent p-6'
                  }`}
                  onClick={() =>
                    setSelectedOrderId(
                      selectedOrderId === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Commande #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.robotInventory.name}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>
                            {order.clientAddress}, {order.clientCity}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{order.clientPhone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>
                            {order.clientEmail ||
                              'Aucune adresse email fournie'}
                          </span>
                        </div>
                        {order.installationDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                              {formatDate(new Date(order.installationDate))}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.clientFirstName} {order.clientLastName}
                          </p>
                          <div className="mt-1 flex items-center space-x-4">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {order.robotInventory.name}
                            </span>
                            {order.antenna && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                {order.antenna.name}
                              </span>
                            )}
                            {order.plugin && (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                {order.plugin.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.deposit)}
                          </p>
                          <p className="text-sm text-gray-600">Acompte versé</p>
                        </div>{' '}
                      </div>
                    </div>

                    {selectedOrderId === order.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {pendingOrders.length === 0 && (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Aucune installation en attente
                </h3>
                <p className="text-gray-600">
                  Toutes les commandes ont été installées ou ne nécessitent pas
                  d&apos;installateur.
                </p>
              </div>
            )}
          </div>{' '}
        </div>
      </div>
      {/* Floating Start Installation Button */}
      {selectedOrderId && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
          {' '}
          <button
            onClick={handleStartInstallation}
            className="inline-flex transform cursor-pointer items-center rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <Package className="mr-2 h-5 w-5" />
            Commencer l&apos;installation
          </button>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
