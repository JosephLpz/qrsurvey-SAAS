"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star, Loader2 } from "lucide-react"
import { Survey, Question } from "@/lib/services/surveys"

interface SurveyRenderProps {
    survey: Partial<Survey>
    mode: "preview" | "live"
    onResponseChange?: (questionId: string, value: any) => void
    onSubmit?: () => void
    isSubmitting?: boolean
}

export function SurveyRender({
    survey,
    mode = "preview",
    onResponseChange,
    onSubmit,
    isSubmitting = false,
}: SurveyRenderProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})

    const questions = survey.questions || []
    const design = survey.design || { primaryColor: "#000000", template: "modern" }

    const handleAnswer = (questionId: string, value: any) => {
        if (mode === "preview") return

        setAnswers((prev) => ({ ...prev, [questionId]: value }))
        if (onResponseChange) {
            onResponseChange(questionId, value)
        }
    }

    // Styles based on design settings
    const isClassic = design.template === "classic"
    const isColorful = design.template === "colorful"
    const isMinimal = design.template === "minimal"

    const containerStyle = {
        fontFamily: isClassic ? "Georgia, serif" : "Inter, sans-serif",
    }

    const primaryColorStyle = {
        color: design.primaryColor,
    }

    const primaryBgStyle = {
        backgroundColor: design.primaryColor,
    }

    const cardClasses = `border-none shadow-lg transition-all duration-500 ${isMinimal ? "shadow-none border border-gray-200" : ""
        } ${isColorful ? "bg-gradient-to-br from-white to-gray-50 border-t-8" : ""
        }`

    const cardStyle = isColorful ? { borderTopColor: design.primaryColor } : {}

    const renderQuestion = (question: Question, index: number) => {
        return (
            <div key={question.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                    <Label className={`text-xl font-black text-slate-900 ${isClassic ? "text-2xl" : ""}`}>
                        <span className="mr-3 text-orange-600">
                            {index + 1}.
                        </span>
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {question.description && (
                        <p className="text-sm text-slate-500 font-medium italic ml-7">{question.description}</p>
                    )}
                </div>

                <div className="pt-2">
                    {question.type === "text" && (
                        <Textarea
                            placeholder="Escribe tu respuesta aquí..."
                            disabled={mode === "preview"}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className={`resize-none h-32 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium text-slate-900 ${isMinimal ? "bg-gray-50 border-0" : ""}`}
                        />
                    )}

                    {question.type === "multiple_choice" && (
                        <RadioGroup
                            disabled={mode === "preview"}
                            onValueChange={(val) => handleAnswer(question.id, val)}
                            className="space-y-3"
                        >
                            {question.options?.map((option, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center space-x-4 border-2 p-5 rounded-2xl hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer font-bold ${isMinimal ? "border-0 bg-gray-50" : "border-slate-100 bg-white"
                                        } ${answers[question.id] === option ? "ring-2 ring-orange-500 border-orange-500 bg-orange-50" : ""}`}
                                >
                                    <RadioGroupItem value={option} id={`${question.id}-${i}`} className={answers[question.id] === option ? "text-orange-600" : ""} />
                                    <Label htmlFor={`${question.id}-${i}`} className="flex-grow cursor-pointer font-bold text-slate-900">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {question.type === "rating" && (
                        <div className="flex gap-3 justify-center py-4">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    disabled={mode === "preview"}
                                    onClick={() => handleAnswer(question.id, rating)}
                                    className={`p-3 rounded-2xl transition-all ${answers[question.id] >= rating
                                        ? "text-orange-600 bg-orange-50 scale-110"
                                        : "text-slate-300 hover:text-orange-400 hover:bg-slate-50"
                                        }`}
                                >
                                    <Star
                                        className={`h-10 w-10 ${answers[question.id] >= rating ? "fill-current" : ""}`}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {question.type === "nps" && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap justify-between gap-2">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                    <button
                                        key={score}
                                        type="button"
                                        disabled={mode === "preview"}
                                        onClick={() => handleAnswer(question.id, score)}
                                        className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${answers[question.id] === score
                                            ? "text-white scale-110 shadow-lg bg-orange-600"
                                            : "bg-slate-100 hover:bg-orange-50 text-slate-900 border-2 border-slate-200 hover:border-orange-200"
                                            }`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                <span>Nada probable</span>
                                <span>Muy probable</span>
                            </div>
                        </div>
                    )}

                    {question.type === "likert" && (
                        <RadioGroup
                            disabled={mode === "preview"}
                            onValueChange={(val) => handleAnswer(question.id, val)}
                            className="space-y-3"
                        >
                            {[
                                "Muy en desacuerdo",
                                "En desacuerdo",
                                "Neutral",
                                "De acuerdo",
                                "Muy de acuerdo"
                            ].map((option, i) => (
                                <div key={i} className="flex items-center space-x-4 border-2 border-slate-100 p-4 rounded-2xl hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer">
                                    <RadioGroupItem value={option} id={`${question.id}-${i}`} className={answers[question.id] === option ? "text-orange-600" : ""} />
                                    <Label htmlFor={`${question.id}-${i}`} className="font-bold text-slate-900 cursor-pointer flex-grow">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full max-w-2xl mx-auto ${mode === "preview" ? "pointer-events-none select-none" : ""}`} style={containerStyle}>
            <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white" style={cardStyle}>
                {!isMinimal && <div className="h-1 w-full" style={primaryBgStyle} />}
                <CardContent className="p-8 lg:p-12 space-y-10">
                    {/* Header */}
                    <div className={`text-center space-y-6 pb-8 ${!isMinimal ? "border-b border-slate-100" : ""}`}>
                        {design.logo && (
                            <div className="flex justify-center mb-6">
                                <img
                                    src={design.logo}
                                    alt="Logo empresa"
                                    className="h-20 object-contain"
                                    onError={(e) => {
                                        // Fallback if image fails
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div>
                            <h1 className={`text-3xl lg:text-4xl font-black text-slate-900 ${isClassic ? "uppercase tracking-wide" : ""}`}>
                                {survey.name || "Sin título"}
                            </h1>
                            {survey.description && (
                                <p className="text-slate-500 font-medium mt-4 text-lg leading-relaxed">{survey.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-10">
                        {questions.length > 0 ? (
                            questions.map((q, i) => renderQuestion(q as Question, i))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No hay preguntas configuradas todavía.
                            </div>
                        )}
                    </div>



                    {/* Submit Button (Live Mode Only) */}
                    {mode === "live" && questions.length > 0 && (
                        <div className="pt-8 border-t border-slate-100">
                            <Button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="w-full h-16 text-lg font-black rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-3">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Enviando...
                                    </span>
                                ) : (
                                    "Enviar respuestas"
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {mode === "live" && (
                <div className="mt-10 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-300 text-xs">
                        <span className="font-medium">Powered by</span>
                        <span className="font-black uppercase tracking-widest">QRSurvey</span>
                    </div>
                </div>
            )}
        </div>
    )
}
