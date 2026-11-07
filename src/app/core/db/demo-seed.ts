import { OrigenDirectoDb } from './origen-directo.db';

interface DemoPhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

async function asset(filename: string, url: URL): Promise<DemoPhoto> {
  const node = (globalThis as { process?: { versions?: { node?: string }; cwd(): string } }).process;
  if (node?.versions?.node) {
    const fs = (await new Function('return import("node:fs/promises")')()) as {
      readFile(path: string): Promise<Uint8Array>;
    };
    const path = (await new Function('return import("node:path")')()) as {
      join(...parts: string[]): string;
    };
    const file = await fs.readFile(path.join(node.cwd(), 'src', 'assets', filename));
    const bytes = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer;
    return { type: 'image/jpeg', bytes };
  }

  const response = await fetch(url);
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

  const paraiso = await asset(
    'El Paraíso, Urrao.jpg',
    new URL('../../../assets/El Paraíso, Urrao.jpg', import.meta.url),
  );
  const angeles1 = await asset(
    'Alto de los Ángeles, foto 1.jpg',
    new URL('../../../assets/Alto de los Ángeles, foto 1.jpg', import.meta.url),
  );
  const angeles2 = await asset(
    'Alto de los Ángeles, foto 2.jpg',
    new URL('../../../assets/Alto de los Ángeles, foto 2.jpg', import.meta.url),
  );
  const fortuna = await asset(
    'La Fortuna, Planadas.jpg',
    new URL('../../../assets/La Fortuna, Planadas.jpg', import.meta.url),
  );
  const roble = await asset(
    'El Roble, Pitalito.jpg',
    new URL('../../../assets/El Roble, Pitalito.jpg', import.meta.url),
  );

  const paraisoBio = 'Tercera generación cultivando café de altura.';
  const angelesBio = 'Café de montaña en las laderas de Chinchiná.';
  const fortunaBio = 'Una finca pequeña entre cafetos del Tolima.';
  const robleBio = 'Cafetal bajo sombra en las colinas de Pitalito.';

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
}
