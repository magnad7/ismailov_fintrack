import {
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirebaseAuth, useFirestore } from "vuefire";

export interface AuthUser {
  email: string;
  name: string;
  phone?: string;
  role: Role;
}

export type Role = "admin" | "employee";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const router = useRouter();
    const auth = useFirebaseAuth();
    const db = useFirestore();

    const access = ref<string>("");
    const role = ref<"" | Role>("");
    const userObj = ref<AuthUser | null>(null);
    const loading = ref<boolean>(false);
    const myId = ref<string>("");

    const signIn = async (
      form: Record<string, string>
    ): Promise<{ role: null | Role; status: boolean }> => {
      loading.value = true;
      try {
        if (!auth) throw new Error("Firebase Auth not initialized");

        // 1. Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );
        const user = userCredential.user;

        // 2. Fetch user details from Firestore to get the Role
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          throw new Error(
            "Foydalanuvchi ma'lumotlari topilmadi. Iltimos admin bilan bog'laning."
          );
        }

        const userData = userDoc.data();
        const userRole: Role = userData.role || "employee";

        // 3. Set Store State
        myId.value = user.uid;
        access.value = await user.getIdToken();
        role.value = userRole;

        userObj.value = {
          email: user.email || form.email,
          name: userData.name || "Foydalanuvchi",
          phone: userData.phone || "",
          role: userRole,
        };

        return { role: userRole, status: true };
      } catch (error: any) {
        console.error("Login Error:", error);
        ElMessage.error(error.message || "Xatolik yuz berdi");
        return { role: null, status: false };
      } finally {
        loading.value = false;
      }
    };

    const logOut = async (): Promise<void> => {
      loading.value = true;
      try {
        if (auth) {
          await firebaseSignOut(auth);
        }
      } catch (error) {
        console.error("Logout Error:", error);
      } finally {
        access.value = "";
        role.value = "";
        userObj.value = null;
        myId.value = "";
        loading.value = false;
        router.push("/auth");
      }
    };

    const myIdValue = computed(() => myId.value);

    return {
      access,
      loading,
      logOut,
      myId,
      myIdValue,
      role,
      signIn,
      userObj,
    };
  },
  {
    persist: true,
  }
);
