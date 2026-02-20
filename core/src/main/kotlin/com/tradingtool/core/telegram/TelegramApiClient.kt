package com.tradingtool.core.telegram

import com.tradingtool.core.http.HttpRequestData
import com.tradingtool.core.http.HttpRequestExecutor
import com.tradingtool.core.model.telegram.TelegramApiResponse
import com.tradingtool.core.model.telegram.TelegramSendFileRequest
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.io.ByteArrayOutputStream
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.time.Duration
import kotlinx.serialization.json.Json

internal data class TelegramApiCallResult(
    val statusCode: Int,
    val response: TelegramApiResponse,
)

@Singleton
class TelegramApiClient @Inject constructor(
    private val botToken: String,
    private val chatId: String,
    private val httpRequestExecutor: HttpRequestExecutor,
    private val json: Json,
) {
    fun isConfigured(): Boolean {
        return botToken.isNotBlank() && chatId.isNotBlank()
    }

    internal suspend fun sendText(text: String): TelegramApiCallResult {
        val requestData = HttpRequestData(
            method = "POST",
            uri = URI.create("$baseUrl/sendMessage"),
            timeout = Duration.ofSeconds(60),
            headers = mapOf("Content-Type" to "application/x-www-form-urlencoded"),
            body = buildFormUrlEncoded(
                "chat_id" to chatId,
                "text" to text,
            ).toByteArray(StandardCharsets.UTF_8),
        )
        return executeAndParse(requestData)
    }

    internal suspend fun sendFile(
        method: String,
        fileFieldName: String,
        request: TelegramSendFileRequest,
    ): TelegramApiCallResult {
        val boundary = "----TelegramBoundary${System.currentTimeMillis()}"
        val requestData = HttpRequestData(
            method = "POST",
            uri = URI.create("$baseUrl/$method"),
            timeout = Duration.ofSeconds(120),
            headers = mapOf("Content-Type" to "multipart/form-data; boundary=$boundary"),
            body = buildMultipartBody(
                boundary = boundary,
                fileFieldName = fileFieldName,
                fileBytes = request.bytes,
                fileName = sanitizeFileName(request.fileName),
                contentType = request.contentType,
                chatId = chatId,
                caption = request.caption?.trim()?.takeIf { it.isNotEmpty() },
            ),
        )
        return executeAndParse(requestData)
    }

    private suspend fun executeAndParse(requestData: HttpRequestData): TelegramApiCallResult {
        val response = httpRequestExecutor.execute(requestData)
        return TelegramApiCallResult(
            statusCode = response.statusCode,
            response = parseTelegramResponse(response.body),
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

    private fun buildFormUrlEncoded(vararg pairs: Pair<String, String>): String {
        return pairs.joinToString("&") { (key, value) ->
            "${URLEncoder.encode(key, StandardCharsets.UTF_8)}=${URLEncoder.encode(value, StandardCharsets.UTF_8)}"
        }
    }

    private fun buildMultipartBody(
        boundary: String,
        fileFieldName: String,
        fileBytes: ByteArray,
        fileName: String,
        contentType: String,
        chatId: String,
        caption: String?,
    ): ByteArray {
        val output = ByteArrayOutputStream()
        val lineEnd = "\r\n".toByteArray(StandardCharsets.UTF_8)
        val boundaryBytes = "--$boundary".toByteArray(StandardCharsets.UTF_8)
        val finalBoundaryBytes = "--$boundary--".toByteArray(StandardCharsets.UTF_8)

        output.write(boundaryBytes)
        output.write(lineEnd)
        output.write("Content-Disposition: form-data; name=\"chat_id\"".toByteArray(StandardCharsets.UTF_8))
        output.write(lineEnd)
        output.write(lineEnd)
        output.write(chatId.toByteArray(StandardCharsets.UTF_8))
        output.write(lineEnd)

        if (caption != null) {
            output.write(boundaryBytes)
            output.write(lineEnd)
            output.write("Content-Disposition: form-data; name=\"caption\"".toByteArray(StandardCharsets.UTF_8))
            output.write(lineEnd)
            output.write(lineEnd)
            output.write(caption.toByteArray(StandardCharsets.UTF_8))
            output.write(lineEnd)
        }

        output.write(boundaryBytes)
        output.write(lineEnd)
        output.write(
            "Content-Disposition: form-data; name=\"$fileFieldName\"; filename=\"$fileName\""
                .toByteArray(StandardCharsets.UTF_8)
        )
        output.write(lineEnd)
        output.write("Content-Type: $contentType".toByteArray(StandardCharsets.UTF_8))
        output.write(lineEnd)
        output.write(lineEnd)
        output.write(fileBytes)
        output.write(lineEnd)

        output.write(finalBoundaryBytes)
        output.write(lineEnd)

        return output.toByteArray()
    }

    private fun sanitizeFileName(fileName: String): String {
        val cleanName = fileName.trim().replace("\"", "")
        if (cleanName.isBlank()) {
            return "upload.bin"
        }
        return cleanName
    }

    private val baseUrl: String
        get() = "https://api.telegram.org/bot$botToken"
}
