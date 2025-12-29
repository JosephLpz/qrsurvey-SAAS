"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, CheckCircle2, Sparkles, QrCode, Download, Maximize2 } from "lucide-react"
import { SurveyDetailsStep } from "@/components/survey-wizard/details-step"
import { SurveyQuestionsStep } from "@/components/survey-wizard/questions-step"
import { SurveyDesignStep } from "@/components/survey-wizard/design-step"
import { createSurvey, updateSurvey, Question, SurveyDesign } from "@/lib/services/surveys"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { SurveyRender } from "@/components/survey/survey-render"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { checkQuota, PLAN_LIMITS } from "@/lib/services/quotas"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getUserProfile } from "@/lib/services/users"

const steps = [
  { id: 1, name: "Detalles", description: "Esencia de la encuesta" },
  { id: 2, name: "Preguntas", description: "Lógica y estructura" },
  { id: 3, name: "Diseño & Print", description: "Identidad visual premium" },
]

interface SurveyState {
  details: {
    name: string
    description: string
    sede: string
    language: string
  }
  questions: Question[]
  design: SurveyDesign
}

function CrearEncuestaContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free")
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const [quotaInfo, setQuotaInfo] = useState<{ allowed: boolean, limit: number, current: number } | null>(null)

  const [surveyData, setSurveyData] = useState<SurveyState>({
    details: {
      name: "",
      description: "",
      sede: "",
      language: "es",
    },
    questions: [],
    design: {
      template: "modern",
      primaryColor: "#FF7A00",
      logo: null,
      qrPosition: "bottom-right",
    },
  })

  // Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch user profile to get plan
      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserPlan(profile.plan)
          if (!editId) {
            const quota = await checkQuota(user.uid, "surveys")
            setQuotaInfo(quota)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }

      if (editId) {
        try {
          const docRef = doc(db, "surveys", editId)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const data = docSnap.data()
            // Verify ownership
            if (data.ownerId !== user.uid) {
              toast.error("No tienes permiso para editar esta encuesta")
              router.push("/dashboard")
              return
            }

            setSurveyData({
              details: {
                name: data.name || "",
                description: data.description || "",
                sede: data.sede || "",
                language: data.language || "es"
              },
              questions: data.questions || [],
              design: {
                template: data.design?.template || "modern",
                primaryColor: data.design?.primaryColor || "#FF7A00",
                logo: data.design?.logo || null,
                qrPosition: data.design?.qrPosition || "bottom-right"
              }
            })
          } else {
            toast.error("Encuesta no encontrada")
          }
        } catch (error) {
          console.error("Error loading survey:", error)
          toast.error("Error al cargar la encuesta")
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [editId, router])

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber)
  }

  const [publishedSurveyId, setPublishedSurveyId] = useState<string | null>(null)

  const handlePublish = async () => {
    try {
      setIsSubmitting(true)

      // Validate basic data
      if (!surveyData.details.name) {
        toast.error("Por favor completa el nombre de la encuesta")
        setCurrentStep(1)
        setIsSubmitting(false)
        return
      }

      const user = auth.currentUser
      if (!user) {
        toast.error("Debes iniciar sesión para guardar")
        setIsSubmitting(false)
        return
      }

      const payload = {
        ...surveyData.details,
        questions: surveyData.questions,
        design: surveyData.design,
      }

      let surveyId = editId
      if (editId) {
        await updateSurvey(editId, payload)
        toast.success("Encuesta actualizada correctamente")
      } else {
        surveyId = await createSurvey(payload, user.uid)
        toast.success("Encuesta publicada correctamente")
      }

      if (surveyId) {
        setPublishedSurveyId(surveyId)
      } else {
        router.push("/dashboard/encuestas")
      }
    } catch (error) {
      toast.error("Error al guardar la encuesta")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    if (publishedSurveyId) {
      return (
        <div className="col-span-full max-w-4xl mx-auto w-full py-12 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-orange-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-orange-600 shadow-2xl shadow-orange-200">
                <CheckCircle2 className="h-16 w-16" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center animate-bounce">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-5xl font-black tracking-tighter text-slate-900">¡Encuesta Publicada!</h2>
              <p className="text-xl text-slate-500 font-medium italic">Tu nueva experiencia de recolección ya está en vivo.</p>
            </div>

            <div className={`grid grid-cols-1 ${userPlan === "pro" ? "md:grid-cols-2" : "max-w-md mx-auto"} gap-6 pt-8`}>
              {userPlan === "pro" && (
                <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white">
                  <CardContent className="p-10 space-y-6 text-left">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">Elite QR Studio</h3>
                      <p className="text-slate-500 text-sm font-medium">Diseña pósters industriales, tarjetas de mesa y material impreso de alta fidelidad.</p>
                    </div>
                    <Link href={`/dashboard/qr-editor?surveyId=${publishedSurveyId}`}>
                      <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all">
                        Diseñar Material Pro
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-2xl shadow-orange-50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white">
                <CardContent className="p-10 space-y-6 text-left">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Descarga Rápida</h3>
                    <p className="text-slate-500 text-sm font-medium">Obtén un QR estándar listo para compartir digitalmente en segundos.</p>
                  </div>
                  <Link href={`/dashboard/qr-generator?surveyId=${publishedSurveyId}`}>
                    <Button variant="outline" className="w-full h-14 border-2 border-slate-100 hover:bg-slate-50 text-slate-900 font-black rounded-2xl transition-all">
                      Descargar QR Simple
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="pt-12">
              <Link href="/dashboard/encuestas" className="text-slate-400 hover:text-orange-600 font-black uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2">
                Ir a mis encuestas
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <SurveyDetailsStep
            data={surveyData.details}
            onChange={(details) => setSurveyData({ ...surveyData, details })}
          />
        )
      case 2:
        return (
          <SurveyQuestionsStep
            data={surveyData.questions}
            onChange={(questions) => setSurveyData({ ...surveyData, questions })}
          />
        )
      case 3:
        return (
          <SurveyDesignStep data={surveyData.design} onChange={(design) => setSurveyData({ ...surveyData, design })} plan={userPlan} />
        )
      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
            {editId ? "Modo Edición" : "Survey Designer PRO"}
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
            {editId ? "Pule tu" : "Crea tu"} <span className="text-orange-600">Encuesta Elite</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            {editId ? "Ajusta cada detalle para maximizar la tasa de respuesta." : "Diseña una experiencia que tus clientes amarán completar."}
          </p>
        </div>
      </div>

      {quotaInfo && !quotaInfo.allowed && !editId && (
        <Card className="border-none shadow-2xl shadow-orange-100 bg-white rounded-[2.5rem] overflow-hidden border-t-8 border-t-orange-600">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Límite alcanzado ({userPlan})</h3>
                <p className="text-slate-500 font-medium">Has creado {quotaInfo.current} de {quotaInfo.limit} encuestas. Mejora tu plan para más.</p>
              </div>
            </div>
            <Link href="/dashboard/ajustes?tab=billing">
              <Button className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-200 transition-all hover:scale-105">
                Mejorar ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Progress indicator */}
      <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
                  {currentStep}
                </div>
                <div>
                  <div className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Paso Actual</div>
                  <div className="text-lg font-black text-slate-900 leading-none">{steps[currentStep - 1].name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Progreso</div>
                <div className="text-lg font-black text-slate-900 leading-none">{Math.round(progress)}%</div>
              </div>
            </div>

            <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-orange-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`relative p-4 rounded-3xl transition-all duration-300 group text-left ${currentStep === step.id
                    ? "bg-slate-50 ring-1 ring-slate-200"
                    : "hover:bg-slate-50/50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${currentStep === step.id
                      ? "bg-orange-600 text-white"
                      : currentStep > step.id
                        ? "bg-orange-200 text-orange-700"
                        : "bg-slate-200 text-slate-400"
                      }`}>
                      {step.id}
                    </div>
                    <div className="hidden md:block">
                      <div className={`text-sm font-black transition-colors ${currentStep === step.id ? "text-slate-900" : "text-slate-400"
                        }`}>
                        {step.name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">{renderStep()}</div>

        <div className="lg:col-span-1">
          <Card className="sticky top-28 border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="pb-4 pt-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Vista Previa</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Simulación en tiempo real</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-6xl h-[90vh] p-0 overflow-hidden bg-slate-50 border-none rounded-[2.5rem] shadow-3xl flex flex-col">
                      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
                      <div className="relative z-10 h-full w-full flex flex-col overflow-hidden">
                        <DialogHeader className="p-8 md:p-12 pb-6 bg-white/90 backdrop-blur-xl border-b border-slate-100 shrink-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Vista Previa Full-Screen</DialogTitle>
                              <DialogDescription className="text-slate-500 font-medium text-lg mt-1">Explora cada detalle de la experiencia que recibirán tus clientes.</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-6 md:p-16 flex justify-center items-start bg-slate-100/30">
                          <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border-[16px] border-white mb-12 relative z-10">
                            <SurveyRender
                              survey={{
                                name: surveyData.details.name,
                                description: surveyData.details.description,
                                questions: surveyData.questions,
                                design: surveyData.design
                              }}
                              mode="preview"
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">En vivo</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 p-8 min-h-[500px] flex justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
                <div className="transform scale-[0.95] origin-top transition-all duration-500 z-10 w-full">
                  <SurveyRender
                    survey={{
                      name: surveyData.details.name,
                      description: surveyData.details.description,
                      questions: surveyData.questions,
                      design: surveyData.design
                    }}
                    mode="preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-100 sticky bottom-8 border border-slate-50 z-20">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="h-14 px-8 rounded-2xl font-black text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Anterior
        </Button>
        <div className="flex gap-4">
          {currentStep === steps.length ? (
            <Button
              className="h-14 px-10 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-200 transition-all hover:scale-[1.05] active:scale-95"
              onClick={handlePublish}
              disabled={isSubmitting || (quotaInfo?.allowed === false && !editId)}
            >
              {isSubmitting
                ? (editId ? "Guardando..." : "Publicando...")
                : (editId ? "Lanzar Encuesta" : "Publicar ahora")
              }
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.05] active:scale-95"
            >
              Siguiente Paso
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CrearEncuestaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <CrearEncuestaContent />
    </Suspense>
  )
}
