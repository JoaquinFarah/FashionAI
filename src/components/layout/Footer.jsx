
import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-16 py-8 border-t border-cyber-border/30 text-center text-xs text-cyber-muted">
      <p>Fashion AI Nexus &copy; {new Date().getFullYear()}. All rights reserved.</p>
      <p className="mt-1">Data stored securely with Supabase.</p>
      <div className="mt-3 h-1 w-20 bg-gradient-to-r from-neon-pink to-neon-cyan mx-auto rounded-full opacity-50"></div>
    </footer>
  );
};

export default Footer;
  