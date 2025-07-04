'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SignaturePadComponent } from '@/components/signature/SignaturePad';
import { formatDate } from '@/lib/utils';
import { completeInstallation, isHttpError } from '@/lib/api';
import { compressImage } from '@/lib/imageUtils';
import { useAuth } from '@/lib/auth';
import { usePurchaseOrder } from '@/lib/hooks';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
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
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const installationSchema = z.object({
  robotInstalled: z.boolean(),
  pluginInstalled: z.boolean(),
  antennaInstalled: z.boolean(),
  shelterInstalled: z.boolean(),
  wireInstalled: z.boolean(),
  antennaSupportInstalled: z.boolean(),
  placementCompleted: z.boolean(),
  installationNotes: z
    .string()
    .min(1, "Les notes d'installation sont obligatoires"),
  missingItems: z.string(),
  additionalComments: z.string(),
  clientInstallationSignature: z
    .string()
    .min(1, 'La signature du client est obligatoire'),
  installerName: z.string().min(2, "Le nom de l'installateur est obligatoire"),
});

type InstallationForm = z.infer<typeof installationSchema>;

function InstallationPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const orderId = parseInt(params.id as string);
  const { order, loading, error } = usePurchaseOrder(orderId, false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Function to validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to check if nothing was installed
  const checkIfNothingInstalled = (): boolean => {
    const data = form.getValues();
    const installationItems = [
      data.robotInstalled,
      ...(order?.plugin ? [data.pluginInstalled] : []),
      ...(order?.antenna ? [data.antennaInstalled] : []),
      ...(order?.shelter ? [data.shelterInstalled] : []),
      ...(order?.hasWire ? [data.wireInstalled] : []),
      ...(order?.hasAntennaSupport ? [data.antennaSupportInstalled] : []),
      ...(order?.hasPlacement ? [data.placementCompleted] : []),
    ];

    return !installationItems.some(item => item === true);
  };

  // Function to handle email submission from modal
  const handleEmailSubmit = () => {
    if (!clientEmail.trim()) {
      setEmailError("L'adresse email est obligatoire");
      return;
    }
    if (!validateEmail(clientEmail)) {
      setEmailError('Veuillez saisir une adresse email valide');
      return;
    }
    setEmailError('');
    setShowEmailModal(false);
    // Proceed with installation completion
    proceedWithInstallation();
  };

  // Function to handle confirmation of nothing installed
  const handleNothingInstalledConfirmation = () => {
    setShowConfirmationModal(false);

    // Check if client email exists, if not show modal
    if (!order?.clientEmail) {
      setShowEmailModal(true);
      return;
    }

    // If email exists, proceed directly
    setClientEmail(order.clientEmail);
    proceedWithInstallation();
  };

  // Function to actually complete the installation
  const proceedWithInstallation = async () => {
    const data = form.getValues();
    if (!order || !token) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Compress the signature image before sending to API
      let compressedSignature = data.clientInstallationSignature;
      if (
        data.clientInstallationSignature &&
        data.clientInstallationSignature.startsWith('data:image')
      ) {
        try {
          compressedSignature = await compressImage(
            data.clientInstallationSignature,
            400, // Max width
            200, // Max height
            0.7 // Quality
          );
        } catch (compressionError) {
          console.warn(
            'Failed to compress signature, using original:',
            compressionError
          );
          // Continue with original signature if compression fails
        }
      }

      // Send installation completion to API
      await completeInstallation(token, order.id, {
        installationNotes: data.installationNotes,
        installerName: data.installerName,
        clientInstallationSignature: compressedSignature,
        robotInstalled: data.robotInstalled,
        pluginInstalled: data.pluginInstalled,
        antennaInstalled: data.antennaInstalled,
        shelterInstalled: data.shelterInstalled,
        wireInstalled: data.wireInstalled,
        antennaSupportInstalled: data.antennaSupportInstalled,
        placementCompleted: data.placementCompleted,
        missingItems: data.missingItems,
        additionalComments: data.additionalComments,
        clientEmail: clientEmail || undefined,
      });

      // Show success screen
      setIsCompleted(true);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      if (isHttpError(error)) {
        setSubmitError(
          `Une erreur est survenue lors de la finalisation: ${error.message}`
        );
      } else {
        setSubmitError("Erreur lors de la finalisation de l'installation");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = useForm<InstallationForm>({
    resolver: zodResolver(installationSchema),
    defaultValues: {
      robotInstalled: false,
      pluginInstalled: false,
      antennaInstalled: false,
      shelterInstalled: false,
      wireInstalled: false,
      antennaSupportInstalled: false,
      placementCompleted: false,
      installationNotes: '',
      missingItems: '',
      additionalComments: '',
      clientInstallationSignature: '',
      installerName: '',
    },
  });

  // Prevent tab/window closing during submission
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue =
          'Une finalisation est en cours. Êtes-vous sûr de vouloir quitter ?';
        return 'Une finalisation est en cours. Êtes-vous sûr de vouloir quitter ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);
  const onSubmit = async () => {
    if (!order || !token) return;

    // Check if nothing was installed and show confirmation modal
    if (checkIfNothingInstalled()) {
      setShowConfirmationModal(true);
      return;
    }

    // Check if client email exists, if not show modal
    if (!order.clientEmail) {
      setShowEmailModal(true);
      return;
    }

    // If email exists, proceed directly
    setClientEmail(order.clientEmail);
    proceedWithInstallation();
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Chargement de la commande...
          </h2>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl text-red-600">⚠</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Erreur de chargement
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => router.push('/')}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Commande introuvable
          </h2>
          <Button onClick={() => router.push('/')}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }
  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="mb-3 text-3xl font-bold text-green-600">
              Installation terminée avec succès !
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Le bon d&apos;installation a été généré
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => router.push(`/complete/${order.id}`)}
                className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-xl border-2 border-blue-200 bg-white px-8 py-3 font-semibold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:flex-none"
              >
                <FileText className="h-5 w-5" />
                <span>Voir le détail de l&apos;installation</span>
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 sm:flex-none"
              >
                <Package className="h-5 w-5" />
                <span>Nouvelle installation</span>
              </button>
              {/* 
              <button
                onClick={() => window.print()}
                className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-xl border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 sm:flex-none"
              >
                <FileText className="h-5 w-5" />
                <span>Imprimer le récapitulatif</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen">
      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Finalisation en cours...
            </h3>
            <p className="text-gray-600">
              Veuillez patienter pendant l&apos;envoi des données
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <button
            onClick={() => router.push('/')}
            className="mb-4 inline-flex cursor-pointer items-center text-gray-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour aux commandes
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Installation - Commande #{order.id}
              </h1>
              <p className="text-gray-600">
                Formulaire de fin d&apos;installation et signature client
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`space-y-6 ${isSubmitting ? 'pointer-events-none' : ''}`}
        >
          {/* Client Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Informations client et équipement
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Client Details */}
              <div className="rounded-xl bg-gray-50 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <MapPin className="mr-2 h-5 w-5 text-gray-600" />
                  Client
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {order.clientFirstName} {order.clientLastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div className="text-sm text-gray-700">
                        <p>{order.clientAddress}</p>
                        <p>{order.clientCity}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {order.clientPhone ||
                          'Aucun numéro de téléphone fourni'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {order.clientEmail || 'Aucune adresse email fournie'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Details */}
              <div className="rounded-xl bg-blue-50 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-blue-900">
                  <Package className="mr-2 h-5 w-5" />
                  Équipement commandé
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-bold text-blue-900">
                      {order.robotInventory.name}
                    </p>
                    <p className="text-sm text-blue-700">
                      Réf: {order.robotInventory.reference}
                    </p>
                    {order.serialNumber && (
                      <p className="text-sm text-blue-700">
                        S/N: {order.serialNumber}
                      </p>
                    )}
                  </div>
                  {order.installationDate && (
                    <div className="flex items-center rounded-lg bg-blue-100 p-3">
                      <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Prévu le {formatDate(order.installationDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Equipment Checklist */}
          <div
            className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${isSubmitting ? 'pointer-events-none opacity-70' : ''}`}
          >
            <div className="mb-6 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Checklist d&apos;installation
                </h2>
                <p className="text-gray-600">
                  Cochez les éléments installés avec succès
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Robot */}
              <div className="group">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue(
                      'robotInstalled',
                      !form.watch('robotInstalled')
                    )
                  }
                  disabled={isSubmitting}
                  className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    form.watch('robotInstalled')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        form.watch('robotInstalled')
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      {form.watch('robotInstalled') ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Robot installé et configuré
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.robotInventory.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Plugin */}
              {order.plugin && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'pluginInstalled',
                        !form.watch('pluginInstalled')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('pluginInstalled')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('pluginInstalled')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('pluginInstalled') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Wifi className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Plugin installé
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.plugin.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Antenna */}
              {order.antenna && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'antennaInstalled',
                        !form.watch('antennaInstalled')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('antennaInstalled')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('antennaInstalled')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('antennaInstalled') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Antenna className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Antenne installée
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.antenna.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Continue with other equipment... */}
              {order.shelter && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'shelterInstalled',
                        !form.watch('shelterInstalled')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('shelterInstalled')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('shelterInstalled')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('shelterInstalled') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Abri installé
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shelter.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Wire */}
              {order.hasWire && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'wireInstalled',
                        !form.watch('wireInstalled')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('wireInstalled')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('wireInstalled')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('wireInstalled') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Cable className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Câble installé
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.wireLength}m
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Antenna Support */}
              {order.hasAntennaSupport && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'antennaSupportInstalled',
                        !form.watch('antennaSupportInstalled')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('antennaSupportInstalled')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('antennaSupportInstalled')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('antennaSupportInstalled') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Antenna className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Support d&apos;antenne
                          </p>
                          <p className="text-sm text-gray-600">
                            Fixation et support
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Placement */}
              {order.hasPlacement && (
                <div className="group">
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'placementCompleted',
                        !form.watch('placementCompleted')
                      )
                    }
                    className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      form.watch('placementCompleted')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          form.watch('placementCompleted')
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {form.watch('placementCompleted') ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Placement et délimitation
                          </p>
                          <p className="text-sm text-gray-600">
                            Zone de tonte définie
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Notes and Comments */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notes d&apos;installation
              </h2>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Notes d&apos;installation *
                </label>
                <Textarea
                  {...form.register('installationNotes')}
                  placeholder="Détails de l'installation, observations particulières..."
                  className="min-h-[120px] rounded-xl border-2 border-gray-200 transition-colors focus:border-blue-500 focus:ring-0"
                />
                {form.formState.errors.installationNotes && (
                  <p className="mt-2 flex items-center text-sm text-red-600">
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-600"></span>
                    {form.formState.errors.installationNotes.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Éléments manquants ou en attente
                </label>
                <Textarea
                  {...form.register('missingItems')}
                  placeholder="Ex: Abri en rupture de stock, antenne à installer ultérieurement..."
                  className="min-h-[100px] rounded-xl border-2 border-gray-200 transition-colors focus:border-orange-500 focus:ring-0"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Commentaires additionnels
                </label>
                <Textarea
                  {...form.register('additionalComments')}
                  placeholder="Recommandations, conseils d'utilisation..."
                  className="min-h-[100px] rounded-xl border-2 border-gray-200 transition-colors focus:border-green-500 focus:ring-0"
                />
              </div>
            </div>
          </div>
          {/* Installer Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Informations installateur
              </h2>
            </div>

            <div className="max-w-md">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Nom de l&apos;installateur *
              </label>
              <Input
                {...form.register('installerName')}
                placeholder="Votre nom complet"
                className="rounded-xl border-2 border-gray-200 transition-colors focus:border-purple-500 focus:ring-0"
              />
              {form.formState.errors.installerName && (
                <p className="mt-2 flex items-center text-sm text-red-600">
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-600"></span>
                  {form.formState.errors.installerName.message}
                </p>
              )}
            </div>
          </div>
          {/* Signature */}
          <div className="mb-8">
            <SignaturePadComponent
              onSignatureChange={signature =>
                form.setValue('clientInstallationSignature', signature)
              }
              value={form.watch('clientInstallationSignature')}
              disabled={isSubmitting}
            />
            {form.formState.errors.clientInstallationSignature && (
              <p className="mt-2 flex items-center text-sm text-red-600">
                <span className="mr-2 h-2 w-2 rounded-full bg-red-600"></span>
                {form.formState.errors.clientInstallationSignature.message}
              </p>
            )}
          </div>{' '}
          {/* Submit Button */}
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg">
            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="flex items-center text-sm text-red-600">
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-600"></span>
                  {submitError}
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full transform cursor-pointer items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-green-800 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            >
              {isSubmitting ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Finalisation en cours...</span>
                </>
              ) : (
                <>
                  <FileText className="h-7 w-7 sm:h-6 sm:w-6" />
                  <span>
                    Finaliser l&apos;installation et envoyer au client
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Mail className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Adresse email requise
                </h3>
                <p className="text-gray-600">
                  Veuillez saisir l&apos;adresse email du client pour
                  l&apos;envoi du bon d&apos;installation
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Adresse email du client *
                  </label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="rounded-xl border-2 border-gray-200 transition-colors focus:border-orange-500 focus:ring-0"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleEmailSubmit();
                      }
                    }}
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEmailSubmit}
                    className="flex-1 cursor-pointer rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nothing Installed Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Aucun élément installé
                </h3>
                <p className="text-gray-600">
                  Vous n&apos;avez coché aucun élément dans la checklist
                  d&apos;installation. Confirmez-vous que rien n&apos;a été
                  installé ?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 cursor-pointer rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleNothingInstalledConfirmation}
                  className="flex-1 cursor-pointer rounded-xl bg-yellow-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-yellow-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Installation() {
  return (
    <ProtectedRoute>
      <InstallationPage />
    </ProtectedRoute>
  );
}
