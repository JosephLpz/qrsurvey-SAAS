import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore"

export const SURVEYS_COLLECTION = "surveys"

export type QuestionType = "text" | "multiple_choice" | "rating" | "nps" | "likert"

export interface Question {
    id: string
    type: QuestionType
    title: string
    description?: string
    required: boolean
    options?: string[]
}

export interface SurveyDesign {
    template: string
    primaryColor: string
    logo: string | null
    qrPosition: string
}

export interface Survey {
    id?: string
    ownerId: string
    name: string
    description: string
    sede: string
    language: string
    status: "Publicada" | "Borrador" | "Pausada" | "Finalizada"
    createdAt: Date
    responses: number
    avgRating: number
    questions: Question[]
    design: SurveyDesign
}

import { checkQuota } from "./quotas"

export const createSurvey = async (surveyData: Omit<Survey, "id" | "createdAt" | "responses" | "avgRating" | "status" | "ownerId">, ownerId: string) => {
    try {
        // Quota check
        const quota = await checkQuota(ownerId, "surveys")
        if (!quota.allowed) {
            throw new Error(`Has alcanzado el límite de ${quota.limit} encuestas para tu plan actual. Mejora a Pro para crear más.`)
        }

        // Sanitize data to remove undefined values
        const cleanData = JSON.parse(JSON.stringify(surveyData))

        const docRef = await addDoc(collection(db, SURVEYS_COLLECTION), {
            ...cleanData,
            ownerId,
            status: "Publicada", // Default status for now when creating via wizard
            responses: 0,
            avgRating: 0,
            createdAt: Timestamp.now(),
        })
        return docRef.id
    } catch (error) {
        console.error("Error adding survey: ", error)
        throw error
    }
}

// ... existing imports
import { doc, getDoc, updateDoc } from "firebase/firestore"

// ... existing code

export const updateSurvey = async (surveyId: string, surveyData: Partial<Omit<Survey, "id" | "createdAt" | "responses" | "avgRating" | "ownerId">>) => {
    try {
        // Sanitize data
        const cleanData = JSON.parse(JSON.stringify(surveyData))

        const docRef = doc(db, SURVEYS_COLLECTION, surveyId)
        await updateDoc(docRef, cleanData)
    } catch (error) {
        console.error("Error updating survey: ", error)
        throw error
    }
}

// ... existing code

export const duplicateSurvey = async (surveyId: string, ownerId: string) => {
    try {
        // Quota check
        const quota = await checkQuota(ownerId, "surveys")
        if (!quota.allowed) {
            throw new Error(`Has alcanzado el límite de ${quota.limit} encuestas para tu plan actual. Mejora a Pro para duplicar.`)
        }

        const docRef = doc(db, SURVEYS_COLLECTION, surveyId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            throw new Error("Encuesta no encontrada")
        }

        const data = docSnap.data()

        // Create copy data
        const newSurveyData = {
            ...data,
            name: `${data.name} (Copia)`,
            createdAt: Timestamp.now(),
            responses: 0,
            avgRating: 0,
            status: "Borrador", // Set copies to draft by default
            ownerId // Ensure owner matches
        }

        const newDocRef = await addDoc(collection(db, SURVEYS_COLLECTION), newSurveyData)
        return newDocRef.id
    } catch (error) {
        console.error("Error duplicating survey: ", error)
        throw error
    }
}

export const getSurveys = async (ownerId: string): Promise<Survey[]> => {
    // ... existing getSurveys implementation
    try {
        const q = query(
            collection(db, SURVEYS_COLLECTION),
            where("ownerId", "==", ownerId),
            orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as Survey[]
    } catch (error) {
        console.error("Error fetching surveys: ", error)
        throw error
    }
}
