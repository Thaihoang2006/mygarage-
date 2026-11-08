"""
Automated Integration and Unit Test Suite for MyGarage REST API.
"""
import os
import sys
import io
import unittest
from PIL import Image

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app
from models import db, ModelItem

class MyGarageAPITestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def test_01_healthz_and_readyz(self):
        """Test healthz and readyz probes."""
        res = self.client.get('/healthz')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json.get('status'), 'ok')

        res_ready = self.client.get('/readyz')
        self.assertIn(res_ready.status_code, [200, 503])
        if res_ready.status_code == 200:
            self.assertEqual(res_ready.json.get('status'), 'ready')

    def test_02_get_stats(self):
        """Test stats aggregation endpoint."""
        res = self.client.get('/api/stats')
        self.assertEqual(res.status_code, 200)
        json_data = res.json
        self.assertTrue(json_data['success'])
        self.assertIn('total', json_data['data'])
        self.assertIn('total_cars', json_data['data'])
        self.assertIn('total_gundams', json_data['data'])
        self.assertIn('categories', json_data['data'])
        self.assertIn('total_value', json_data['data'])

    def test_03_get_models_list_and_filters(self):
        """Test getting models list with filters."""
        res = self.client.get('/api/models')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json['success'])
        self.assertGreaterEqual(res.json['count'], 1)

        # Test category filter
        res_car = self.client.get('/api/models?category=Car')
        self.assertEqual(res_car.status_code, 200)
        for item in res_car.json['data']:
            self.assertEqual(item['category'], 'Car')

        # Test search filter
        res_search = self.client.get('/api/models?search=Gundam')
        self.assertEqual(res_search.status_code, 200)
        self.assertTrue(res_search.json['success'])

        # Test sort filter
        res_sort = self.client.get('/api/models?sort=price_desc')
        self.assertEqual(res_sort.status_code, 200)
        prices = [m['price'] for m in res_sort.json['data'] if m['price'] is not None]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_04_create_and_delete_model_json(self):
        """Test creating and deleting a model using JSON payload."""
        payload = {
            'name': 'Lamborghini Huracan STO',
            'category': 'Car',
            'brand': 'Mini GT',
            'scale': '1/64',
            'price': 420000.0,
            'purchase_date': '2026-09-10',
            'description': 'Mô hình xe thể thao siêu cấp'
        }
        res = self.client.post('/api/models', json=payload)
        self.assertEqual(res.status_code, 201)
        created_id = res.json['data']['id']
        self.assertEqual(res.json['data']['name'], 'Lamborghini Huracan STO')

        # Get details
        res_detail = self.client.get(f'/api/models/{created_id}')
        self.assertEqual(res_detail.status_code, 200)
        self.assertEqual(res_detail.json['data']['name'], 'Lamborghini Huracan STO')

        # Update
        update_payload = {'name': 'Lamborghini Huracan STO Verde Scandal'}
        res_update = self.client.put(f'/api/models/{created_id}', json=update_payload)
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json['data']['name'], 'Lamborghini Huracan STO Verde Scandal')

        # Delete
        res_del = self.client.delete(f'/api/models/{created_id}')
        self.assertEqual(res_del.status_code, 200)

        # Verify deletion
        res_check = self.client.get(f'/api/models/{created_id}')
        self.assertEqual(res_check.status_code, 404)

    def test_05_image_upload_and_serve(self):
        """Test multipart/form-data image upload, validation, and serving."""
        img = Image.new('RGB', (100, 100), color=(94, 131, 186))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        data = {
            'name': 'Gundam Aerial Rebuild',
            'category': 'Gundam',
            'brand': 'Bandai',
            'scale': 'HG 1/144',
            'price': '450000',
            'image': (img_bytes, 'test_aerial.png')
        }

        res = self.client.post(
            '/api/models',
            data=data,
            content_type='multipart/form-data'
        )
        self.assertEqual(res.status_code, 201)
        image_url = res.json['data']['image_url']
        self.assertTrue(image_url.startswith('/uploads/'))
        model_id = res.json['data']['id']

        # Test serving uploaded image
        res_img = self.client.get(image_url)
        self.assertEqual(res_img.status_code, 200)
        self.assertIn('image', res_img.content_type)

        # Clean up model
        del_res = self.client.delete(f'/api/models/{model_id}')
        self.assertEqual(del_res.status_code, 200)

    def test_06_frontend_static_serving(self):
        """Test that index.html and frontend assets are served correctly."""
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'MYGARAGE', res.data)
        self.assertIn(b'COLLECTION MANAGER', res.data)

        res_css = self.client.get('/css/style.css')
        self.assertEqual(res_css.status_code, 200)
        self.assertIn(b'#FFAFCA', res_css.data)

        res_js = self.client.get('/js/app.js')
        self.assertEqual(res_js.status_code, 200)
        self.assertIn(b'MyGarage', res_js.data)

    def test_07_auth_endpoints(self):
        """Test login, logout and profile authentication endpoints."""
        # Success login with admin
        res_login = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'garage2026'})
        self.assertEqual(res_login.status_code, 200)
        self.assertTrue(res_login.json['success'])
        self.assertIn('token', res_login.json)
        self.assertEqual(res_login.json['user']['username'], 'admin')

        # Failed login with wrong password
        res_fail = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrongpassword123'})
        self.assertEqual(res_fail.status_code, 401)
        self.assertFalse(res_fail.json['success'])

        # Empty body
        res_empty = self.client.post('/api/auth/login', json={})
        self.assertEqual(res_empty.status_code, 400)

        # Logout
        res_logout = self.client.post('/api/auth/logout')
        self.assertEqual(res_logout.status_code, 200)

if __name__ == '__main__':
    unittest.main()
