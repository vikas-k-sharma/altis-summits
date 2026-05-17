'use client';

interface FilterButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FilterButton({
  label,
  active,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-sm font-medium transition-colors
        ${
          active
            ? 'bg-cyan-500 text-slate-950'
            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
        }`}
    >
      {label}
    </button>
  );
}
