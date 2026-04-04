import { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Type, Heading1, Heading2, Heading3, List, CheckSquare, Copy, Trash2, Files } from 'lucide-react';
import { Block } from '../context/NotesContext';

const ItemTypes = { BLOCK: 'block' };

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Text',      description: 'Plain text paragraph',       Icon: Type },
  { type: 'h1',        label: 'Heading 1', description: 'Large section heading',       Icon: Heading1 },
  { type: 'h2',        label: 'Heading 2', description: 'Medium section heading',      Icon: Heading2 },
  { type: 'h3',        label: 'Heading 3', description: 'Small section heading',       Icon: Heading3 },
  { type: 'bullet',    label: 'Bullet',    description: 'Simple bullet list item',     Icon: List },
  { type: 'todo',      label: 'To-do',     description: 'Track tasks with a checkbox', Icon: CheckSquare },
];

interface BlockRowProps {
  block: Block;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  addBlock: (index: number, type?: string) => void;
  removeBlock: (index: number) => void;
  duplicateBlock: (index: number) => void;
  isOnlyBlock: boolean;
}

export function BlockRow({
  block, index, moveBlock, updateBlock, addBlock, removeBlock, duplicateBlock, isOnlyBlock
}: BlockRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashHighlight, setSlashHighlight] = useState(0);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);

  // ── Drag & Drop ────────────────────────────────────────────────
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
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

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  // ── Auto-resize ────────────────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  // ── Close menus on outside click ───────────────────────────────
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false);
      }
      if (blockMenuRef.current && !blockMenuRef.current.contains(e.target as Node)) {
        setBlockMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // ── Slash menu actions ─────────────────────────────────────────
  const selectSlashType = (type: string) => {
    updateBlock(block.id, { type: type as Block['type'], content: '' });
    setSlashMenuOpen(false);
    setSlashHighlight(0);
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  // ── Block menu actions ─────────────────────────────────────────
  const handleTurnInto = (type: string) => {
    updateBlock(block.id, { type: type as Block['type'] });
    setBlockMenuOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setBlockMenuOpen(false);
  };

  const handleDuplicate = () => {
    duplicateBlock(index);
    setBlockMenuOpen(false);
  };

  const handleDelete = () => {
    removeBlock(index);
    setBlockMenuOpen(false);
  };

  // ── Drag handle double-click ───────────────────────────────────
  const handleGripDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBlockMenuOpen(prev => !prev);
    setSlashMenuOpen(false);
  };

  // ── Keyboard handler ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashHighlight(i => (i + 1) % BLOCK_TYPES.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashHighlight(i => (i - 1 + BLOCK_TYPES.length) % BLOCK_TYPES.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectSlashType(BLOCK_TYPES[slashHighlight].type);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        updateBlock(block.id, { content: '' });
        return;
      }
    }

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

  // ── Change handler ─────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // Open slash menu when "/" is the only character
    if (val === '/') {
      setSlashMenuOpen(true);
      setSlashHighlight(0);
      updateBlock(block.id, { content: val });
      return;
    }

    // Close slash menu if content changes away from "/"
    if (slashMenuOpen) {
      setSlashMenuOpen(false);
    }

    // Markdown shortcuts
    if (val === '# ')   { updateBlock(block.id, { type: 'h1',     content: '' }); return; }
    if (val === '## ')  { updateBlock(block.id, { type: 'h2',     content: '' }); return; }
    if (val === '### ') { updateBlock(block.id, { type: 'h3',     content: '' }); return; }
    if (val === '- ' || val === '* ') { updateBlock(block.id, { type: 'bullet', content: '' }); return; }
    if (val === '[] ')  { updateBlock(block.id, { type: 'todo',   content: '' }); return; }

    updateBlock(block.id, { content: val });
  };

  // ── Styles ─────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────
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
      <div className="relative shrink-0 self-start">
        <div
          ref={drag as any}
          onDoubleClick={handleGripDoubleClick}
          title="Drag to reorder · Double-click for options"
          className={`w-8 flex items-center justify-center pt-2.5 cursor-grab active:cursor-grabbing
            text-neutral-600 transition-all duration-200 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100
            hover:text-neutral-300 hover:bg-neutral-800 rounded-md mx-1
            ${isFocused ? 'text-orange-500/80' : ''}
          `}
          contentEditable={false}
        >
          <GripVertical size={16} />
        </div>

        {/* Block Options Menu */}
        {blockMenuOpen && (
          <div
            ref={blockMenuRef}
            className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl border border-neutral-700 bg-[#1e1e1e] shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Turn into */}
            <div className="px-3 pt-2.5 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">Turn into</p>
              {BLOCK_TYPES.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onMouseDown={(e) => { e.preventDefault(); handleTurnInto(type); }}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors
                    ${block.type === type
                      ? 'bg-orange-500/15 text-orange-400'
                      : 'text-neutral-300 hover:bg-neutral-700/60 hover:text-neutral-100'
                    }
                  `}
                >
                  <Icon size={14} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            <div className="h-px bg-neutral-700/60 mx-3 my-1" />

            {/* Actions */}
            <div className="px-3 pb-2.5 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">Actions</p>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleCopy(); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700/60 hover:text-neutral-100 transition-colors"
              >
                <Copy size={14} className="shrink-0" />
                Copy text
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleDuplicate(); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-700/60 hover:text-neutral-100 transition-colors"
              >
                <Files size={14} className="shrink-0" />
                Duplicate block
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleDelete(); }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} className="shrink-0" />
                Delete block
              </button>
            </div>
          </div>
        )}
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

        <div className="relative flex-1">
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

          {/* Slash Command Menu */}
          {slashMenuOpen && (
            <div
              ref={slashMenuRef}
              className="absolute left-0 top-full mt-1 z-50 w-64 rounded-xl border border-neutral-700 bg-[#1e1e1e] shadow-2xl shadow-black/60 overflow-hidden"
            >
              <div className="px-3 pt-2.5 pb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">Insert block</p>
                {BLOCK_TYPES.map(({ type, label, description, Icon }, i) => (
                  <button
                    key={type}
                    onMouseDown={(e) => { e.preventDefault(); selectSlashType(type); }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors
                      ${slashHighlight === i
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'text-neutral-300 hover:bg-neutral-700/60 hover:text-neutral-100'
                      }
                    `}
                  >
                    <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center
                      ${slashHighlight === i ? 'bg-orange-500/20' : 'bg-neutral-700/60'}`}>
                      <Icon size={14} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium leading-none mb-0.5">{label}</div>
                      <div className="text-[11px] text-neutral-500 leading-none">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
