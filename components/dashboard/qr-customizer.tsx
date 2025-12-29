"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Download, Upload, Trash2, Layout, Palette, ShieldCheck, QrCode,
    AlertTriangle, CheckCircle2, Info, Maximize, Ruler, Sliders, Sparkles, RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { toPng } from 'html-to-image'

// Import conditionally for SSR
let QRCodeStyling: any;
if (typeof window !== "undefined") {
    QRCodeStyling = require("qr-code-styling");
}

// --- Technical Utilities ---
const getLuminance = (hex: string) => {
    const rgb = hex.startsWith('#')
        ? [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
        : [0, 0, 0];
    const [r, g, b] = rgb.map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (f: string, b: string) => {
    const l1 = getLuminance(f);
    const l2 = getLuminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const PRESETS = {
    safe: { fgColor: "#000000", bgColor: "#FFFFFF", level: "H" as const, margin: 4, qrStyle: "square" as const, eyeStyle: "square" as const },
    creative: { fgColor: "#FF7A00", bgColor: "#FFFFFF", level: "Q" as const, margin: 2, qrStyle: "dots" as const, eyeStyle: "extra-rounded" as const },
    retail: { fgColor: "#1A1A1A", bgColor: "#F8FAFC", level: "M" as const, margin: 1, qrStyle: "rounded" as const, eyeStyle: "square" as const },
}

export type QRLevel = "L" | "M" | "Q" | "H";
export type QRDotsStyle = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
export type QREyesStyle = "square" | "dot" | "rounded" | "extra-rounded";

export interface QRSettings {
    value: string
    size: number
    level: QRLevel
    fgColor: string
    bgColor: string
    includeImage: boolean
    margin: number
    qrStyle: QRDotsStyle
    eyeStyle: QREyesStyle
    printSize: "A4" | "A5" | "Card" | "Poster"
    headerColor: string
    headerText: string
    imageSettings: {
        src: string
    }
}

interface QRCodeCustomizerProps {
    initialValue?: string
    onSave?: (settings: QRSettings) => void
}

export function QRCodeCustomizer({ initialValue = "https://qrsurvey.com/s/demo", onSave }: QRCodeCustomizerProps) {
    const [settings, setSettings] = useState<QRSettings>({
        value: initialValue,
        size: 500,
        level: "M",
        fgColor: "#000000",
        bgColor: "#FFFFFF",
        includeImage: false,
        margin: 2,
        qrStyle: "square",
        eyeStyle: "square",
        printSize: "A4",
        headerColor: "#FF7A00",
        headerText: "SÍGUENOS",
        imageSettings: {
            src: "",
        },
    })

    // --- Scan Score Logic ---
    const contrast = getContrastRatio(settings.fgColor, settings.bgColor);
    const isContrastOk = contrast >= 3;
    const isHighDensity = settings.value.length > 100;

    let score = 100;
    if (contrast < 7) score -= 15;
    if (contrast < 3) score -= 50;
    if (isHighDensity) score -= 10;
    if (settings.margin < 2) score -= 20;
    const scanScore = Math.max(0, score);

    const [posterTitle, setPosterTitle] = useState("¡Tu opinión nos importa!")
    const [posterSub, setPosterSub] = useState("Escanea el código para dejarnos tus comentarios")

    const qrRef = useRef<HTMLDivElement>(null)
    const posterRef = useRef<HTMLDivElement>(null)
    const qrInstance = useRef<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Initialize or update QR
    useEffect(() => {
        if (typeof window === "undefined" || !QRCodeStyling) return;

        if (!qrInstance.current) {
            qrInstance.current = new QRCodeStyling({
                width: 300,
                height: 300,
                type: "svg",
                data: settings.value,
                dotsOptions: {
                    color: settings.fgColor,
                    type: settings.qrStyle as any,
                },
                backgroundOptions: {
                    color: settings.bgColor,
                },
                qrOptions: {
                    errorCorrectionLevel: settings.level,
                },
                cornersSquareOptions: {
                    type: settings.eyeStyle as any,
                    color: settings.fgColor,
                },
                cornersDotOptions: {
                    type: settings.eyeStyle === "square" ? "square" : "dot",
                    color: settings.fgColor,
                }
            });
            if (qrRef.current) {
                qrRef.current.innerHTML = "";
                qrInstance.current.append(qrRef.current);
            }
        } else {
            qrInstance.current.update({
                data: settings.value,
                dotsOptions: {
                    color: settings.fgColor,
                    type: settings.qrStyle as any,
                },
                backgroundOptions: {
                    color: settings.bgColor,
                },
                qrOptions: {
                    errorCorrectionLevel: settings.level,
                },
                cornersSquareOptions: {
                    type: settings.eyeStyle as any,
                    color: settings.fgColor,
                },
                cornersDotOptions: {
                    type: settings.eyeStyle === "square" ? "square" : "dot",
                    color: settings.fgColor,
                }
            });
        }
    }, [settings]);

    const handleDownload = async () => {
        if (!posterRef.current) return;

        try {
            toast.loading("Generando material de alta fidelidad...", { id: "downloading" });

            // Generate the image from the DOM node
            const dataUrl = await toPng(posterRef.current, {
                pixelRatio: 3,
                cacheBust: true,
                backgroundColor: settings.bgColor,
                filter: (node) => {
                    return !node.classList?.contains('data-export-ignore');
                }
            });

            const link = document.createElement('a');
            link.download = `qrsurvey-poster-pro-${settings.printSize.toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Póster exportado correctamente", { id: "downloading" });
        } catch (error) {
            console.error("Error exporting poster:", error);
            toast.error("Error al exportar el póster", { id: "downloading" });
        }
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSettings({
                    ...settings,
                    includeImage: true,
                    imageSettings: { ...settings.imageSettings, src: reader.result as string }
                })
                if (e.target) e.target.value = ''
            }
            reader.readAsDataURL(file)
        }
    }
    const generateRandomBranding = () => {
        const colors = ["#FF7A00", "#1A1A1A", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];
        const qrStyles: QRDotsStyle[] = ["square", "dots", "rounded", "extra-rounded", "classy"];
        const eyeStyles: QREyesStyle[] = ["square", "dot", "rounded", "extra-rounded"];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomQRStyle = qrStyles[Math.floor(Math.random() * qrStyles.length)];
        const randomEyeStyle = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];

        setSettings(prev => ({
            ...prev,
            fgColor: randomColor,
            headerColor: randomColor,
            qrStyle: randomQRStyle,
            eyeStyle: randomEyeStyle,
            margin: 2
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panels */}
            <div className="space-y-6">
                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-primary/5 rounded-t-xl border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Palette className="h-5 w-5" />
                            Diseño del QR PRO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="presets">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="presets">Plantillas</TabsTrigger>
                                <TabsTrigger value="colors">Estética</TabsTrigger>
                                <TabsTrigger value="logo">Marca</TabsTrigger>
                                <TabsTrigger value="pro">Pro Tech</TabsTrigger>
                            </TabsList>

                            <TabsContent value="presets" className="space-y-4">
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm font-bold">Plantillas prediseñadas</p>
                                    <p className="text-[10px] text-muted-foreground">Selecciona una plantilla optimizada para tu caso de uso</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto p-4 border-2 hover:border-primary transition-all group"
                                        onClick={() => setSettings({ ...settings, ...PRESETS.safe })}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                            <ShieldCheck className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Máxima Fiabilidad (Safe)</div>
                                            <div className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">Mayor fiabilidad, Margin: 4, ECL: Máxima. Recomendado para exteriores.</div>
                                        </div>
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 justify-start h-auto p-4 border-2 hover:border-primary transition-all group"
                                            onClick={() => setSettings({ ...settings, ...PRESETS.creative })}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                                <Sparkles className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm">Branding Creativo</div>
                                                <div className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">Colores y estilos modernos.</div>
                                            </div>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-auto w-12 border-2 hover:border-primary hover:text-primary transition-all"
                                            onClick={generateRandomBranding}
                                            title="Generar combinación aleatoria"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto p-4 border-2 hover:border-primary transition-all group"
                                        onClick={() => setSettings({ ...settings, ...PRESETS.retail })}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                                            <Layout className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">Retail / Etiquetas</div>
                                            <div className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">Optimizado para escanear individualmente y alta densidad de detalles.</div>
                                        </div>
                                    </Button>
                                </div>
                            </TabsContent>


                            <TabsContent value="colors" className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Módulos</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={settings.fgColor}
                                                onChange={(e) => setSettings({ ...settings, fgColor: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                            />
                                            <div className="flex-1 flex items-center px-3 border rounded-lg text-xs font-mono bg-muted/30 uppercase">
                                                {settings.fgColor}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fondo</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={settings.bgColor}
                                                onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                            />
                                            <div className="flex-1 flex items-center px-3 border rounded-lg text-xs font-mono bg-muted/30 uppercase">
                                                {settings.bgColor}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-3 rounded-xl border flex items-center gap-3 ${contrast >= 7 ? "bg-green-50 border-green-100 text-green-700" : contrast >= 3 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                                    {contrast >= 3 ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                                    <div className="text-[11px] font-medium">
                                        {contrast >= 7 ? "Contraste óptimo (AAA)" : contrast >= 3 ? "Legibilidad buena." : "Riesgo de escaneo bajo."}
                                        <span className="ml-1 opacity-70">({contrast.toFixed(1)}:1)</span>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="logo" className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Banner Superior (Póster)</Label>
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 p-2 border rounded-lg text-xs font-bold"
                                                    value={settings.headerText}
                                                    onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                                                />
                                                <input
                                                    type="color"
                                                    value={settings.headerColor}
                                                    onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Logo Superior (Póster)</Label>
                                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${settings.includeImage ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/30"}`}>
                                                {settings.includeImage && settings.imageSettings.src ? (
                                                    <div className="relative group max-w-[120px] mx-auto">
                                                        <img src={settings.imageSettings.src} alt="Logo" className="max-h-20 mx-auto rounded-lg shadow-md bg-white p-1" />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-3 -right-3 h-7 w-7 rounded-full shadow-lg"
                                                            onClick={() => setSettings({ ...settings, includeImage: false })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="font-bold">
                                                            Cargar Logotipo
                                                        </Button>
                                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="pro" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold">Forma Módulos</Label>
                                            <select
                                                className="w-full text-xs p-2 border rounded-lg bg-background font-medium"
                                                value={settings.qrStyle}
                                                onChange={(e) => setSettings({ ...settings, qrStyle: e.target.value as any })}
                                            >
                                                <option value="square">Cuadrado Clásico</option>
                                                <option value="dots">Puntos Modernos</option>
                                                <option value="rounded">Redondeado Suave</option>
                                                <option value="extra-rounded">Extra Redondeado</option>
                                                <option value="classy">Líneas (Classy)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold">Estilo de Ojos</Label>
                                            <select
                                                className="w-full text-xs p-2 border rounded-lg bg-background font-medium"
                                                value={settings.eyeStyle}
                                                onChange={(e) => setSettings({ ...settings, eyeStyle: e.target.value as any })}
                                            >
                                                <option value="square">Cuadrado</option>
                                                <option value="dot">Circular</option>
                                                <option value="rounded">Bordes Suaves</option>
                                                <option value="extra-rounded">Gota / Hoja</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase font-bold">Enlace del QR (Automático)</Label>
                                            <Badge variant="secondary" className="text-[8px] font-black tracking-tighter">Sincronizado</Badge>
                                        </div>
                                        <div className="relative">
                                            <input
                                                className="w-full p-2 border rounded-lg text-xs bg-muted/30 font-mono opacity-60 cursor-not-allowed pr-8"
                                                value={settings.value}
                                                readOnly
                                            />
                                            <Info className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground italic">Este enlace se genera dinámicamente basado en la encuesta seleccionada.</p>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] uppercase font-bold">Quiet Zone (Papel)</Label>
                                            <Badge variant="outline" className="text-[9px]">{settings.margin} units</Badge>
                                        </div>
                                        <Slider
                                            value={[settings.margin]} max={4} min={0} step={1}
                                            onValueChange={([v]) => setSettings({ ...settings, margin: v })}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                    <CardHeader className="bg-accent/5 rounded-t-xl border-b border-accent/10 py-3">
                        <CardTitle className="flex items-center gap-2 text-accent text-sm">
                            <Layout className="h-4 w-4" />
                            Campaña & Póster
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <input
                            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-background font-bold h-10"
                            placeholder="Título del póster..."
                            value={posterTitle}
                            onChange={(e) => setPosterTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full p-2 border rounded-lg text-[10px] focus:ring-2 focus:ring-primary/20 bg-background h-12 resize-none italic"
                            placeholder="Instrucción de escaneo..."
                            value={posterSub}
                            onChange={(e) => setPosterSub(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-accent/5 rounded-t-xl border-b border-accent/10">
                        <CardTitle className="flex items-center gap-2 text-accent">
                            <Ruler className="h-5 w-5" />
                            Tamaño de Impresión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-3">
                            {['A4', 'A5', 'Card', 'Poster'].map((size) => (
                                <Button
                                    key={size}
                                    variant={settings.printSize === size ? "default" : "outline"}
                                    className="h-auto p-4 flex flex-col items-start gap-1 transition-all"
                                    onClick={() => setSettings({ ...settings, printSize: size as any })}
                                >
                                    <span className="font-bold text-[10px]">{size === 'A4' ? 'A4 (210x297mm)' : size === 'A5' ? 'A5 (148x210mm)' : size === 'Card' ? 'Tarjeta (55x85mm)' : 'Póster (50x70cm)'}</span>
                                    <span className="text-[8px] opacity-60">Formato Industrial</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Preview Column */}
            <div className="space-y-6 flex flex-col items-center sticky top-12">
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${scanScore > 80 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Quality Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`h-6 ${scanScore > 80 ? "bg-green-500" : scanScore > 50 ? "bg-amber-500" : "bg-red-500"} border-none text-[11px] font-black`}>
                            {scanScore}
                        </Badge>
                    </div>
                </div>

                {/* Poster Mockup */}
                <div
                    ref={posterRef}
                    className="w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl flex flex-col items-center border-[6px] overflow-hidden relative group transition-all duration-500"
                    style={{
                        borderColor: settings.bgColor === "#FFFFFF" ? "#f1f5f9" : settings.bgColor,
                        backgroundColor: settings.bgColor,
                        aspectRatio: settings.printSize === 'Card' ? '1/1.54' : settings.printSize === 'Poster' ? '1/1.4' : '1/1.414'
                    }}
                >
                    {/* Dynamic Header */}
                    <div
                        className="w-full h-12 flex items-center justify-center animate-in slide-in-from-top duration-500"
                        style={{ backgroundColor: settings.headerColor }}
                    >
                        <span className="text-white font-black text-xs tracking-[0.3em] uppercase">{settings.headerText}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-center z-10 w-full px-6 transition-all">
                        {settings.includeImage && (
                            <img src={settings.imageSettings.src} alt="Brand" className="h-10 mx-auto object-contain mb-2 animate-in fade-in zoom-in duration-500" />
                        )}
                        <h2 className="text-xl font-black leading-tight text-gray-900 transition-all" style={{ color: settings.fgColor }}>
                            {posterTitle}
                        </h2>
                        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">
                            {posterSub}
                        </p>
                    </div>

                    <div
                        className="mt-4 mb-8 p-4 bg-white rounded-[1.5rem] shadow-2xl border-4 relative transition-all group-hover:scale-105 duration-500 flex items-center justify-center overflow-hidden"
                        ref={qrRef}
                        style={{
                            borderColor: settings.fgColor + "15",
                            width: "240px",
                            height: "240px"
                        }}
                    />

                    {/* Scanning Simulation Overlay - Excluded from export */}
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md data-export-ignore">
                        <div className="w-48 h-48 border-2 border-primary/50 rounded-3xl relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(255,122,0,0.8)] animate-scan" />
                            <Sparkles className="h-10 w-10 text-primary opacity-20 animate-pulse" />
                        </div>
                        <div className="mt-8 space-y-2 text-center">
                            <p className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Simulación de Óptica</p>
                            <div className="flex gap-2 justify-center">
                                <Badge variant="outline" className="text-[9px] text-primary border-primary font-bold">LEGIBILIDAD: {scanScore}%</Badge>
                                <Badge variant="outline" className={`text-[9px] font-bold ${contrast < 3 ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}`}>CONTRASTE: {contrast.toFixed(1)}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-[360px]">
                    <div className="grid grid-cols-2 gap-3">
                        <Button className="font-bold h-12 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            DESCARGAR PNG
                        </Button>
                        <Button variant="outline" className="h-12 border-4 font-black text-[10px] uppercase tracking-widest" onClick={() => onSave?.(settings)}>
                            Guardar Perfil
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
