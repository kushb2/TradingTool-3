package com.tradingtool.core.telegram

import com.tradingtool.core.model.telegram.TelegramApiResponse
import com.tradingtool.core.model.telegram.TelegramSendFileRequest
import com.tradingtool.core.model.telegram.TelegramSendResponse
import com.tradingtool.core.model.telegram.TelegramSendResult
import com.tradingtool.core.model.telegram.TelegramSendStatus
import com.tradingtool.core.model.telegram.TelegramSendTextRequest
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitForm
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.parameters
import kotlinx.serialization.json.Json

class TelegramSender(
    private val botToken: String,
    private val chatId: String,
    private val httpClient: HttpClient = HttpClient(CIO),
    private val json: Json = Json { ignoreUnknownKeys = true },
) : AutoCloseable {
    fun isConfigured(): Boolean {
        return botToken.isNotBlank() && chatId.isNotBlank()
    }

    suspend fun sendText(request: TelegramSendTextRequest): TelegramSendResult {
        if (!isConfigured()) {
            return notConfiguredResult()
        }

        val text: String = request.text.trim()
        if (text.isEmpty()) {
            return badRequestResult("Text message cannot be empty.")
        }

        return runCatching {
            val response: HttpResponse = httpClient.submitForm(
                url = "$baseUrl/sendMessage",
                formParameters = parameters {
                    append("chat_id", chatId)
                    append("text", text)
                },
            )
            parseHttpResponse(response, successMessage = "Text sent to Telegram.")
        }.getOrElse { error ->
            failedResult(error.message ?: "Failed to send text to Telegram.")
        }
    }

    suspend fun sendImage(request: TelegramSendFileRequest): TelegramSendResult {
        if (!isConfigured()) {
            return notConfiguredResult()
        }

        if (!isImageFile(request)) {
            return badRequestResult("Only image files are allowed for this endpoint.")
        }

        return sendMultipartFile(
            method = "sendPhoto",
            fileFieldName = "photo",
            request = request,
            successMessage = "Image sent to Telegram.",
        )
    }

    suspend fun sendExcel(request: TelegramSendFileRequest): TelegramSendResult {
        if (!isConfigured()) {
            return notConfiguredResult()
        }

        if (!isExcelFile(request)) {
            return badRequestResult("Only .xls or .xlsx files are allowed for this endpoint.")
        }

        return sendMultipartFile(
            method = "sendDocument",
            fileFieldName = "document",
            request = request,
            successMessage = "Excel file sent to Telegram.",
        )
    }

    override fun close() {
        httpClient.close()
    }

    private suspend fun sendMultipartFile(
        method: String,
        fileFieldName: String,
        request: TelegramSendFileRequest,
        successMessage: String,
    ): TelegramSendResult {
        return runCatching {
            val safeFileName: String = sanitizeFileName(request.fileName)
            val response: HttpResponse = httpClient.post("$baseUrl/$method") {
                setBody(
                    MultiPartFormDataContent(
                        parts = formData {
                            append("chat_id", chatId)
                            if (!request.caption.isNullOrBlank()) {
                                append("caption", request.caption.trim())
                            }
                            append(
                                key = fileFieldName,
                                value = request.bytes,
                                headers = Headers.build {
                                    append(
                                        HttpHeaders.ContentDisposition,
                                        "filename=\"$safeFileName\"",
                                    )
                                    append(HttpHeaders.ContentType, request.contentType)
                                },
                            )
                        },
                    ),
                )
            }
            parseHttpResponse(response, successMessage = successMessage)
        }.getOrElse { error ->
            failedResult(error.message ?: "Failed to upload file to Telegram.")
        }
    }

    private suspend fun parseHttpResponse(
        response: HttpResponse,
        successMessage: String,
    ): TelegramSendResult {
        val responseText: String = response.bodyAsText()
        val parsedResponse: TelegramApiResponse = parseTelegramResponse(responseText)

        if (response.status.value !in 200..299 || !parsedResponse.ok) {
            val description: String = parsedResponse.description
                ?: "Telegram API request failed with status ${response.status.value}."
            return failedResult(description)
        }

        return TelegramSendResult(
            status = TelegramSendStatus.SUCCESS,
            response = TelegramSendResponse(
                ok = true,
                message = successMessage,
                telegramDescription = parsedResponse.description,
            ),
        )
    }

    private fun parseTelegramResponse(responseText: String): TelegramApiResponse {
        return runCatching {
            json.decodeFromString<TelegramApiResponse>(responseText)
        }.getOrElse {
            TelegramApiResponse(
                ok = false,
                description = responseText.ifBlank { "Unexpected Telegram response." },
            )
        }
    }

    private fun isImageFile(request: TelegramSendFileRequest): Boolean {
        val lowerContentType: String = request.contentType.lowercase()
        if (lowerContentType.startsWith("image/")) {
            return true
        }

        val lowerName: String = request.fileName.lowercase()
        return lowerName.endsWith(".png")
            || lowerName.endsWith(".jpg")
            || lowerName.endsWith(".jpeg")
            || lowerName.endsWith(".webp")
    }

    private fun isExcelFile(request: TelegramSendFileRequest): Boolean {
        val lowerName: String = request.fileName.lowercase()
        if (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")) {
            return true
        }

        val lowerContentType: String = request.contentType.lowercase()
        return lowerContentType == "application/vnd.ms-excel"
            || lowerContentType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }

    private fun sanitizeFileName(fileName: String): String {
        val cleanName: String = fileName.trim().replace("\"", "")
        if (cleanName.isBlank()) {
            return "upload.bin"
        }
        return cleanName
    }

    private fun notConfiguredResult(): TelegramSendResult {
        return TelegramSendResult(
            status = TelegramSendStatus.NOT_CONFIGURED,
            response = TelegramSendResponse(
                ok = false,
                message = "Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.",
            ),
        )
    }

    private fun badRequestResult(message: String): TelegramSendResult {
        return TelegramSendResult(
            status = TelegramSendStatus.BAD_REQUEST,
            response = TelegramSendResponse(
                ok = false,
                message = message,
            ),
        )
    }

    private fun failedResult(description: String): TelegramSendResult {
        return TelegramSendResult(
            status = TelegramSendStatus.FAILED,
            response = TelegramSendResponse(
                ok = false,
                message = "Telegram API request failed.",
                telegramDescription = description,
            ),
        )
    }

    private val baseUrl: String
        get() = "https://api.telegram.org/bot$botToken"
}
