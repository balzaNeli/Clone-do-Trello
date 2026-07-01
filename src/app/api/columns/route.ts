import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const { projectId, title } = await request.json();

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.userId, projectId } },
  });
  if (!member) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const lastColumn = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const column = await prisma.column.create({
    data: { title, projectId, order: (lastColumn?.order ?? -1) + 1 },
    include: { cards: { orderBy: { order: "asc" } } },
  });

  return Response.json(column, { status: 201 });
}
