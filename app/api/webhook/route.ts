import { NextResponse } from "next/server"
import { dbAdmin } from "@/lib/firebase-admin"
import * as admin from "firebase-admin"
import { flowRequest } from "@/lib/flow"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const token = formData.get("token")

        if (!token) {
            console.error("Flow Webhook: No token received")
            return NextResponse.json({ error: "No token" }, { status: 400 })
        }

        console.log("Flow Webhook: Received token:", token)

        // Obtener estado del pago usando el token
        console.log(`[Flow Webhook] Fetching status for token: ${token}`)
        const paymentStatus = await flowRequest("/payment/getStatus", "GET", { token })

        console.log(`[Flow Webhook] Payment Status: ${paymentStatus.status} for Order: ${paymentStatus.commerceOrder}`)

        /**
         * Flow Status Mapping:
         * 1: Pending
         * 2: Paid
         * 3: Rejected
         * 4: Canceled
         */
        const status = paymentStatus.status
        const optional = paymentStatus.optional
            ? (typeof paymentStatus.optional === 'string' ? JSON.parse(paymentStatus.optional) : paymentStatus.optional)
            : {}
        const userId = optional.userId
        const commerceOrder = paymentStatus.commerceOrder

        if (!userId) {
            console.error("[Flow Webhook Error] No userId found in optional data. paymentStatus:", JSON.stringify(paymentStatus))
            return NextResponse.json({ received: true, error: "No userId in metadata" })
        }

        switch (status) {
            case 2: // Paid
                console.log(`[Flow Webhook] Processing PRO upgrade for user: ${userId}`)
                await dbAdmin.collection("users").doc(userId).update({
                    plan: "pro",
                    flowCustomerId: commerceOrder,
                    subscriptionStatus: "active",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                console.log(`[Flow Webhook] ✅ User ${userId} upgraded successfully`)
                break

            case 3: // Rejected
            case 4: // Canceled
                console.log(`[Flow Webhook] ❌ Payment ${status === 3 ? "rejected" : "canceled"} for user: ${userId}`)
                break

            default:
                console.log(`[Flow Webhook] ℹ️ Ignored payment status: ${status} for user: ${userId}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("[Flow Webhook Critical Error]:", error)
        return NextResponse.json({ error: "Webhook handler failed", message: error.message }, { status: 500 })
    }
}
