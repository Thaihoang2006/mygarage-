# MyGarage – Personal Model Collection Manager 🏎️🤖

Ứng dụng web quản lý bộ sưu tập mô hình (Ô tô Die-cast, Gunpla/Gundam và các dòng mô hình sưu tầm khác) được thiết kế theo phong cách **Premium Automotive Dashboard** với Dark Mode và Vintage Theme (Polo Burgundy, Saddle Tan, Racing Green).

Dự án được xây dựng phục vụ bài tập lớn môn **Triển khai ứng dụng web với Docker & Kubernetes (CKA 2026)**.

---

## 1. Công nghệ sử dụng & Kiến trúc

- **Frontend**: HTML5, CSS3, Pure JavaScript, Chart.js, FontAwesome (phục vụ bằng Nginx Alpine Container làm Reverse Proxy).
- **Backend**: Python 3.12/3.14, Flask REST API, Flask-SQLAlchemy, PyMySQL, Pillow, Gunicorn (Linux container).
- **Database**: MySQL 8.0 (`mygarage_db`) hỗ trợ Persistent Volume Claim.
- **Container & Registry**: Docker, Docker Compose, Docker Hub Registry (`nthoang06`).
- **Orchestration**: Kubernetes v1.31 (Kubeadm, Flannel CNI, 1 Control Plane + 2 Worker Nodes trên AWS EC2).

### Danh sách Docker Images trên Docker Hub:
- Backend v1: `nthoang06/mygarage-backend:v1`
- Frontend v1: `nthoang06/mygarage-frontend:v1`
- Frontend v2: `nthoang06/mygarage-frontend:v2` (Phiên bản nâng cấp phục vụ thử nghiệm Rolling Update & Rollback)

---

## 2. Cấu trúc thư mục dự án

```text
mygarage/
├── frontend/
│   ├── index.html           # Giao diện chính (Dashboard, Collection, Auth modal, Theme switch)
│   ├── css/
│   │   └── style.css        # CSS tùy biến Dark Mode & Vintage Automotive Theme
│   ├── js/
│   │   └── app.js           # REST API client, Charts, Camera & Upload, Dynamic Filters
│   ├── assets/              # Hình ảnh tĩnh, biểu tượng
│   ├── nginx.conf           # Cấu hình Nginx reverse proxy /api và /uploads
│   └── Dockerfile           # Nginx Alpine container
│
├── backend/
│   ├── app.py               # Flask REST API, routing, upload & image validation, auth
│   ├── models.py            # SQLAlchemy Model: User, ModelItem, Collection
│   ├── config.py            # Đọc cấu hình từ biến môi trường & .env
│   ├── init_db.py           # Script khởi tạo database và nạp dữ liệu mẫu
│   ├── requirements.txt     # Danh sách thư viện Python
│   ├── uploads/             # Thư mục lưu trữ hình ảnh tải lên
│   └── Dockerfile           # Python 3.12 Slim + Gunicorn container
│
├── database/
│   └── init.sql             # SQL Script tạo database, bảng và dữ liệu mẫu khởi tạo
│
├── kubernetes/              # Các manifest YAML triển khai cụm K8s
│   ├── 00-namespace.yaml    # Namespace: mygarage
│   ├── 01-secret-configmap.yaml # ConfigMap & Secret (DB credentials, Flask env)
│   ├── 02-storage.yaml      # PersistentVolume & PersistentVolumeClaim (MySQL & Uploads)
│   ├── 03-mysql.yaml        # Deployment & ClusterIP Service cho MySQL 8.0
│   ├── 04-backend.yaml      # Deployment (2 replicas, podAntiAffinity) & ClusterIP Service
│   └── 05-frontend.yaml     # Deployment (2 replicas, podAntiAffinity) & NodePort Service (30080)
│
├── tests/
│   └── test_api.py          # Bộ kiểm thử tự động API (7/7 tests pass)
│
├── docker-compose.yml       # Khởi chạy trọn bộ 3 dịch vụ cục bộ
├── .dockerignore
├── .gitignore
└── README.md                # Hướng dẫn chi tiết dự án
```

---

## 3. Hướng dẫn chạy bằng Docker Compose (Cục bộ)

Khởi động toàn bộ hệ thống gồm 3 container (MySQL, Backend, Frontend) chỉ với 1 câu lệnh:

```bash
docker compose up -d --build
```

- Mở trình duyệt truy cập: `http://localhost` (hoặc `http://localhost:80`)
- Dữ liệu và hình ảnh tải lên được lưu bền vững qua Docker Volumes (`mysql_data`, `uploads_data`).
- Để dừng hệ thống:
```bash
docker compose down
```

---

## 4. Hướng dẫn triển khai lên cụm Kubernetes (Production / Cloud)

### 4.1. Kiến trúc cụm Kubernetes 3-Node trên AWS EC2
- **Node Control Plane**: `ip-172-31-39-7` (Public IP: `3.107.71.171`)
- **Node Worker 1**: `ip-172-31-42-90` (Public IP: `16.176.226.153`)
- **Node Worker 2**: `ip-172-31-45-172` (Public IP: `52.63.115.3`)
- **CNI**: Flannel (`10.244.0.0/16`)

### 4.2. Triển khai các Manifests
Trên máy Control Plane (`cp`), áp dụng toàn bộ các file YAML theo thứ tự:

```bash
kubectl apply -f kubernetes/00-namespace.yaml
kubectl apply -f kubernetes/01-secret-configmap.yaml
kubectl apply -f kubernetes/02-storage.yaml
kubectl apply -f kubernetes/03-mysql.yaml
kubectl apply -f kubernetes/04-backend.yaml
kubectl apply -f kubernetes/05-frontend.yaml
```

*(Hoặc áp dụng nhanh toàn bộ thư mục: `kubectl apply -f kubernetes/`)*

### 4.3. Kiểm tra trạng thái triển khai
```bash
kubectl get pods -n mygarage -o wide
kubectl get svc -n mygarage
```

- Truy cập web từ Internet thông qua NodePort:
  - `http://3.107.71.171:30080` (Control Plane)
  - `http://16.176.226.153:30080` (Worker 1)

---

## 5. Các kịch bản vận hành Kubernetes (Operations)

### 5.1. Scale số lượng Replicas
Tăng số lượng Pod Frontend lên 4 replicas để chịu tải cao:
```bash
kubectl scale deployment frontend -n mygarage --replicas=4
kubectl get pods -n mygarage -l app=frontend -o wide
```

### 5.2. Rolling Update lên phiên bản v2
Cập nhật image Frontend lên bản `v2` không làm gián đoạn dịch vụ:
```bash
kubectl set image deployment/frontend frontend=nthoang06/mygarage-frontend:v2 -n mygarage
kubectl rollout status deployment/frontend -n mygarage
```

### 5.3. Rollback về phiên bản v1
Quay lui về phiên bản ổn định trước đó khi phát hiện sự cố:
```bash
kubectl rollout undo deployment/frontend -n mygarage
kubectl rollout status deployment/frontend -n mygarage
```

### 5.4. Thử nghiệm Self-Healing & High Availability (HA)
Tắt 1 Worker node (`worker2`) trên Cloud:
```bash
kubectl get nodes
# Quan sát worker2 chuyển sang NotReady
kubectl get pods -n mygarage -o wide
# Traffic người dùng vẫn được phục vụ liên tục thông qua worker1 nhờ podAntiAffinity và kube-proxy
```

---

## 6. Chạy bộ kiểm thử tự động (Unit & Integration Tests)
```bash
pytest tests/test_api.py -v
```
Kết quả kiểm thử: **7/7 tests passed**.
