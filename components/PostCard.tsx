import Link from "next/link";
import { POST_TYPES, POST_CATEGORIES, IDEA_STATUSES, labelOf } from "@/lib/types";

type PostCardProps = {
  id: string;
  type: string;
  category?: string | null;
  title: string;
  body: string;
  status?: string | null;
  authorName?: string | null;
  createdAt: Date | string;
  thumbnailUrl?: string | null;
  compact?: boolean;
};

export default function PostCard({
  id,
  type,
  category,
  title,
  body,
  status,
  authorName,
  createdAt,
  thumbnailUrl,
  compact = false,
}: PostCardProps) {
  const date = new Date(createdAt);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

  if (compact) {
    return (
      <Link
        href={`/posts/${id}`}
        className="block bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
      >
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="w-full h-28 object-cover" />
        )}
        <div className="p-2">
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {labelOf(POST_TYPES, type)}
          </span>
          <h3 className="font-medium text-sm mt-1 line-clamp-2">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{authorName ?? "不明"} ・ {dateStr}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/posts/${id}`}
      className="block bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex">
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="w-24 h-24 object-cover flex-shrink-0" />
        )}
        <div className="p-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {labelOf(POST_TYPES, type)}
            </span>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {labelOf(POST_CATEGORIES, category)}
              </span>
            )}
            {status && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {labelOf(IDEA_STATUSES, status)}
              </span>
            )}
          </div>
          <h3 className="font-medium truncate">{title}</h3>
          <p className="text-sm text-gray-500 truncate">{body}</p>
          <p className="text-xs text-gray-400 mt-1">
            {authorName ?? "不明"} ・ {dateStr}
          </p>
        </div>
      </div>
    </Link>
  );
}
