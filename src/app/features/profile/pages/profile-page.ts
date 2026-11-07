import { Component, inject, signal } from '@angular/core';
import { Publication } from '../../../core/data/publication.repository';
import { ProfilePhoto } from '../data/profile-farm.repository';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile-page',
  providers: [ProfileService],
  templateUrl: './profile-page.html',
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

  like(): void {
    this.notice.set('Trabajo en progreso');
  }

  startEdit(): void {
    this.editing.set(true);
  }
}
