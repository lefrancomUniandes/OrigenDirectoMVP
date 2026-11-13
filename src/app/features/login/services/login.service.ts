import { Injectable } from '@angular/core';
import { hashPassword } from '../../../core/auth/password-hash';
import { SessionService } from '../../../core/session/session';
import { LoginFarmRepository } from '../data/login-farm.repository';

export type LoginResult = { kind: 'success' } | { kind: 'invalid' } | { kind: 'locked' };

const ATTEMPTS_KEY = 'od.login-attempts';
const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILED = 5;

interface AttemptState {
  count: number;
  lockedUntil: number | null;
}

@Injectable({ providedIn: 'root' })
export class LoginClock {
  now(): number {
    return Date.now();
  }
}

function readAttempts(): Record<string, AttemptState> {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Record<string, AttemptState>;
  } catch {
    return {};
  }
}

function writeAttempts(attempts: Record<string, AttemptState>): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private readonly farms: LoginFarmRepository,
    private readonly clock: LoginClock,
    private readonly session: SessionService,
  ) {}

  async signIn(email: string, password: string): Promise<LoginResult> {
    const key = email.trim().toLowerCase();
    const now = this.clock.now();
    const attempts = readAttempts();
    const state = attempts[key] ?? { count: 0, lockedUntil: null };
    if (state.lockedUntil !== null && now < state.lockedUntil) {
      return { kind: 'locked' };
    }
    const count = state.lockedUntil !== null ? 0 : state.count;
    const farm = (await this.farms.getAll()).find(
      (row) => row.email.trim().toLowerCase() === key && row.verified === true,
    );
    const matches = farm !== undefined && farm.passwordHash === (await hashPassword(password));
    if (!matches || !farm) {
      const next = count + 1;
      if (next >= MAX_FAILED) {
        attempts[key] = { count: 0, lockedUntil: now + LOCK_MS };
        writeAttempts(attempts);
        return { kind: 'locked' };
      }
      attempts[key] = { count: next, lockedUntil: null };
      writeAttempts(attempts);
      return { kind: 'invalid' };
    }
    delete attempts[key];
    writeAttempts(attempts);
    this.session.start({
      farmId: farm.id,
      ownerName: farm.ownerName,
      farmName: farm.farmName,
    });
    return { kind: 'success' };
  }
}
