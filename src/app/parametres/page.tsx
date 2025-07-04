'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
} from 'lucide-react';
import {
  useInstallationInfoSections,
  usePaymentInfoSections,
} from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import {
  createInstallationInfoSection,
  updateInstallationInfoSection,
  deleteInstallationInfoSection,
  createInstallationInfoItem,
  updateInstallationInfoItem,
  deleteInstallationInfoItem,
  reorderInstallationInfoSections,
  downloadTestInstallationPdf,
  createPaymentInfoSection,
  updatePaymentInfoSection,
  deletePaymentInfoSection,
  createPaymentInfoItem,
  updatePaymentInfoItem,
  deletePaymentInfoItem,
  reorderPaymentInfoSections,
} from '@/lib/api';
import {
  InstallationInfoSection,
  InstallationInfoItem,
  PaymentInfoSection,
  PaymentInfoItem,
} from '@/types';
import { ErrorDialog } from '@/components/ui/error-dialog';

const COLOR_OPTIONS = [
  {
    value: 'BLUE',
    label: 'Bleu',
    className: 'bg-blue-100 border-blue-300 text-blue-800',
  },
  {
    value: 'GREEN',
    label: 'Vert',
    className: 'bg-green-100 border-green-300 text-green-800',
  },
  {
    value: 'YELLOW',
    label: 'Jaune',
    className: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  },
  {
    value: 'RED',
    label: 'Rouge',
    className: 'bg-red-100 border-red-300 text-red-800',
  },
  {
    value: 'GRAY',
    label: 'Gris',
    className: 'bg-gray-100 border-gray-300 text-gray-800',
  },
  {
    value: 'ORANGE',
    label: 'Orange',
    className: 'bg-orange-100 border-orange-300 text-orange-800',
  },
  {
    value: 'PURPLE',
    label: 'Violet',
    className: 'bg-purple-100 border-purple-300 text-purple-800',
  },
];

const ITEM_TYPE_OPTIONS = [
  { value: 'TITLE', label: 'Titre' },
  { value: 'CHAPTER', label: 'Chapitre' },
  { value: 'BULLET_POINT', label: 'Point à puces' },
  { value: 'TEXT', label: 'Texte libre' },
];

