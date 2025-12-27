import { db } from "@/lib/firebase"
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc,
    deleteDoc,
    doc
} from "firebase/firestore"

export interface Location {
    id: string
    ownerId: string
    name: string
    address: string
    manager: string
    phone: string
    email: string
    status: "Activa" | "Inactiva"
    createdAt?: Date
    surveysCount?: number
    responsesCount?: number
}

export async function getLocations(ownerId: string): Promise<Location[]> {
    const q = query(
        collection(db, "locations"),
        where("ownerId", "==", ownerId)
    )
    const snap = await getDocs(q)
    const locations = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
    })) as Location[]

    // Sort client-side
    return locations.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createLocation(ownerId: string, data: Partial<Location>): Promise<string> {
    const docRef = await addDoc(collection(db, "locations"), {
        ...data,
        ownerId,
        status: "Activa",
        createdAt: Timestamp.now(),
        surveysCount: 0,
        responsesCount: 0
    })
    return docRef.id
}

export async function updateLocation(locationId: string, data: Partial<Location>): Promise<void> {
    const docRef = doc(db, "locations", locationId)
    await updateDoc(docRef, data)
}

export async function deleteLocation(locationId: string): Promise<void> {
    const docRef = doc(db, "locations", locationId)
    await deleteDoc(docRef)
}
