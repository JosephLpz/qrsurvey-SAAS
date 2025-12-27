import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from "firebase/firestore"
import { QuestionType } from "./surveys"

export const RESPONSES_COLLECTION = "responses"

export interface Response {
    id?: string
    surveyId: string
    answers: Record<string, any>
    createdAt: Date
    rating?: number
    nps?: number
    comment?: string // Optional general comment
    sede?: string
}

export interface QuestionResult {
    questionId: string
    title: string
    type: QuestionType
    total: number
    data: any[] // Depends on type
}

export interface ResultsData {
    totalResponses: number
    avgRating: number
    completionRate: number
    responseRate: number
    ratingDistribution: { rating: string, count: number, percentage: number }[]
    npsData: { category: string, count: number, percentage: number, color: string }[]
    responsesByDay: { day: string, responses: number }[]
    questionResults: QuestionResult[]
}

export const getSurveyResults = async (surveyId: string): Promise<ResultsData> => {
    try {
        const q = query(
            collection(db, RESPONSES_COLLECTION),
            where("surveyId", "==", surveyId)
        )

        const snapshot = await getDocs(q)
        const responses = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }))
            .sort((a: any, b: any) => b.createdAt - a.createdAt) as Response[]

        // 1. Fetch Survey Structure
        const surveyRef = doc(db, "surveys", surveyId)
        const surveySnap = await getDoc(surveyRef)
        const survey = surveySnap.exists() ? { id: surveySnap.id, ...surveySnap.data() } as any : null

        const totalResponses = responses.length

        // Global Rating Stats
        let totalRating = 0
        let ratedCount = 0
        const ratingCounts = new Array(6).fill(0)

        // Global NPS Stats
        let promoters = 0
        let neutrals = 0
        let detractors = 0
        let npsCount = 0

        // Per Question Aggregation
        const questionResults: QuestionResult[] = []

        if (survey && survey.questions) {
            survey.questions.forEach((q: any) => {
                const result: QuestionResult = {
                    questionId: q.id,
                    title: q.title,
                    type: q.type,
                    total: 0,
                    data: []
                }

                if (q.type === 'text') {
                    const comments = responses
                        .filter(r => r.answers[q.id])
                        .map(r => ({
                            text: r.answers[q.id],
                            date: r.createdAt?.toLocaleDateString() || "Reciente",
                            sede: r.sede || "General"
                        }))
                    result.data = comments.slice(0, 10)
                    result.total = comments.length
                } else if (q.type === 'multiple_choice' || q.type === 'likert') {
                    const options = q.type === 'likert'
                        ? ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"]
                        : (q.options || [])

                    const counts: Record<string, number> = {}
                    options.forEach((opt: string) => counts[opt] = 0)

                    responses.forEach(r => {
                        const ans = r.answers[q.id]
                        if (ans && counts[ans] !== undefined) {
                            counts[ans]++
                            result.total++
                        }
                    })

                    result.data = options.map((opt: string) => ({
                        name: opt,
                        value: counts[opt],
                        percentage: result.total > 0 ? Math.round((counts[opt] / result.total) * 100) : 0
                    }))
                } else if (q.type === 'rating') {
                    const counts = new Array(6).fill(0)
                    responses.forEach(r => {
                        const val = r.answers[q.id]
                        if (val) {
                            counts[Math.round(val)]++
                            result.total++
                            totalRating += val
                            ratedCount++
                            ratingCounts[Math.round(val)]++
                        }
                    })
                    result.data = [5, 4, 3, 2, 1].map(star => ({
                        name: `${star} \u2605`,
                        value: counts[star],
                        percentage: result.total > 0 ? Math.round((counts[star] / result.total) * 100) : 0
                    }))
                } else if (q.type === 'nps') {
                    let p = 0, n = 0, d = 0
                    responses.forEach(r => {
                        const val = r.answers[q.id]
                        if (val !== undefined) {
                            result.total++
                            npsCount++
                            if (val >= 9) { promoters++; p++; }
                            else if (val >= 7) { neutrals++; n++; }
                            else { detractors++; d++; }
                        }
                    })
                    result.data = [
                        { name: "Promotores", value: p, color: "#22c55e" },
                        { name: "Neutros", value: n, color: "#f59e0b" },
                        { name: "Detractores", value: d, color: "#ef4444" }
                    ]
                }

                questionResults.push(result)
            })
        }

        // Global Calculations
        const avgRating = ratedCount > 0 ? totalRating / ratedCount : 0

        const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
            rating: `${star} estrellas`,
            count: ratingCounts[star],
            percentage: totalResponses > 0 ? Math.round((ratingCounts[star] / totalResponses) * 100) : 0
        }))

        const npsData = [
            { category: "Promotores", count: promoters, percentage: npsCount > 0 ? Math.round((promoters / npsCount) * 100) : 0, color: "#22c55e" },
            { category: "Neutros", count: neutrals, percentage: npsCount > 0 ? Math.round((neutrals / npsCount) * 100) : 0, color: "#f59e0b" },
            { category: "Detractores", count: detractors, percentage: npsCount > 0 ? Math.round((detractors / npsCount) * 100) : 0, color: "#ef4444" }
        ]

        // By Day (Simplified for demo, just grouping by day name)
        // Real implementation needs proper date handling
        const responsesByDayMap = new Map<string, number>()
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

        responses.forEach(r => {
            if (!r.createdAt) return
            const day = days[r.createdAt.getDay()]
            responsesByDayMap.set(day, (responsesByDayMap.get(day) || 0) + 1)
        })

        const responsesByDay = days.map(day => ({
            day,
            responses: responsesByDayMap.get(day) || 0
        }))

        return {
            totalResponses,
            avgRating,
            completionRate: 0,
            responseRate: 0,
            ratingDistribution,
            npsData,
            responsesByDay,
            questionResults
        }
    } catch (error) {
        console.error("Error getting results:", error)
        return {
            totalResponses: 0,
            avgRating: 0,
            completionRate: 0,
            responseRate: 0,
            ratingDistribution: [],
            npsData: [],
            responsesByDay: [],
            questionResults: []
        }
    }
}
