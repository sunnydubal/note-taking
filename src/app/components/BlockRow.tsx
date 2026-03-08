import { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { Block } from '../context/NotesContext';

const ItemTypes = { BLOCK: 'block' };

interface BlockRowProps {
  block: Block;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  addBlock: (index: number, type?: string) => void;
  removeBlock: (index: number) => void;
  isOnlyBlock: boolean;
}

export function BlockRow({ block, index, moveBlock, updateBlock, addBlock, removeBlock, isOnlyBlock }: BlockRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  dragPreview(drop(ref));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextType = (block.type === 'bullet' || block.type === 'todo') ? block.type : 'paragraph';
      addBlock(index + 1, nextType);
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      if (block.type !== 'paragraph') {
        updateBlock(block.id, { type: 'paragraph' });
      } else {
        removeBlock(index);
      }
    } else if (e.key === 'ArrowUp') {
      const textareas = document.querySelectorAll('.block-textarea');
      const prev = textareas[index - 1] as HTMLTextAreaElement;
      if (prev) {
        e.preventDefault();
        prev.focus();
        prev.setSelectionRange(prev.value.length, prev.value.length);
      }
    } else if (e.key === 'ArrowDown') {
      const textareas = document.querySelectorAll('.block-textarea');
      const next = textareas[index + 1] as HTMLTextAreaElement;
      if (next) {
        e.preventDefault();
        next.focus();
        next.setSelectionRange(next.value.length, next.value.length);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    
    // Markdown shortcuts triggers when space is typed after a trigger keyword
    if (val === '# ') { updateBlock(block.id, { type: 'h1', content: '' }); return; }
    if (val === '## ') { updateBlock(block.id, { type: 'h2', content: '' }); return; }
    if (val === '### ') { updateBlock(block.id, { type: 'h3', content: '' }); return; }
    if (val === '- ' || val === '* ') { updateBlock(block.id, { type: 'bullet', content: '' }); return; }
    if (val === '[] ') { updateBlock(block.id, { type: 'todo', content: '' }); return; }

    updateBlock(block.id, { content: val });
  };

  const getBlockStyles = () => {
    switch (block.type) {
      case 'h1': return 'text-4xl font-bold mt-8 mb-2 text-neutral-100 placeholder:text-neutral-700 placeholder:font-bold';
      case 'h2': return 'text-2xl font-semibold mt-6 mb-1 text-neutral-200 placeholder:text-neutral-700 placeholder:font-semibold';
      case 'h3': return 'text-xl font-medium mt-4 mb-1 text-neutral-300 placeholder:text-neutral-700 placeholder:font-medium';
      case 'bullet': return 'text-base text-neutral-200 mt-1 mb-1';
      case 'todo': return `text-base mt-1 mb-1 ${block.checked ? 'text-neutral-500 line-through' : 'text-neutral-200'}`;
      default: return 'text-base text-neutral-200 py-1 min-h-[1.5em]';
    }
  };

  const getPlaceholder = () => {
    if (isOnlyBlock && block.content === '') return 'Type / to insert blocks';
    if (block.type === 'h1') return 'Heading 1';
    if (block.type === 'h2') return 'Heading 2';
    if (block.type === 'h3') return 'Heading 3';
    return '';
  };

  return (
    <div 
      ref={ref}
      className={`group relative flex items-start px-2 py-0.5 -mx-2 rounded-lg transition-colors
        ${isFocused ? 'bg-[#242424]/50' : 'hover:bg-[#242424]/40'}
        ${isDragging ? 'opacity-30' : 'opacity-100'}
      `}
      data-handler-id={handlerId}
    >
      {/* Left Accent Bar on Focus */}
      <div 
        className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm bg-orange-500 transition-opacity
          ${isFocused ? 'opacity-100' : 'opacity-0'}
        `} 
      />

      {/* Drag Handle */}
      <div 
        ref={drag}
        className={`w-8 flex items-center justify-center pt-2.5 shrink-0 cursor-grab active:cursor-grabbing
          text-neutral-600 transition-all duration-200 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100
          hover:text-neutral-300 hover:bg-neutral-800 rounded-md mx-1 self-start
          ${isFocused ? 'text-orange-500/80' : ''}
        `}
        contentEditable={false}
      >
        <GripVertical size={16} />
      </div>

      {/* Block Content */}
      <div className="flex-1 flex items-start relative ml-1 pt-[2px]">
        {block.type === 'bullet' && (
          <div className="w-6 shrink-0 pt-1 flex justify-center text-neutral-400 font-bold select-none">
            •
          </div>
        )}
        
        {block.type === 'todo' && (
          <div className="w-8 shrink-0 pt-1 flex justify-center select-none">
            <input 
              type="checkbox"
              checked={!!block.checked}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              className="mt-[3px] w-[18px] h-[18px] rounded-[4px] border border-neutral-600 bg-[#242424] transition-all
                checked:bg-orange-500 checked:border-orange-500 
                focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] 
                appearance-none cursor-pointer flex items-center justify-center relative
                hover:border-orange-500/50
                after:content-[''] after:absolute after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] 
                after:border-r-[2.5px] after:border-b-[2.5px] after:border-black after:rotate-45 after:hidden
                checked:after:block
              "
            />
          </div>
        )}

        <textarea
          id={`block-${block.id}`}
          ref={textareaRef}
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={getPlaceholder()}
          className={`block-textarea w-full resize-none overflow-hidden bg-transparent outline-none m-0 p-0 placeholder:text-neutral-600/60 leading-relaxed ${getBlockStyles()}`}
          rows={1}
        />
      </div>
    </div>
  );
}
