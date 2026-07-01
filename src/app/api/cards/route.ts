import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const { columnId, title } = await request.json();

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { project: { include: { members: { where: { userId: user.userId } } } } },
  });

  if (!column || column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
  });

  const card = await prisma.card.create({
    data: { title, columnId, order: (lastCard?.order ?? -1) + 1 },
  });

  return Response.json(card, { status: 201 });
}
