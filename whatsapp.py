"""WhatsApp alerts through the WhatsApp Business Cloud API. Standard library only."""
import json
import os
import urllib.error
import urllib.request


class WhatsAppError(Exception):
    def __init__(self, message, ambiguous=True):
        super().__init__(message)
        self.ambiguous = ambiguous


def _env(name, default=''):
    return str(os.environ.get(name, default) or '').strip()


class WhatsApp:
    """Sends a text alert through the WhatsApp Business Cloud API.

    Configuration comes from environment variables or GitHub Actions Secrets:
    WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_TO (recipient with country code).
    """

    endpoint = 'https://graph.facebook.com/v21.0/%s/messages'

    def __init__(self, token=None, phone_id=None, to=None):
        self.token = str(token if token is not None else _env('WHATSAPP_TOKEN')).strip()
        self.phone_id = str(phone_id if phone_id is not None else _env('WHATSAPP_PHONE_ID')).strip()
        self.to = str(to if to is not None else _env('WHATSAPP_TO')).strip()
        self.ready = bool(self.token and self.phone_id and self.to)

    def recipient(self):
        digits = ''.join(c for c in self.to if c.isdigit())
        if not 7 <= len(digits) <= 15:
            raise WhatsAppError('Неверный WHATSAPP_TO: нужен номер с кодом страны, только цифры', ambiguous=False)
        return digits

    def send(self, text):
        if not self.ready:
            raise WhatsAppError('WhatsApp не настроен: задайте WHATSAPP_TOKEN, WHATSAPP_PHONE_ID и WHATSAPP_TO', ambiguous=False)
        to = self.recipient()
        body = json.dumps({
            'messaging_product': 'whatsapp',
            'recipient_type': 'individual',
            'to': to,
            'type': 'text',
            'text': {'body': text[:1000]},
        }).encode('utf-8')
        request = urllib.request.Request(
            self.endpoint % self.phone_id,
            data=body,
            method='POST',
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + self.token},
        )
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                payload = response.read(100000)
                status = response.status
        except urllib.error.HTTPError as error:
            # 4xx is a rejected request; 5xx may have been delivered already.
            raise WhatsAppError('WhatsApp API отклонил запрос: HTTP %s' % error.code, ambiguous=error.code >= 500)
        except (urllib.error.URLError, OSError) as error:
            raise WhatsAppError('WhatsApp API не подтвердил отправку: ' + type(error).__name__, ambiguous=True)
        if status not in (200, 201):
            raise WhatsAppError('WhatsApp API не подтвердил отправку: HTTP %s' % status, ambiguous=True)
        try:
            result = json.loads(payload)
        except ValueError:
            raise WhatsAppError('WhatsApp API вернул неожиданный ответ', ambiguous=True)
        messages = result.get('messages') if isinstance(result, dict) else None
        if not isinstance(messages, list) or not messages or not isinstance(messages[0], dict) or not messages[0].get('id'):
            raise WhatsAppError('WhatsApp API не вернул идентификатор сообщения', ambiguous=True)
        return 'whatsapp:' + str(messages[0]['id'])
