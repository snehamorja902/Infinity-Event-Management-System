from django.test import TestCase, Client
from django.urls import reverse
from .models import WeddingForm
import json

class WeddingFormEndpointTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('wedding-inquiry')

    def test_post_valid_payload_creates_row(self):
        payload = {
            'bride_name': 'TestBride',
            'groom_name': 'TestGroom',
            'contact_email': 'test@example.com'
        }
        resp = self.client.post(self.url, json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(WeddingForm.objects.filter(contact_email='test@example.com').exists())

    def test_post_invalid_json_returns_400(self):
        # Send invalid JSON (string instead of JSON)
        resp = self.client.post(self.url, 'not-a-json', content_type='application/json')
        self.assertEqual(resp.status_code, 400)

