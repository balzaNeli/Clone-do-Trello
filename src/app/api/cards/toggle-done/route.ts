import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const { cardId } = await request.json();

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: { project: { include: { members: { where: { userId: user.userId } } } } },
      },
    },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { done: !card.done },
  });

  return Response.json(updated);
}
