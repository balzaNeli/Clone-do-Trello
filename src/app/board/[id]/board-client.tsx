"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardModal from "./card-modal";

type Label = { id: string; name: string; color: string };
type Card = { id: string; title: string; description: string; done: boolean; labels: Label[] };
type Column = { id: string; title: string; cards: Card[] };

interface BoardProps {
  userName: string;
  project: { id: string; name: string; labels: Label[]; columns: Column[] };
}

/* ──────── Sortable Card ──────── */

function SortableCard({
  card,
  onToggleDone,
  onDelete,
  onOpen,
}: {
  card: Card;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (card: Card) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border border-[#d2d2d7]/50 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
        card.done ? "opacity-45" : ""
      }`}
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: label.color + "20", color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(card.id);
          }}
              className={`mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
            card.done
              ? "border-green-400 bg-green-400 text-white"
              : "border-zinc-300 hover:border-green-400 dark:border-[#48484a] dark:hover:border-green-400"
          }`}
        >
          {card.done && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <span
          className="flex-1 cursor-pointer"
          onClick={() => onOpen(card)}
          {...attributes}
          {...listeners}
        >
          <span
            className={`text-sm font-medium ${
              card.done ? "text-zinc-400 line-through dark:text-[#636366]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"
            }`}
          >
            {card.title}
          </span>
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-200 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100 dark:text-[#48484a] dark:hover:bg-red-500/20"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {card.description && !card.done && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-[#636366]">{card.description}</p>
      )}
    </div>
  );
}

/* ──────── Confirmation Modal ──────── */

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[#d2d2d7]/50 bg-white p-6 shadow-xl dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-[#8e8e93]">{message}</p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────── Drag overlay card ──────── */

function DragCard({ card }: { card: Card }) {
  return (
    <div className="rounded-xl border border-[#d2d2d7]/50 bg-white px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]">
      <p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{card.title}</p>
    </div>
  );
}

/* ──────── Column container ──────── */

function ColumnContainer({
  column,
  cards,
  editingColumnId,
  editingColumnTitle,
  addingCardColumnId,
  newCardTitle,
  onStartEdit,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onAddCardClick,
  onNewCardTitleChange,
  onAddCardSubmit,
  onAddCardCancel,
  onToggleDone,
  onDeleteCard,
  onDeleteColumn,
  onOpenCard,
}: {
  column: Column;
  cards: Card[];
  editingColumnId: string | null;
  editingColumnTitle: string;
  addingCardColumnId: string | null;
  newCardTitle: string;
  onStartEdit: (col: Column) => void;
  onEditChange: (v: string) => void;
  onEditSubmit: (id: string) => void;
  onEditCancel: () => void;
  onAddCardClick: (id: string) => void;
  onNewCardTitleChange: (v: string) => void;
  onAddCardSubmit: (id: string) => void;
  onAddCardCancel: () => void;
  onToggleDone: (id: string) => void;
  onDeleteCard: (id: string, colId: string) => void;
  onDeleteColumn: (id: string) => void;
  onOpenCard: (card: Card) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);

  return (
    <div
      ref={setNodeRef}
      className={`group flex h-full w-72 shrink-0 flex-col rounded-2xl backdrop-blur-md transition-colors ${
        isOver ? "bg-blue-50/60 dark:bg-blue-500/10" : "bg-white/70 dark:bg-[#2c2c2e]/70"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#d2d2d7]/40 px-4 py-3 dark:border-[#3a3a3c]/40">
        {editingColumnId === column.id ? (
          <input
            value={editingColumnTitle}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={() => onEditSubmit(column.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSubmit(column.id);
              if (e.key === "Escape") onEditCancel();
            }}
            className="flex-1 rounded-lg border border-[#d2d2d7] px-2 py-1 text-sm font-medium text-[#1d1d1f] outline-none focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => onStartEdit(column)}
            className="cursor-pointer text-sm font-semibold text-[#1d1d1f] transition-colors hover:text-blue-500 dark:text-[#f5f5f7]"
          >
            {column.title}
          </button>
        )}
        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-md bg-[#f5f5f7] text-[11px] font-medium text-zinc-400 dark:bg-[#3a3a3c] dark:text-[#8e8e93]">
          {cards.length}
        </span>
        <button
          type="button"
          onClick={() => onDeleteColumn(column.id)}
          className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100 dark:text-[#48484a] dark:hover:bg-red-500/20"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onToggleDone={onToggleDone}
              onDelete={(id) => onDeleteCard(id, column.id)}
              onOpen={onOpenCard}
            />
          ))}
        </SortableContext>

        {addingCardColumnId === column.id ? (
          <div className="rounded-xl border border-[#d2d2d7]/50 bg-white p-3 dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]">
            <input
              value={newCardTitle}
              onChange={(e) => onNewCardTitleChange(e.target.value)}
              placeholder="Título do cartão"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddCardSubmit(column.id);
                if (e.key === "Escape") onAddCardCancel();
              }}
              className="w-full rounded-lg border border-[#d2d2d7] px-3 py-2 text-sm text-[#1d1d1f] outline-none placeholder:text-zinc-300 focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:placeholder:text-[#636366]"
              autoFocus
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onAddCardSubmit(column.id)}
                className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={onAddCardCancel}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddCardClick(column.id)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Adicionar cartão
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────── Main Board ──────── */

