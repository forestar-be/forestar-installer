'use client';

import { useState, useMemo } from 'react';
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
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react';

type SortField =
  | 'clientName'
  | 'robotName'
  | 'installationDate'
  | 'deposit'
  | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface Filters {
  robotType: string;
  hasAntenna: boolean | null;
  hasPlugin: boolean | null;
  hasShelter: boolean | null;
  city: string;
  dateRange: {
    start: string;
    end: string;
  };
}

function HomePage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    robotType: '',
    hasAntenna: null,
    hasPlugin: null,
    hasShelter: null,
    city: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const router = useRouter();
  const { orders, loading, error, refetch } = usePurchaseOrders(
    viewMode === 'completed' ? true : false
  );

  const handleStartInstallation = () => {
    if (selectedOrderId) {
      if (viewMode === 'completed') {
        router.push(`/complete/${selectedOrderId}`);
      } else {
        router.push(`/install/${selectedOrderId}`);
      }
    }
  };

  const handleViewModeChange = (mode: 'pending' | 'completed') => {
    setViewMode(mode);
    setSelectedOrderId(null); // Reset selection when switching modes
  };

  // Normalize text for search
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    const result = orders.filter(order => {
      // View mode filter
      if (viewMode === 'pending') {
        if (order.isInstalled || !order.needsInstaller) return false;
      } else {
        if (!order.isInstalled || !order.needsInstaller) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchNormalized = normalizeText(searchTerm);
        const clientName = normalizeText(
          `${order.clientFirstName} ${order.clientLastName}`
        );
        const robotName = normalizeText(order.robotInventory.name);
        const orderId = order.id.toString();
        const city = normalizeText(order.clientCity || '');
        const address = normalizeText(order.clientAddress || '');

        if (
          !clientName.includes(searchNormalized) &&
          !robotName.includes(searchNormalized) &&
          !orderId.includes(searchNormalized) &&
          !city.includes(searchNormalized) &&
          !address.includes(searchNormalized)
        ) {
          return false;
        }
      }

      // Robot type filter
      if (
        filters.robotType &&
        !normalizeText(order.robotInventory.name).includes(
          normalizeText(filters.robotType)
        )
      ) {
        return false;
      }

      // Antenna filter
      if (filters.hasAntenna !== null) {
        if (filters.hasAntenna && !order.antenna) return false;
        if (!filters.hasAntenna && order.antenna) return false;
      }

      // Plugin filter
      if (filters.hasPlugin !== null) {
        if (filters.hasPlugin && !order.plugin) return false;
        if (!filters.hasPlugin && order.plugin) return false;
      }

      // Shelter filter
      if (filters.hasShelter !== null) {
        if (filters.hasShelter && !order.shelter) return false;
        if (!filters.hasShelter && order.shelter) return false;
      }

      // City filter
      if (
        filters.city &&
        !normalizeText(order.clientCity || '').includes(
          normalizeText(filters.city)
        )
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const orderDate = order.installationDate
          ? new Date(order.installationDate)
          : new Date(order.createdAt);

        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (orderDate < startDate) return false;
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (orderDate > endDate) return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'clientName':
          aValue = `${a.clientFirstName} ${a.clientLastName}`;
          bValue = `${b.clientFirstName} ${b.clientLastName}`;
          break;
        case 'robotName':
          aValue = a.robotInventory.name;
          bValue = b.robotInventory.name;
          break;
        case 'installationDate':
          aValue = a.installationDate
            ? new Date(a.installationDate)
            : new Date(0);
          bValue = b.installationDate
            ? new Date(b.installationDate)
            : new Date(0);
          break;
        case 'deposit':
          aValue = a.deposit || 0;
          bValue = b.deposit || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, viewMode, searchTerm, filters, sortField, sortDirection]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const robots = [
      ...new Set(orders.map(order => order.robotInventory.name)),
    ].sort();
    const cities = [
      ...new Set(orders.map(order => order.clientCity).filter(Boolean)),
    ].sort();

    return { robots, cities };
  }, [orders]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      robotType: '',
      hasAntenna: null,
      hasPlugin: null,
      hasShelter: null,
      city: '',
      dateRange: { start: '', end: '' },
    });
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.robotType) count++;
    if (filters.hasAntenna !== null) count++;
    if (filters.hasPlugin !== null) count++;
    if (filters.hasShelter !== null) count++;
    if (filters.city) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [searchTerm, filters]);

  // Filter orders based on view mode
  const filteredOrders = filteredAndSortedOrders;
  if (loading) {
    return (
      <>
        <Header
          showToggle
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
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
        <Header
          showToggle
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Erreur de chargement
            </h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
      <Header
        showToggle
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar, Filter Button and Sort Controls */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search Bar and Filter Button */}
              <div className="flex flex-1 gap-3 md:max-w-2xl">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, robot, ville, adresse..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    showFilters || activeFiltersCount > 0
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Trier par:
                </span>
                <select
                  value={sortField}
                  onChange={e => setSortField(e.target.value as SortField)}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="createdAt">Date de création</option>
                  <option value="clientName">Client</option>
                  <option value="robotName">Robot</option>
                  <option value="installationDate">
                    Date d&apos;installation
                  </option>
                  <option value="deposit">Acompte</option>
                </select>
                <div className="group relative">
                  <button
                    onClick={() =>
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    }
                    className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
                    title={`Tri ${sortDirection === 'asc' ? 'croissant' : 'décroissant'} - Cliquer pour inverser`}
                  >
                    {sortDirection === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <X className="mr-1 h-3 w-3" />
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Robot Type Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Type de robot
                  </label>
                  <select
                    value={filters.robotType}
                    onChange={e =>
                      setFilters({ ...filters, robotType: e.target.value })
                    }
                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Tous les robots</option>
                    {filterOptions.robots.map(robot => (
                      <option key={robot} value={robot}>
                        {robot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <select
                    value={filters.city}
                    onChange={e =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Toutes les villes</option>
                    {filterOptions.cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Période d&apos;installation
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={e =>
                        setFilters({
                          ...filters,
                          dateRange: {
                            ...filters.dateRange,
                            start: e.target.value,
                          },
                        })
                      }
                      lang="fr-FR"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={e =>
                        setFilters({
                          ...filters,
                          dateRange: {
                            ...filters.dateRange,
                            end: e.target.value,
                          },
                        })
                      }
                      lang="fr-FR"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accessories Filters */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Accessoires
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasAntenna === true}
                        onChange={e =>
                          setFilters({
                            ...filters,
                            hasAntenna: e.target.checked ? true : null,
                          })
                        }
                        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Avec antenne
                      </span>
                    </label>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasPlugin === true}
                        onChange={e =>
                          setFilters({
                            ...filters,
                            hasPlugin: e.target.checked ? true : null,
                          })
                        }
                        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Avec plugin
                      </span>
                    </label>
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasShelter === true}
                        onChange={e =>
                          setFilters({
                            ...filters,
                            hasShelter: e.target.checked ? true : null,
                          })
                        }
                        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Avec abri
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Orders List */}
        <div className="mx-auto max-w-7xl px-4 pb-12">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewMode === 'pending'
                      ? 'Commandes à installer'
                      : 'Installations terminées'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {viewMode === 'pending'
                      ? 'Cliquez sur une commande pour la sélectionner'
                      : 'Cliquez sur une installation pour voir les détails'}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      viewMode === 'pending'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {filteredOrders.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {filteredOrders.length === 0
                      ? 'Aucun résultat'
                      : filteredOrders.length === 1
                        ? '1 résultat'
                        : `${filteredOrders.length} résultats`}
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 text-blue-600">
                        (filtré{activeFiltersCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className={`relative cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedOrderId === order.id
                      ? `border-l-4 py-6 pr-6 pl-6 ${
                          viewMode === 'pending'
                            ? 'border-l-blue-500 bg-blue-50'
                            : 'border-l-green-500 bg-green-50'
                        }`
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
                        <div
                          className={`mr-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                            viewMode === 'pending'
                              ? 'bg-blue-100'
                              : 'bg-green-100'
                          }`}
                        >
                          <Package
                            className={`h-5 w-5 ${
                              viewMode === 'pending'
                                ? 'text-blue-600'
                                : 'text-green-600'
                            }`}
                          />
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
                        <CheckCircle
                          className={`h-6 w-6 ${
                            viewMode === 'pending'
                              ? 'text-blue-600'
                              : 'text-green-600'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {viewMode === 'pending'
                    ? 'Aucune installation en attente'
                    : 'Aucune installation terminée'}
                </h3>
                <p className="text-gray-600">
                  {viewMode === 'pending'
                    ? "Toutes les commandes ont été installées ou ne nécessitent pas d'installateur."
                    : 'Aucune installation terminée pour le moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Floating Action Button */}
      {selectedOrderId && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
          <button
            onClick={handleStartInstallation}
            className={`inline-flex transform cursor-pointer items-center rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
              viewMode === 'pending'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            <Package className="mr-2 h-5 w-5" />
            {viewMode === 'pending'
              ? "Commencer l'installation"
              : 'Voir les détails'}
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
