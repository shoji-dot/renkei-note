import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { POST_TYPES, POST_CATEGORIES, IDEA_STATUSES, labelOf } from "@/lib/types";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, session] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { author: true, images: true } }),
    requireSession(),
  ]);
  if (!post) notFound();

  const user = session.user as any;
  const canDelete = post.authorId === user.memberId || user.role === "admin";

  const date = new Date(post.createdAt);

  return (
    <article className="bg-white rounded-xl border overflow-hidden">
      {post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-0.5">
          {post.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={img.imageUrl} alt="" className="w-full h-48 object-cover" />
          ))}
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {labelOf(POST_TYPES, post.type)}
          </span>
          {post.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {labelOf(POST_CATEGORIES, post.category)}
            </span>
          )}
          {post.status && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {labelOf(IDEA_STATUSES, post.status)}
            </span>
          )}
        </div>
        <h1 className="text-lg font-bold">{post.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            投稿者: {post.author?.name ?? "不明"} ・ {date.getFullYear()}/{date.getMonth() + 1}/{date.getDate()}
          </p>
          {canDelete && (
            <div className="flex gap-2">
              <Link
                href={`/posts/${post.id}/edit`}
                className="text-xs px-3 py-1.5 border rounded-lg text-gray-600"
              >
                編集
              </Link>
              <DeleteButton postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
