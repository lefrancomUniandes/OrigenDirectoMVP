import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { OriginFarm, OriginPhoto } from '../data/origin-farm.repository';
import { OriginService } from '../services/origin.service';

@Component({
  selector: 'app-origin-page',
  imports: [RouterLink],
  providers: [OriginService],
  templateUrl: './origin-page.html',
  styleUrl: './origin-page.scss',
})
export class OriginPage {
  readonly origin = inject(OriginService);
  private readonly sanitizer = inject(DomSanitizer);

  photoSrc(photo: OriginPhoto): string {
    const copy = new Uint8Array(photo.bytes);
    return URL.createObjectURL(new Blob([copy], { type: photo.type }));
  }

  mapLink(farm: OriginFarm): SafeResourceUrl {
    const query = encodeURIComponent(`${farm.municipality}, ${farm.department}, Colombia`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`,
    );
  }
}
