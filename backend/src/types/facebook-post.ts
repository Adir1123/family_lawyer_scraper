/** Raw shape from Apify — fields vary by actor version */
export interface RawFacebookPost {
  postId?: string;
  id?: string;
  authorName?: string;
  user?: { name?: string };
  text?: string;
  message?: string;
  timestamp?: string;
  date?: string;
  url?: string;
  postUrl?: string;
  likesCount?: number;
  reactions?: number;
  commentsCount?: number;
  comments?: number;
  groupUrl?: string;
}

/** Normalized internal type */
export interface FacebookPost {
  postId: string;
  authorName: string;
  text: string;
  timestamp: string;
  url: string;
  reactions: number;
  comments: number;
  groupUrl: string;
}
