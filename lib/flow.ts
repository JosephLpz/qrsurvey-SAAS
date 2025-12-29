import crypto from "crypto"

// Flow API Configuration
// Validation removed to allow build without env vars


const FLOW_API_URL = process.env.FLOW_API_URL || "https://www.flow.cl/api"

export interface FlowConfig {
    apiKey: string
    secretKey: string
    apiUrl: string
}

export const flowConfig: FlowConfig = {
    apiKey: process.env.FLOW_API_KEY || "",
    secretKey: process.env.FLOW_SECRET_KEY || "",
    apiUrl: FLOW_API_URL,
}

/**
 * Genera la firma para Flow API
 * 1. Ordena los parámetros alfabéticamente
 * 2. Concatena nombre y valor de cada parámetro
 * 3. Hashea con HMAC-SHA256 usando el secretKey
 */
export function generateSignature(params: Record<string, any>): string {
    const keys = Object.keys(params).sort()
    let data = ""
    for (const key of keys) {
        data += key + params[key]
    }
    return crypto
        .createHmac("sha256", flowConfig.secretKey)
        .update(data)
        .digest("hex")
}

// Helper para hacer requests autenticados a Flow API
export async function flowRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    params: Record<string, any> = {}
): Promise<any> {
    if (!flowConfig.apiKey || !flowConfig.secretKey) {
        throw new Error("Flow API keys are missing. Please set FLOW_API_KEY and FLOW_SECRET_KEY in your environment variables.")
    }

    const url = `${flowConfig.apiUrl}${endpoint}`

    // Todos los requests de Flow requieren apiKey y firma 's'
    const fullParams = {
        ...params,
        apiKey: flowConfig.apiKey,
    }

    const signature = generateSignature(fullParams)

    // Todos los parámetros van en el body para POST/PUT en formato x-www-form-urlencoded
    const bodyParams = new URLSearchParams()

    // Añadir todos los parámetros originales (incluyendo apiKey)
    for (const [key, value] of Object.entries(fullParams)) {
        bodyParams.append(key, String(value))
    }
    // La firma 's' debe ser el último parámetro
    bodyParams.append("s", signature)

    console.log(`[Flow Debug] URL: ${url}`)
    console.log(`[Flow Debug] Method: ${method}`)
    console.log(`[Flow Debug] Parameters:`, Object.keys(fullParams).join(", "), "s")
    console.log(`[Flow Debug] Body String: ${bodyParams.toString()}`)

    const options: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    }

    if (method === "POST" || method === "PUT") {
        options.body = bodyParams.toString()
    } else {
        // Para GET, todo va en la URL
        const getUrl = `${url}?${bodyParams.toString()}`
        return fetch(getUrl, options).then(async (res) => {
            if (!res.ok) {
                const text = await res.text()
                console.error(`[Flow API Error] GET ${endpoint}:`, {
                    status: res.status,
                    response: text
                })
                throw new Error(`Flow API error: ${res.status} - ${text}`)
            }
            return res.json()
        })
    }

    try {
        const response = await fetch(url, options)

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Flow API Error] ${method} ${endpoint}:`, {
                status: response.status,
                response: errorText
            })
            throw new Error(`Flow API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log(`[Flow API Success] ${method} ${endpoint}`)
        return data
    } catch (error: any) {
        console.error(`[Flow API Failure] ${method} ${endpoint}:`, error.message)
        throw error
    }
}


