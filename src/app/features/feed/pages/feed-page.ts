import { Component, inject, signal } from '@angular/core';
import { FeedPhoto } from '../data/feed-farm.repository';
import { FeedService } from '../services/feed.service';

@Component({
  selector: 'app-feed-page',
  styleUrl: './feed-page.scss',
  templateUrl: './feed-page.html',
})
export class FeedPage {
  readonly feed = inject(FeedService);
  readonly loading = signal(true);
  readonly novedadIndex = signal(0);

  constructor() {
    setTimeout(() => this.loading.set(false), 1000);
  }

  photoSrc(photo: FeedPhoto): string {
    const copy = new Uint8Array(photo.bytes);
    return URL.createObjectURL(new Blob([copy], { type: photo.type }));
  }

  nextNovedad(): void {
    const last = this.feed.novedades().length - 1;
    this.novedadIndex.update((index) => Math.min(index + 1, Math.max(last, 0)));
  }

  previousNovedad(): void {
    this.novedadIndex.update((index) => Math.max(index - 1, 0));
  }
}
