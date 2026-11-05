import { Farm } from './farm';

export function emptyFarmDraft(
  overrides: Partial<Omit<Farm, 'id'>> = {},
): Omit<Farm, 'id'> {
  return {
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
    mobile: '',
    phoneAreaCode: '',
    landline: '',
    bio: '',
    experience: '',
    photos: [],
    pdf: null,
    ...overrides,
  };
}
