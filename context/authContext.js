import { createContext, use, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert } from "react-native";

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    
    useEffect(() => {
        //onAuthStateChange
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                updateUserData(user.uid);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        }) 
        return unsub;
    }, [])

    const updateUserData = async (userId) => {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data();
            setUser({...user, username: data.username, userId: data.userId})
        }
    }

    const login = async (email, password) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log('reponse.user: ', response?.user);
            return { success: true, data: response?.user};
        } catch(e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg='Invalid email'
            if (msg.includes('(auth/invalid-credential)')) msg='Wrong credential'
            return { success: false, msg};
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true }
        } catch(e) {
            return { success: false, msg: e.message, error: e};
            }
        }

    const register = async (email, password, username, confirmPassword) => {
        try {
            if (password === confirmPassword){
                const response = await createUserWithEmailAndPassword(auth, email, password);
                console.log('response.user: ', response?.user);

                await setDoc(doc(db, 'users', response?.user?.uid), {
                    username,
                    email,
                    userId: response?.user?.uid
                })
                return { success: true, data: response?.user };
            } else {
                Alert.alert('Confirm password does not match')
                return { success: false}
            } 
        } catch(e) {
            let msg = e.message
            if (msg.includes('(auth/invalid-email)')) msg='Invalid email'
            if (msg.includes('(auth/email-already-in-use)')) msg='This email already in use'
            return { success: false, msg };
        }
    }
    return (
        <AuthContext.Provider value={{user, isAuthenticated, login, logout, register}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
}
