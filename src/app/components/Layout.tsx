import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Menu, Loader2 } from 'lucide-react';
import { useNotes } from '../context/NotesContext';

export function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading } = useNotes();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] items-center justify-center text-neutral-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-neutral-100 overflow-hidden font-sans antialiased selection:bg-orange-500/30 selection:text-orange-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header Drawer */}
        <div className="md:hidden h-14 border-b border-[#333] flex items-center px-4 bg-[#1a1a1a]/80 backdrop-blur z-30 shrink-0 shadow-sm shadow-black/20">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-400 hover:text-neutral-100 p-1.5 -ml-1.5 rounded-md hover:bg-[#333] transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="ml-3 font-semibold text-neutral-200">Block Notes</div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#1a1a1a]">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
