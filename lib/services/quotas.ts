import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, count } from "firebase/firestore"
import { getUserProfile } from "./users"

export const PLAN_LIMITS = {
    free: {
        surveys: 3,
        responses: 100
    },
    pro: {
        surveys: 50,
        responses: 5000
    }
}

export interface UserUsage {
    surveys: number
    responses: number
}

export async function getUserUsage(uid: string): Promise<UserUsage> {
    try {
        // 1. Count surveys
        const surveysQuery = query(
            collection(db, "surveys"),
            where("ownerId", "==", uid)
        )
        const surveysSnap = await getDocs(surveysQuery)
        const surveysCount = surveysSnap.size

        // 2. Count responses across all surveys
        // Note: For large volumes, we might want a counter in the user profile
        // but for now we'll sum the 'responses' field in survey documents
        let totalResponses = 0
        surveysSnap.docs.forEach(doc => {
            totalResponses += doc.data().responses || 0
        })

        return {
            surveys: surveysCount,
            responses: totalResponses
        }
    } catch (error) {
        console.error("Error getting user usage:", error)
        return { surveys: 0, responses: 0 }
    }
}

export async function checkQuota(uid: string, type: "surveys" | "responses"): Promise<{ allowed: boolean, limit: number, current: number }> {
    const profile = await getUserProfile(uid)
    const usage = await getUserUsage(uid)
    const plan = profile?.plan || "free"
    const limits = PLAN_LIMITS[plan]

    const current = usage[type]
    const limit = limits[type]

    return {
        allowed: current < limit,
        limit,
        current
    }
}
