import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"

export interface UserProfile {
    uid: string
    name: string
    email: string
    role: "user" | "admin"
    plan: "free" | "pro"
    flowCustomerId?: string // Cambiado de stripeCustomerId
    subscriptionStatus?: "active" | "canceled" | "past_due" | "unpaid"
    cancelAtPeriodEnd?: boolean
    currentPeriodEnd?: Date
    createdAt?: Date
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        const data = docSnap.data()
        return {
            uid: data.uid,
            name: data.name,
            email: data.email,
            role: data.role || "user",
            plan: data.plan || "free", // Default to free if not set
            flowCustomerId: data.flowCustomerId,
            subscriptionStatus: data.subscriptionStatus,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            currentPeriodEnd: data.currentPeriodEnd?.toDate ? data.currentPeriodEnd.toDate() : data.currentPeriodEnd,
            createdAt: data.createdAt?.toDate()
        } as UserProfile
    }

    return null
}

export async function updateUserPlan(uid: string, plan: "free" | "pro"): Promise<void> {
    const docRef = doc(db, "users", uid)
    await setDoc(docRef, { plan }, { merge: true })
}
