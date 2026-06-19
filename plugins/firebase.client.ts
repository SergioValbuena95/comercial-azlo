// plugins/firebase.client.ts
import { initializeApp, getApps } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
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

    return {
        provide: {
            db,
            firebase: {
                collection,
                getDocs,
                addDoc,
                updateDoc,
                deleteDoc,
                doc,
                onSnapshot,
                query,
                orderBy,
            },
        },
    };
});
