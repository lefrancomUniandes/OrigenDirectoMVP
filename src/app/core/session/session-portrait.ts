import { Injectable, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from, of, switchMap } from 'rxjs';
import { OrigenDirectoDb } from '../db/origen-directo.db';
import { SessionService } from './session';

export interface SessionPhoto {
  readonly type: string;
  readonly bytes: ArrayBuffer;
}

@Injectable({ providedIn: 'root' })
export class SessionPortrait {
  private readonly session = inject(SessionService);
  private readonly db = inject(OrigenDirectoDb);

  readonly photo = toSignal(
    toObservable(this.session.account).pipe(
      switchMap((account) => {
        if (!account) {
          return of(null);
        }
        const farmId = account.farmId;
        return from(
          liveQuery(async (): Promise<SessionPhoto | null> => {
            const farm = (await this.db.table('fincas').get(farmId)) as
              | { photos?: { type?: string; bytes?: ArrayBuffer }[] }
              | undefined;
            const photo = farm?.photos?.[0];
            if (!photo?.bytes) {
              return null;
            }
            return { type: photo.type || 'image/jpeg', bytes: photo.bytes };
          }),
        );
      }),
    ),
    { initialValue: null as SessionPhoto | null },
  );
}
