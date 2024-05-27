import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { distinctUntilChanged, Observable, Subject } from 'rxjs';
import { PostModel } from '../model/post.model';
import { PostHeightPredictor } from './post-height-predictor';

const PaddingAbove = 5;
const PaddingBelow = 5;

interface PostHeight {
  value: number;
  source: 'predicted' | 'actual';
}

export class PostVirtualScrollStrategy implements VirtualScrollStrategy {
  _scrolledIndexChange$ = new Subject<number>();
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange$.pipe(
    distinctUntilChanged(),
  );

  private _viewport!: CdkVirtualScrollViewport | null;
  private _wrapper!: ChildNode | null;
  private _post: PostModel[] = [];
  private _heightCache = new Map<string, PostHeight>();

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._wrapper = viewport.getElementRef().nativeElement.childNodes[0];

    if (this._post) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
      this._updateRenderedRange();
    }
  }

  detach(): void {
    this._viewport = null;
    this._wrapper = null;
  }

  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._getTotalHeight());
    this._updateRenderedRange();
  }

  onContentRendered(): void {}

  onRenderedOffsetChanged(): void {}

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this._viewport) {
      return;
    }

    const offset = this._getOffsetByPostIdx(index);
    this._viewport.scrollToOffset(offset, behavior);
  }

  // Update the posts array.
  updatePosts(post: PostModel[]) {
    this._post = post;

    if (this._viewport) {
      this._viewport.checkViewportSize();
    }
  }

  // Returns the total height of the scrollable container given the size of the elements.
  private _getTotalHeight(): number {
    return this._measurePostHeight(this._post);
  }

  //  Returns the offset relative to the top of the container by a provided post index.
  private _getOffsetByPostIdx(idx: number): number {
    return this._measurePostHeight(this._post.slice(0, idx));
  }

  // Returns the post index by a provided offset.
  private _getPostIdxByOffset(offset: number): number {
    let accumOffset = 0;

    for (let i = 0; i < this._post.length; i++) {
      const msg = this._post[i];
      const msgHeight = this._getPostHeight(msg);
      accumOffset += msgHeight;

      if (accumOffset >= offset) {
        return i;
      }
    }

    return 0;
  }

  // Measure each post height.
  private _measurePostHeight(post: PostModel[]): number {
    return post.map((p) => this._getPostHeight(p)).reduce((a, c) => a + c, 0);
  }

  // Get the number of renderable posts withing the viewport by given post index.
  private _determinePostsCountInViewport(startIdx: number): number {
    if (!this._viewport) {
      return 0;
    }

    let totalSize = 0;
    const viewportSize = this._viewport.getViewportSize();

    for (let i = startIdx; i < this._post.length; i++) {
      const msg = this._post[i];
      totalSize += this._getPostHeight(msg);

      if (totalSize >= viewportSize) {
        return i - startIdx + 1;
      }
    }

    return 0;
  }

  // Update the range of rendered posts.
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const scrollIdx = this._getPostIdxByOffset(scrollOffset);
    const dataLength = this._viewport.getDataLength();
    const renderedRange = this._viewport.getRenderedRange();
    const range = {
      start: renderedRange.start,
      end: renderedRange.end,
    };

    range.start = Math.max(0, scrollIdx - PaddingAbove);
    range.end = Math.min(
      dataLength,
      scrollIdx + this._determinePostsCountInViewport(scrollIdx) + PaddingBelow,
    );

    this._viewport.setRenderedRange(range);
    this._viewport.setRenderedContentOffset(
      this._getOffsetByPostIdx(range.start),
    );
    this._scrolledIndexChange$.next(scrollIdx);

    this._updateHeightCache();
  }

  // Get the height of a given post. It could be either predicted or actual. Results are memoized.
  private _getPostHeight(m: PostModel): number {
    let height = 0;
    const cachedHeight = this._heightCache.get(m.id);

    if (!cachedHeight) {
      height = PostHeightPredictor(m);
      this._heightCache.set(m.id, { value: height, source: 'predicted' });
    } else {
      height = cachedHeight.value;
    }

    return height;
  }

  // Update the height cache with the actual height of the rendered post components.
  private _updateHeightCache() {
    if (!this._wrapper || !this._viewport) {
      return;
    }

    const nodes = this._wrapper.childNodes;
    let cacheUpdated: boolean = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;

      // Check if the node is an app-post component
      if (node && node.nodeName === 'APP-POST') {
        // Get the post Id
        const id = node.getAttribute('data-id') as string;
        const cachedHeight = this._heightCache.get(id);

        // If the existing height is predicted, Update the height cache
        if (!cachedHeight || cachedHeight.source !== 'actual') {
          const height = node.clientHeight;

          this._heightCache.set(id, { value: height, source: 'actual' });
          cacheUpdated = true;
        }
      }
    }

    // If there is a cache change, Reset the total content size only
    if (cacheUpdated) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
    }
  }
}
