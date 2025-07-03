import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function InstallationInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Header />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
