import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OriginFarm } from '../data/origin-farm.repository';
import { OriginService } from '../services/origin.service';

@Component({
  selector: 'app-origin-page',
  providers: [OriginService],
  templateUrl: './origin-page.html',
  styleUrl: './origin-page.scss',
})
export class OriginPage {
  readonly origin = inject(OriginService);
  private readonly sanitizer = inject(DomSanitizer);

  mapLink(farm: OriginFarm): SafeResourceUrl {
    const query = encodeURIComponent(`${farm.municipality}, ${farm.department}, Colombia`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`,
    );
  }
}
