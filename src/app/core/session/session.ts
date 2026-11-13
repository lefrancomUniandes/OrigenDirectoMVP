import { Injectable, computed, signal } from '@angular/core';

export interface SessionAccount {
  farmId: string;
  ownerName: string;
  farmName: string;
}

const STORAGE_KEY = 'od.session';

function readAccount(): SessionAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const value = JSON.parse(raw) as SessionAccount;
    if (!value?.farmId || !value.ownerName || !value.farmName) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly accountState = signal<SessionAccount | null>(readAccount());
  readonly account = this.accountState.asReadonly();
  readonly signedIn = computed(() => this.accountState() !== null);

  start(account: SessionAccount): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    this.accountState.set(account);
  }

  end(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.accountState.set(null);
  }
}
