"""Email alerts over SMTP. Standard library only, no third-party dependencies."""
import os
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr, parseaddr


class EmailError(Exception):
    def __init__(self, message, ambiguous=True):
        super().__init__(message)
        self.ambiguous = ambiguous


def _env(name, default=''):
    return str(os.environ.get(name, default) or '').strip()


class Email:
    """Sends a plain text alert through an SMTP server.

    Configuration comes from environment variables or GitHub Actions Secrets:
    EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_TO, EMAIL_STARTTLS.
    """

    def __init__(self, host=None, port=None, user=None, password=None, to=None, starttls=None):
        self.host = str(host if host is not None else _env('EMAIL_HOST')).strip()
        self.user = str(user if user is not None else _env('EMAIL_USER')).strip()
        self.password = str(password if password is not None else _env('EMAIL_PASSWORD')).strip()
        self.to = str(to if to is not None else _env('EMAIL_TO')).strip()
        raw_port = port if port is not None else _env('EMAIL_PORT', '587')
        try:
            self.port = int(raw_port)
        except (TypeError, ValueError):
            self.port = 0
        if starttls is None:
            starttls = _env('EMAIL_STARTTLS', '1').lower() not in ('0', 'false', 'no', 'off')
        self.starttls = bool(starttls)
        self.ready = bool(self.host and self.to and 1 <= self.port <= 65535)

    def recipients(self):
        """Every address must be a plain mailbox; no headers or display names."""
        result = []
        for part in self.to.replace(';', ',').split(','):
            address = part.strip()
            if not address:
                continue
            name, mailbox = parseaddr(address)
            if name or not mailbox or '@' not in mailbox or any(c in mailbox for c in ' \t\r\n<>"'):
                raise EmailError('Неверный адрес получателя EMAIL_TO: укажите только почтовый адрес', ambiguous=False)
            result.append(mailbox)
        return result

    def send(self, text, subject='Price Hunter: подтверждённая находка'):
        if not self.ready:
            raise EmailError('Email не настроен: задайте EMAIL_HOST, EMAIL_PORT и EMAIL_TO', ambiguous=False)
        try:
            recipients = self.recipients()
        except EmailError:
            raise
        if not recipients:
            raise EmailError('EMAIL_TO пуст: получатель не указан', ambiguous=False)
        message = EmailMessage()
        message['Subject'] = subject
        message['To'] = ', '.join(recipients)
        message['From'] = formataddr(('Price Hunter', self.user or ('price-hunter@' + self.host)))
        message.set_content(text[:8000])
        server = None
        try:
            context = ssl.create_default_context()
            if self.port == 465:
                server = smtplib.SMTP_SSL(self.host, self.port, timeout=25, context=context)
            else:
                server = smtplib.SMTP(self.host, self.port, timeout=25)
                server.ehlo()
                if self.starttls and server.has_extn('starttls'):
                    server.starttls(context=context)
                    server.ehlo()
            if self.user and self.password:
                server.login(self.user, self.password)
            server.send_message(message)
        except smtplib.SMTPResponseException as error:
            # 4xx means the message was rejected; 5xx may already be delivered.
            ambiguous = 500 <= int(error.smtp_code) < 600
            raise EmailError('SMTP отклонил письмо: HTTP-подобный код %s' % error.smtp_code, ambiguous=ambiguous)
        except (smtplib.SMTPException, OSError) as error:
            raise EmailError('SMTP не подтвердил отправку: ' + type(error).__name__, ambiguous=True)
        finally:
            if server is not None:
                try:
                    server.quit()
                except Exception:
                    try:
                        server.close()
                    except Exception:
                        pass
        return 'email:' + ','.join(recipients)
