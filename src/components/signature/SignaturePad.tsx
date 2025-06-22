'use client';

import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';

interface SignaturePadComponentProps {
  onSignatureChange: (signature: string) => void;
  value?: string;
  disabled?: boolean;
}

export function SignaturePadComponent({
  onSignatureChange,
  value,
  disabled = false,
}: SignaturePadComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const signaturePad = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 2,
        maxWidth: 4,
      });

      signaturePadRef.current = signaturePad;

      const handleSignature = () => {
        if (!signaturePad.isEmpty()) {
          const dataURL = signaturePad.toDataURL();
          onSignatureChange(dataURL);
          setIsEmpty(false);
        } else {
          onSignatureChange('');
          setIsEmpty(true);
        }
      };

      signaturePad.addEventListener('endStroke', handleSignature);

      // Load existing signature if provided
      if (value && value.startsWith('data:image')) {
        signaturePad.fromDataURL(value);
        setIsEmpty(false);
      }

      return () => {
        signaturePad.removeEventListener('endStroke', handleSignature);
      };
    }
  }, [onSignatureChange, value]);

  useEffect(() => {
    if (signaturePadRef.current) {
      if (disabled) {
        signaturePadRef.current.off();
      } else {
        signaturePadRef.current.on();
      }
    }
  }, [disabled]);

  const clear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onSignatureChange('');
      setIsEmpty(true);
    }
  };

  const resizeCanvas = () => {
    if (canvasRef.current && signaturePadRef.current) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      signaturePadRef.current.clear();
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Signature du client
          </h2>
          <p className="text-gray-600">
            Signature obligatoire pour valider l&apos;installation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={`rounded-2xl border-3 p-6 transition-all duration-200 ${
            isEmpty
              ? 'border-dashed border-gray-300 bg-gray-50'
              : 'border-solid border-green-300 bg-green-50'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="h-56 w-full cursor-crosshair touch-none rounded-xl border-2 border-gray-100 bg-white shadow-inner"
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEmpty ? (
              <>
                <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                <p className="text-sm text-gray-600">
                  Veuillez signer dans la zone ci-dessus
                </p>
              </>
            ) : (
              <>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium text-green-700">
                  Signature capturée avec succès
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={clear}
            disabled={disabled || isEmpty}
            className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Effacer
          </button>
        </div>

        {!isEmpty && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-green-800">
                Signature enregistrée et prête pour la validation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
