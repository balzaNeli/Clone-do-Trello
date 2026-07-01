import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import NewProjectButton from "./new-project-button";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.userId } } },
    include: { columns: { include: { cards: true }, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      <header className="flex items-center justify-between border-b border-[#d2d2d7]/60 bg-white/80 px-6 py-3 backdrop-blur-xl dark:border-[#3a3a3c]/60 dark:bg-[#2c2c2e]/80">
        <h1 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Trello Clone</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7]"
            title="Configurações"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 1V3M8 13V15M3 3L4.5 4.5M11.5 11.5L13 13M1 8H3M13 8H15M3 13L4.5 11.5M11.5 4.5L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <ThemeToggle />
          <span className="text-sm text-zinc-500 dark:text-[#8e8e93]">{user.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Meus Projetos</h2>
          <NewProjectButton />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d2d2d7]/50 bg-white/50 px-8 py-16 dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e]/50">
            <p className="text-sm text-zinc-400 dark:text-[#8e8e93]">Nenhum projeto ainda.</p>
            <p className="mt-1 text-xs text-zinc-300 dark:text-[#636366]">Crie seu primeiro projeto para começar</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/board/${project.id}`}
                className="group rounded-2xl border border-[#d2d2d7]/50 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-[#3a3a3c]/50 dark:bg-[#2c2c2e] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              >
                <h3 className="font-semibold text-[#1d1d1f] group-hover:text-blue-500 dark:text-[#f5f5f7]">{project.name}</h3>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-400 dark:text-[#8e8e93]">{project.description}</p>
                )}
                <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400 dark:text-[#636366]">
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4.5H11" stroke="currentColor" strokeWidth="1.2"/></svg>
                    {project.columns.length} colunas
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4H8M4 6H7M4 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {project.columns.reduce((acc, col) => acc + col.cards.length, 0)} cartões
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
