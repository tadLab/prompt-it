import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { generationId, rating } = await req.json();

  if (!generationId || !["up", "down"].includes(rating)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use compound doc ID for uniqueness
  const ratingId = `${user.uid}_${generationId}`;
  const ratingRef = getAdminDb().collection("ratings").doc(ratingId);

  const existing = await ratingRef.get();
  if (existing.exists) {
    return NextResponse.json({ error: "Already rated", alreadyRated: true }, { status: 409 });
  }

  await ratingRef.set({
    userId: user.uid,
    generationId,
    rating,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
