import {Component, OnInit} from '@angular/core';
import {ContentScrollService} from '../service/content-scroll-service';

@Component({
  selector: 'pc-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  providers: [ContentScrollService],
})
export class ShellComponent implements OnInit {

  constructor(private scrollService: ContentScrollService) {
  }

  ngOnInit() {
  }

  onContentScroll(event: any) {
    this.scrollService.fireScroll(event);
  }
}
