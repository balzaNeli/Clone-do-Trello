import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { unlink } from "node:fs/promises";
import path from "node:path";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const user = await requireAuth();
  const { id, attachmentId } = await params;

  const attachment = await prisma.cardAttachment.findUnique({
    where: { id: attachmentId },
    include: { card: { include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } } } },
  });

  if (!attachment || attachment.card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const absolutePath = path.join(process.cwd(), "public", attachment.filePath);
  await unlink(absolutePath).catch(() => {});
  await prisma.cardAttachment.delete({ where: { id: attachmentId } });

  return Response.json({ success: true });
}
