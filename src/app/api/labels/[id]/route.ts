import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const label = await prisma.label.findUnique({
    where: { id },
    include: { project: { include: { members: { where: { userId: user.userId } } } } },
  });

  if (!label || label.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.label.delete({ where: { id } });
  return Response.json({ success: true });
}
