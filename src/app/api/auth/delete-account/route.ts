import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(_request: NextRequest) {
  const user = await requireAuth();

  const ownedProjects = await prisma.project.findMany({
    where: { members: { some: { userId: user.userId, role: "owner" } } },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.projectMember.deleteMany({ where: { userId: user.userId } }),
    ...ownedProjects.map((p) => prisma.project.delete({ where: { id: p.id } })),
    prisma.user.delete({ where: { id: user.userId } }),
  ]);

  const session = await getSession();
  session.destroy();

  return Response.json({ ok: true });
}
