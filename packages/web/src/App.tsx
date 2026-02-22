import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTrpcClient } from "./trpc";
import { HomePage } from "./pages/HomePage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { ContactPage } from "./pages/ContactPage";
import { PageBySlug } from "./pages/PageBySlug";
import { Layout } from "./components/Layout";
import "./index.css";

const queryClient = new QueryClient();

function AppWithProviders() {
  const [trpcClient] = useState(() => createTrpcClient());
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/page/:slug" element={<PageBySlug />} />
          </Routes>
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default function App() {
  return <AppWithProviders />;
}
