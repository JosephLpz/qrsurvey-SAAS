"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Edit, FileText, Loader2 } from "lucide-react"

interface Question {
  id: string
  type: "multiple_choice" | "rating" | "nps" | "text" | "likert"
  title: string
  description?: string
  required: boolean
  options?: string[]
}

interface SurveyQuestionsStepProps {
  data: Question[]
  onChange: (data: Question[]) => void
}

const questionTypes = [
  { value: "multiple_choice", label: "Opción múltiple", description: "Selección única o múltiple" },
  { value: "rating", label: "Escala de valoración", description: "1-5 estrellas o números" },
  { value: "nps", label: "Net Promoter Score", description: "Escala 0-10 de recomendación" },
  { value: "likert", label: "Escala Likert", description: "Muy en desacuerdo a Muy de acuerdo" },
  { value: "text", label: "Texto libre", description: "Respuesta abierta" },
]

export function SurveyQuestionsStep({ data, onChange }: SurveyQuestionsStepProps) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "multiple_choice",
    title: "",
    description: "",
    required: true,
    options: ["", ""],
  })

  const addQuestion = () => {
    if (!newQuestion.title) return

    const question: Question = {
      id: Date.now().toString(),
      type: newQuestion.type as Question["type"],
      title: newQuestion.title,
      description: newQuestion.description,
      required: newQuestion.required || false,
      options: newQuestion.type === "multiple_choice" ? newQuestion.options?.filter(Boolean) : undefined,
    }

    onChange([...data, question])
    setNewQuestion({
      type: "multiple_choice",
      title: "",
      description: "",
      required: true,
      options: ["", ""],
    })
  }

  const removeQuestion = (id: string) => {
    onChange(data.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onChange(data.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), ""],
    })
  }

  const updateOption = (index: number, value: string) => {
    const options = [...(newQuestion.options || [])]
    options[index] = value
    setNewQuestion({ ...newQuestion, options })
  }

  const removeOption = (index: number) => {
    const options = [...(newQuestion.options || [])]
    options.splice(index, 1)
    setNewQuestion({ ...newQuestion, options })
  }

  return (
    <div className="space-y-8">
      {/* Existing questions */}
      <div className="space-y-6">
        {data.map((question, index) => (
          <Card key={question.id} className="border-none shadow-xl shadow-slate-100 rounded-[2rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 pt-6 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors cursor-move">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Badge className="bg-slate-900 hover:bg-slate-900 font-black text-[10px] uppercase tracking-widest rounded-full py-1 px-3">
                    {questionTypes.find((t) => t.value === question.type)?.label}
                  </Badge>
                  {question.required && (
                    <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none font-black text-[10px] uppercase tracking-widest rounded-full py-1 px-3">
                      Obligatoria
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-orange-50 hover:text-orange-600" onClick={() => setEditingQuestion(question.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => removeQuestion(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="space-y-3">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  <span className="text-orange-600 mr-2">{index + 1}.</span> {question.title}
                </h4>
                {question.description && <p className="text-slate-500 font-medium">{question.description}</p>}
                {question.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{option}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new question */}
      <Card className="border-none shadow-2xl shadow-orange-100 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pb-4 pt-10 px-10">
          <CardTitle className="text-2xl font-black text-slate-900">Añadir Nueva Pregunta</CardTitle>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Configuración Técnica</p>
        </CardHeader>
        <CardContent className="space-y-8 px-10 pb-12">
          <div className="space-y-2">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Tipo de interacción</Label>
            <Select
              value={newQuestion.type}
              onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as Question["type"] })}
            >
              <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                {questionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="py-3">
                    <div className="flex flex-col">
                      <div className="font-black text-slate-900 text-sm">{type.label}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Pregunta *</Label>
            <Input
              placeholder="Ej: ¿Qué tan satisfecho estás con nuestro servicio?"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Descripción o Instrucciones (opcional)</Label>
            <Textarea
              placeholder="Ayuda a tus clientes a entender mejor la pregunta..."
              value={newQuestion.description}
              onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
              rows={2}
              className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium text-slate-700 p-4"
            />
          </div>

          {newQuestion.type === "multiple_choice" && (
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Opciones de respuesta</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <Input
                      placeholder={`Opción ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold text-slate-700"
                    />
                    {(newQuestion.options?.length || 0) > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="rounded-xl hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addOption} className="h-12 border-dashed border-2 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all font-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Opción
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setNewQuestion({ ...newQuestion, required: !newQuestion.required })}>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newQuestion.required ? 'bg-orange-600 border-orange-600' : 'border-slate-200'}`}>
                {newQuestion.required && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <Label className="text-sm font-black text-slate-600 cursor-pointer">
                Pregunta obligatoria
              </Label>
            </div>
            <Button onClick={addQuestion} disabled={!newQuestion.title} className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.05] active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Integrar Pregunta
            </Button>
          </div>
        </CardContent>
      </Card>

      {data.length === 0 && (
        <Card className="border-none shadow-none bg-slate-50 rounded-[2.5rem] py-20 px-8 text-center">
          <CardContent className="space-y-4">
            <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center text-slate-200 shadow-sm">
              <FileText className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Estructura Vacía</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">Comienza añadiendo tu primera pregunta para dar vida a tu encuesta inteligente.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
