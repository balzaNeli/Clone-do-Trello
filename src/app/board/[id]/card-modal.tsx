"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Label = { id: string; name: string; color: string };
type Comment = { id: string; content: string; createdAt: string; user: { id: string; name: string } };
type Attachment = { id: string; filePath: string; createdAt: string };

interface CardModalProps {
  userName: string;
  card: { id: string; title: string; description: string; labels: Label[] };
  projectLabels: Label[];
  onClose: () => void;
  onUpdate: (cardId: string, data: { title?: string; description?: string }) => void;
  onToggleLabel: (cardId: string, labelId: string, add: boolean) => void;
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
}

const LABEL_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CardModal({
  userName,
  card,
  projectLabels,
  onClose,
  onUpdate,
  onToggleLabel,
  onCreateLabel,
}: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [preview, setPreview] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

  /* Comments */
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  /* Attachments */
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowLabelPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Fetch comments & attachments on mount */
  const fetchData = useCallback(async () => {
    const [commentsRes, attachmentsRes] = await Promise.all([
      fetch(`/api/cards/${card.id}/comments`),
      fetch(`/api/cards/${card.id}/attachments`),
    ]);
    if (commentsRes.ok) setComments(await commentsRes.json());
    if (attachmentsRes.ok) setAttachments(await attachmentsRes.json());
  }, [card.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleTitleBlur() {
    const t = title.trim();
    if (t && t !== card.title) onUpdate(card.id, { title: t });
  }

  function handleDescriptionBlur() {
    if (description !== card.description) onUpdate(card.id, { description });
  }

  async function handleCreateLabel() {
    const name = newLabelName.trim();
    if (!name) return;
    const label = await onCreateLabel(name, newLabelColor);
    if (label) {
      onToggleLabel(card.id, label.id, true);
      setNewLabelName("");
      setShowLabelPicker(false);
    }
  }

  async function handleAddComment() {
    const content = newComment.trim();
    if (!content || sendingComment) return;
    setSendingComment(true);

    const res = await fetch(`/api/cards/${card.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    }
    setSendingComment(false);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || uploading) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/cards/${card.id}/attachments`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const attachment = await res.json();
      setAttachments((prev) => [...prev, attachment]);
      if (fileRef.current) fileRef.current.value = "";
    }
    setUploading(false);
  }

  async function handleDeleteAttachment(attachmentId: string) {
    const res = await fetch(`/api/cards/${card.id}/attachments/${attachmentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    }
  }

  const cardLabelIds = new Set(card.labels.map((l) => l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-12 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#d2d2d7]/50 bg-white shadow-xl dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d2d2d7]/40 px-6 py-4 dark:border-[#3a3a3c]/40">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="flex-1 text-lg font-semibold text-[#1d1d1f] outline-none dark:bg-transparent dark:text-[#f5f5f7]"
          />
          <button type="button" onClick={onClose} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Labels */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-[#8e8e93]">Etiquetas</span>
              <div className="relative" ref={pickerRef}>
                <button type="button" onClick={() => setShowLabelPicker(!showLabelPicker)} className="cursor-pointer rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]">
                  + gerenciar
                </button>
                {showLabelPicker && (
                  <div className="absolute left-0 top-8 z-10 w-64 rounded-xl border border-[#d2d2d7]/50 bg-white p-4 shadow-lg dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]">
                    <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-[#8e8e93]">Adicionar etiqueta</p>
                    <div className="flex flex-wrap gap-1.5">
                      {projectLabels.map((label) => {
                        const active = cardLabelIds.has(label.id);
                        return (
                          <button
                            type="button"
                            key={label.id}
                            onClick={() => onToggleLabel(card.id, label.id, !active)}
                            className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-all ${active ? "ring-2 ring-offset-1 ring-zinc-400 dark:ring-offset-[#2c2c2e]" : "opacity-50 hover:opacity-80"}`}
                            style={{ backgroundColor: label.color + "20", color: label.color }}
                          >
                            {label.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 border-t border-[#d2d2d7]/40 pt-3 dark:border-[#3a3a3c]/40">
                      <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-[#8e8e93]">Nova etiqueta</p>
                      <input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Nome" className="w-full rounded-lg border border-[#d2d2d7] px-2.5 py-1.5 text-xs text-[#1d1d1f] outline-none placeholder:text-zinc-300 focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:placeholder:text-[#636366]" />
                      <div className="mt-2 flex items-center gap-1.5">
                        {LABEL_COLORS.map((c) => (
                          <button type="button" key={c} onClick={() => setNewLabelColor(c)} className={`h-5 w-5 cursor-pointer rounded-full transition-all ${newLabelColor === c ? "scale-110 ring-2 ring-offset-1 ring-zinc-500" : ""}`} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                                                <button type="button" onClick={handleCreateLabel} className="cursor-pointer mt-2 w-full rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600">Criar etiqueta</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {card.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {card.labels.map((label) => (
                  <span key={label.id} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: label.color + "20", color: label.color }}>{label.name}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-[#8e8e93]">Descrição</span>
              <button type="button" onClick={() => setPreview(!preview)} className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-colors ${preview ? "bg-blue-50 text-blue-500 dark:bg-blue-500/20" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"}`}>
                {preview ? "Editar" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="prose prose-sm max-w-none rounded-xl border border-[#d2d2d7]/50 bg-[#fafafa] px-4 py-3 text-sm text-[#1d1d1f] dark:border-[#3a3a3c]/50 dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:prose-invert">
                {description ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown> : <span className="text-zinc-300 dark:text-[#636366]">Nenhuma descrição</span>}
              </div>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Adicione uma descrição com **markdown**..."
                rows={5}
                className="w-full resize-none rounded-xl border border-[#d2d2d7] px-4 py-3 text-sm text-[#1d1d1f] outline-none placeholder:text-zinc-300 focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:placeholder:text-[#636366]"
              />
            )}
          </div>

          {/* Attachments */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-[#8e8e93]">Anexos</span>
              <label className="cursor-pointer rounded-lg px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]">
                {uploading ? "Enviando..." : "+ adicionar"}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className="group relative">
                    <img src={att.filePath} alt="" className="h-24 w-full rounded-xl border border-[#d2d2d7]/50 object-cover dark:border-[#3a3a3c]/50" />
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-300 dark:text-[#636366]">Nenhum anexo</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-[#8e8e93]">Comentários</span>

            <div className="mt-3 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-[#d2d2d7]/50 bg-[#fafafa] px-4 py-3 dark:border-[#3a3a3c]/50 dark:bg-[#3a3a3c]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{comment.user.name}</span>
                    <span className="text-zinc-300 dark:text-[#636366]">·</span>
                    <span className="text-zinc-400 dark:text-[#8e8e93]">{formatTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-[#c7c7cc]">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                placeholder="Escreva um comentário..."
                className="flex-1 rounded-xl border border-[#d2d2d7] px-3 py-2 text-sm text-[#1d1d1f] outline-none placeholder:text-zinc-300 focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:placeholder:text-[#636366]"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={sendingComment || !newComment.trim()}
                className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
              >
                {sendingComment ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
