// Custom hooks for API calls
import { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder } from '@/types';
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  isHttpError,
} from '@/lib/api';
import { useAuth } from '@/lib/auth';

export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPurchaseOrders(token);
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
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, error, refetch };
};

export const usePurchaseOrder = (id: number) => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refetch = useCallback(async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPurchaseOrderById(token, id);
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
  }, [token, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { order, loading, error, refetch };
};
