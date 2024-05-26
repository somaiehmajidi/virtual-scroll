import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';
import { PostModel } from '../model/post.model';
import { PostVirtualScrollStrategy } from './post-virtual-scroll';

@Directive({
  selector: '[appVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (d: PostVirtualScrollDirective) => d._scrollStrategy,
      deps: [forwardRef(() => PostVirtualScrollDirective)],
    },
  ],
})
export class PostVirtualScrollDirective {
  _scrollStrategy = new PostVirtualScrollStrategy();

  private post: PostModel[] = [];

  @Input()
  set messages(value: PostModel[] | null) {
    if (value && this.post.length !== value.length) {
      this._scrollStrategy.updatePosts(value);
      this.post = value;
    }
  }
}
