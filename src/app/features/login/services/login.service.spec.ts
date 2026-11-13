import { LoginClock, LoginService } from './login.service';
import { hashPassword } from '../../../core/auth/password-hash';
import { SessionService } from '../../../core/session/session';

describe('LoginService', () => {
  it('durante el bloqueo, Cafe2026* de Ana tampoco entra; pasados 15 minutos, sí entra', async () => {
    localStorage.removeItem('od.session');
    localStorage.removeItem('od.login-attempts');
    let now = 0;
    const session = new SessionService();
    const service = new LoginService(
      {
        getAll: async () => [
          {
            id: 'demo-paraiso',
            email: 'ana@paraiso.com',
            ownerName: 'Ana Morales',
            farmName: 'Finca El Paraíso',
            passwordHash: await hashPassword('Cafe2026*'),
            verified: true,
          },
        ],
      } as never,
      { now: () => now } as LoginClock,
      session,
    );

    for (let attempt = 0; attempt < 4; attempt++) {
      expect((await service.signIn('ana@paraiso.com', 'incorrecta')).kind).toBe('invalid');
    }
    expect((await service.signIn('ana@paraiso.com', 'incorrecta')).kind).toBe('locked');
    expect((await service.signIn('ana@paraiso.com', 'Cafe2026*')).kind).toBe('locked');

    now = 899999;
    expect((await service.signIn('ana@paraiso.com', 'Cafe2026*')).kind).toBe('locked');

    now = 900000;
    expect((await service.signIn('ana@paraiso.com', 'Cafe2026*')).kind).toBe('success');
    expect(session.account()?.farmId).toBe('demo-paraiso');
  });
});