export default function BoardClient({ userName, project }: BoardProps) {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const [columns, setColumns] = useState<Column[]>(project.columns);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [projectLabels, setProjectLabels] = useState<Label[]>(project.labels);

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [addingCardColumnId, setAddingCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const newColumnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewColumn && newColumnInputRef.current) {
      newColumnInputRef.current.focus();
    }
  }, [showNewColumn]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
      }
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function findColumn(id: string): Column | undefined {
    return columns.find((c) => c.id === id);
  }

  function findCardColumn(cardId: string): Column | undefined {
    return columns.find((c) => c.cards.some((card) => card.id === cardId));
  }

  /* ── drag handlers ── */

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    const col = findCardColumn(cardId);
    if (!col) return;
    const card = col.cards.find((c) => c.id === cardId);
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findCardColumn(activeId);
    const overCol = findColumn(overId) ?? findCardColumn(overId);

    if (!activeCol || !overCol) return;
    if (activeCol.id === overCol.id) return;

    setColumns((prev) => {
      const card = activeCol.cards.find((c) => c.id === activeId);
      if (!card) return prev;

      const overCard = overCol.cards.find((c) => c.id === overId);
      const overIndex = overCard ? overCol.cards.indexOf(overCard) : overCol.cards.length;

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const next = [...col.cards];
          next.splice(overIndex, 0, card);
          return { ...col, cards: next };
        }
        return col;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findCardColumn(activeId);
    const overCol = findColumn(overId) ?? findCardColumn(overId);

    if (!activeCol || !overCol) return;

    const card = activeCol.cards.find((c) => c.id === activeId);
    if (!card) return;

    if (activeCol.id === overCol.id) {
      const cards = activeCol.cards;
      const oldIdx = cards.findIndex((c) => c.id === activeId);
      const overCard = overCol.cards.find((c) => c.id === overId);
      const newIdx = overCard ? cards.indexOf(overCard) : cards.length;
      if (oldIdx === newIdx) return;
    }

    const finalCol = findColumn(overCol.id) ?? overCol;
    const targetColumnId = finalCol.id;

    try {
      await fetch(`/api/cards/${activeId}`, {
        method: "PATCH",
        body: JSON.stringify({ columnId: targetColumnId }),
      });
    } catch {
      // fallback
    }
  }

  /* ── column & card actions ── */

  async function addColumn() {
    const title = newColumnTitle.trim();
    if (!title) return;

    const res = await fetch("/api/columns", {
      method: "POST",
      body: JSON.stringify({ projectId: project.id, title }),
    });

    if (res.ok) {
      const col = await res.json();
      setColumns((prev) => [...prev, { ...col, cards: [] }]);
      setNewColumnTitle("");
      setShowNewColumn(false);
      scrollToEnd();
    }
  }

  async function updateColumnTitle(columnId: string) {
    const title = editingColumnTitle.trim();
    if (!title) return;

    const res = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, title } : c)));
    }
    setEditingColumnId(null);
  }

  async function deleteColumn(columnId: string) {
    const res = await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    if (res.ok) {
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
    }
  }

  async function addCard(columnId: string) {
    const title = newCardTitle.trim();
    if (!title) return;

    const res = await fetch("/api/cards", {
      method: "POST",
      body: JSON.stringify({ columnId, title }),
    });

    if (res.ok) {
      const card = await res.json();
      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId ? { ...c, cards: [...c.cards, { ...card, done: false, labels: [] }] } : c
        )
      );
      setNewCardTitle("");
      setAddingCardColumnId(null);
    }
  }

  async function deleteCard(cardId: string, columnId: string) {
    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (res.ok) {
      setColumns((prev) =>
        prev.map((c) =>
          c.id === columnId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c
        )
      );
    }
  }

  async function toggleDone(cardId: string) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, done: !card.done } : card
        ),
      }))
    );

    fetch("/api/cards/toggle-done", {
      method: "POST",
      body: JSON.stringify({ cardId }),
    }).catch(() => {});
  }

  async function handleUpdateCard(cardId: string, data: { title?: string; description?: string }) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, ...data } : card
        ),
      }))
    );

    if (modalCard && data.title) {
      setModalCard((prev) => (prev?.id === cardId ? { ...prev, ...data } : prev));
    }

    fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  async function handleToggleLabel(cardId: string, labelId: string, add: boolean) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.id !== cardId) return card;
          const labels = add
            ? [...card.labels, projectLabels.find((l) => l.id === labelId)!]
            : card.labels.filter((l) => l.id !== labelId);
          return { ...card, labels };
        }),
      }))
    );

    if (modalCard?.id === cardId) {
      setModalCard((prev) => {
        if (!prev) return prev;
        const labels = add
          ? [...prev.labels, projectLabels.find((l) => l.id === labelId)!]
          : prev.labels.filter((l) => l.id !== labelId);
        return { ...prev, labels };
      });
    }

    fetch(`/api/cards/${cardId}/labels`, {
      method: "POST",
      body: JSON.stringify({ labelId, add }),
    }).catch(() => {});
  }

  async function handleCreateLabel(name: string, color: string) {
    const res = await fetch("/api/labels", {
      method: "POST",
      body: JSON.stringify({ projectId: project.id, name, color }),
    });

    if (res.ok) {
      const label = await res.json();
      setProjectLabels((prev) => [...prev, label]);
      return label;
    }
    return null;
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/login"));
  }

  async function handleDeleteProject() {
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  }

  /* ── Render ── */

  return (
    <div className="flex h-screen flex-col bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      <header className="flex items-center justify-between border-b border-[#d2d2d7]/60 bg-white/80 px-6 py-3 backdrop-blur-xl dark:border-[#3a3a3c]/60 dark:bg-[#2c2c2e]/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 3L5 9L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{project.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
            title="Excluir projeto"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 7V11M10 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1V2.5M8 13.5V15M3 3L4 4M12 12L13 13M1 8H2.5M13.5 8H15M3 13L4 12M12 4L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 9.5C12.5 10.5 10.5 11 8.5 10.5C6.5 10 5.5 8.5 5.5 6.5C5.5 5 6 3.5 7 2.5C5 3 3 5 3 7.5C3 10.5 5.5 13 8.5 13C10 13 11.5 12 13.5 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-full px-4 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-[#8e8e93] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
          >
            Sair
          </button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex flex-1 gap-4 overflow-x-auto p-6"
          style={{ scrollBehavior: "smooth" }}
        >
          {columns.map((column) => (
            <ColumnContainer
              key={column.id}
              column={column}
              cards={column.cards}
              editingColumnId={editingColumnId}
              editingColumnTitle={editingColumnTitle}
              addingCardColumnId={addingCardColumnId}
              newCardTitle={newCardTitle}
              onStartEdit={(col) => {
                setEditingColumnId(col.id);
                setEditingColumnTitle(col.title);
              }}
              onEditChange={setEditingColumnTitle}
              onEditSubmit={updateColumnTitle}
              onEditCancel={() => setEditingColumnId(null)}
              onAddCardClick={(id) => setAddingCardColumnId(id)}
              onNewCardTitleChange={setNewCardTitle}
              onAddCardSubmit={addCard}
              onAddCardCancel={() => {
                setAddingCardColumnId(null);
                setNewCardTitle("");
              }}
              onToggleDone={toggleDone}
              onDeleteCard={deleteCard}
              onDeleteColumn={deleteColumn}
              onOpenCard={(card) => setModalCard(card)}
            />
          ))}

          <div className="flex h-full w-72 shrink-0 flex-col">
            {showNewColumn ? (
              <div className="rounded-2xl border border-[#d2d2d7]/50 bg-white/90 p-4 backdrop-blur-md dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]/90">
                <input
                  ref={newColumnInputRef}
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Título da coluna"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addColumn();
                    if (e.key === "Escape") {
                      setShowNewColumn(false);
                      setNewColumnTitle("");
                    }
                  }}
                  className="w-full rounded-lg border border-[#d2d2d7] px-3 py-2 text-sm text-[#1d1d1f] outline-none placeholder:text-zinc-300 focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:placeholder:text-[#636366]"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={addColumn}
                    className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewColumn(false);
                      setNewColumnTitle("");
                    }}
                    className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewColumn(true)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[#d2d2d7]/50 px-5 py-4 text-sm font-medium text-zinc-400 transition-all hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/40 dark:border-[#3a3a3c]/50 dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Nova coluna
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? <DragCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {modalCard && (
        <CardModal
          userName={userName}
          card={modalCard}
          projectLabels={projectLabels}
          onClose={() => setModalCard(null)}
          onUpdate={handleUpdateCard}
          onToggleLabel={handleToggleLabel}
          onCreateLabel={handleCreateLabel}
        />
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        title="Excluir projeto"
        message="Tem certeza que deseja excluir este projeto? Todas as colunas, cartões, comentários e anexos serão removidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
