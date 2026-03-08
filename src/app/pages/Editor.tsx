import { useParams, useNavigate } from 'react-router';
import { useNotes } from '../context/NotesContext';
import { useCallback, useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BlockRow } from '../components/BlockRow';
import { Trash2, Calendar, FileText } from 'lucide-react';

export function Editor() {
  const { id } = useParams();
  const { notes, updateNote, deleteNote } = useNotes();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  const note = notes.find(n => n.id === id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
        <FileText size={48} className="text-neutral-700" />
        <p className="text-xl font-medium">Note not found or deleted.</p>
        <button 
          onClick={() => navigate('/')}
          className="text-orange-500 hover:text-orange-400 hover:underline transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNote(note.id, { title: e.target.value });
  };

  const setBlocks = useCallback((blocks: any) => {
    updateNote(note.id, { blocks });
  }, [note.id, updateNote]);

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragBlock = note.blocks[dragIndex];
    const newBlocks = [...note.blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, dragBlock);
    setBlocks(newBlocks);
  }, [note.blocks, setBlocks]);

  const updateBlock = useCallback((blockId: string, updates: any) => {
    const newBlocks = note.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
    setBlocks(newBlocks);
  }, [note.blocks, setBlocks]);

  const addBlock = useCallback((index: number, type = 'paragraph') => {
    const newBlock = { id: Math.random().toString(36).substring(2, 9), type: type as any, content: '' };
    const newBlocks = [...note.blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
    
    setTimeout(() => {
      const el = document.getElementById(`block-${newBlock.id}`);
      if (el) el.focus();
    }, 50);
  }, [note.blocks, setBlocks]);

  const removeBlock = useCallback((index: number) => {
    if (note.blocks.length === 1) {
      updateBlock(note.blocks[0].id, { content: '', type: 'paragraph' });
      return;
    }
    const newBlocks = [...note.blocks];
    const prevBlockId = newBlocks[Math.max(0, index - 1)].id;
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
    
    setTimeout(() => {
      const el = document.getElementById(`block-${prevBlockId}`);
      if (el) {
        el.focus();
        if (el instanceof HTMLTextAreaElement) {
          el.selectionStart = el.value.length;
          el.selectionEnd = el.value.length;
        }
      }
    }, 50);
  }, [note.blocks, setBlocks, updateBlock]);

  const handleDeleteNote = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      navigate('/');
    }
  };

  if (!mounted) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 md:px-12 pb-40 animate-in fade-in duration-300">
        <div className="group flex items-start justify-between mb-8 pl-12 pr-4 relative">
          <div className="flex-1 space-y-3 w-full relative">
            <textarea
              className="w-full text-5xl md:text-5xl font-bold text-neutral-100 placeholder:text-neutral-700 bg-transparent outline-none flex-1 leading-tight tracking-tight selection:bg-orange-500/30 resize-none overflow-hidden m-0 p-0"
              placeholder="Untitled"
              value={note.title}
              onChange={(e) => {
                handleTitleChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              rows={1}
            />
            {note.title && (
               <div className="text-sm text-neutral-500 flex items-center gap-1.5 font-medium">
                 <Calendar size={14} />
                 Last edited {new Date(note.lastEdited).toLocaleString()}
               </div>
            )}
          </div>
          
          <button 
            onClick={handleDeleteNote}
            className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-neutral-500 hover:text-red-500 hover:bg-[#242424] rounded-md absolute right-0 top-2 shrink-0"
            title="Delete note"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="space-y-[1px]">
          {note.blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              index={index}
              block={block}
              moveBlock={moveBlock}
              updateBlock={updateBlock}
              addBlock={addBlock}
              removeBlock={removeBlock}
              isOnlyBlock={note.blocks.length === 1}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
