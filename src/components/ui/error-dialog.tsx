'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  error?: Error | string;
}

export function ErrorDialog({
  isOpen,
  onClose,
  title,
  message,
  error,
}: ErrorDialogProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const errorDetails =
    error instanceof Error
      ? `${error.name}: ${error.message}\n\nStack trace:\n${error.stack}`
      : typeof error === 'string'
        ? error
        : "Aucun détail d'erreur disponible";

  const handleCopyError = async () => {
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 text-center sm:mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:h-16 sm:w-16">
            <AlertTriangle className="h-6 w-6 text-red-600 sm:h-8 sm:w-8" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
          <p className="mb-4 text-base text-gray-600">{message}</p>
          <p className="text-sm text-gray-500">
            Si le problème persiste, contactez le support technique en incluant
            les détails de l'erreur ci-dessous.
          </p>
        </div>

        {showDetails && (
          <div className="mb-4 space-y-3">
            <div className="relative">
              <textarea
                value={errorDetails}
                readOnly
                className="h-32 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm"
                placeholder="Détails de l'erreur..."
              />
              <button
                onClick={handleCopyError}
                className="absolute top-2 right-2 flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white p-1.5 transition-colors hover:bg-gray-50 sm:p-2"
                title="Copier les détails de l'erreur"
                aria-label="Copier les détails de l'erreur"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="hidden text-sm text-green-600 sm:inline">
                      Copié
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-gray-600" />
                    <span className="hidden text-sm text-gray-600 sm:inline">
                      Copier
                    </span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-center text-sm text-green-600">
                Détails copiés dans le presse-papiers
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {error && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-blue-600 px-3 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50 sm:px-4"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Masquer détails</span>
                  <span className="sm:hidden">Masquer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Voir détails</span>
                  <span className="sm:hidden">Détails</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition-colors hover:bg-blue-700 sm:px-4"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
