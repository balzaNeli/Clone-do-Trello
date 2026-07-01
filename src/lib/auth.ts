import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();
  return session.userId
    ? { userId: session.userId, email: session.email, name: session.name }
    : null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
