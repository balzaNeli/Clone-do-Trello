"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });

    if (res.ok) {
      const project = await res.json();
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/board/${project.id}`);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_1px_3px_rgba(0,122,255,0.3)] transition-all hover:bg-blue-600 hover:shadow-[0_2px_8px_rgba(0,122,255,0.4)] dark:shadow-[0_1px_3px_rgba(0,122,255,0.15)]"
      >
        Novo Projeto
      </button>

      {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm rounded-2xl border border-[#d2d2d7]/50 bg-white p-6 shadow-xl dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]"
          >
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Novo Projeto</h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-[#8e8e93]">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d2d2d7] px-3 py-2 text-sm text-[#1d1d1f] outline-none focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
                  placeholder="Meu projeto"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-[#8e8e93]">Descrição</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d2d2d7] px-3 py-2 text-sm text-[#1d1d1f] outline-none focus:border-blue-400 dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
