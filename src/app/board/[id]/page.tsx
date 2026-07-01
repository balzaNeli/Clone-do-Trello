import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BoardClient from "./board-client";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, members: { some: { userId: user.userId } } },
    include: {
      columns: {
        include: {
          cards: {
            include: { labels: { include: { label: true } } },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      labels: true,
    },
  });

  if (!project) redirect("/dashboard");

  return (
    <BoardClient
      userName={user.name ?? "Usuário"}
      project={{
        id: project.id,
        name: project.name,
        labels: project.labels.map((l) => ({ id: l.id, name: l.name, color: l.color })),
        columns: project.columns.map((col) => ({
          id: col.id,
          title: col.title,
          cards: col.cards.map((card) => ({
            id: card.id,
            title: card.title,
            description: card.description,
            done: card.done,
            labels: card.labels.map((cl) => ({
              id: cl.label.id,
              name: cl.label.name,
              color: cl.label.color,
            })),
          })),
        })),
      }}
    />
  );
}
