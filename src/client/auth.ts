import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

// Map Firebase user to our User type
function mapFirebaseUserToUser(firebaseUser: FirebaseUser, additionalData: any = {}): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: additionalData.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    role: additionalData.role || 'student',
    phone: additionalData.phone || '',
    branch: additionalData.branch || '',
    year: additionalData.year || '',
    ieeeMemberId: additionalData.ieeeMemberId || '',
    createdAt: new Date(),
    emailVerified: firebaseUser.emailVerified,
  };
}

export const authService = {
  // Register new user with email verification
  async register(
    email: string,
    password: string,
    displayName: string,
    additionalData: {
      phone: string;
      branch: string;
      year: string;
      ieeeMemberId?: string;
    },
    _secretCode?: string
  ): Promise<User> {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName,
      phone: additionalData.phone,
      branch: additionalData.branch,
      year: additionalData.year,
      ieeeMemberId: additionalData.ieeeMemberId || '',
      role: 'student',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    // Return user but throw error to indicate verification needed
    throw new Error('CONFIRMATION_REQUIRED');
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email first. Check your inbox for the confirmation link.');
    }

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const additionalData = userDoc.exists() ? userDoc.data() : {};

    const user = mapFirebaseUserToUser(firebaseUser, additionalData);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },

  // Logout user
  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem('user');
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        // Check if email is verified
        if (!firebaseUser.emailVerified) {
          resolve(null);
          return;
        }

        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const additionalData = userDoc.exists() ? userDoc.data() : {};

        const user = mapFirebaseUserToUser(firebaseUser, additionalData);
        localStorage.setItem('user', JSON.stringify(user));
        resolve(user);
      });
    });
  },

  // Get stored user from localStorage
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    } catch {
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const additionalData = userDoc.exists() ? userDoc.data() : {};
        const user = mapFirebaseUserToUser(firebaseUser, additionalData);
        localStorage.setItem('user', JSON.stringify(user));
        callback(user);
      } else {
        localStorage.removeItem('user');
        callback(null);
      }
    });
  },

  // Resend verification email
  async resendVerificationEmail(email: string, password: string): Promise<void> {
    // Sign in temporarily to get the Firebase user, then sign out immediately
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    if (firebaseUser.emailVerified) {
      await signOut(auth);
      throw new Error('Your email is already verified. You can login now.');
    }
    await sendEmailVerification(firebaseUser);
    await signOut(auth);
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
  },
};

export default authService;
