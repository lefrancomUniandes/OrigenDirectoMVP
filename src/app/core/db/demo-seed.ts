import { hashPassword } from '../auth/password-hash';
import { OrigenDirectoDb } from './origen-directo.db';

interface DemoPhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

type DemoAssetLoader = (filename: string) => Promise<ArrayBuffer>;

export function installDemoAssetLoader(loader: DemoAssetLoader): void {
  (globalThis as { __loadDemoAsset?: DemoAssetLoader }).__loadDemoAsset = loader;
}

async function asset(filename: string): Promise<DemoPhoto> {
  const load = (globalThis as { __loadDemoAsset?: DemoAssetLoader }).__loadDemoAsset;
  if (load) {
    return { type: 'image/jpeg', bytes: await load(filename) };
  }
  const response = await fetch(`/assets/${encodeURIComponent(filename)}`);
  if (!response.ok) {
    throw new Error(filename);
  }
  return { type: 'image/jpeg', bytes: await response.arrayBuffer() };
}

function presentation(bio: string, email: string, mobile: string, landline: string): string {
  return `${bio}\n${email}\n${mobile}\n${landline}`;
}

export async function seedDemoIfEmpty(db: OrigenDirectoDb): Promise<void> {
  await db.open();
  if ((await db.table('fincas').count()) > 0) {
    return;
  }

  const paraiso = await asset('El Paraíso, Urrao.jpg');
  const angeles1 = await asset('Alto de los Ángeles, foto 1.jpg');
  const angeles2 = await asset('Alto de los Ángeles, foto 2.jpg');
  const fortuna = await asset('La Fortuna, Planadas.jpg');
  const roble = await asset('El Roble, Pitalito.jpg');

  const paraisoBio = 'Tercera generación cultivando café de altura.';
  const angelesBio = 'Café de montaña en las laderas de Chinchiná.';
  const fortunaBio = 'Una finca pequeña entre cafetos del Tolima.';
  const robleBio = 'Cafetal bajo sombra en las colinas de Pitalito.';
  const passwordHash = await hashPassword('Cafe2026*');

  await db.table('fincas').bulkAdd([
    {
      id: 'demo-paraiso',
      farmName: 'Finca El Paraíso',
      ownerName: 'Ana Morales',
      department: 'Antioquia',
      municipality: 'Urrao',
      village: 'La Clara',
      area: '4',
      areaUnit: 'Hectáreas',
      altitude: '1800',
      varieties: ['Castillo', 'Caturra'],
      otherVariety: '',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '100',
      email: 'ana@paraiso.com',
      mobile: '3001111111',
      phoneAreaCode: '604',
      landline: '1111111',
      bio: paraisoBio,
      experience: '18',
      photos: [paraiso],
      pdf: null,
      passwordHash,
      verified: true,
    },
    {
      id: 'demo-angeles',
      farmName: 'Finca Alto de los Ángeles',
      ownerName: 'Luis Herrera',
      department: 'Caldas',
      municipality: 'Chinchiná',
      village: 'El Trébol',
      area: '6',
      areaUnit: 'Hectáreas',
      altitude: '1450',
      varieties: ['Castillo'],
      otherVariety: '',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '200',
      email: 'luis@angeles.com',
      mobile: '3002222222',
      phoneAreaCode: '606',
      landline: '2222222',
      bio: angelesBio,
      experience: '12',
      photos: [angeles1, angeles2],
      pdf: null,
      passwordHash,
      verified: true,
    },
    {
      id: 'demo-fortuna',
      farmName: 'Finca La Fortuna',
      ownerName: 'Marta Gómez',
      department: 'Tolima',
      municipality: 'Planadas',
      village: 'Bilbao',
      area: '3',
      areaUnit: 'Hectáreas',
      altitude: '1600',
      varieties: ['Tabi'],
      otherVariety: '',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '300',
      email: 'marta@fortuna.com',
      mobile: '3003333333',
      phoneAreaCode: '608',
      landline: '3333333',
      bio: fortunaBio,
      experience: '20',
      photos: [fortuna],
      pdf: null,
      passwordHash,
      verified: true,
    },
    {
      id: 'demo-roble',
      farmName: 'Finca El Roble',
      ownerName: 'Pedro Castaño',
      department: 'Huila',
      municipality: 'Pitalito',
      village: 'Charguayaco',
      area: '5',
      areaUnit: 'Hectáreas',
      altitude: '1750',
      varieties: ['Caturra'],
      otherVariety: 'Pink Bourbon',
      documentType: 'Cédula de ciudadanía',
      documentNumber: '400',
      email: 'pedro@elroble.com',
      mobile: '3004444444',
      phoneAreaCode: '608',
      landline: '4444444',
      bio: robleBio,
      experience: '9',
      photos: [roble],
      pdf: null,
      passwordHash,
      verified: true,
    },
  ]);

  await db.table('publicaciones').bulkAdd([
    {
      id: 'demo-paraiso-presentacion',
      farmId: 'demo-paraiso',
      publishedOn: '2026-10-01',
      text: presentation(paraisoBio, 'ana@paraiso.com', '3001111111', '1111111'),
      photo: null,
    },
    {
      id: 'demo-paraiso-foto',
      farmId: 'demo-paraiso',
      publishedOn: '2026-10-02',
      text: '',
      photo: paraiso,
    },
    {
      id: 'demo-paraiso-cereza',
      farmId: 'demo-paraiso',
      publishedOn: '2026-10-03',
      text: 'Fermentación en cereza',
      photo: null,
    },
    {
      id: 'demo-angeles-presentacion',
      farmId: 'demo-angeles',
      publishedOn: '2026-10-01',
      text: presentation(angelesBio, 'luis@angeles.com', '3002222222', '2222222'),
      photo: null,
    },
    {
      id: 'demo-angeles-foto-1',
      farmId: 'demo-angeles',
      publishedOn: '2026-10-02',
      text: '',
      photo: angeles1,
    },
    {
      id: 'demo-angeles-foto-2',
      farmId: 'demo-angeles',
      publishedOn: '2026-10-03',
      text: '',
      photo: angeles2,
    },
    {
      id: 'demo-fortuna-presentacion',
      farmId: 'demo-fortuna',
      publishedOn: '2026-10-01',
      text: presentation(fortunaBio, 'marta@fortuna.com', '3003333333', '3333333'),
      photo: null,
    },
    {
      id: 'demo-fortuna-foto',
      farmId: 'demo-fortuna',
      publishedOn: '2026-10-02',
      text: '',
      photo: fortuna,
    },
    {
      id: 'demo-roble-presentacion',
      farmId: 'demo-roble',
      publishedOn: '2026-10-01',
      text: presentation(robleBio, 'pedro@elroble.com', '3004444444', '4444444'),
      photo: null,
    },
    {
      id: 'demo-roble-secado',
      farmId: 'demo-roble',
      publishedOn: '2026-10-04',
      text: 'Secado en marquesina',
      photo: null,
    },
  ]);

  await db.table('lotes').bulkAdd([
    {
      id: 'demo-paraiso-lote',
      farmId: 'demo-paraiso',
      quantity: 20,
      unit: 'sacos',
      variety: 'Caturra',
      altitude: 1800,
      price: 1200000,
      status: 'Disponible',
      notes: 'Honey',
      active: true,
      publishedOn: '2026-01-03',
    },
    {
      id: 'demo-angeles-lote',
      farmId: 'demo-angeles',
      quantity: 15,
      unit: 'sacos',
      variety: 'Castillo',
      altitude: 1450,
      price: 1100000,
      status: 'Disponible',
      notes: '',
      active: true,
      publishedOn: '2026-01-02',
    },
    {
      id: 'demo-fortuna-lote',
      farmId: 'demo-fortuna',
      quantity: 30,
      unit: 'kg',
      variety: 'Tabi',
      altitude: 1600,
      price: 45000,
      status: 'Disponible',
      notes: '',
      active: true,
      publishedOn: '2026-01-01',
    },
  ]);

  await db.table('novedades').bulkAdd([
    {
      id: 'demo-paraiso-novedad',
      lotId: 'demo-paraiso-lote',
      title: 'Caturra',
      farmName: 'Finca El Paraíso',
      municipality: 'Urrao',
      department: 'Antioquia',
      publishedOn: '2026-01-03',
    },
    {
      id: 'demo-angeles-novedad',
      lotId: 'demo-angeles-lote',
      title: 'Castillo',
      farmName: 'Finca Alto de los Ángeles',
      municipality: 'Chinchiná',
      department: 'Caldas',
      publishedOn: '2026-01-02',
    },
    {
      id: 'demo-fortuna-novedad',
      lotId: 'demo-fortuna-lote',
      title: 'Tabi',
      farmName: 'Finca La Fortuna',
      municipality: 'Planadas',
      department: 'Tolima',
      publishedOn: '2026-01-01',
    },
  ]);
}
