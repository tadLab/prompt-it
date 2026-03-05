import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/firebase/server-auth";
import { getUserProfile } from "@/lib/firebase/db";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const profile = await getUserProfile(user.uid);

  return NextResponse.json({
    user: {
      uid: user.uid,
      email: user.email,
      name: user.name || user.email?.split("@")[0],
      picture: user.picture,
      promptsRemaining: profile?.coins ?? 0,
      referralCode: profile?.referralCode ?? null,
    },
  });
}
