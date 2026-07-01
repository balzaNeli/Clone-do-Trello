import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const comments = await prisma.cardComment.findMany({
    where: { cardId: id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(comments);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const { content } = await request.json();

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const comment = await prisma.cardComment.create({
    data: { content, cardId: id, userId: user.userId },
    include: { user: { select: { id: true, name: true } } },
  });

  return Response.json(comment, { status: 201 });
}
