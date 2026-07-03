import type { ObligationStatus, ObligationType } from "@/entities/obligation/types";
import type { KnownApiErrorCode } from "@/shared/api/errors";
import type { Locale } from "@/shared/i18n/config";

type Dictionary = {
  app: {
    title: string;
    subtitle: string;
    dashboard: string;
    newObligation: string;
    edit: string;
    detail: string;
    back: string;
    language: string;
    theme: string;
    yes: string;
    no: string;
  };
  dashboard: {
    total: string;
    overdue: string;
    dueSoon: string;
    byStatus: string;
    filters: string;
    status: string;
    type: string;
    due: string;
    query: string;
    all: string;
    upcomingOrActive: string;
    title: string;
    owner: string;
    dueDate: string;
    document: string;
    actions: string;
    noObligations: string;
    noObligationsDescription: string;
    noMatches: string;
    noMatchesDescription: string;
    apiErrorTitle: string;
    loading: string;
  };
  detail: {
    summary: string;
    description: string;
    taxId: string;
    requiresDocument: string;
    hasDocument: string;
    version: string;
    transitions: string;
    noTransitions: string;
    blockedSubmitted: string;
    currentStatus: string;
    availableNow: string;
    unavailableStatus: string;
    changeStatus: string;
    statusChangeHelp: string;
    selectNextStatus: string;
    selectedTransition: string;
    optionalReason: string;
    chooseDocument: string;
    registerDocumentMetadata: string;
    replaceDocumentMetadata: string;
    registeringDocument: string;
    confirmReplaceDocument: string;
    confirmReplaceDocumentTitle: string;
    documentMetadataOnly: string;
    selectedDocument: string;
    audit: string;
    auditEvents: string;
    noAudit: string;
    documentMetadata: string;
    noDocument: string;
    attachDocument: string;
    removeDocument: string;
    deleteObligation: string;
    confirmDelete: string;
    confirmRemoveDocument: string;
    reason: string;
    changedBy: string;
    changedAt: string;
    from: string;
    to: string;
  };
  form: {
    title: string;
    description: string;
    type: string;
    dueDate: string;
    owner: string;
    requiresDocument: string;
    companyTaxId: string;
    fileName: string;
    contentType: string;
    sizeBytes: string;
    storageKey: string;
    create: string;
    save: string;
    submit: string;
    cancel: string;
    required: string;
    invalidDate: string;
    notPastDate: string;
    positiveSize: string;
    apiError: string;
    pending: string;
  };
  status: Record<ObligationStatus, string>;
  type: Record<ObligationType, string>;
  errors: Record<KnownApiErrorCode, string> & { UNKNOWN: string };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    app: {
      title: "Compliance Obligations",
      subtitle: "Track ownership, due dates, documents, and audit history.",
      dashboard: "Dashboard",
      newObligation: "New obligation",
      edit: "Edit",
      detail: "Detail",
      back: "Back",
      language: "Language",
      theme: "Theme",
      yes: "Yes",
      no: "No",
    },
    dashboard: {
      total: "Total",
      overdue: "Overdue",
      dueSoon: "Due soon",
      byStatus: "By status",
      filters: "Filters",
      status: "Status",
      type: "Type",
      due: "Due",
      query: "Title or owner",
      all: "All",
      upcomingOrActive: "Upcoming / active",
      title: "Title",
      owner: "Owner",
      dueDate: "Due date",
      document: "Document",
      actions: "Actions",
      noObligations: "No obligations yet",
      noObligationsDescription: "Create the first obligation to start tracking compliance work.",
      noMatches: "No obligations match the filters",
      noMatchesDescription: "Adjust the selected filters or search query.",
      apiErrorTitle: "Could not load obligations",
      loading: "Loading obligations",
    },
    detail: {
      summary: "Summary",
      description: "Description",
      taxId: "Tax ID",
      requiresDocument: "Requires document",
      hasDocument: "Has document",
      version: "Version",
      transitions: "Available transitions",
      noTransitions: "No transitions are currently available.",
      blockedSubmitted: "Submission blocked",
      currentStatus: "Current status",
      availableNow: "Available now",
      unavailableStatus: "Not available",
      changeStatus: "Change status",
      statusChangeHelp: "This records a workflow change and updates the audit trail.",
      selectNextStatus: "Select next status",
      selectedTransition: "Selected transition",
      optionalReason: "Optional reason",
      chooseDocument: "Choose a document from your computer",
      registerDocumentMetadata: "Register document metadata",
      replaceDocumentMetadata: "Replace document metadata",
      registeringDocument: "Registering metadata...",
      confirmReplaceDocument: "This replaces the current document metadata with the selected file metadata.",
      confirmReplaceDocumentTitle: "Replace document metadata?",
      documentMetadataOnly: "The file stays on your computer. Only name, type, and size are registered.",
      selectedDocument: "Selected document",
      audit: "Audit history",
      auditEvents: "events",
      noAudit: "No audit events recorded.",
      documentMetadata: "Document metadata",
      noDocument: "No document metadata attached.",
      attachDocument: "Attach document",
      removeDocument: "Remove document",
      deleteObligation: "Delete obligation",
      confirmDelete: "This permanently deletes the obligation.",
      confirmRemoveDocument: "This removes the document metadata from the obligation.",
      reason: "Reason",
      changedBy: "Changed by",
      changedAt: "Changed at",
      from: "From",
      to: "To",
    },
    form: {
      title: "Title",
      description: "Description",
      type: "Type",
      dueDate: "Due date",
      owner: "Owner",
      requiresDocument: "Requires document",
      companyTaxId: "Company tax ID",
      fileName: "File name",
      contentType: "Content type",
      sizeBytes: "Size in bytes",
      storageKey: "Storage key",
      create: "Create",
      save: "Save",
      submit: "Submit",
      cancel: "Cancel",
      required: "This field is required.",
      invalidDate: "Enter a valid date.",
      notPastDate: "Due date cannot be in the past.",
      positiveSize: "Size must be greater than zero.",
      apiError: "The API rejected the request.",
      pending: "Working...",
    },
    status: {
      pending: "Pending",
      in_progress: "In progress",
      submitted: "Submitted",
      done: "Done",
    },
    type: {
      annual_report: "Annual report",
      franchise_tax: "Franchise tax",
      boi_report: "BOI report",
      registered_agent_renewal: "Registered agent renewal",
    },
    errors: {
      VALIDATION_ERROR: "Some fields need attention.",
      OBLIGATION_NOT_FOUND: "The obligation was not found.",
      INVALID_STATUS_TRANSITION: "That status transition is no longer available.",
      DOCUMENT_REQUIRED_FOR_SUBMISSION: "A document is required before submission.",
      OBLIGATION_VERSION_CONFLICT: "This obligation changed. Refresh before trying again.",
      INTERNAL_SERVER_ERROR: "The server could not complete the request.",
      UNKNOWN: "Something went wrong.",
    },
  },
  es: {
    app: {
      title: "Obligaciones de Compliance",
      subtitle: "Seguimiento de responsables, vencimientos, documentos e historial.",
      dashboard: "Dashboard",
      newObligation: "Nueva obligación",
      edit: "Editar",
      detail: "Detalle",
      back: "Volver",
      language: "Idioma",
      theme: "Tema",
      yes: "Sí",
      no: "No",
    },
    dashboard: {
      total: "Total",
      overdue: "Vencidas",
      dueSoon: "Próximas",
      byStatus: "Por estado",
      filters: "Filtros",
      status: "Estado",
      type: "Tipo",
      due: "Vencimiento",
      query: "Título o responsable",
      all: "Todos",
      upcomingOrActive: "Próximas / activas",
      title: "Título",
      owner: "Responsable",
      dueDate: "Vence",
      document: "Documento",
      actions: "Acciones",
      noObligations: "Todavía no hay obligaciones",
      noObligationsDescription: "Creá la primera obligación para empezar el seguimiento.",
      noMatches: "No hay obligaciones con esos filtros",
      noMatchesDescription: "Ajustá los filtros seleccionados o el texto de búsqueda.",
      apiErrorTitle: "No se pudieron cargar las obligaciones",
      loading: "Cargando obligaciones",
    },
    detail: {
      summary: "Resumen",
      description: "Descripción",
      taxId: "Tax ID",
      requiresDocument: "Requiere documento",
      hasDocument: "Tiene documento",
      version: "Versión",
      transitions: "Transiciones disponibles",
      noTransitions: "No hay transiciones disponibles en este momento.",
      blockedSubmitted: "Envío bloqueado",
      currentStatus: "Estado actual",
      availableNow: "Disponible ahora",
      unavailableStatus: "No disponible",
      changeStatus: "Cambiar estado",
      statusChangeHelp: "Esto registra un cambio de workflow y actualiza el historial.",
      selectNextStatus: "Seleccionar próximo estado",
      selectedTransition: "Transición seleccionada",
      optionalReason: "Motivo opcional",
      chooseDocument: "Elegir un documento de la computadora",
      registerDocumentMetadata: "Registrar metadata del documento",
      replaceDocumentMetadata: "Reemplazar metadata del documento",
      registeringDocument: "Registrando metadata...",
      confirmReplaceDocument: "Esto reemplaza la metadata actual por la metadata del archivo seleccionado.",
      confirmReplaceDocumentTitle: "¿Reemplazar metadata del documento?",
      documentMetadataOnly: "El archivo queda en tu computadora. Solo se registran nombre, tipo y tamaño.",
      selectedDocument: "Documento seleccionado",
      audit: "Historial",
      auditEvents: "eventos",
      noAudit: "No hay eventos registrados.",
      documentMetadata: "Metadata del documento",
      noDocument: "No hay metadata de documento adjunta.",
      attachDocument: "Adjuntar documento",
      removeDocument: "Quitar documento",
      deleteObligation: "Eliminar obligación",
      confirmDelete: "Esto elimina la obligación de forma permanente.",
      confirmRemoveDocument: "Esto quita la metadata del documento de la obligación.",
      reason: "Motivo",
      changedBy: "Cambiado por",
      changedAt: "Fecha",
      from: "Desde",
      to: "Hacia",
    },
    form: {
      title: "Título",
      description: "Descripción",
      type: "Tipo",
      dueDate: "Fecha de vencimiento",
      owner: "Responsable",
      requiresDocument: "Requiere documento",
      companyTaxId: "Tax ID de la empresa",
      fileName: "Nombre del archivo",
      contentType: "Tipo de contenido",
      sizeBytes: "Tamaño en bytes",
      storageKey: "Storage key",
      create: "Crear",
      save: "Guardar",
      submit: "Enviar",
      cancel: "Cancelar",
      required: "Este campo es obligatorio.",
      invalidDate: "Ingresá una fecha válida.",
      notPastDate: "La fecha de vencimiento no puede estar en el pasado.",
      positiveSize: "El tamaño debe ser mayor a cero.",
      apiError: "La API rechazó la solicitud.",
      pending: "Procesando...",
    },
    status: {
      pending: "Pendiente",
      in_progress: "En progreso",
      submitted: "Enviada",
      done: "Completada",
    },
    type: {
      annual_report: "Reporte anual",
      franchise_tax: "Franchise tax",
      boi_report: "Reporte BOI",
      registered_agent_renewal: "Renovación de agente registrado",
    },
    errors: {
      VALIDATION_ERROR: "Hay campos que requieren atención.",
      OBLIGATION_NOT_FOUND: "No se encontró la obligación.",
      INVALID_STATUS_TRANSITION: "Esa transición ya no está disponible.",
      DOCUMENT_REQUIRED_FOR_SUBMISSION: "Se requiere un documento antes de enviar.",
      OBLIGATION_VERSION_CONFLICT: "La obligación cambió. Actualizá antes de reintentar.",
      INTERNAL_SERVER_ERROR: "El servidor no pudo completar la solicitud.",
      UNKNOWN: "Ocurrió un error.",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
