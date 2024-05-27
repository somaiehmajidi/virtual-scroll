import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { PostModel } from '../model/post.model';
import { generatePosts } from './generator';

@Injectable()
export class ApiService {
  // Call generate posts method with a half second delay just like real APICALL
  getPosts$(pageSize: number = 5): Observable<PostModel[]> {
    return of(generatePosts(pageSize)).pipe(delay(500));
  }
}
