import { Component, inject, signal } from '@angular/core';
import { Publication } from '../../../core/data/publication.repository';
import { ProfileFarm, ProfilePhoto } from '../data/profile-farm.repository';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile-page',
  providers: [ProfileService],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  readonly profile = inject(ProfileService);
  readonly openPost = signal<Publication | null>(null);
  readonly notice = signal('');
  readonly editing = signal(false);

  photoSrc(photo: ProfilePhoto): string {
    const copy = new Uint8Array(photo.bytes);
    return URL.createObjectURL(new Blob([copy], { type: photo.type }));
  }

  open(post: Publication): void {
    this.openPost.set(post);
  }

  close(): void {
    this.openPost.set(null);
  }

  like(): void {
    this.notice.set('Trabajo en progreso');
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  filled(value: string): boolean {
    return value.trim().length > 0;
  }

  place(farm: ProfileFarm): string {
    return [farm.municipality, farm.department].map((part) => part.trim()).filter((part) => part).join(', ');
  }

  save(event: Event): void {
    const form = (event.currentTarget as HTMLElement).closest('form');
    if (!form) {
      return;
    }
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? '');
    const file = (form.querySelector('#avatar') as HTMLInputElement).files?.[0];
    const changes: Partial<Omit<ProfileFarm, 'id'>> = {
      farmName: text('farmName'),
      ownerName: text('ownerName'),
      municipality: text('municipality'),
      department: text('department'),
      bio: text('bio'),
      experience: text('experience'),
      mobile: text('mobile'),
      village: text('village'),
      area: text('area'),
      areaUnit: text('areaUnit'),
      altitude: text('altitude'),
      varieties: text('varieties')
        .split(',')
        .map((variety) => variety.trim())
        .filter((variety) => variety.length > 0),
      otherVariety: text('otherVariety'),
      email: text('email'),
      phoneAreaCode: text('phoneAreaCode'),
      landline: text('landline'),
    };
    void this.store(changes, file);
  }

  private async store(
    changes: Partial<Omit<ProfileFarm, 'id'>>,
    file: File | undefined,
  ): Promise<void> {
    if (file && file.size > 0) {
      const rest = this.profile.farm()?.photos.slice(1) ?? [];
      changes = {
        ...changes,
        photos: [{ type: file.type, bytes: await file.arrayBuffer() }, ...rest],
      };
    }
    await this.profile.update(changes);
    this.editing.set(false);
  }
}
