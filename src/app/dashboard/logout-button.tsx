"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button type="button" onClick={handleLogout} className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-800 dark:text-[#8e8e93] dark:hover:text-[#f5f5f7]">
      Sair
    </button>
  );
}
