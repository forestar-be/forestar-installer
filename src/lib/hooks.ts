// Custom hooks for API calls
import { useState, useEffect, useCallback } from 'react';
import {
  PurchaseOrder,
  InstallationInfoSection,
  PaymentInfoSection,
} from '@/types';
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  fetchAllInstallationInfoSections,
  fetchAllPaymentInfoSections,
  isHttpError,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const usePurchaseOrders = (isInstalled?: boolean) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPurchaseOrders(token, isInstalled);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      if (isHttpError(err)) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement des commandes');
      }
    } finally {
      setLoading(false);
    }
  }, [token, isInstalled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, error, refetch };
};

export const usePurchaseOrder = (id: number, isInstalled?: boolean) => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPurchaseOrderById(token, id, isInstalled);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching purchase order:', err);
      if (isHttpError(err)) {
        if (err.status == 404) {
          setError(
            'La commande que vous cherchez est introuvable. Veuillez vérifier le lien ou contacter Forestar Shop pour assistance.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Erreur lors du chargement de la commande');
      }
    } finally {
      setLoading(false);
    }
  }, [token, id, isInstalled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { order, loading, error, refetch };
};

export const useInstallationInfoSections = () => {
  const [sections, setSections] = useState<InstallationInfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllInstallationInfoSections(token);
      setSections(data);
    } catch (err) {
      console.error('Error fetching installation info sections:', err);
      if (isHttpError(err)) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des sections d'information");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sections, loading, error, refetch, setSections };
};

export const usePaymentInfoSections = () => {
  const [sections, setSections] = useState<PaymentInfoSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllPaymentInfoSections(token);
      setSections(data);
    } catch (err) {
      console.error('Error fetching payment info sections:', err);
      if (isHttpError(err)) {
        setError(err.message);
      } else {
        setError(
          "Erreur lors du chargement des sections d'information de paiement"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { sections, loading, error, refetch, setSections };
};
