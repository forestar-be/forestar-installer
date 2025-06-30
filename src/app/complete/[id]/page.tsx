'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePurchaseOrder } from '@/lib/hooks';
import { formatDateTime } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { downloadInstallationPdf } from '@/lib/api';
import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  Wifi,
  Home,
  Cable,
  Antenna,
  FileText,
  User,
  AlertTriangle,
  Download,
  Loader2,
} from 'lucide-react';

function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const orderId = parseInt(params.id as string);
  const { order, loading, error } = usePurchaseOrder(orderId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!order || !token) return;

    setIsDownloading(true);
    try {
      const blob = await downloadInstallationPdf(token, order.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bon_Installation_${order.id}_${order.robotInventory.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert("Erreur lors du téléchargement du bon d'installation");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">
              Chargement des détails de l&apos;installation...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Erreur de chargement
            </h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Retour
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="max-w-md text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Commande introuvable
            </h3>
            <p className="mb-4 text-gray-600">
              La commande demandée n&apos;existe pas ou n&apos;est pas
              accessible.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Retour
            </button>
          </div>
        </div>
      </>
    );
  }

  const getStatusIcon = (installed: boolean | null | undefined) => {
    if (installed === true) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (installed === false) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (installed: boolean | null | undefined) => {
    if (installed === true) return 'Installé';
    if (installed === false) return 'Non installé';
    return 'Non spécifié';
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="mb-6 inline-flex cursor-pointer items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </button>

          {/* Header Card */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Commande #{order.id}
                    </h1>
                    <div className="flex items-center rounded-full bg-green-100 px-3 py-1">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Installée
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.clientFirstName} {order.clientLastName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
                  </button>
                </div>
              </div>

              {/* Client Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    {order.clientEmail || 'Aucune adresse email fournie'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Details */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Détails de l&apos;installation
              </h2>
            </div>
            <div className="p-6 pt-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        Équipement
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        Détails
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                        État d&apos;installation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Package className="mr-3 h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">Robot</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.robotInventory?.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(order.robotInstalled)}
                          <span className="ml-2 text-sm text-gray-600">
                            {getStatusText(order.robotInstalled)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {order.plugin && (
                      <tr>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Wifi className="mr-3 h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              Plugin
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.plugin.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getStatusIcon(order.pluginInstalled)}
                            <span className="ml-2 text-sm text-gray-600">
                              {getStatusText(order.pluginInstalled)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {order.antenna && (
                      <tr>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Antenna className="mr-3 h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              Antenne
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.antenna.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getStatusIcon(order.antennaInstalled)}
                            <span className="ml-2 text-sm text-gray-600">
                              {getStatusText(order.antennaInstalled)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {order.shelter && (
                      <tr>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Home className="mr-3 h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">Abri</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.shelter.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {getStatusIcon(order.shelterInstalled)}
                            <span className="ml-2 text-sm text-gray-600">
                              {getStatusText(order.shelterInstalled)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Cable className="mr-3 h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Fil périmétrique
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.wireLength}m
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(order.wireInstalled)}
                          <span className="ml-2 text-sm text-gray-600">
                            {getStatusText(order.wireInstalled)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Antenna className="mr-3 h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Support d&apos;antenne
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">-</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(order.antennaSupportInstalled)}
                          <span className="ml-2 text-sm text-gray-600">
                            {getStatusText(order.antennaSupportInstalled)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <MapPin className="mr-3 h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            Mise en place
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">-</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getStatusIcon(order.placementCompleted)}
                          <span className="ml-2 text-sm text-gray-600">
                            {getStatusText(order.placementCompleted)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Installation Info */}
              {(order.installerName ||
                order.installationCompletedAt ||
                order.clientInstallationSignature) && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-900">
                    Informations d&apos;installation
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {order.installerName && (
                      <div className="flex items-center">
                        <User className="mr-3 h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-700">
                            Installateur
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.installerName}
                          </div>
                        </div>
                      </div>
                    )}

                    {order.installationCompletedAt && (
                      <div className="flex items-center">
                        <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-700">
                            Date de fin
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDateTime(order.installationCompletedAt)}
                          </div>
                        </div>
                      </div>
                    )}

                    {order.clientInstallationSignature && (
                      <div className="flex items-start">
                        <FileText className="mt-1 mr-3 h-5 w-5 text-gray-400" />
                        <div>
                          <div className="mb-2 text-sm text-gray-700">
                            Signature client
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <Image
                              src={order.clientInstallationSignature}
                              alt="Signature du client"
                              className="max-h-20 object-contain"
                              width={200}
                              height={80}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Comments */}
          {(order.installationNotes ||
            order.missingItems ||
            order.additionalComments) && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notes et commentaires
                </h2>
              </div>
              <div className="space-y-4 p-6">
                {order.installationNotes && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      Notes d&apos;installation
                    </h3>
                    <p className="text-sm whitespace-pre-wrap text-gray-600">
                      {order.installationNotes}
                    </p>
                  </div>
                )}

                {order.missingItems && (
                  <div>
                    <div className="mb-2 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                      <h3 className="text-sm font-medium text-gray-900">
                        Éléments manquants
                      </h3>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-600">
                      {order.missingItems}
                    </p>
                  </div>
                )}

                {order.additionalComments && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      Commentaires supplémentaires
                    </h3>
                    <p className="text-sm whitespace-pre-wrap text-gray-600">
                      {order.additionalComments}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Complete() {
  return (
    <ProtectedRoute>
      <CompletePage />
    </ProtectedRoute>
  );
}
