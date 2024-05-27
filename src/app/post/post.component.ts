import { Component, Input } from '@angular/core';
import { PostModel } from '../model/post.model';

const expand = (char: number) => {
  const min = 65;
  const max = 90;
  const range = max - min;
  const pos = char - min;

  return Math.round(255 * (pos / range));
};

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent {
  @Input() post!: PostModel;

  // get user's name/family initials to use as an avatar
  get initials() {
    return this.post.title
      .split(' ')
      .map((name: string) => name[0])
      .join('');
  }

  // generate color rgb code for user avatar
  get color() {
    const c = this.post.title.toUpperCase();
    return `rgb(${expand(c.charCodeAt(0))}, ${expand(
      c.charCodeAt(1),
    )}, ${expand(c.charCodeAt(2))})`;
  }
}
