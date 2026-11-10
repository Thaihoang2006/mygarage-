"""
Automated Test Suite for MyGarage - Isolated SQLite Test Database.
Guarantees ZERO changes or deletions to real MySQL database and Model 7!
Tests:
  1. Owner views model details (is_owner: True).
  2. Owner updates model (PUT /api/models/<id>).
  3. Owner deletes model (DELETE /api/models/<id>).
  4. Non-owner cannot update or delete (403 Forbidden).
  5. Price and purchase_date are displayed accurately when set.
  6. When price or date is not set, API returns None (frontend formats to 'Chưa cập nhật').
  7. Health & system readiness.
"""
import os
import sys
import unittest
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from models import db, User, ModelItem, Collection

class MyGarageIsolatedTestCase(unittest.TestCase):
    def setUp(self):
        # Use completely isolated SQLite in-memory database to protect live MySQL data
        self.app = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'WTF_CSRF_ENABLED': False
        })
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_01_health_probes(self):
        """Test healthz endpoint."""
        res = self.client.get('/healthz')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json.get('status'), 'ok')

    def test_02_registration_and_login(self):
        """Test user registration and login."""
        res_reg = self.client.post('/api/auth/register', json={
            'username': 'owner_user',
            'email': 'owner@garage.local',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'display_name': 'Owner User'
        })
        self.assertEqual(res_reg.status_code, 201)
        self.assertTrue(res_reg.json['success'])
        self.assertIn('csrf_token', res_reg.json)

        # Check me
        res_me = self.client.get('/api/auth/me')
        self.assertEqual(res_me.status_code, 200)
        self.assertTrue(res_me.json['authenticated'])
        self.assertEqual(res_me.json['user']['username'], 'owner_user')

    def test_03_owner_sees_and_updates_model(self):
        """Scenario 1 & 2: Owner sees is_owner=True, updates model successfully."""
        # 1. Register owner
        res_reg = self.client.post('/api/auth/register', json={
            'username': 'model_owner',
            'email': 'owner2@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf = res_reg.json['csrf_token']

        # 2. Owner creates model
        res_create = self.client.post('/api/models', json={
            'name': 'Nissan Skyline GT-R',
            'category': 'Car',
            'brand': 'Mini GT',
            'scale': '1/64',
            'price': 450000.0,
            'purchase_date': '2026-05-10',
            'description': 'Bayside Blue die-cast'
        }, headers={'X-CSRF-Token': csrf})
        self.assertEqual(res_create.status_code, 201)
        model_id = res_create.json['data']['id']

        # 3. Owner views model details -> is_owner MUST be True
        res_view = self.client.get(f'/api/models/{model_id}')
        self.assertEqual(res_view.status_code, 200)
        self.assertTrue(res_view.json['data']['is_owner'], "Owner must have is_owner=True to show Edit/Delete buttons!")
        self.assertEqual(res_view.json['data']['price'], 450000.0)
        self.assertEqual(res_view.json['data']['purchase_date'], '2026-05-10')

        # 4. Owner updates model
        res_update = self.client.put(f'/api/models/{model_id}', json={
            'name': 'Nissan Skyline GT-R V-Spec II',
            'price': 480000.0
        }, headers={'X-CSRF-Token': csrf})
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json['data']['name'], 'Nissan Skyline GT-R V-Spec II')
        self.assertEqual(res_update.json['data']['price'], 480000.0)

    def test_04_owner_deletes_model(self):
        """Scenario 3: Owner confirms deletion and model is removed."""
        res_reg = self.client.post('/api/auth/register', json={
            'username': 'delete_tester',
            'email': 'del@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf = res_reg.json['csrf_token']

        res_create = self.client.post('/api/models', json={
            'name': 'Temporary Model',
            'category': 'Other'
        }, headers={'X-CSRF-Token': csrf})
        model_id = res_create.json['data']['id']

        # Delete model
        res_del = self.client.delete(f'/api/models/{model_id}', headers={'X-CSRF-Token': csrf})
        self.assertEqual(res_del.status_code, 200)

        # Confirm deleted
        res_check = self.client.get(f'/api/models/{model_id}')
        self.assertEqual(res_check.status_code, 404)

    def test_05_non_owner_cannot_update_or_delete(self):
        """Scenario 4: Non-owner is blocked from updating or deleting (403 Forbidden)."""
        # User 1 creates model
        res_u1 = self.client.post('/api/auth/register', json={
            'username': 'user_one',
            'email': 'u1@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf_u1 = res_u1.json['csrf_token']

        res_model = self.client.post('/api/models', json={
            'name': 'Protected Model',
            'category': 'Car',
            'price': 990000.0
        }, headers={'X-CSRF-Token': csrf_u1})
        model_id = res_model.json['data']['id']

        # User 2 logs in
        res_u2 = self.client.post('/api/auth/register', json={
            'username': 'user_two',
            'email': 'u2@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf_u2 = res_u2.json['csrf_token']

        # User 2 views User 1's model -> is_owner MUST be False
        res_view = self.client.get(f'/api/models/{model_id}')
        self.assertEqual(res_view.status_code, 200)
        self.assertFalse(res_view.json['data']['is_owner'], "Non-owner must have is_owner=False")

        # User 2 attempts to update -> 403 Forbidden
        res_hack_put = self.client.put(f'/api/models/{model_id}', json={
            'name': 'Hacked Title'
        }, headers={'X-CSRF-Token': csrf_u2})
        self.assertEqual(res_hack_put.status_code, 403)

        # User 2 attempts to delete -> 403 Forbidden
        res_hack_del = self.client.delete(f'/api/models/{model_id}', headers={'X-CSRF-Token': csrf_u2})
        self.assertEqual(res_hack_del.status_code, 403)

    def test_06_price_and_date_display(self):
        """Scenario 5 & 6: Accurate price and date when present, None when not set."""
        # Model without price and date
        res_u = self.client.post('/api/auth/register', json={
            'username': 'display_tester',
            'email': 'dt@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf = res_u.json['csrf_token']

        res_empty = self.client.post('/api/models', json={
            'name': 'Model Without Price',
            'category': 'Gundam'
        }, headers={'X-CSRF-Token': csrf})
        empty_id = res_empty.json['data']['id']

        res_check_empty = self.client.get(f'/api/models/{empty_id}')
        self.assertEqual(res_check_empty.status_code, 200)
        self.assertIsNone(res_check_empty.json['data']['price'], "Empty price should be None (frontend renders 'Chưa cập nhật')")
        self.assertIsNone(res_check_empty.json['data']['purchase_date'], "Empty date should be None (frontend renders 'Chưa cập nhật')")

        # Model with price and date
        res_full = self.client.post('/api/models', json={
            'name': 'Gundam Barbatos',
            'category': 'Gundam',
            'price': 380000.0,
            'purchase_date': '2026-07-01'
        }, headers={'X-CSRF-Token': csrf})
        full_id = res_full.json['data']['id']

        res_check_full = self.client.get(f'/api/models/{full_id}')
        self.assertEqual(res_check_full.status_code, 200)
        self.assertEqual(res_check_full.json['data']['price'], 380000.0)
        self.assertEqual(res_check_full.json['data']['purchase_date'], '2026-07-01')

    def test_07_custom_category(self):
        """Custom category creation, filtering and retrieval."""
        res_reg = self.client.post('/api/auth/register', json={
            'username': 'cat_user',
            'email': 'cat@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf = res_reg.json['csrf_token']

        # Create model with custom category 'Lego'
        res_create = self.client.post('/api/models', json={
            'name': 'Lego Millennium Falcon',
            'category': 'Lego',
            'brand': 'LEGO Star Wars'
        }, headers={'X-CSRF-Token': csrf})
        self.assertEqual(res_create.status_code, 201)
        self.assertEqual(res_create.json['data']['category'], 'Lego')

        # Filter by custom category
        res_filter = self.client.get('/api/models?category=Lego')
        self.assertEqual(res_filter.status_code, 200)
        self.assertEqual(len(res_filter.json['data']), 1)
        self.assertEqual(res_filter.json['data'][0]['name'], 'Lego Millennium Falcon')

        # Check stats includes Lego
        res_stats = self.client.get('/api/stats')
        self.assertEqual(res_stats.status_code, 200)
        self.assertIn('Lego', res_stats.json['data']['available_categories'])

if __name__ == '__main__':
    unittest.main()
