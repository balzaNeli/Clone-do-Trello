import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

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

  const attachments = await prisma.cardAttachment.findMany({
    where: { cardId: id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(attachments);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    include: { column: { include: { project: { include: { members: { where: { userId: user.userId } } } } } } },
  });

  if (!card || card.column.project.members.length === 0) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const attachment = await prisma.cardAttachment.create({
    data: { filePath: `/uploads/${filename}`, cardId: id },
  });

  return Response.json(attachment, { status: 201 });
}
