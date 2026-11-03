"""Alert channels: email, WhatsApp and per-channel delivery state."""
import unittest

from collector.emailer import Email, EmailError
from collector.telegram import channel_state, eligible
from collector.whatsapp import WhatsApp, WhatsAppError


class EmailChannelTests(unittest.TestCase):
    def test_not_ready_without_host_and_recipient(self):
        self.assertFalse(Email(host='', to='a@example.com').ready)
        self.assertFalse(Email(host='smtp.example.com', to='').ready)
        self.assertTrue(Email(host='smtp.example.com', to='a@example.com').ready)

    def test_recipient_must_be_a_plain_mailbox(self):
        with self.assertRaises(EmailError):
            Email(host='smtp.example.com', to='not-an-address').recipients()
        with self.assertRaises(EmailError):
            Email(host='smtp.example.com', to='Name <a@example.com>').recipients()
        self.assertEqual(Email(host='smtp.example.com', to='a@example.com, b@example.com').recipients(),
                         ['a@example.com', 'b@example.com'])

    def test_send_without_configuration_is_refused(self):
        with self.assertRaises(EmailError) as caught:
            Email().send('test')
        self.assertFalse(caught.exception.ambiguous)


class WhatsAppChannelTests(unittest.TestCase):
    def test_not_ready_without_token(self):
        self.assertFalse(WhatsApp(token='', phone_id='1', to='77001234567').ready)
        self.assertTrue(WhatsApp(token='t', phone_id='1', to='77001234567').ready)

    def test_number_needs_country_code(self):
        with self.assertRaises(WhatsAppError):
            WhatsApp(token='t', phone_id='1', to='12345').recipient()
        self.assertEqual(WhatsApp(token='t', phone_id='1', to='+7 700 123 45 67').recipient(), '77001234567')

    def test_send_without_configuration_is_refused(self):
        with self.assertRaises(WhatsAppError) as caught:
            WhatsApp().send('test')
        self.assertFalse(caught.exception.ambiguous)


class ChannelStateTests(unittest.TestCase):
    def setUp(self):
        self.config = {'preliminary_alerts': False}
        self.offer = {'status': 'confirmed', 'price': 100000, 'delivery_cost': 0, 'mandatory_cost': 0,
                      'available': True, 'baseline_kind': 'history', 'discount': 90, 'comparisons': []}
        self.previous = {'value': 100000, 'sent': True, 'pending': False, 'was_unavailable': False,
                         'channels': {'telegram': {'sent': True, 'pending': False}}}

    def test_new_channel_reports_once_while_used_one_stays_quiet(self):
        self.assertFalse(eligible(self.offer, self.previous, self.config, 'telegram'))
        self.assertTrue(eligible(self.offer, self.previous, self.config, 'email'))

    def test_real_drop_is_news_for_every_channel(self):
        self.offer['price'] = 90000
        self.assertTrue(eligible(self.offer, self.previous, self.config, 'telegram'))
        self.assertTrue(eligible(self.offer, self.previous, self.config, 'whatsapp'))

    def test_ambiguous_send_blocks_only_its_channel(self):
        self.previous['channels']['telegram'] = {'sent': False, 'pending': True}
        self.assertFalse(eligible(self.offer, self.previous, self.config, 'telegram'))
        self.assertTrue(eligible(self.offer, self.previous, self.config, 'whatsapp'))

    def test_ledger_without_channels_still_works_for_telegram(self):
        legacy = {'value': 100000, 'sent': True, 'pending': False, 'was_unavailable': False}
        self.assertEqual(channel_state(legacy, 'telegram'), {'pending': False, 'sent': True})
        self.assertEqual(channel_state(legacy, 'email'), {})
        self.assertFalse(eligible(self.offer, legacy, self.config, 'telegram'))
        self.assertTrue(eligible(self.offer, legacy, self.config, 'email'))

    def test_unavailable_offer_is_never_notified(self):
        self.offer['available'] = False
        self.assertFalse(eligible(self.offer, None, self.config, 'email'))


if __name__ == '__main__':
    unittest.main()
