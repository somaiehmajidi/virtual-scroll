import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppComponent } from './app.component';
import { PostComponent } from './post/post.component';
import { ApiService } from './api/api.service';
import { PostService } from './post.service';
import { PostVirtualScrollDirective } from './virtual-scroll/post-virtual-scroll.directive';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';

@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    PostVirtualScrollDirective,
    InfiniteScrollComponent,
  ],
  imports: [BrowserModule, ScrollingModule],
  providers: [ApiService, PostService],
  bootstrap: [AppComponent],
})
export class AppModule {}
