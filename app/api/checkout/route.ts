import { NextResponse } from "next/server"
import { flowRequest } from "@/lib/flow"

export async function POST(req: Request) {
    try {
        const { userId, userEmail } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const origin = req.headers.get("origin") || ""

        const checkoutData = {
            commerceOrder: `pro-${userId}-${Date.now()}`.substring(0, 45), // Flow limit 45 chars
            subject: "Plan Pro - QRSurvey",
            amount: process.env.FLOW_PRO_PRICE || "19000",
            email: userEmail,
            urlConfirmation: `${origin}/api/webhook`,
            urlReturn: `${origin}/dashboard/ajustes?success=true`,
            currency: "CLP",
            optional: JSON.stringify({
                userId: userId,
            }),
        }

        // Endpoint: /payment/create
        // Flow retorna { url: string, token: string }
        const flowResponse = await flowRequest("/payment/create", "POST", checkoutData)

        if (!flowResponse.url || !flowResponse.token) {
            console.error("Flow invalid response:", flowResponse)
            throw new Error("Invalid response from Flow")
        }

        // Se redirige al usuario a la URL con el token
        const paymentUrl = `${flowResponse.url}?token=${flowResponse.token}`

        return NextResponse.json({ url: paymentUrl })
    } catch (error: any) {
        console.error("Flow Checkout Error:", error)
        return NextResponse.json({ error: error.message || "Error al crear el pago" }, { status: 500 })
    }
}
