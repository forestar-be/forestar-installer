export enum InventoryCategory {
  ROBOT = 'ROBOT',
  PLUGIN = 'PLUGIN',
  ANTENNA = 'ANTENNA',
  SHELTER = 'SHELTER',
  WIRE = 'WIRE',
  SUPPORT = 'SUPPORT',
}

export interface RobotInventory {
  id: number;
  reference?: string;
  name: string;
  category: InventoryCategory;
  sellingPrice?: number;
  purchasePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  // Client information
  clientFirstName: string;
  clientLastName: string;
  clientAddress: string;
  clientCity: string;
  clientPhone: string;
  clientEmail: string;
  deposit: number;
  devisSignatureAccessTokenArray: string[];
  emailDevisSent: boolean;

  // Robot details
  robotInventoryId: number;
  robotInventory: RobotInventory;
  serialNumber?: string;

  // Accessories
  pluginInventoryId?: number;
  antennaInventoryId?: number;
  shelterInventoryId?: number;
  plugin?: RobotInventory;
  antenna?: RobotInventory;
  shelter?: RobotInventory;
  hasWire: boolean;
  wireLength?: number;
  hasAntennaSupport: boolean;
  hasPlacement: boolean;

  // Installation
  installationDate?: Date;
  needsInstaller: boolean;
  installationNotes?: string;

  // Installation completion details
  installerName?: string;
  installationCompletedAt?: Date;
  robotInstalled?: boolean;
  pluginInstalled?: boolean;
  antennaInstalled?: boolean;
  shelterInstalled?: boolean;
  wireInstalled?: boolean;
  antennaSupportInstalled?: boolean;
  placementCompleted?: boolean;
  missingItems?: string;
  additionalComments?: string;
  installationPdfId?: string;

  // Status fields
  hasAppointment: boolean;
  isInstalled: boolean;
  isInvoiced: boolean;
  devis: boolean;

  // Crisis specific fields
  validUntil?: Date;
  bankAccountNumber?: string;

  // Files
  orderPdfId?: string;
  invoicePath?: string;
  photosPaths: string[];

  // Signature fields
  clientInstallationSignature?: string;
  signatureTimestamp?: Date;

  eventId?: string; // Calendar integration
}

export interface InstallationFormData {
  orderId: number;

  // Equipment installed status
  robotInstalled: boolean;
  pluginInstalled: boolean;
  antennaInstalled: boolean;
  shelterInstalled: boolean;
  wireInstalled: boolean;
  antennaSupportInstalled: boolean;
  placementCompleted: boolean;

  // Notes and comments
  installationNotes: string;
  missingItems: string;
  additionalComments: string;

  // Client signature
  clientInstallationSignature: string;
  installerName: string;
  installationDate: Date;

  // Photos
  photosPaths: string[];
}

export interface InstallationReceipt {
  order: PurchaseOrder;
  installation: InstallationFormData;
  generatedAt: Date;
  installerName: string;
}

// Installation Info Management Types
export interface InstallationInfoItem {
  id: number;
  content: string;
  type: 'TITLE' | 'CHAPTER' | 'BULLET_POINT' | 'TEXT';
  order: number;
  sectionId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstallationInfoSection {
  id: number;
  title: string;
  color: 'BLUE' | 'GREEN' | 'YELLOW' | 'RED' | 'GRAY' | 'ORANGE' | 'PURPLE';
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: InstallationInfoItem[];
}
