export type WizardPhoto = { file: File; url: string };

export interface WizardForm {
  step: number;
  summaryOpen: boolean;
  successOpen: boolean;
  submitting: boolean;
  persistError: string;
  requestNumber: string;
  farmName: string;
  department: string;
  municipality: string;
  village: string;
  area: string;
  areaUnit: string;
  altitude: string;
  varieties: readonly string[];
  otherVariety: string;
  ownerName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  password: string;
  mobile: string;
  phoneAreaCode: string;
  landline: string;
  bio: string;
  experience: string;
  photos: readonly WizardPhoto[];
  photoAlert: string;
  photoReplaceIndex: number | null;
  pdf: File | null;
  pdfAlert: string;
}

export const emptyWizardForm: WizardForm = {
  step: 1,
  summaryOpen: false,
  successOpen: false,
  submitting: false,
  persistError: '',
  requestNumber: '',
  farmName: '',
  department: '',
  municipality: '',
  village: '',
  area: '',
  areaUnit: 'Hectáreas',
  altitude: '',
  varieties: [],
  otherVariety: '',
  ownerName: '',
  documentType: '',
  documentNumber: '',
  email: '',
  password: '',
  mobile: '',
  phoneAreaCode: '',
  landline: '',
  bio: '',
  experience: '',
  photos: [],
  photoAlert: '',
  photoReplaceIndex: null,
  pdf: null,
  pdfAlert: '',
};
