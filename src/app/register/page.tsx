"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) return setError("Senhas não conferem");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#1c1c1e]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-sm dark:bg-[#2c2c2e] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#f5f5f7]">Criar conta</h1>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-500/20">{error}</p>}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-[#8e8e93]">Nome</label>
          <input id="name" name="name" type="text" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-[#8e8e93]">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-[#8e8e93]">Senha</label>
          <input id="password" name="password" type="password" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]" />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 dark:text-[#8e8e93]">Confirmar senha</label>
          <input id="confirm" name="confirm" type="password" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-[#3a3a3c] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]" />
        </div>

        <button type="submit" className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Criar conta
        </button>

        <p className="text-center text-sm text-zinc-500 dark:text-[#8e8e93]">
          Já tem conta? <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
