
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const userEmail = user?.email;
  const userName = user?.user_metadata?.full_name;

  return (
     <header className="relative text-center mb-10 md:mb-16 pt-8">
        {user && (
           <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 right-4 flex items-center space-x-3 bg-card/50 backdrop-blur-sm p-2 rounded-lg border border-cyber-border"
           >
              <span className="text-xs text-cyber-muted hidden sm:inline-flex items-center">
                 <User className="w-3 h-3 mr-1 text-secondary" />
                 {userName || userEmail}
              </span>
              <Button
                 variant="ghost"
                 size="sm"
                 onClick={onLogout}
                 className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                 title="Logout"
              >
                 <LogOut className="h-4 w-4" />
                 <span className="ml-1 hidden md:inline">Logout</span>
              </Button>
           </motion.div>
        )}

       <motion.h1
         className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3
                    bg-gradient-to-r from-neon-pink via-purple-500 to-neon-cyan
                    bg-clip-text text-transparent animate-neon-glow"
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 100 }}
       >
         Fashion AI Nexus
       </motion.h1>
       <motion.p
         className="text-cyber-muted text-sm md:text-base max-w-2xl mx-auto"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3, duration: 0.5 }}
       >
         {user ? "Upload, analyze, and curate your ultimate style library." : "Authenticate to access the Nexus."}
       </motion.p>
     </header>
  );
};

export default Header;
   