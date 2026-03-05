import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 14 * 1000; // 14 days

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    const db = getAdminDb();

    // Verify the ID token first
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    });

    // Check if user profile exists, create if new
    const userRef = db.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    let isNewUser = false;
    if (!userDoc.exists) {
      isNewUser = true;
      const referralCode = decoded.uid.slice(0, 8);

      // Create user profile + referral code lookup in a batch
      const batch = db.batch();
      batch.set(userRef, {
        coins: 10,
        referralCode,
        updatedAt: FieldValue.serverTimestamp(),
      });
      batch.set(db.collection("referralCodes").doc(referralCode), {
        uid: decoded.uid,
      });
      await batch.commit();
    }

    // Record referral if new user and referral cookie exists
    const refCode = req.cookies.get("prompt-it-ref")?.value;
    if (isNewUser && refCode) {
      const refDoc = await db.collection("referralCodes").doc(refCode).get();
      if (refDoc.exists) {
        const referrerId = refDoc.data()!.uid;
        if (referrerId !== decoded.uid) {
          await db.collection("referrals").add({
            referrerId,
            referredId: decoded.uid,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: SESSION_EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Clear referral cookie after processing
    if (refCode) {
      cookieStore.delete("prompt-it-ref");
    }

    return NextResponse.json({ success: true, isNewUser });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  return NextResponse.json({ success: true });
}
