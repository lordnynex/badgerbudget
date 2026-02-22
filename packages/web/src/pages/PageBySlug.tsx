import { useParams } from "react-router-dom";
import { trpc } from "../trpc";

export function PageBySlug() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = trpc.website.getPageBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  if (!slug) return <main className="p-6">Missing slug</main>;
  if (isLoading) return <main className="p-6">Loading…</main>;
  if (error || !page) return <main className="p-6">Page not found.</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <article>
        <h1 className="text-2xl font-semibold">{page.title}</h1>
        <div className="mt-6 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: page.body ?? "" }} />
      </article>
    </main>
  );
}
