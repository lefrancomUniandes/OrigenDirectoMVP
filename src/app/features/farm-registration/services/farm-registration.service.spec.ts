import { emptyFarmDraft } from '../data/farm-draft';
import { FarmRegistrationService } from './farm-registration.service';

describe('FarmRegistrationService', () => {
  it('register guarda la finca y devuelve un número OD-año-######', async () => {
    const create = vi.fn().mockResolvedValue('unused');
    const service = new FarmRegistrationService({ create } as any, { create: vi.fn() } as any);
    const draft = emptyFarmDraft({ farmName: 'Finca La Esperanza' });

    const id = await service.register(draft);

    expect(id).toMatch(/^OD-\d{4}-\d{6}$/);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ farmName: 'Finca La Esperanza' }),
    );
  });

  it('el registro se puede leer después con el mismo número OD-año-######', async () => {
    const stored = new Map<string, { id: string; farmName: string }>();
    const farms = {
      create: async (data: { id?: string; farmName: string }) => {
        const id = data.id ?? 'missing';
        stored.set(id, { id, farmName: data.farmName });
        return id;
      },
      getById: async (id: string) => stored.get(id),
    };
    const service = new FarmRegistrationService(farms as never, { create: async () => 'pub' } as never);

    const id = await service.register(emptyFarmDraft({ farmName: 'Finca La Esperanza' }));
    const saved = await farms.getById(id);

    expect(id).toMatch(/^OD-\d{4}-\d{6}$/);
    expect(saved?.id).toBe(id);
    expect(saved?.farmName).toBe('Finca La Esperanza');
  });

  it('al registrar con dos fotos quedan dos publicaciones con esa imagen, la fecha de hoy y el texto vacío', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-07T15:00:00Z'));

    try {
      const created: {
        farmId: string;
        publishedOn: string;
        text: string;
        photo: { type: string; bytes: ArrayBuffer } | null;
      }[] = [];
      const farms = {
        create: async (data: { id: string }) => data.id,
      };
      const publications = {
        create: async (data: (typeof created)[number]) => {
          created.push(data);
          return 'pub';
        },
      };
      const service = new FarmRegistrationService(farms as never, publications as never);
      const first = new Uint8Array([9, 8, 7]).buffer;
      const second = new Uint8Array([6, 5]).buffer;

      const id = await service.register(
        emptyFarmDraft({
          photos: [
            { name: 'cosecha.jpg', type: 'image/jpeg', size: 3, bytes: first },
            { name: 'secado.jpg', type: 'image/png', size: 2, bytes: second },
          ],
        }),
      );

      const withPhoto = created.filter((row) => row.photo !== null);

      expect(
        withPhoto.map((row) => ({
          farmId: row.farmId,
          publishedOn: row.publishedOn,
          text: row.text,
          type: row.photo?.type,
          bytes: [...new Uint8Array(row.photo!.bytes)],
        })),
      ).toEqual([
        {
          farmId: id,
          publishedOn: '2026-11-07',
          text: '',
          type: 'image/jpeg',
          bytes: [9, 8, 7],
        },
        {
          farmId: id,
          publishedOn: '2026-11-07',
          text: '',
          type: 'image/png',
          bytes: [6, 5],
        },
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('al registrar queda una publicación de presentación, sin foto, con la biografía, el correo, el celular y el fijo', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-07T15:00:00Z'));

    try {
      const created: {
        farmId: string;
        publishedOn: string;
        text: string;
        photo: { type: string; bytes: ArrayBuffer } | null;
      }[] = [];
      const farms = {
        create: async (data: { id: string }) => data.id,
      };
      const publications = {
        create: async (data: (typeof created)[number]) => {
          created.push(data);
          return 'pub';
        },
      };
      const service = new FarmRegistrationService(farms as never, publications as never);

      const id = await service.register(
        emptyFarmDraft({
          bio: 'Café de altura cultivado bajo sombra.',
          email: 'ana@finca.com',
          mobile: '3001234567',
          landline: '6088765432',
        }),
      );

      expect(created).toEqual([
        {
          farmId: id,
          publishedOn: '2026-11-07',
          text: 'Café de altura cultivado bajo sombra.\nana@finca.com\n3001234567\n6088765432',
          photo: null,
        },
      ]);
    } finally {
      vi.useRealTimers();
    }
  });
});
