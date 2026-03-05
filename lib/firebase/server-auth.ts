import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function getAuthUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return null;
  }
}
