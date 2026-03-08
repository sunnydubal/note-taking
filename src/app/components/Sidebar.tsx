import { NavLink, useNavigate } from 'react-router';
import { useNotes } from '../context/NotesContext';
import { Plus, FileText, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { notes, createNote } = useNotes();
  const navigate = useNavigate();

  const handleNewNote = () => {
    const id = createNote();
    navigate(`/note/${id}`);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#242424] border-r border-[#333] flex flex-col
        transition-transform duration-300 ease-out md:translate-x-0 md:static md:w-64 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-4 flex items-center justify-between border-b border-[#333]">
           <NavLink to="/" onClick={onClose} className="flex items-center gap-3 text-neutral-100 font-semibold hover:text-orange-500 transition-colors">
             <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center">
               <FileText size={16} className="text-black" />
             </div>
             Block Notes
           </NavLink>
           <button onClick={onClose} className="md:hidden text-neutral-400 hover:text-neutral-100 transition-colors p-1">
             <X size={20} />
           </button>
         </div>

         <div className="p-4 border-b border-[#333]/50">
           <button 
             onClick={handleNewNote}
             className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-md transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-[0.98]"
           >
             <Plus size={18} strokeWidth={2.5} />
             New note
           </button>
         </div>

         <div className="flex-1 overflow-y-auto py-4">
           <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
             Your Notes
           </div>
           <div className="space-y-0.5 px-3">
             {notes.map(note => (
               <NavLink 
                 key={note.id}
                 to={`/note/${note.id}`}
                 onClick={() => onClose()}
                 className={({ isActive }) => `
                   block px-3 py-2 rounded-md text-sm transition-colors group relative
                   ${isActive 
                     ? 'bg-neutral-800 text-orange-500 font-medium' 
                     : 'text-neutral-300 hover:bg-neutral-800/70 hover:text-neutral-100'}
                 `}
               >
                 <div className="truncate pr-4">{note.title || 'Untitled'}</div>
                 <div className={`text-xs mt-0.5 ${note.title ? 'text-neutral-500' : 'text-neutral-600'}`}>
                   {new Date(note.lastEdited).toLocaleDateString()}
                 </div>
               </NavLink>
             ))}
             {notes.length === 0 && (
               <div className="text-sm text-neutral-500 px-3 py-2 italic">
                 No notes yet
               </div>
             )}
           </div>
         </div>
      </div>
    </>
  );
}
