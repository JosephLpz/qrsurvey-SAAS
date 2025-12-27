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
        const paymentStatus = await flowRequest("/payment/getStatus", "GET", { token })

        console.log("Flow Payment Status:", paymentStatus.status)

        /**
         * Flow Status Mapping:
         * 1: Pending
         * 2: Paid
         * 3: Rejected
         * 4: Canceled
         */
        const status = paymentStatus.status
        const optional = paymentStatus.optional ? JSON.parse(paymentStatus.optional) : {}
        const userId = optional.userId
        const commerceOrder = paymentStatus.commerceOrder

        if (!userId) {
            console.error("Flow Webhook: No userId found in optional data")
            return NextResponse.json({ received: true }) // Accept but log error
        }

        switch (status) {
            case 2: // Paid
                console.log("Processing PRO upgrade for:", userId)
                await dbAdmin.collection("users").doc(userId).update({
                    plan: "pro",
                    flowCustomerId: commerceOrder,
                    subscriptionStatus: "active",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                console.log("✅ User upgraded successfully via Flow")
                break

            case 3: // Rejected
            case 4: // Canceled
                console.log(`❌ Payment ${status === 3 ? "rejected" : "canceled"} for user:`, userId)
                // Opcional: degradar plan si era una renovación fallida
                break

            default:
                console.log("Ignored payment status:", status)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Flow Webhook Handler Error:", error)
        // Flow reintenta si no recibe 200 OK
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
