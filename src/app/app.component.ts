import { Component } from '@angular/core';
import { PostService } from './post.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'post-feed';

  constructor(public postService: PostService) {
    this.postService.loadPosts();
  }
}
