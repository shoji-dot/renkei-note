import PostForm from "./PostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return (
    <div>
      <h1 className="text-lg font-bold mb-4">投稿する</h1>
      <PostForm defaultType={type} />
    </div>
  );
}
