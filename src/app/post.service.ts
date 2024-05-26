import { Injectable } from '@angular/core';
import { BehaviorSubject, take, withLatestFrom } from 'rxjs';
import { ApiService } from './api/api.service';
import { PostModel } from './model/post.model';

@Injectable()
export class PostService {
  posts$ = new BehaviorSubject<PostModel[]>([]);

  constructor(private api: ApiService) {}

  loadPosts() {
    this.api
      .getPosts$()
      .pipe(withLatestFrom(this.posts$), take(1))
      .subscribe(([apiMsgs, stateMsgs]) => {
        this.posts$.next([...stateMsgs, ...apiMsgs]);
      });
  }
}
