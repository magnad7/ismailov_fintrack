import { getAdminAuth, getAdminFirestore } from "../utils/firebase";

export default defineEventHandler(async () => {
  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();

    const email = "admin@fintrack.uz";
    const password = "password123";

    // Check if exists
    try {
      await auth.getUserByEmail(email);
      return { message: "Admin user already exists." };
    } catch (e: any) {
      if (e.code !== "auth/user-not-found") throw e;
    }

    const userRecord = await auth.createUser({
      displayName: "Admin Administrator",
      email,
      password,
    });

    await db.collection("users").doc(userRecord.uid).set({
      createdAt: new Date().toISOString(),
      email,
      name: "Admin Administrator",
      phone: "+998901234567",
      role: "admin",
    });

    return {
      email,
      message: "Admin seeded successfully!",
      password,
      success: true,
    };
  } catch (error: any) {
    return {
      message: error.message,
      success: false,
    };
  }
});
