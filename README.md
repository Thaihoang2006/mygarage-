# MyGarage – Personal Model Collection Manager 🏎️🤖

Ứng dụng web quản lý bộ sưu tập mô hình (Ô tô Die-cast, Gunpla/Gundam và các dòng mô hình sưu tầm khác) được thiết kế theo phong cách **Premium Automotive Dashboard** với Dark Mode và bảng màu sang trọng (Polo Burgundy, Saddle Tan, Racing Green).

Dự án được xây dựng phục vụ bài tập lớn môn **Triển khai ứng dụng web với Docker & Kubernetes**.

---

## 1. Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, Pure JavaScript, Chart.js, FontAwesome (Không dùng React/Vue).
- **Backend**: Python 3.12/3.14, Flask, Flask-SQLAlchemy, PyMySQL, Pillow, Gunicorn (Linux container).
- **Database**: MySQL 8.x (`mygarage_db`).
- **Container & Orchestration**: Docker, Docker Compose, Kubernetes (Kubeadm, Flannel/Calico CNI).

---

## 2. Bảng màu chủ đạo (Luxury Racing Theme)

- **Polo Burgundy**: `#641E2A` – Điểm nhấn thương hiệu, nút chính, badge Gundam.
- **Saddle Tan**: `#C9B99A` – Tông màu ánh kim ấm áp, viền card, số liệu quan trọng, chữ phụ nổi bật.
- **Racing Green**: `#18352B` – Tông xanh xe đua cổ điển, badge Xe (Car), trạng thái hoạt động.
- **Dark Green-Charcoal Surface**: `#0a1310` / `#13221c` – Nền giao diện tối dịu mắt, độ tương phản cao.

---

## 3. Cấu trúc thư mục

```text
mygarage/
├── frontend/
│   ├── index.html           # Giao diện chính (Dashboard, Collection, Add Model, Modals)
│   ├── css/
│   │   └── style.css        # CSS tùy biến giao diện Premium Automotive Dashboard
│   ├── js/
│   │   └── app.js           # Xử lý sự kiện, REST API client, Charts, Camera & Upload
│   ├── assets/              # Hình ảnh tĩnh, biểu tượng
│   ├── nginx.conf           # Cấu hình Nginx reverse proxy /api và /uploads
│   └── Dockerfile           # Nginx Alpine container
│
├── backend/
│   ├── app.py               # Flask REST API, routing, upload & image validation
│   ├── models.py            # SQLAlchemy Model: ModelItem
│   ├── config.py            # Đọc cấu hình từ biến môi trường & .env
│   ├── init_db.py           # Script khởi tạo database và nạp dữ liệu mẫu
│   ├── requirements.txt     # Danh sách thư viện Python
│   ├── uploads/             # Thư mục lưu trữ hình ảnh tải lên cục bộ
│   ├── Dockerfile           # Python 3.12 Slim + Gunicorn container
│   ├── .env.example         # Mẫu cấu hình môi trường
│   └── .env                 # File biến môi trường bảo mật (không commit lên Git)
│
├── database/
│   └── init.sql             # SQL Script tạo bảng models và dữ liệu mẫu ban đầu
│
├── kubernetes/
│   └── README.md            # Tài liệu kiến trúc cụm K8s 3-node
│
├── docker-compose.yml       # Cấu hình khởi chạy trọn bộ 3 container cục bộ
├── .gitignore               # Loại bỏ các file nhạy cảm và tạm (.env, venv, uploads)
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## 4. Hướng dẫn khởi chạy cục bộ (Giai đoạn 1)

### Bước 1: Cấu hình kết nối MySQL trong `backend/.env`
Tạo file `backend/.env` (sao chép từ `backend/.env.example`):
```env
FLASK_ENV=development
SECRET_KEY=mygarage-dev-secret-key-2026
PORT=5000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MẬT_KHẨU_MYSQL_CỦA_BẠN
DB_NAME=mygarage_db

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

### Bước 2: Khởi tạo cơ sở dữ liệu `mygarage_db`
Chạy script tự động tạo database, bảng và nạp 6 mẫu xe & mô hình ban đầu:
```bash
cd backend
python init_db.py
```
*(Hoặc import trực tiếp file `database/init.sql` thông qua MySQL Workbench).*

### Bước 3: Chạy Backend Flask
```bash
python app.py
```
Máy chủ backend sẽ chạy tại: `http://127.0.0.1:5000`

### Bước 4: Trải nghiệm Website
- Truy cập trực tiếp trình duyệt tại: `http://127.0.0.1:5000` (Flask tự động phục vụ giao diện frontend).
- Hoặc mở file `frontend/index.html` bằng trình duyệt hay Live Server.
- Thử nghiệm các tính năng:
  - 📊 Xem thống kê Dashboard và biểu đồ phân bố.
  - 🔍 Tìm kiếm mô hình, lọc theo danh mục (Car, Gundam, Other), lọc theo Hãng, sắp xếp theo giá và ngày thêm.
  - ➕ Thêm mô hình mới: Chọn ảnh từ máy tính hoặc chụp từ camera điện thoại.
  - 🖼️ Xem chi tiết mô hình, chỉnh sửa thông tin, đổi ảnh và xóa mô hình có hộp thoại xác nhận an toàn.
