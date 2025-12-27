import { db } from "@/lib/firebase"
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    deleteDoc,
    doc
} from "firebase/firestore"

export interface Report {
    id: string
    name: string
    type: string
    status: "Completado" | "Procesando" | "Programado"
    format: string
    createdAt: any
    surveyIds: string[]
    sedes: string[]
    ownerId: string
    metrics?: {
        responses: number
        avgSatisfaction: number
        nps: number
    }
}

export async function getReports(ownerId: string): Promise<Report[]> {
    const q = query(
        collection(db, "reports"),
        where("ownerId", "==", ownerId)
    )
    const snap = await getDocs(q)
    const reports = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
    })) as Report[]

    // Sort client-side to avoid index requirement
    return reports.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
    })
}

export async function createReport(ownerId: string, data: Partial<Report>): Promise<string> {
    const docRef = await addDoc(collection(db, "reports"), {
        ...data,
        ownerId,
        status: "Completado",
        createdAt: Timestamp.now()
    })
    return docRef.id
}

export async function deleteReport(reportId: string): Promise<void> {
    await deleteDoc(doc(db, "reports", reportId))
}

export async function getFilteredResponses(surveyIds: string[], sedes: string[]): Promise<any[]> {
    if (surveyIds.length === 0) return []

    // Firestore 'in' query supports up to 30 items
    const chunkedSurveyIds = []
    for (let i = 0; i < surveyIds.length; i += 30) {
        chunkedSurveyIds.push(surveyIds.slice(i, i + 30))
    }

    let allResponses: any[] = []
    for (const chunk of chunkedSurveyIds) {
        let q = query(
            collection(db, "responses"),
            where("surveyId", "in", chunk)
        )

        const snap = await getDocs(q)
        let filtered = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        })) as any[]

        // Filter by sede client-side if needed (or we could use where if sedes length <= 30)
        if (sedes.length > 0 && !sedes.includes("Todas")) {
            filtered = filtered.filter((r: any) => sedes.includes(r.sede))
        }

        allResponses = [...allResponses, ...filtered]
    }

    return allResponses
}

export async function exportToCSV(responses: any[], reportName: string) {
    if (responses.length === 0) return

    // Define headers from first response answers keys
    const headers = ["Fecha", "Sede", "Rating"]
    const answerKeys = Object.keys(responses[0].answers || {})
    const allHeaders = [...headers, ...answerKeys]

    const csvContent = [
        allHeaders.join(","),
        ...responses.map(r => {
            const row = [
                r.createdAt?.toLocaleDateString() || "",
                r.sede || "General",
                r.rating || 0,
                ...answerKeys.map(k => {
                    const val = r.answers[k]
                    // Escape commas and quotes for CSV
                    return `"${String(val).replace(/"/g, '""')}"`
                })
            ]
            return row.join(",")
        })
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportName.replace(/\s+/g, '_')}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
