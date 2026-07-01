// plugins/firebase.client.ts
import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import {
    getFirestore,
    collection,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    where,
    serverTimestamp,
} from "firebase/firestore";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
    };

    // Initialize Firebase (avoid re-initialization in HMR)
    const app =
        getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const auth = getAuth(app);

    return {
        provide: {
            auth,
            db,
            firebase: {
                createUserWithEmailAndPassword,
                onAuthStateChanged,
                sendEmailVerification,
                sendPasswordResetEmail,
                signInWithEmailAndPassword,
                signOut,
                collection,
                getDoc,
                getDocs,
                setDoc,
                addDoc,
                updateDoc,
                deleteDoc,
                doc,
                onSnapshot,
                query,
                orderBy,
                where,
                serverTimestamp,
            },
        },
    };
});
