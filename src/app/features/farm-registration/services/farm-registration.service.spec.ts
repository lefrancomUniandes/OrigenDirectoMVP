import { emptyFarmDraft } from '../data/farm-draft';
import { FarmRegistrationService } from './farm-registration.service';

describe('FarmRegistrationService', () => {
  it('register guarda la finca y devuelve un número OD-año-######', async () => {
    const create = vi.fn().mockResolvedValue('unused');
    const service = new FarmRegistrationService({ create } as any);
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
    const service = new FarmRegistrationService(farms as never);

    const id = await service.register(emptyFarmDraft({ farmName: 'Finca La Esperanza' }));
    const saved = await farms.getById(id);

    expect(id).toMatch(/^OD-\d{4}-\d{6}$/);
    expect(saved?.id).toBe(id);
    expect(saved?.farmName).toBe('Finca La Esperanza');
  });
});
