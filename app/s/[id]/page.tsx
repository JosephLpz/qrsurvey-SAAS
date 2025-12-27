"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, updateDoc, increment, addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Survey } from "@/lib/services/surveys"
import { SurveyRender } from "@/components/survey/survey-render"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { checkQuota } from "@/lib/services/quotas"

export default function PublicSurveyPage() {
    const params = useParams()
    const surveyId = params.id as string

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [startedAt, setStartedAt] = useState<Date | null>(null)
    const [quotaReached, setQuotaReached] = useState(false)

    useEffect(() => {
        const fetchSurvey = async () => {
            if (!surveyId) return

            try {
                const docRef = doc(db, "surveys", surveyId)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data() as Survey
                    setSurvey({ id: docSnap.id, ...data } as Survey)
                    setStartedAt(new Date()) // Capture start time

                    // Check quota
                    const quota = await checkQuota(data.ownerId, "responses")
                    if (!quota.allowed) {
                        setQuotaReached(true)
                    }
                } else {
                    toast.error("Encuesta no encontrada")
                }
            } catch (error) {
                console.error("Error fetching survey:", error)
                toast.error("Error al cargar la encuesta")
            } finally {
                setLoading(false)
            }
        }

        fetchSurvey()
    }, [surveyId])

    const handleResponseChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    const handleSubmit = async () => {
        if (!survey) return

        // Validation
        const missingRequired = survey.questions.filter(q => q.required && !answers[q.id])
        if (missingRequired.length > 0) {
            toast.error(`Por favor responde las preguntas obligatorias: ${missingRequired.length} faltantes`)
            return
        }

        setIsSubmitting(true)
        try {
            // 1. Save individual response
            await addDoc(collection(db, "responses"), {
                surveyId: survey.id,
                ownerId: survey.ownerId,
                sede: survey.sede || "General",
                answers,
                createdAt: Timestamp.now(),
                startedAt: startedAt ? Timestamp.fromDate(startedAt) : Timestamp.now(),
                // Calculate partial rating if applicable
                rating: calculateRating(survey, answers)
            })

            // 2. Update aggregated stats (Optimistic update could be better but keeping it simple)
            const surveyRef = doc(db, "surveys", survey.id!)
            // Calculate average rating update logic is complex in firestore alone without cloud functions
            // For now, simplest approach is increment count. Average rating usually needs re-calc or running average.
            // We will just increment responses for now.
            await updateDoc(surveyRef, {
                responses: increment(1)
            })

            setSubmitted(true)
            toast.success("¡Gracias por tu respuesta!")
        } catch (error) {
            console.error("Error submitting response:", error)
            toast.error("Error al enviar respuestas. Intenta nuevamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper to calculate a rough "rating" for the response to store for analytics
    const calculateRating = (survey: Survey, answers: Record<string, any>) => {
        let totalRating = 0
        let count = 0

        survey.questions.forEach(q => {
            if (q.type === 'rating' && answers[q.id]) {
                totalRating += answers[q.id]
                count++
            } else if (q.type === 'nps' && answers[q.id] !== undefined) {
                // Normalized to 5 stars? Or keep naive. Let's map NPS 0-10 to 1-5 roughly for general "sat"
                totalRating += (answers[q.id] / 2)
                count++
            }
        })

        return count > 0 ? (totalRating / count) : 0
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Cargando encuesta...</p>
                </div>
            </div>
        )
    }

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Encuesta no disponible</h1>
                    <p className="text-slate-500 font-medium">Es posible que la encuesta haya sido eliminada o el enlace sea incorrecto.</p>
                    <div className="pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by QRSurvey</p>
                    </div>
                </div>
            </div>
        )
    }

    if (survey.status !== 'Publicada' && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Encuesta no disponible</h1>
                    <p className="text-slate-500 font-medium">Esta encuesta no está aceptando respuestas en este momento.</p>
                    <div className="pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by QRSurvey</p>
                    </div>
                </div>
            </div>
        )
    }

    if (quotaReached) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Encuesta llena</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Esta encuesta ha alcanzado su límite de respuestas mensuales. Por favor, contacta con el administrador.</p>
                    <div className="pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by QRSurvey</p>
                    </div>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6 animate-in fade-in duration-700">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">¡Gracias por tu opinión!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Tus respuestas han sido registradas correctamente.</p>
                    <div className="pt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Powered by QRSurvey</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            <SurveyRender
                survey={survey}
                mode="live"
                onResponseChange={handleResponseChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
