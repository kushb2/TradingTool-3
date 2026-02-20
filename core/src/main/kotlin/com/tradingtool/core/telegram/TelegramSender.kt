package com.tradingtool.core.telegram

import com.tradingtool.core.model.telegram.TelegramSendFileRequest
import com.tradingtool.core.model.telegram.TelegramSendResponse
import com.tradingtool.core.model.telegram.TelegramSendResult
import com.tradingtool.core.model.telegram.TelegramSendStatus
import com.tradingtool.core.model.telegram.TelegramSendTextRequest
import jakarta.inject.Singleton

@Singleton
class TelegramSender(
    private val telegramApiClient: TelegramApiClient,
) : AutoCloseable {

    fun isConfigured(): Boolean {
        return telegramApiClient.isConfigured()
    }

    suspend fun sendText(request: TelegramSendTextRequest): TelegramSendResult {
        val text = request.text.trim()
        if (text.isEmpty()) {
            return badRequestResult("Text message cannot be empty.")
        }

        return runCatching {
            val apiResult = telegramApiClient.sendText(text = text)
            toSendResult(apiResult, successMessage = "Text sent to Telegram.")
        }.getOrElse { error ->
            failedResult(error.message ?: "Failed to send text to Telegram.")
        }
    }

    suspend fun sendImage(request: TelegramSendFileRequest): TelegramSendResult {

        if (!isImageFile(request)) {
            return badRequestResult("Only image files are allowed for this endpoint.")
        }

        return sendFile(
            method = "sendPhoto",
            fileFieldName = "photo",
            request = request,
            successMessage = "Image sent to Telegram.",
            failureMessage = "Failed to upload image to Telegram.",
        )
    }

    suspend fun sendExcel(request: TelegramSendFileRequest): TelegramSendResult {


        if (!isExcelFile(request)) {
            return badRequestResult("Only .xls or .xlsx files are allowed for this endpoint.")
        }

        return sendFile(
            method = "sendDocument",
            fileFieldName = "document",
            request = request,
            successMessage = "Excel file sent to Telegram.",
            failureMessage = "Failed to upload file to Telegram.",
        )
    }

    override fun close() {
        // No-op: shared HttpClient lifecycle is managed by DI container wiring.
    }

    private suspend fun sendFile(
        method: String,
        fileFieldName: String,
        request: TelegramSendFileRequest,
        successMessage: String,
        failureMessage: String,
    ): TelegramSendResult {
        return runCatching {
            val apiResult = telegramApiClient.sendFile(
                method = method,
                fileFieldName = fileFieldName,
                request = request,
            )
            toSendResult(apiResult, successMessage = successMessage)
        }.getOrElse { error ->
            failedResult(error.message ?: failureMessage)
        }
    }

    private fun toSendResult(
        apiResult: TelegramApiCallResult,
        successMessage: String,
    ): TelegramSendResult {
        if (apiResult.statusCode !in 200..299 || !apiResult.response.ok) {
            val description = apiResult.response.description
                ?: "Telegram API request failed with status ${apiResult.statusCode}."
            return failedResult(description)
        }

        return TelegramSendResult(
            status = TelegramSendStatus.SUCCESS,
            response = TelegramSendResponse(
                ok = true,
                message = successMessage,
                telegramDescription = apiResult.response.description,
            ),
        )
    }

    private fun isImageFile(request: TelegramSendFileRequest): Boolean {
        val lowerContentType = request.contentType.lowercase()
        if (lowerContentType.startsWith("image/")) {
            return true
        }

        val lowerName = request.fileName.lowercase()
        return lowerName.endsWith(".png")
            || lowerName.endsWith(".jpg")
            || lowerName.endsWith(".jpeg")
            || lowerName.endsWith(".webp")
    }

    private fun isExcelFile(request: TelegramSendFileRequest): Boolean {
        val lowerName = request.fileName.lowercase()
        if (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")) {
            return true
        }

        val lowerContentType = request.contentType.lowercase()
        return lowerContentType == "application/vnd.ms-excel"
            || lowerContentType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
}
