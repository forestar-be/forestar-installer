import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export async function generateInstallationPDF(data: any) {
  // Mock PDF generation - in a real app, you'd use @react-pdf/renderer
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("PDF généré pour l'installation:", data);
      resolve('mock-pdf-path.pdf');
    }, 1000);
  });
}

export async function sendEmailToClient(
  email: string,
  pdfPath: string,
  clientName: string
) {
  // Mock email sending
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(
        `Email envoyé à ${email} pour ${clientName} avec le PDF ${pdfPath}`
      );
      resolve(true);
    }, 1500);
  });
}
