import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireAuth();

  const { name, description } = await request.json();

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? "",
      members: { create: { userId: user.userId, role: "owner" } },
    },
  });

  return Response.json(project, { status: 201 });
}
