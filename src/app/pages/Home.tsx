import { useNotes } from '../context/NotesContext';
import { useNavigate } from 'react-router';
import { Plus, ArrowRight } from 'lucide-react';

export function Home() {
  const { notes, createNote } = useNotes();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 animate-in fade-in duration-500">
      {notes.length === 0 ? (
        <div className="text-center mt-20 sm:mt-32">
          <h2 className="text-3xl font-bold text-neutral-100 mb-3 tracking-tight">Welcome to Block Notes</h2>
          <p className="text-neutral-400 mb-10 max-w-md mx-auto leading-relaxed text-lg">
            A minimal, block-based workspace for your thoughts. Everything is treated as a block. Start by creating your first note.
          </p>
          <button 
             onClick={() => {
               const id = createNote();
               navigate(`/note/${id}`);
             }}
             className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-black font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/20"
           >
             <Plus size={20} />
             Create your first note
           </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold text-neutral-100 tracking-tight">Home</h1>
          </div>
          <div className="space-y-4">
             {notes.map(note => (
               <div 
                 key={note.id}
                 onClick={() => navigate(`/note/${note.id}`)}
                 className="group p-5 rounded-xl bg-[#242424] border border-[#333] hover:border-orange-500/50 hover:bg-[#2c2c2c] transition-all cursor-pointer shadow-sm hover:shadow-orange-500/5"
               >
                 <div className="flex items-start justify-between">
                   <div>
                     <h3 className="text-xl font-semibold text-neutral-200 mb-1 group-hover:text-orange-500 transition-colors">
                       {note.title || 'Untitled'}
                     </h3>
                     <p className="text-sm text-neutral-500 flex items-center gap-2">
                       Last edited {new Date(note.lastEdited).toLocaleDateString()}
                     </p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 group-hover:bg-orange-500/10">
                     <ArrowRight size={16} className="text-orange-500" />
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
