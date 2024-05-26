import { PostModel } from '../model/post.model';

const Padding = 24 * 2;
const NameHeight = 21;
const DateHeight = 14;
const PostMarginTop = 14;
const PostRowHeight = 24;
const PostRowCharCount = 35;
const TagsMarginTop = 16;
const TagsRowHeight = 36;
const TagsPerRow = 3;

export const PostHeightPredictor = (p: PostModel) => {
  const textHeight =
    Math.ceil(p.text.length / PostRowCharCount) * PostRowHeight;

  const tagsHeight = p.tags.length
    ? TagsMarginTop + Math.ceil(p.tags.length / TagsPerRow) * TagsRowHeight
    : 0;

  return (
    Padding + NameHeight + DateHeight + PostMarginTop + textHeight + tagsHeight
  );
};
