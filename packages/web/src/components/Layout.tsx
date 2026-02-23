import { Link } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <nav className="flex gap-4">
          <Link to="/" className="font-medium">
            Home
          </Link>
          <Link to="/blog" className="text-muted-foreground hover:text-foreground">
            Blog
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
