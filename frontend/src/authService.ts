import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./config/firestore";

export const signUp = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};
