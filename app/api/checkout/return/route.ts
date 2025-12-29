import { NextResponse } from "next/server"
import { flowRequest } from "@/lib/flow"
import { dbAdmin } from "@/lib/firebase-admin"
import * as admin from "firebase-admin"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const token = formData.get("token")

        if (!token) {
            console.error("[Flow Return] No token received in redirect")
            return NextResponse.redirect(new URL("/dashboard/ajustes?error=no-token", req.url))
        }

        console.log(`[Flow Return] Handling redirect for token: ${token}`)

        // Consultar estado del pago
        const paymentStatus = await flowRequest("/payment/getStatus", "GET", { token: String(token) })

        const status = Number(paymentStatus.status)
        const optional = paymentStatus.optional
            ? (typeof paymentStatus.optional === 'string' ? JSON.parse(paymentStatus.optional) : paymentStatus.optional)
            : {}
        const userId = optional.userId
        const commerceOrder = paymentStatus.commerceOrder

        let redirectPath = "/dashboard/ajustes"

        if (status === 2) {
            console.log(`[Flow Return] Payment successful (Paid). Updating user: ${userId}`)

            // Actualización de seguridad: si el webhook no llega (como en localhost), 
            // actualizamos aquí para que el usuario vea el cambio inmediato.
            if (userId) {
                await dbAdmin.collection("users").doc(userId).update({
                    plan: "pro",
                    flowCustomerId: commerceOrder,
                    subscriptionStatus: "active",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                console.log(`[Flow Return] ✅ User ${userId} upgraded successfully in redirect handler`)
                redirectPath += "?success=true"
            } else {
                console.error("[Flow Return Error] No userId found in optional metadata during success redirect")
                redirectPath += "?error=missing-user-id"
            }
        } else if (status === 3 || status === 4) {
            console.log(`[Flow Return] ❌ Payment was ${status === 3 ? "rejected" : "canceled"}`)
            redirectPath += "?canceled=true"
        } else {
            console.log(`[Flow Return] Payment status is pending or other: ${status}`)
            redirectPath += "?pending=true"
        }

        console.log(`[Flow Return] Final redirect to: ${redirectPath}`)
        const origin = new URL(req.url).origin
        return NextResponse.redirect(new URL(redirectPath, origin), 303)
    } catch (error: any) {
        console.error("[Flow Return Error]:", error)
        const origin = new URL(req.url).origin
        return NextResponse.redirect(new URL("/dashboard/ajustes?error=redirect-failed", origin), 303)
    }
}
