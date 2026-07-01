"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function SettingsPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/auth/delete-account", { method: "POST" });
    if (res.ok) router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e]">
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
          <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Configurações</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10">
        <div className="rounded-2xl border border-[#d2d2d7]/50 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">Zona de Perigo</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-[#8e8e93]">
            Ao excluir sua conta, todos os seus projetos, cartões, comentários e anexos serão removidos permanentemente. Esta ação não pode ser desfeita.
          </p>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="mt-4 cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Excluir minha conta
          </button>
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => !deleting && setShowConfirm(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-[#d2d2d7]/50 bg-white p-6 shadow-xl dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Excluir conta</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-[#8e8e93]">
              Tem certeza? Todos os seus dados serão apagados permanentemente.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
