import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return Response.json({ error: "projectId é obrigatório" }, { status: 400 });
  }

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.userId, projectId } },
  });
  if (!member) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const labels = await prisma.label.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return Response.json(labels);
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const { projectId, name, color } = await request.json();

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.userId, projectId } },
  });
  if (!member) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const label = await prisma.label.create({
    data: { name, color: color ?? "#3b82f6", projectId },
  });

  return Response.json(label, { status: 201 });
}
