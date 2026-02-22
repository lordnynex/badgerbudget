import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-4 md:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Satyrs M/C</h1>
        <p className="mt-2 text-muted-foreground">Welcome to our public site.</p>
        <nav className="mt-6 flex gap-4 justify-center">
          <Link to="/blog" className="text-primary underline">
            Blog
          </Link>
          <Link to="/contact" className="text-primary underline">
            Contact
          </Link>
        </nav>
      </div>
    </main>
  );
}
