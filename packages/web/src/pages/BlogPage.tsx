import { Link } from "react-router-dom";
import { trpc } from "../trpc";

export function BlogPage() {
  const { data: posts = [], isLoading } = trpc.website.getBlogPublished.useQuery();

  if (isLoading) return <main className="p-6">Loading…</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Blog</h1>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/blog/${post.slug}`} className="text-primary underline">
              {post.title}
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="text-muted-foreground">No posts yet.</li>}
      </ul>
    </main>
  );
}
