import { getAdminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

export async function incrementCoins(uid: string, amount: number): Promise<number> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    const current = doc.data()?.coins ?? 0;
    const updated = current + amount;
    tx.update(userRef, {
      coins: updated,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return updated;
  });
}

export async function getUserProfile(uid: string) {
  const db = getAdminDb();
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? doc.data()! : null;
}

export async function getAnonymousGenerationCount(anonymousId: string): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("generations")
    .where("anonymousId", "==", anonymousId)
    .count()
    .get();
  return snapshot.data().count;
}
