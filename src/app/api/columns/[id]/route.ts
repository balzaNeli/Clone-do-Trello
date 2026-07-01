import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const { title } = await request.json();

  const column = await prisma.column.findUnique({
    where: { id },
    include: { project: { include: { members: { where: { userId: user.userId } } } } },
  });

  if (!column || column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const updated = await prisma.column.update({
    where: { id },
    data: { title },
    include: { cards: { orderBy: { order: "asc" } } },
  });

  return Response.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const column = await prisma.column.findUnique({
    where: { id },
    include: { project: { include: { members: { where: { userId: user.userId } } } } },
  });

  if (!column || column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.column.delete({ where: { id } });
  return Response.json({ success: true });
}
