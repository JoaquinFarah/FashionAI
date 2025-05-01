
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/AuthPage";
import GalleryApp from "@/components/GalleryApp";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function App() {
  const { session, loading, handleLogout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-secondary">
        <Loader2 className="h-12 w-12 animate-spin" />
        <span className="ml-4 text-lg">Initializing Nexus Interface...</span>
      </div>
    );
  }

  return (
    <>
      {session ? <GalleryApp session={session} handleLogout={handleLogout} /> : <AuthPage />}
      <Toaster />
    </>
  );
}

export default App;
  