import {
  PurchaseOrder,
  InstallationInfoSection,
  InstallationInfoItem,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class HttpError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};

const apiRequest = async (
  endpoint: string,
  method: string,
  token: string,
  body?: unknown,
  additionalHeaders: HeadersInit = { 'Content-Type': 'application/json' },
  stringifyBody: boolean = true
) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...additionalHeaders,
  };

  const options: RequestInit = {
    method,
    headers,
  };
  if (body) {
    options.body = stringifyBody ? JSON.stringify(body) : (body as BodyInit);
  }

  const response: Response = await fetch(`${API_URL}${endpoint}`, options);

  let data;

  try {
    // Check if the response is a binary type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text/html')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }
  } catch (error) {
    console.warn('Error parsing response', response, error);
  }

  // Handle JWT expiration - redirect to login with current page as redirect
  if (
    response.status === 403 &&
    data?.message &&
    data?.message === 'jwt expired'
  ) {
    // Use window.location to redirect to login with current page as redirect parameter
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    return;
  }

  if (!response.ok) {
    console.error(`${response.statusText} ${response.status}`, data);
    if (typeof data === 'string' && data) {
      throw new HttpError(data, response.status);
    }
    throw new HttpError(
      data?.message || `${response.statusText} ${response.status}`,
      response.status
    );
  }

  return data;
};

// Purchase Orders API functions
export const fetchPurchaseOrders = (
  token: string,
  isInstalled?: boolean
): Promise<PurchaseOrder[]> => {
  const params = new URLSearchParams();
  if (isInstalled !== undefined) {
    params.append('isInstalled', isInstalled.toString());
  }
  const endpoint = `/installer/purchase-orders${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest(endpoint, 'GET', token);
};

export const fetchPurchaseOrderById = (
  token: string,
  id: number,
  isInstalled?: boolean
): Promise<PurchaseOrder> =>
  apiRequest(
    `/installer/purchase-orders/${id}?isInstalled=${isInstalled}`,
    'GET',
    token
  );

export const completeInstallation = (
  token: string,
  id: number,
  data: {
    installationNotes?: string;
    installerName?: string;
    clientInstallationSignature?: string;
    robotInstalled?: boolean;
    pluginInstalled?: boolean;
    antennaInstalled?: boolean;
    shelterInstalled?: boolean;
    wireInstalled?: boolean;
    antennaSupportInstalled?: boolean;
    placementCompleted?: boolean;
    missingItems?: string;
    additionalComments?: string;
    clientEmail?: string;
  }
): Promise<PurchaseOrder> =>
  apiRequest(`/installer/purchase-orders/${id}/complete`, 'PUT', token, data);

export const downloadInstallationPdf = async (
  token: string,
  id: number
): Promise<Blob> =>
  apiRequest(
    `/installer/purchase-orders/${id}/installation-pdf`,
    'GET',
    token,
    undefined,
    { Accept: 'application/pdf' },
    false
  );

// Installation Info Management API functions
export const fetchInstallationInfoSections = (
  token: string
): Promise<InstallationInfoSection[]> =>
  apiRequest('/installer/installation-info/sections', 'GET', token);

export const fetchAllInstallationInfoSections = (
  token: string
): Promise<InstallationInfoSection[]> =>
  apiRequest('/installer/installation-info/sections/all', 'GET', token);

export const fetchInstallationInfoSectionById = (
  token: string,
  id: number
): Promise<InstallationInfoSection> =>
  apiRequest(`/installer/installation-info/sections/${id}`, 'GET', token);

export const createInstallationInfoSection = (
  token: string,
  data: {
    title: string;
    color?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<InstallationInfoSection> =>
  apiRequest('/installer/installation-info/sections', 'POST', token, data);

export const updateInstallationInfoSection = (
  token: string,
  id: number,
  data: {
    title?: string;
    color?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<InstallationInfoSection> =>
  apiRequest(`/installer/installation-info/sections/${id}`, 'PUT', token, data);

export const deleteInstallationInfoSection = (
  token: string,
  id: number
): Promise<{ message: string }> =>
  apiRequest(`/installer/installation-info/sections/${id}`, 'DELETE', token);

export const createInstallationInfoItem = (
  token: string,
  sectionId: number,
  data: {
    content: string;
    type: 'TITLE' | 'CHAPTER' | 'BULLET_POINT' | 'TEXT';
    order?: number;
  }
): Promise<InstallationInfoItem> =>
  apiRequest(
    `/installer/installation-info/sections/${sectionId}/items`,
    'POST',
    token,
    data
  );

export const updateInstallationInfoItem = (
  token: string,
  id: number,
  data: {
    content?: string;
    type?: 'TITLE' | 'CHAPTER' | 'BULLET_POINT' | 'TEXT';
    order?: number;
  }
): Promise<InstallationInfoItem> =>
  apiRequest(`/installer/installation-info/items/${id}`, 'PUT', token, data);

export const deleteInstallationInfoItem = (
  token: string,
  id: number
): Promise<{ message: string }> =>
  apiRequest(`/installer/installation-info/items/${id}`, 'DELETE', token);

export const reorderInstallationInfoSections = (
  token: string,
  sectionIds: number[]
): Promise<{ message: string }> =>
  apiRequest('/installer/installation-info/sections/reorder', 'PUT', token, {
    sectionIds,
  });

export const reorderInstallationInfoItems = (
  token: string,
  sectionId: number,
  itemIds: number[]
): Promise<{ message: string }> =>
  apiRequest(
    `/installer/installation-info/sections/${sectionId}/items/reorder`,
    'PUT',
    token,
    { itemIds }
  );

export const downloadTestInstallationPdf = async (
  token: string
): Promise<Blob> =>
  apiRequest(
    `/installer/test/installation-pdf`,
    'GET',
    token,
    undefined,
    { Accept: 'application/pdf' },
    false
  );
