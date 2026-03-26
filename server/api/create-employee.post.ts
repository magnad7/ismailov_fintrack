import { getAdminAuth, getAdminFirestore } from "../utils/firebase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, name, password, phone, role } = body;

    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email, password and name are required",
      });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // 1. Create User in Firebase Auth
    const userRecord = await auth.createUser({
      displayName: name,
      email,
      password,
    });

    // 2. Set custom claims if needed (optional)
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role || "employee",
    });

    // 3. Save User Profile in Firestore
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        createdAt: new Date().toISOString(),
        email,
        name,
        phone: phone || "",
        role: role || "employee",
      });

    return {
      success: true,
      user: {
        email: userRecord.email,
        role: role || "employee",
        uid: userRecord.uid,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to create user",
    });
  }
});
