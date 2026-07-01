import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const { labelId, add } = await request.json();

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  if (add) {
    await prisma.cardLabel.create({ data: { cardId: id, labelId } });
  } else {
    await prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId: id, labelId } },
    });
  }

  return Response.json({ success: true });
}
