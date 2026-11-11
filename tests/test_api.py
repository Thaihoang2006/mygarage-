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

        # User 1 creates a public collection and adds the model so it can be viewed publicly
        res_col = self.client.post('/api/collections', json={
            'name': 'User 1 Public Collection',
            'visibility': 'public'
        }, headers={'X-CSRF-Token': csrf_u1})
        col_id = res_col.json['data']['id']
        self.client.post(f'/api/collections/{col_id}/models', json={
            'model_id': model_id
        }, headers={'X-CSRF-Token': csrf_u1})

        # User 2 logs in
        res_u2 = self.client.post('/api/auth/register', json={
            'username': 'user_two',
            'email': 'u2@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf_u2 = res_u2.json['csrf_token']

        # User 2 views User 1's public model -> is_owner MUST be False, price masked
        res_view = self.client.get(f'/api/models/{model_id}')
        self.assertEqual(res_view.status_code, 200)
        self.assertFalse(res_view.json['data']['is_owner'], "Non-owner must have is_owner=False")
        self.assertIsNone(res_view.json['data']['price'], "Non-owner cannot view sensitive price info")

        # User 2 attempts to update -> 403 Forbidden
        res_hack_put = self.client.put(f'/api/models/{model_id}', json={
            'name': 'Hacked Title'
        }, headers={'X-CSRF-Token': csrf_u2})
        self.assertEqual(res_hack_put.status_code, 403)

        # User 2 attempts to delete -> 403 Forbidden
        res_hack_del = self.client.delete(f'/api/models/{model_id}', headers={'X-CSRF-Token': csrf_u2})
        self.assertEqual(res_hack_del.status_code, 403)

        # User 2 cannot add User 1's model into User 2's own collection
        res_u2_col = self.client.post('/api/collections', json={
            'name': 'User 2 Collection'
        }, headers={'X-CSRF-Token': csrf_u2})
        u2_col_id = res_u2_col.json['data']['id']
        res_hack_add = self.client.post(f'/api/collections/{u2_col_id}/models', json={
            'model_id': model_id
        }, headers={'X-CSRF-Token': csrf_u2})
        self.assertEqual(res_hack_add.status_code, 403)

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

    def test_08_multi_account_strict_isolation(self):
        """
        Verify multi-account strict isolation (Requirement 2 & Giai đoạn A):
        1. User Alice and User Bob have completely isolated My Garage models.
        2. Dashboard statistics are calculated ONLY on the logged-in user's data.
        3. Search, category filter and sorting operate strictly on the user's models.
        4. Neither user can view, edit, delete, or steal ownership of the other's models.
        5. Guest / unauthenticated users are rejected with 401.
        """
        # --- 1. Register User Alice ---
        res_alice = self.client.post('/api/auth/register', json={
            'username': 'alice',
            'email': 'alice@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'display_name': 'Alice Modelist'
        })
        self.assertEqual(res_alice.status_code, 201)
        csrf_alice = res_alice.json['csrf_token']

        # Alice creates Model A1 (Car) and Model A2 (Gundam)
        res_a1 = self.client.post('/api/models', json={
            'name': 'Ferrari SF90 Stradale',
            'category': 'Car',
            'brand': 'BBR Models',
            'price': 1500000.0,
            'description': 'Alice rare Ferrari'
        }, headers={'X-CSRF-Token': csrf_alice})
        self.assertEqual(res_a1.status_code, 201)
        a1_id = res_a1.json['data']['id']

        res_a2 = self.client.post('/api/models', json={
            'name': 'Gundam Barbatos Lupus Rex',
            'category': 'Gundam',
            'brand': 'Bandai Spirits',
            'price': 650000.0,
            'description': 'Alice Iron-Blooded Orphans model'
        }, headers={'X-CSRF-Token': csrf_alice})
        self.assertEqual(res_a2.status_code, 201)
        a2_id = res_a2.json['data']['id']

        # Alice checks My Garage: should have exactly 2 models
        res_alice_models = self.client.get('/api/models')
        self.assertEqual(res_alice_models.status_code, 200)
        self.assertEqual(res_alice_models.json['count'], 2)
        alice_names = [m['name'] for m in res_alice_models.json['data']]
        self.assertIn('Ferrari SF90 Stradale', alice_names)
        self.assertIn('Gundam Barbatos Lupus Rex', alice_names)

        # Alice checks Dashboard stats: exactly 2 models, 1 Car, 1 Gundam, total value 2,150,000
        res_alice_stats = self.client.get('/api/stats')
        self.assertEqual(res_alice_stats.status_code, 200)
        stats_a = res_alice_stats.json['data']
        self.assertEqual(stats_a['total'], 2)
        self.assertEqual(stats_a['total_cars'], 1)
        self.assertEqual(stats_a['total_gundams'], 1)
        self.assertEqual(stats_a['total_others'], 0)
        self.assertEqual(stats_a['total_value'], 2150000.0)

        # Alice logs out
        self.client.post('/api/auth/logout')

        # --- 2. Guest attempts to access My Garage or Stats -> 401 Unauthorized ---
        res_guest_models = self.client.get('/api/models')
        self.assertEqual(res_guest_models.status_code, 401)
        res_guest_stats = self.client.get('/api/stats')
        self.assertEqual(res_guest_stats.status_code, 401)

        # --- 3. Register User Bob ---
        res_bob = self.client.post('/api/auth/register', json={
            'username': 'bob',
            'email': 'bob@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'display_name': 'Bob Collector'
        })
        self.assertEqual(res_bob.status_code, 201)
        csrf_bob = res_bob.json['csrf_token']

        # Bob creates Model B1 (Porsche 911 GT3)
        res_b1 = self.client.post('/api/models', json={
            'name': 'Porsche 911 GT3 RS',
            'category': 'Car',
            'brand': 'AutoArt',
            'price': 2200000.0,
            'description': 'Bob Lizard Green GT3'
        }, headers={'X-CSRF-Token': csrf_bob})
        self.assertEqual(res_b1.status_code, 201)
        b1_id = res_b1.json['data']['id']

        # Bob checks My Garage: MUST see ONLY Bob's 1 model, NEVER Alice's models!
        res_bob_models = self.client.get('/api/models')
        self.assertEqual(res_bob_models.status_code, 200)
        self.assertEqual(res_bob_models.json['count'], 1)
        bob_names = [m['name'] for m in res_bob_models.json['data']]
        self.assertIn('Porsche 911 GT3 RS', bob_names)
        self.assertNotIn('Ferrari SF90 Stradale', bob_names, "Bob MUST NOT see Alice's Ferrari in My Garage!")
        self.assertNotIn('Gundam Barbatos Lupus Rex', bob_names, "Bob MUST NOT see Alice's Gundam in My Garage!")

        # Bob searches "Ferrari" in My Garage -> returns 0 results
        res_bob_search = self.client.get('/api/models?search=Ferrari')
        self.assertEqual(res_bob_search.status_code, 200)
        self.assertEqual(res_bob_search.json['count'], 0)

        # Bob checks Dashboard stats: ONLY 1 model, total value 2,200,000 (NOT 4,350,000!)
        res_bob_stats = self.client.get('/api/stats')
        self.assertEqual(res_bob_stats.status_code, 200)
        stats_b = res_bob_stats.json['data']
        self.assertEqual(stats_b['total'], 1, "Bob's dashboard must count only Bob's models")
        self.assertEqual(stats_b['total_cars'], 1)
        self.assertEqual(stats_b['total_gundams'], 0)
        self.assertEqual(stats_b['total_value'], 2200000.0, "Bob's dashboard must calculate only Bob's values")

        # Bob attempts to view Alice's private model directly by ID -> 403 Forbidden
        res_bob_view_alice = self.client.get(f'/api/models/{a1_id}')
        self.assertEqual(res_bob_view_alice.status_code, 403)

        # Bob attempts to update Alice's model -> 403 Forbidden
        res_bob_hack_put = self.client.put(f'/api/models/{a1_id}', json={
            'name': 'Bob Stolen Ferrari'
        }, headers={'X-CSRF-Token': csrf_bob})
        self.assertEqual(res_bob_hack_put.status_code, 403)

        # Bob attempts to delete Alice's model -> 403 Forbidden
        res_bob_hack_del = self.client.delete(f'/api/models/{a1_id}', headers={'X-CSRF-Token': csrf_bob})
        self.assertEqual(res_bob_hack_del.status_code, 403)

        # Bob attempts to forge owner_id in PUT -> owner_id remains unchanged
        res_bob_tamper = self.client.put(f'/api/models/{b1_id}', json={
            'name': 'Porsche 911 GT3 RS Updated',
            'owner_id': 99999
        }, headers={'X-CSRF-Token': csrf_bob})
        self.assertEqual(res_bob_tamper.status_code, 200)
        self.assertNotEqual(res_bob_tamper.json['data']['owner_id'], 99999, "owner_id cannot be tampered via API")

        # --- 4. Switch back to Alice ---
        self.client.post('/api/auth/logout')
        res_login_alice = self.client.post('/api/auth/login', json={
            'username': 'alice',
            'password': 'Password@123'
        })
        self.assertEqual(res_login_alice.status_code, 200)

        # Alice checks My Garage: still exactly 2 models, Bob's Porsche is NEVER visible to Alice!
        res_alice_check = self.client.get('/api/models')
        self.assertEqual(res_alice_check.status_code, 200)
        self.assertEqual(res_alice_check.json['count'], 2)
        alice_check_names = [m['name'] for m in res_alice_check.json['data']]
        self.assertNotIn('Porsche 911 GT3 RS', alice_check_names, "Alice MUST NOT see Bob's Porsche!")

        # Alice attempts to delete Bob's model -> 403 Forbidden
        csrf_alice_again = res_login_alice.json['csrf_token']
        res_alice_hack_del = self.client.delete(f'/api/models/{b1_id}', headers={'X-CSRF-Token': csrf_alice_again})
        self.assertEqual(res_alice_hack_del.status_code, 403)

    def test_09_user_profile_api(self):
        """Test User Profile viewing and editing."""
        # 1. Register User Carol
        res_c = self.client.post('/api/auth/register', json={
            'username': 'carol',
            'email': 'carol@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123',
            'display_name': 'Carol Collector'
        })
        csrf_c = res_c.json['csrf_token']

        # Carol creates 1 public collection and 1 private collection
        self.client.post('/api/collections', json={
            'name': 'Carol Public Garage',
            'visibility': 'public'
        }, headers={'X-CSRF-Token': csrf_c})

        self.client.post('/api/collections', json={
            'name': 'Carol Secret Stash',
            'visibility': 'private'
        }, headers={'X-CSRF-Token': csrf_c})

        # Carol views her own profile: sees both collections (public + private)
        res_carol_own = self.client.get('/api/users/carol/profile')
        self.assertEqual(res_carol_own.status_code, 200)
        self.assertTrue(res_carol_own.json['data']['is_owner'])
        self.assertEqual(len(res_carol_own.json['data']['collections']), 2)

        # Carol updates her profile (display name, bio, cover)
        res_update_prof = self.client.put('/api/users/profile', json={
            'display_name': 'Carol The Master Collector',
            'bio': 'Passionate die-cast & Gunpla enthusiast since 2018.',
            'cover_url': 'https://images.unsplash.com/photo-carol-banner'
        }, headers={'X-CSRF-Token': csrf_c})
        self.assertEqual(res_update_prof.status_code, 200)
        self.assertEqual(res_update_prof.json['user']['display_name'], 'Carol The Master Collector')
        self.assertEqual(res_update_prof.json['user']['cover_url'], 'https://images.unsplash.com/photo-carol-banner')

        # 2. Register Dave (Stranger)
        res_d = self.client.post('/api/auth/register', json={
            'username': 'dave',
            'email': 'dave@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })

        # Dave views Carol's public profile: sees ONLY public collections, no email, no private collections
        res_dave_view = self.client.get('/api/users/carol/profile')
        self.assertEqual(res_dave_view.status_code, 200)
        carol_public = res_dave_view.json['data']
        self.assertFalse(carol_public['is_owner'])
        self.assertEqual(carol_public['display_name'], 'Carol The Master Collector')
        self.assertEqual(carol_public['bio'], 'Passionate die-cast & Gunpla enthusiast since 2018.')
        self.assertEqual(len(carol_public['collections']), 1, "Stranger must see ONLY public collections")
        self.assertEqual(carol_public['collections'][0]['name'], 'Carol Public Garage')
        self.assertNotIn('email', carol_public, "Email must not be leaked on public profile")

    def test_10_community_and_voting_system(self):
        """Test Community feed, vote toggle, and Top Collections leaderboard."""
        # 1. Register User Emily & User Frank
        res_e = self.client.post('/api/auth/register', json={
            'username': 'emily',
            'email': 'emily@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf_e = res_e.json['csrf_token']

        # Emily creates 1 public collection and 1 private collection
        res_e_pub = self.client.post('/api/collections', json={
            'name': 'Emily Supercars Showcase',
            'description': 'Handcrafted 1:18 models',
            'visibility': 'public'
        }, headers={'X-CSRF-Token': csrf_e})
        e_pub_id = res_e_pub.json['data']['id']

        self.client.post('/api/collections', json={
            'name': 'Emily Private Vault',
            'visibility': 'private'
        }, headers={'X-CSRF-Token': csrf_e})

        # 2. Community feed: Must list Emily's public collection, but NEVER her private collection
        res_comm = self.client.get('/api/community/collections')
        self.assertEqual(res_comm.status_code, 200)
        comm_names = [c['name'] for c in res_comm.json['data']]
        self.assertIn('Emily Supercars Showcase', comm_names)
        self.assertNotIn('Emily Private Vault', comm_names, "Private collections must never appear in Community")

        # 3. Emily attempts to vote for her own collection -> 400 Bad Request
        res_self_vote = self.client.post(f'/api/collections/{e_pub_id}/vote', headers={'X-CSRF-Token': csrf_e})
        self.assertEqual(res_self_vote.status_code, 400)

        # 4. Register Frank
        res_f = self.client.post('/api/auth/register', json={
            'username': 'frank',
            'email': 'frank@garage.local',
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        })
        csrf_f = res_f.json['csrf_token']

        # Frank votes for Emily's public collection -> 200 OK, action: 'voted'
        res_vote1 = self.client.post(f'/api/collections/{e_pub_id}/vote', headers={'X-CSRF-Token': csrf_f})
        self.assertEqual(res_vote1.status_code, 200)
        self.assertEqual(res_vote1.json['action'], 'voted')
        self.assertEqual(res_vote1.json['votes_count'], 1)
        self.assertTrue(res_vote1.json['has_voted'])

        # Frank votes again -> Toggles to 'unvoted'
        res_vote2 = self.client.post(f'/api/collections/{e_pub_id}/vote', headers={'X-CSRF-Token': csrf_f})
        self.assertEqual(res_vote2.status_code, 200)
        self.assertEqual(res_vote2.json['action'], 'unvoted')
        self.assertEqual(res_vote2.json['votes_count'], 0)
        self.assertFalse(res_vote2.json['has_voted'])

        # Frank votes once more -> 'voted' (1 vote)
        res_vote3 = self.client.post(f'/api/collections/{e_pub_id}/vote', headers={'X-CSRF-Token': csrf_f})
        self.assertEqual(res_vote3.status_code, 200)
        self.assertEqual(res_vote3.json['votes_count'], 1)

        # 5. Top Collections Leaderboard: Emily's collection is #1 rank with 1 vote
        res_lb = self.client.get('/api/collections/leaderboard?period=all')
        self.assertEqual(res_lb.status_code, 200)
        lb_data = res_lb.json['data']
        self.assertGreaterEqual(len(lb_data), 1)
        top_item = lb_data[0]
        self.assertEqual(top_item['id'], e_pub_id)
        self.assertEqual(top_item['rank'], 1)
        self.assertEqual(top_item['votes_count'], 1)
        self.assertEqual(top_item['owner_username'], 'emily')

        # Test month period
        res_lb_month = self.client.get('/api/collections/leaderboard?period=month')
        self.assertEqual(res_lb_month.status_code, 200)
        self.assertEqual(res_lb_month.json['period'], 'month')

    def test_11_full_e2e_multi_account_workflow(self):
        """End-to-end integration test validating all requirements across User A and User B."""
        # 1. Register User A (Alice)
        res_a = self.client.post('/api/auth/register', json={
            'username': 'alice_e2e',
            'email': 'alice@e2e.local',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'display_name': 'Alice E2E'
        })
        csrf_a = res_a.json['csrf_token']

        # Alice adds a model
        res_am = self.client.post('/api/models', json={
            'name': 'Alice Nissan Skyline R34',
            'category': 'Car',
            'brand': 'AutoArt',
            'price': 4500000
        }, headers={'X-CSRF-Token': csrf_a})
        self.assertEqual(res_am.status_code, 201)
        alice_model_id = res_am.json['data']['id']

        # 2. Register User B (Bob)
        res_b = self.client.post('/api/auth/register', json={
            'username': 'bob_e2e',
            'email': 'bob@e2e.local',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'display_name': 'Bob E2E'
        })
        csrf_b = res_b.json['csrf_token']

        # Bob adds a model
        res_bm = self.client.post('/api/models', json={
            'name': 'Bob Gundam Barbatos Lupus',
            'category': 'Gundam',
            'brand': 'Bandai',
            'price': 1200000
        }, headers={'X-CSRF-Token': csrf_b})
        self.assertEqual(res_bm.status_code, 201)
        bob_model_id = res_bm.json['data']['id']

        # Bob checks My Garage: sees ONLY Barbatos, NOT Skyline
        res_b_models = self.client.get('/api/models')
        self.assertEqual(res_b_models.json['count'], 1)
        self.assertEqual(res_b_models.json['data'][0]['name'], 'Bob Gundam Barbatos Lupus')

        # Bob checks dashboard stats: exactly 1 Gundam, 0 Cars, 1,200,000 VND
        res_b_stats = self.client.get('/api/stats')
        self.assertEqual(res_b_stats.json['data']['total'], 1)
        self.assertEqual(res_b_stats.json['data']['total_gundams'], 1)
        self.assertEqual(res_b_stats.json['data']['total_cars'], 0)
        self.assertEqual(res_b_stats.json['data']['total_value'], 1200000.0)

        # Bob creates a public collection and adds his model to it
        res_b_col = self.client.post('/api/collections', json={
            'name': 'Bob Gunpla Masterpieces',
            'visibility': 'public'
        }, headers={'X-CSRF-Token': csrf_b})
        bob_col_id = res_b_col.json['data']['id']

        res_b_add_m = self.client.post(f'/api/collections/{bob_col_id}/models', json={
            'model_id': bob_model_id
        }, headers={'X-CSRF-Token': csrf_b})
        self.assertEqual(res_b_add_m.status_code, 201)

        # Bob attempts to add Alice's model to his collection -> 403 Forbidden
        res_b_steal = self.client.post(f'/api/collections/{bob_col_id}/models', json={
            'model_id': alice_model_id
        }, headers={'X-CSRF-Token': csrf_b})
        self.assertEqual(res_b_steal.status_code, 403)

        # Switch back to Alice
        res_login_alice = self.client.post('/api/auth/login', json={'username': 'alice_e2e', 'password': 'Password123!'})
        self.assertEqual(res_login_alice.status_code, 200)
        csrf_a_active = res_login_alice.json['csrf_token']

        # Alice cannot edit or delete Bob's model -> 403 Forbidden
        res_a_del = self.client.delete(f'/api/models/{bob_model_id}', headers={'X-CSRF-Token': csrf_a_active})
        self.assertEqual(res_a_del.status_code, 403)

        # Alice visits Community: sees Bob's collection
        res_comm = self.client.get('/api/community/collections')
        col_names = [c['name'] for c in res_comm.json['data']]
        self.assertIn('Bob Gunpla Masterpieces', col_names)

        # Alice votes for Bob's collection
        res_vote = self.client.post(f'/api/collections/{bob_col_id}/vote', headers={'X-CSRF-Token': csrf_a_active})
        self.assertEqual(res_vote.status_code, 200)
        self.assertEqual(res_vote.json['votes_count'], 1)

        # Alice views Bob's public profile `/u/bob_e2e`
        res_prof = self.client.get('/api/users/bob_e2e/profile')
        self.assertEqual(res_prof.status_code, 200)
        prof_data = res_prof.json['data']
        self.assertEqual(prof_data['username'], 'bob_e2e')
        self.assertEqual(prof_data['stats']['public_collections_count'], 1)
        self.assertEqual(prof_data['stats']['public_models_count'], 1)
        self.assertEqual(prof_data['stats']['total_votes_received'], 1)
        self.assertFalse(prof_data['is_owner'])

if __name__ == '__main__':
    unittest.main()
