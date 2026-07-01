"use server";

import { prisma } from "./prisma";
import { requireAuth } from "./auth";

export async function moveCard(
  cardId: string,
  newColumnId: string,
  newOrder: number
) {
  const user = await requireAuth();

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: { project: { include: { members: { where: { userId: user.userId } } } } },
      },
    },
  });

  if (!card || card.column.project.members.length === 0) {
    throw new Error("Acesso negado");
  }

  await prisma.card.update({
    where: { id: cardId },
    data: { columnId: newColumnId, order: newOrder },
  });

  const targetCards = await prisma.card.findMany({
    where: { columnId: newColumnId, id: { not: cardId } },
    orderBy: { order: "asc" },
  });

  const updates: { id: string; order: number }[] = [];
  let idx = 0;

  for (const c of targetCards) {
    if (idx === newOrder) idx++;
    if (c.order !== idx) updates.push({ id: c.id, order: idx });
    idx++;
  }

  await Promise.all(
    updates.map((u) => prisma.card.update({ where: { id: u.id }, data: { order: u.order } }))
  );
}

export async function toggleCardDone(cardId: string) {
  const user = await requireAuth();

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: { project: { include: { members: { where: { userId: user.userId } } } } },
      },
    },
  });

  if (!card || card.column.project.members.length === 0) {
    throw new Error("Acesso negado");
  }

  await prisma.card.update({
    where: { id: cardId },
    data: { done: !card.done },
  });
}
