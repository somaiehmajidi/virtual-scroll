import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

const ActiveZone = 150; // pixels

@Component({
  selector: 'app-infinite-scroll',
  template: '',
})
export class InfiniteScrollComponent implements OnInit, OnDestroy {
  @Output() endReached = new EventEmitter<void>();

  private unlisten!: () => void;
  private endLock: boolean = false;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  // while the user scrolls down the list, emit the end reached to handle another APICALL for data
  ngOnInit() {
    const parent = this.elRef.nativeElement.parentElement;

    this.unlisten = this.renderer.listen(parent, 'scroll', (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop + target.clientHeight;
      const endReached = scrollTop + ActiveZone >= target.scrollHeight;

      if (endReached && !this.endLock) {
        this.endReached.emit();
        this.endLock = true;
      } else if (!endReached) {
        this.endLock = false;
      }
    });
  }

  ngOnDestroy() {
    this.unlisten();
  }
}
