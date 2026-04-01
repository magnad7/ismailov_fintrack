import { getAdminAuth, getAdminFirestore } from "../utils/firebase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { newEmail, newPassword, uid } = body;

    if (!uid) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    if (!newEmail && !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "At least one of email or password must be provided",
      });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    const updatePayload: Record<string, string> = {};

    if (newEmail) {
      updatePayload.email = newEmail;
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        throw createError({
          statusCode: 400,
          statusMessage: "Password must be at least 6 characters",
        });
      }
      updatePayload.password = newPassword;
    }

    // Update Firebase Auth
    await auth.updateUser(uid, updatePayload);

    // Update email in Firestore if changed
    if (newEmail) {
      await db.collection("users").doc(uid).update({
        email: newEmail,
      });
    }

    return {
      message: "Credentials updated successfully",
      success: true,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || error.message || "Failed to update credentials",
    });
  }
});
