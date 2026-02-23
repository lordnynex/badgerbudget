import { useParams, Link } from "react-router-dom";
import { trpc } from "../trpc";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = trpc.website.getBlogBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  if (!slug) return <main className="p-6">Missing slug</main>;
  if (isLoading) return <main className="p-6">Loading…</main>;
  if (error || !post) return <main className="p-6">Post not found.</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Link to="/blog" className="text-primary underline text-sm mb-4 inline-block">
        ← Blog
      </Link>
      <article>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        {post.excerpt && <p className="mt-2 text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-6 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.body ?? "" }} />
      </article>
    </main>
  );
}
