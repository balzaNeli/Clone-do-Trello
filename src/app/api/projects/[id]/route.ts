import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, members: { some: { userId: user.userId } } },
    include: {
      columns: {
        include: { cards: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    return Response.json({ error: "Projeto não encontrado" }, { status: 404 });
  }

  return Response.json(project);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.userId, projectId: id } },
  });

  if (!membership || membership.role !== "owner") {
    return Response.json({ error: "Apenas o dono pode excluir o projeto" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });
  return Response.json({ ok: true });
}
