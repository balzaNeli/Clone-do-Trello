import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const { title, description, assigneeId, columnId, done } = await request.json();

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (assigneeId !== undefined) data.assigneeId = assigneeId;
  if (done !== undefined) data.done = done;

  if (columnId !== undefined) {
    data.columnId = columnId;

    const updated = await prisma.card.update({ where: { id }, data });

    const targetCards = await prisma.card.findMany({
      where: { columnId },
      orderBy: { order: "asc" },
    });

    await Promise.all(
      targetCards.map((c, i) =>
        prisma.card.update({ where: { id: c.id }, data: { order: i } })
      )
    );

    return Response.json(updated);
  }

  const updated = await prisma.card.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.card.delete({ where: { id } });
  return Response.json({ success: true });
}