export default function Parametres() {
  const { sections, loading, error, setSections } =
    useInstallationInfoSections();
  const {
    sections: paymentSections,
    loading: paymentLoading,
    error: paymentError,
    setSections: setPaymentSections,
  } = usePaymentInfoSections();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'installation' | 'payment'>(
    'installation'
  );
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [newlyCreatedSectionId, setNewlyCreatedSectionId] = useState<
    number | null
  >(null);
  const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    error?: Error | string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    error: undefined,
  });

  // Scroll to newly created section
  useEffect(() => {
    if (newlyCreatedSectionId && sectionRefs.current[newlyCreatedSectionId]) {
      sectionRefs.current[newlyCreatedSectionId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setNewlyCreatedSectionId(null);
    }
  }, [newlyCreatedSectionId, sections]);

  const showError = (
    title: string,
    message: string,
    error?: Error | string
  ) => {
    setErrorDialog({
      isOpen: true,
      title,
      message,
      error,
    });
  };

  const closeError = () => {
    setErrorDialog({
      isOpen: false,
      title: '',
      message: '',
      error: undefined,
    });
  };

  const handleCreateSection = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const newSection = await createInstallationInfoSection(token, {
        title: 'Nouvelle section',
        color: 'BLUE',
        isActive: true,
      });
      setSections([...sections, newSection]);
      setEditingSection(newSection.id);
      setNewlyCreatedSectionId(newSection.id);
    } catch (error) {
      console.error('Error creating section:', error);
      showError(
        'Erreur de création',
        'Impossible de créer la nouvelle section. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePaymentSection = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const newSection = await createPaymentInfoSection(token, {
        title: 'Nouvelle section de paiement',
        color: 'BLUE',
        isActive: true,
      });
      setPaymentSections([...paymentSections, newSection]);
      setEditingSection(newSection.id);
      setNewlyCreatedSectionId(newSection.id);
    } catch (error) {
      console.error('Error creating payment section:', error);
      showError(
        'Erreur de création',
        'Impossible de créer la nouvelle section de paiement. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (
    sectionId: number,
    updates: Partial<InstallationInfoSection>
  ) => {
    if (!token) return;

    try {
      setSaving(true);
      const updatedSection = await updateInstallationInfoSection(
        token,
        sectionId,
        updates
      );
      setSections(sections.map(s => (s.id === sectionId ? updatedSection : s)));
    } catch (error) {
      console.error('Error updating section:', error);
      showError(
        'Erreur de modification',
        'Impossible de modifier la section. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (
      !token ||
      !confirm('Êtes-vous sûr de vouloir supprimer cette section ?')
    )
      return;

    try {
      setSaving(true);
      await deleteInstallationInfoSection(token, sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
      showError(
        'Erreur de suppression',
        'Impossible de supprimer la section. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async (sectionId: number) => {
    if (!token) return;

    try {
      setSaving(true);
      const newItem = await createInstallationInfoItem(token, sectionId, {
        content: 'Nouveau contenu',
        type: 'TEXT',
      });

      // Mise à jour locale du state
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId
            ? { ...section, items: [...section.items, newItem] }
            : section
        )
      );
    } catch (error) {
      console.error('Error creating item:', error);
      showError(
        'Erreur de création',
        'Impossible de créer le nouvel élément. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = async (
    itemId: number,
    updates: Partial<InstallationInfoItem>
  ) => {
    if (!token) return;

    try {
      setSaving(true);
      const updatedItem = await updateInstallationInfoItem(
        token,
        itemId,
        updates
      );

      // Mise à jour locale du state
      setSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? updatedItem : item
          ),
        }))
      );
    } catch (error) {
      console.error('Error updating item:', error);
      showError(
        'Erreur de modification',
        "Impossible de modifier l'élément. Veuillez réessayer.",
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const [originalSectionData, setOriginalSectionData] = useState<{
    [key: number]: Partial<InstallationInfoSection>;
  }>({});
  const [originalItemData, setOriginalItemData] = useState<{
    [key: number]: InstallationInfoItem;
  }>({});

  const updateItemLocally = (
    itemId: number,
    updates: Partial<InstallationInfoItem>
  ) => {
    setSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }))
    );
  };

  const updatePaymentItemLocally = (
    itemId: number,
    updates: Partial<PaymentInfoItem>
  ) => {
    setPaymentSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }))
    );
  };

  const cancelItemEdit = () => {
    if (editingItem && originalItemData[editingItem]) {
      // Restaurer les valeurs originales localement
      if (activeTab === 'installation') {
        updateItemLocally(editingItem, originalItemData[editingItem]);
      } else {
        updatePaymentItemLocally(editingItem, originalItemData[editingItem]);
      }
      delete originalItemData[editingItem];
      setOriginalItemData({ ...originalItemData });
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!token || !confirm('Êtes-vous sûr de vouloir supprimer cet élément ?'))
      return;

    try {
      setSaving(true);
      await deleteInstallationInfoItem(token, itemId);

      // Mise à jour locale du state
      setSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          items: section.items.filter(item => item.id !== itemId),
        }))
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      showError(
        'Erreur de suppression',
        "Impossible de supprimer l'élément. Veuillez réessayer.",
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSection = async (
    sectionId: number,
    direction: 'up' | 'down'
  ) => {
    if (!token) return;

    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSections[currentIndex], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[currentIndex],
    ];

    const sectionIds = newSections.map(s => s.id);

    try {
      setSaving(true);
      await reorderInstallationInfoSections(token, sectionIds);
      setSections(newSections);
    } catch (error) {
      console.error('Error reordering sections:', error);
      showError(
        'Erreur de réorganisation',
        'Impossible de réorganiser les sections. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewInstallationPdf = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const pdfBlob = await downloadTestInstallationPdf(token);

      // Create a URL for the blob and open it in a new tab
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');

      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating preview PDF:', error);
      showError(
        'Erreur de prévisualisation',
        'Impossible de générer la prévisualisation du PDF. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const getColorClassName = (color: string) => {
    return (
      COLOR_OPTIONS.find(option => option.value === color)?.className ||
      COLOR_OPTIONS[0].className
    );
  };

  // Payment section management functions
  const handleUpdatePaymentSection = async (
    sectionId: number,
    updates: Partial<PaymentInfoSection>
  ) => {
    if (!token) return;

    try {
      setSaving(true);
      const updatedSection = await updatePaymentInfoSection(
        token,
        sectionId,
        updates
      );
      setPaymentSections(
        paymentSections.map(s => (s.id === sectionId ? updatedSection : s))
      );
    } catch (error) {
      console.error('Error updating payment section:', error);
      showError(
        'Erreur de modification',
        'Impossible de modifier la section de paiement. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentSection = async (sectionId: number) => {
    if (
      !token ||
      !confirm('Êtes-vous sûr de vouloir supprimer cette section de paiement ?')
    )
      return;

    try {
      setSaving(true);
      await deletePaymentInfoSection(token, sectionId);
      setPaymentSections(paymentSections.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting payment section:', error);
      showError(
        'Erreur de suppression',
        'Impossible de supprimer la section de paiement. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePaymentItem = async (sectionId: number) => {
    if (!token) return;

    try {
      setSaving(true);
      const newItem = await createPaymentInfoItem(token, sectionId, {
        content: 'Nouveau contenu de paiement',
        type: 'TEXT',
      });

      // Mise à jour locale du state
      setPaymentSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId
            ? { ...section, items: [...section.items, newItem] }
            : section
        )
      );
    } catch (error) {
      console.error('Error creating payment item:', error);
      showError(
        'Erreur de création',
        'Impossible de créer le nouvel élément de paiement. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePaymentItem = async (
    itemId: number,
    updates: Partial<PaymentInfoItem>
  ) => {
    if (!token) return;

    try {
      setSaving(true);
      const updatedItem = await updatePaymentInfoItem(token, itemId, updates);

      // Mise à jour locale du state
      setPaymentSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? updatedItem : item
          ),
        }))
      );
    } catch (error) {
      console.error('Error updating payment item:', error);
      showError(
        'Erreur de modification',
        "Impossible de modifier l'élément de paiement. Veuillez réessayer.",
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentItem = async (itemId: number) => {
    if (
      !token ||
      !confirm('Êtes-vous sûr de vouloir supprimer cet élément de paiement ?')
    )
      return;

    try {
      setSaving(true);
      await deletePaymentInfoItem(token, itemId);

      // Mise à jour locale du state
      setPaymentSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          items: section.items.filter(item => item.id !== itemId),
        }))
      );
    } catch (error) {
      console.error('Error deleting payment item:', error);
      showError(
        'Erreur de suppression',
        "Impossible de supprimer l'élément de paiement. Veuillez réessayer.",
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMovePaymentSection = async (
    sectionId: number,
    direction: 'up' | 'down'
  ) => {
    if (!token) return;

    const currentIndex = paymentSections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === paymentSections.length - 1)
    ) {
      return;
    }

    const newSections = [...paymentSections];
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSections[currentIndex], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[currentIndex],
    ];

    const sectionIds = newSections.map(s => s.id);

    try {
      setSaving(true);
      await reorderPaymentInfoSections(token, sectionIds);
      setPaymentSections(newSections);
    } catch (error) {
      console.error('Error reordering payment sections:', error);
      showError(
        'Erreur de réorganisation',
        'Impossible de réorganiser les sections de paiement. Veuillez réessayer.',
        error as Error
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || paymentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (error || paymentError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl text-red-600">⚠</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Erreur de chargement
          </h2>
          <p className="mb-4 text-gray-600">{error || paymentError}</p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des informations PDF</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewInstallationPdf}
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              Prévisualiser le PDF
            </button>
            <button
              onClick={
                activeTab === 'installation'
                  ? handleCreateSection
                  : handleCreatePaymentSection
              }
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter une section
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('installation')}
              className={`cursor-pointer border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'installation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Informations d&apos;installation
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`cursor-pointer border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Informations de paiement
            </button>
          </div>
        </div>

        <p className="mt-4 text-gray-600">
          {activeTab === 'installation'
            ? "Gérez les sections d'information qui apparaîtront dans les PDF d'installation."
            : "Gérez les sections d'information de paiement qui apparaîtront dans les PDF d'installation."}
        </p>
      </div>

      <div className="space-y-6">
        {(activeTab === 'installation' ? sections : paymentSections).map(
          (section, sectionIndex) => (
            <div
              key={section.id}
              ref={el => {
                sectionRefs.current[section.id] = el;
              }}
              className={`rounded-lg border p-4 ${getColorClassName(section.color)}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() =>
                        activeTab === 'installation'
                          ? handleMoveSection(section.id, 'up')
                          : handleMovePaymentSection(section.id, 'up')
                      }
                      disabled={sectionIndex === 0 || saving}
                      className="cursor-pointer rounded p-1 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        activeTab === 'installation'
                          ? handleMoveSection(section.id, 'down')
                          : handleMovePaymentSection(section.id, 'down')
                      }
                      disabled={
                        sectionIndex ===
                          (activeTab === 'installation'
                            ? sections
                            : paymentSections
                          ).length -
                            1 || saving
                      }
                      className="cursor-pointer rounded p-1 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {editingSection === section.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => {
                          if (activeTab === 'installation') {
                            const newSections = sections.map(s =>
                              s.id === section.id
                                ? { ...s, title: e.target.value }
                                : s
                            );
                            setSections(newSections);
                          } else {
                            const newSections = paymentSections.map(s =>
                              s.id === section.id
                                ? { ...s, title: e.target.value }
                                : s
                            );
                            setPaymentSections(newSections);
                          }
                        }}
                        className="rounded-md border bg-white px-3 py-1"
                        placeholder="Titre de la section"
                      />
                      <select
                        value={section.color}
                        onChange={e => {
                          if (activeTab === 'installation') {
                            const newSections = sections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    color: e.target
                                      .value as InstallationInfoSection['color'],
                                  }
                                : s
                            );
                            setSections(newSections);
                          } else {
                            const newSections = paymentSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    color: e.target
                                      .value as PaymentInfoSection['color'],
                                  }
                                : s
                            );
                            setPaymentSections(newSections);
                          }
                        }}
                        className="rounded-md border bg-white px-3 py-1"
                      >
                        {COLOR_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.isActive}
                          onChange={e => {
                            if (activeTab === 'installation') {
                              const newSections = sections.map(s =>
                                s.id === section.id
                                  ? { ...s, isActive: e.target.checked }
                                  : s
                              );
                              setSections(newSections);
                            } else {
                              const newSections = paymentSections.map(s =>
                                s.id === section.id
                                  ? { ...s, isActive: e.target.checked }
                                  : s
                              );
                              setPaymentSections(newSections);
                            }
                          }}
                        />
                        Actif
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {!section.isActive && (
                        <span className="rounded bg-gray-500 px-2 py-1 text-xs text-white">
                          Inactif
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingSection === section.id ? (
                    <>
                      <button
                        onClick={() => {
                          if (activeTab === 'installation') {
                            handleUpdateSection(section.id, {
                              title: section.title,
                              color: section.color,
                              isActive: section.isActive,
                            });
                          } else {
                            handleUpdatePaymentSection(section.id, {
                              title: section.title,
                              color: section.color,
                              isActive: section.isActive,
                            });
                          }
                          setEditingSection(null);
                        }}
                        disabled={saving}
                        className="cursor-pointer rounded p-2 text-green-600 hover:bg-green-100"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            editingSection &&
                            originalSectionData[editingSection]
                          ) {
                            // Restaurer les données originales de la section
                            setSections(prevSections =>
                              prevSections.map(s =>
                                s.id === editingSection
                                  ? {
                                      ...s,
                                      ...originalSectionData[editingSection],
                                    }
                                  : s
                              )
                            );
                            const newOriginalData = { ...originalSectionData };
                            delete newOriginalData[editingSection];
                            setOriginalSectionData(newOriginalData);
                          }
                          setEditingSection(null);
                        }}
                        disabled={saving}
                        className="cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          // Sauvegarder les données originales avant d'éditer
                          const originalSection = sections.find(
                            s => s.id === section.id
                          );
                          if (originalSection) {
                            setOriginalSectionData({
                              ...originalSectionData,
                              [section.id]: {
                                title: originalSection.title,
                                color: originalSection.color,
                                isActive: originalSection.isActive,
                              },
                            });
                          }
                          setEditingSection(section.id);
                        }}
                        disabled={saving}
                        className="cursor-pointer rounded p-2 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          activeTab === 'installation'
                            ? handleDeleteSection(section.id)
                            : handleDeletePaymentSection(section.id)
                        }
                        disabled={saving}
                        className="cursor-pointer rounded p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {section.items.map(item => (
                  <div key={item.id} className="rounded-md bg-white/50 p-3">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={item.type}
                            onChange={e => {
                              if (activeTab === 'installation') {
                                updateItemLocally(item.id, {
                                  type: e.target
                                    .value as InstallationInfoItem['type'],
                                });
                              } else {
                                updatePaymentItemLocally(item.id, {
                                  type: e.target
                                    .value as PaymentInfoItem['type'],
                                });
                              }
                            }}
                            className="rounded-md border px-3 py-1"
                          >
                            {ITEM_TYPE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                if (activeTab === 'installation') {
                                  handleUpdateItem(item.id, {
                                    content: item.content,
                                    type: item.type,
                                  });
                                } else {
                                  handleUpdatePaymentItem(item.id, {
                                    content: item.content,
                                    type: item.type,
                                  });
                                }
                                setEditingItem(null);
                              }}
                              disabled={saving}
                              className="cursor-pointer rounded p-1 text-green-600 hover:bg-green-100"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => cancelItemEdit()}
                              disabled={saving}
                              className="cursor-pointer rounded p-1 text-gray-600 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (activeTab === 'installation') {
                                  handleDeleteItem(item.id);
                                } else {
                                  handleDeletePaymentItem(item.id);
                                }
                              }}
                              disabled={saving}
                              className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={item.content}
                          onChange={e => {
                            if (activeTab === 'installation') {
                              updateItemLocally(item.id, {
                                content: e.target.value,
                              });
                            } else {
                              updatePaymentItemLocally(item.id, {
                                content: e.target.value,
                              });
                            }
                          }}
                          className="resize-vertical w-full rounded-md border px-3 py-2"
                          rows={3}
                          placeholder="Contenu de l'élément"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded bg-gray-200 px-2 py-1 text-xs">
                              {
                                ITEM_TYPE_OPTIONS.find(
                                  opt => opt.value === item.type
                                )?.label
                              }
                            </span>
                          </div>
                          <div
                            className={`${
                              item.type === 'TITLE' || item.type === 'CHAPTER'
                                ? 'font-semibold'
                                : ''
                            } ${item.type === 'BULLET_POINT' ? 'pl-4' : ''}`}
                          >
                            {item.type === 'BULLET_POINT' && '• '}
                            {item.content}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Sauvegarder les données originales avant d'éditer
                            const currentSections =
                              activeTab === 'installation'
                                ? sections
                                : paymentSections;
                            const originalItem = currentSections
                              .flatMap(s => s.items)
                              .find(i => i.id === item.id);
                            if (originalItem) {
                              setOriginalItemData({
                                ...originalItemData,
                                [item.id]: { ...originalItem },
                              });
                            }
                            setEditingItem(item.id);
                          }}
                          disabled={saving}
                          className="cursor-pointer rounded p-1 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() =>
                    activeTab === 'installation'
                      ? handleCreateItem(section.id)
                      : handleCreatePaymentItem(section.id)
                  }
                  disabled={saving}
                  className="w-full cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-3 text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Ajouter un élément
                </button>
              </div>
            </div>
          )
        )}

        {(activeTab === 'installation' ? sections : paymentSections).length ===
          0 && (
          <div className="py-12 text-center text-gray-500">
            {activeTab === 'installation'
              ? "Aucune section d'installation trouvée. Commencez par ajouter une nouvelle section."
              : 'Aucune section de paiement trouvée. Commencez par ajouter une nouvelle section.'}
          </div>
        )}
      </div>

      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={closeError}
        title={errorDialog.title}
        message={errorDialog.message}
        error={errorDialog.error}
      />
    </div>
  );
}
