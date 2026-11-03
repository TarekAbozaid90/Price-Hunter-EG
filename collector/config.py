import datetime as dt
import math
import re
from .adapters import ADAPTERS
from .net import validate_url
from .engine import timestamp

CATEGORIES = {'computers', 'gadgets', 'accessories', 'appliances', 'clothing', 'food', 'household', 'tools', 'sport'}
FACT_FIELDS = {'brand', 'model', 'quantity', 'volume', 'bundle', 'variant', 'condition', 'delivery_cost', 'mandatory_cost', 'astana', 'full_payment', 'conditions', 'expiry'}


def validate(config):
    if config.get('schema_version') != 1 or config.get('currency') != 'KZT' or config.get('city') != 'Астана':
        raise ValueError('Конфигурация: требуются schema_version=1, KZT, Астана')
    bounds = {'threshold': (90, 100), 'stale_minutes': (15, 1440), 'history_days': (7, 90),
              'history_min_days': (3, 30), 'history_min_samples': (3, 240), 'max_products': (1, 100), 'max_tracked': (10, 2000)}
    for k, (lo, hi) in bounds.items():
        v = config.get(k)
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or not lo <= v <= hi:
            raise ValueError('Конфигурация: %s должен быть от %s до %s' % (k, lo, hi))
        if k != 'threshold' and not isinstance(v, int):
            raise ValueError('%s должен быть целым' % k)
    if not isinstance(config.get('preliminary_alerts'), bool):
        raise ValueError('preliminary_alerts должен быть bool')
    if not set(config.get('enabled_categories', [])).issubset(CATEGORIES):
        raise ValueError('Неизвестные категории')
    net = config['network']
    if not 1 <= net['timeout'] <= 30 or not 1 <= net['interval'] <= 60 or not 5 <= net['max_requests'] <= 150:
        raise ValueError('Небезопасные лимиты запросов')
    if not set(config['shops']).issubset(ADAPTERS):
        raise ValueError('Неизвестный магазин')
    for shop, settings in config['shops'].items():
        hosts = ADAPTERS[shop].hosts
        for category in settings.get('categories', []):
            if category['key'] not in CATEGORIES:
                raise ValueError('Неизвестная категория магазина')
            validate_url(category['url'], hosts)
        for item in settings.get('watch_urls', []):
            validate_url(item['url'], hosts)
            if item.get('category') not in CATEGORIES:
                raise ValueError('Наблюдаемой ссылке нужна category')
    alerts = config.get('alerts', {})
    if alerts:
        if not isinstance(alerts, dict):
            raise ValueError('alerts должен быть объектом')
        for key in ('email_address', 'whatsapp_number', 'telegram_bot'):
            if key in alerts and not isinstance(alerts[key], str):
                raise ValueError('alerts.%s должен быть строкой' % key)
        address = (alerts.get('email_address') or '').strip()
        if address and not re.fullmatch(r'[^@\s,;]+@[^@\s,;]+\.[A-Za-z]{2,}', address):
            raise ValueError('alerts.email_address должен быть адресом почты')
        number = (alerts.get('whatsapp_number') or '').strip()
        if number:
            if not number.startswith('+') or not 7 <= len(''.join(c for c in number if c.isdigit())) <= 15:
                raise ValueError('alerts.whatsapp_number должен быть международным номером, например +77012345678')
        bot = (alerts.get('telegram_bot') or '').strip()
        if bot and not re.fullmatch(r'[A-Za-z0-9_]{5,32}', bot):
            raise ValueError('alerts.telegram_bot должен быть именем бота без @')
    for url, facts in config.get('verified_facts', {}).items():
        hosts = [h for a in ADAPTERS.values() for h in a.hosts]
        validate_url(url, hosts)
        validate_url(facts['evidence_url'], hosts)
        timestamp(facts['checked_at'])
        if not set(facts['values']).issubset(FACT_FIELDS):
            raise ValueError('Недопустимые поля verified_facts; цену подменять нельзя')
        for field in ('delivery_cost', 'mandatory_cost'):
            value = facts['values'].get(field)
            if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0):
                raise ValueError('Расходы не могут быть отрицательными или строкой')
        q = facts['values'].get('quantity')
        if q is not None and (isinstance(q, bool) or not isinstance(q, (int, float)) or not math.isfinite(q) or q <= 0):
            raise ValueError('quantity должна быть положительным числом')
        for field in ('brand', 'model', 'volume', 'bundle', 'variant', 'condition', 'astana'):
            value = facts['values'].get(field)
            if value is not None and (not isinstance(value, str) or not value.strip()):
                raise ValueError('%s требует непустой строки или null' % field)
        values = facts['values']
        if values.get('full_payment') is not None and not isinstance(values['full_payment'], bool):
            raise ValueError('full_payment требует bool или null')
        if 'conditions' in values and (not isinstance(values['conditions'], list) or any(not isinstance(v, str) for v in values['conditions'])):
            raise ValueError('conditions требует список строк')
        if values.get('expiry') is not None:
            dt.date.fromisoformat(values['expiry'])
    return config


def apply_facts(offer, config, now):
    facts = config.get('verified_facts', {}).get(offer['url'])
    if not facts:
        return offer
    age = (now - timestamp(facts['checked_at'])).total_seconds()
    if age < 0 or age > 24 * 3600:
        offer['limitations'].append('Ручное подтверждение условий устарело (срок 24 часа)')
        return offer
    offer.update(facts['values'])
    offer['identity_verified'] = all(offer.get(k) is not None for k in ('brand', 'model', 'quantity', 'volume', 'bundle', 'variant', 'condition'))
    offer['evidence_url'] = facts['evidence_url']
    offer['limitations'] = ['Совместимость должна соответствовать вашему устройству/размеру', 'Часть условий подтверждена вручную: ' + facts['checked_at']]
    return offer
