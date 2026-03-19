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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
      memberType: additionalData.memberType || 'Student',
      branch: additionalData.branch || '',
      year: additionalData.year || '',
      ieeeMemberId: additionalData.ieeeMemberId || '',
      createdAt: new Date(),
      emailVerified: firebaseUser.emailVerified || false,
    };
  }

// Translate Firebase auth error codes to user-friendly messages
export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred. Please try again.";
  }
  
  const message = error.message;
  
  // Custom errors
  if (message === 'CONFIRMATION_REQUIRED') {
    return "Registration successful! Please check your email to verify your account.";
  }
  
  // Firebase auth errors
  if (message.includes('auth/invalid-email')) {
    return "Please enter a valid email address.";
  }
  if (message.includes('auth/user-disabled')) {
    return "This account has been disabled. Please contact support.";
  }
  if (message.includes('auth/user-not-found')) {
    return "No account found with this email. Please register first.";
  }
  if (message.includes('auth/wrong-password')) {
    return "Incorrect password. Please try again.";
  }
  if (message.includes('auth/email-already-in-use')) {
    return "An account with this email already exists.";
  }
  if (message.includes('auth/weak-password')) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (message.includes('auth/network-request-failed')) {
    return "Network error. Please check your internet connection.";
  }
  if (message.includes('auth/too-many-requests')) {
    return "Too many attempts. Please try again later.";
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return "Sign-in was cancelled. Please try again.";
  }
  if (message.includes('auth/invalid-credential')) {
    return "Invalid email or password. Please check your credentials.";
  }
  
  // Default fallback
  return "An error occurred. Please try again.";
}

export const authService = {
  // Register new user with email verification
  async register(
    email: string,
    password: string,
    displayName: string,
    additionalData: {
      phone: string;
      memberType: string;
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
      memberType: additionalData.memberType,
      branch: additionalData.branch,
      year: additionalData.year,
      ieeeMemberId: additionalData.ieeeMemberId || '',
      role: additionalData.memberType === 'Faculty' ? 'faculty' : 'student',
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

  // Update user profile
  async updateUser(userId: string, data: { displayName?: string; phone?: string; branch?: string; year?: string; ieeeMemberId?: string }): Promise<void> {
    await updateDoc(doc(db, 'users', userId), data);
  },
};

export default authService;
