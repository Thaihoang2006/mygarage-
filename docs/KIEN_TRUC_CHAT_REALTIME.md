# KIẾN TRÚC HỆ THỐNG REAL-TIME CHAT CHO MYGARAGE
*Tài liệu phân tích kỹ thuật và đề xuất giải pháp mở rộng (Không tự động triển khai - Chờ người dùng xác nhận)*

---

## 1. TỔNG QUAN & MỤC TIÊU HỆ THỐNG CHAT

Trong nền tảng **MyGarage**, cộng đồng người sưu tầm mô hình (ô tô die-cast, Gundam Gunpla, tượng nhân vật...) có nhu cầu trao đổi trực tiếp:
- Thảo luận kinh nghiệm sơn phết, custom, ráp mô hình.
- Hỏi mua, giao lưu hoặc chia sẻ thông tin về các bộ sưu tập quý hiếm.
- Chia sẻ đường dẫn nhanh đến mô hình cụ thể (`model_id`) hoặc thư viện công khai (`collection_id`).

Hệ thống chat cần đảm bảo:
- **Độ trễ thấp (Real-time)**: Tin nhắn hiển thị ngay lập tức khi người gửi bấm gửi.
- **Tính toàn vẹn & Bảo mật**: Chỉ thành viên trong cuộc hội thoại mới đọc được tin nhắn; backend kiểm soát session và CSRF nghiêm ngặt.
- **Khả năng mở rộng đa Replica (Horizontal Scalability)**: Hoạt động trơn tru khi backend chạy **nhiều Pods (Replicas >= 2)** trên cụm **Kubernetes** mà không bị mất tin nhắn giữa các Pod.

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Hệ thống chat đề xuất sử dụng 3 bảng quan hệ trong MySQL, đảm bảo chuẩn hóa (3NF) và hiệu năng truy vấn phân trang:

```
+-------------------+       +------------------------+       +-------------------+
|   conversations   | 1---N |  conversation_members  | N---1 |       users       |
+-------------------+       +------------------------+       +-------------------+
          | 1
          |
          | N
+-------------------+
|   chat_messages   |
+-------------------+
```

### 2.1. Bảng `conversations` (Cuộc hội thoại)
Lưu trữ thông tin phòng chat (chat 1-1 trực tiếp hoặc chat nhóm sau này):

```sql
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
    title VARCHAR(150) NULL COMMENT 'Tên nhóm (nếu là group chat)',
    created_by INT NULL COMMENT 'Người tạo cuộc trò chuyện',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2. Bảng `conversation_members` (Thành viên cuộc hội thoại)
Quản lý người tham gia, thời điểm đọc tin nhắn cuối cùng (để hiển thị badge "tin nhắn chưa đọc"):

```sql
CREATE TABLE conversation_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_conv_member (conversation_id, user_id),
    INDEX idx_user_convs (user_id, last_read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3. Bảng `chat_messages` (Nội dung tin nhắn)
Lưu trữ tin nhắn văn bản hoặc thẻ chia sẻ mô hình:

```sql
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type ENUM('text', 'image', 'model_share') NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSON NULL COMMENT 'Chứa thông tin đính kèm như model_id, collection_id, ảnh preview',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conv_timeline (conversation_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. THIẾT KẾ API VÀ GIAO THỨC WEBSOCKET

Hệ thống kết hợp giữa **HTTP REST API** (cho lịch sử, danh sách) và **WebSocket** (cho tương tác thời gian thực):

### 3.1. REST API Endpoints
| Phương thức | Endpoint | Mô tả | Quyền hạn |
|---|---|---|---|
| `GET` | `/api/chat/conversations` | Lấy danh sách hội thoại của user hiện tại, kèm tin nhắn mới nhất | Đăng nhập |
| `POST` | `/api/chat/conversations` | Bắt đầu chat 1-1 với user khác (`{ "recipient_id": 12 }`) | Đăng nhập |
| `GET` | `/api/chat/conversations/<id>/messages` | Lấy lịch sử tin nhắn phân trang (Cursor: `before_id`) | Thành viên phòng |
| `POST` | `/api/chat/conversations/<id>/read` | Đánh dấu đã đọc tất cả tin nhắn trong phòng | Thành viên phòng |

### 3.2. WebSocket Events (Flask-SocketIO)
- **Client gửi lên Server (Emit)**:
  - `join_room`: Gửi `conversation_id`, server kiểm tra quyền trong `conversation_members`, nếu hợp lệ thì cho client join socket room.
  - `send_message`: Gửi `{ "conversation_id": 1, "content": "Chào bạn, xe GT3 đẹp quá!", "message_type": "text" }`.
  - `typing`: Báo đang gõ tin nhắn (`{ "conversation_id": 1, "is_typing": true }`).
- **Server đẩy xuống Client (Broadcast)**:
  - `new_message`: Đẩy payload tin nhắn vừa lưu vào DB tới tất cả socket client trong cùng phòng.
  - `user_typing`: Thông báo trạng thái người khác đang soạn tin nhắn.
  - `message_read_receipt`: Thông báo đối phương đã xem tin nhắn.

---

## 4. GIẢI PHÁP ĐA REPLICA TRÊN KUBERNETES (MULTI-POD HORIZONTAL SCALING)

### 4.1. Vấn đề thực tế trong Kubernetes
Trong kiến trúc hiện tại của dự án MyGarage:
- Backend chạy dưới dạng Deployment trên cụm K8s với 2 Worker Nodes (`worker1`, `worker2`).
- Khi tải tăng, chúng ta scale `replicas: 2` hoặc `replicas: 3`:
  - **Pod 1** chạy trên `worker1` (IP `10.244.1.x`).
  - **Pod 2** chạy trên `worker2` (IP `10.244.2.x`).
- Nếu **User A kết nối tới Pod 1** và **User B kết nối tới Pod 2**:
  - Khi User A gửi tin nhắn qua WebSocket, Pod 1 nhận được.
  - Nhưng bộ nhớ của Pod 1 **hoàn toàn độc lập** với Pod 2! Pod 1 không biết User B đang mở kết nối ở Pod 2, dẫn đến User B không nhận được tin nhắn real-time nếu không reload lại trang!

### 4.2. Mô hình kiến trúc giải pháp: Redis Pub/Sub Message Broker

Để giải quyết bài toán giao tiếp giữa các Pods, ta sử dụng **Redis Pub/Sub** đóng vai trò Message Broker đồng bộ sự kiện WebSocket giữa tất cả các Pod:

```
[ Client A (User 1) ]           [ Client B (User 2) ]
        |                               |
  WebSocket conn                  WebSocket conn
        |                               |
        v                               v
 +---------------+              +---------------+
 | Backend Pod 1 |              | Backend Pod 2 |
 +---------------+              +---------------+
        \                               /
         \                             /
    Publish event                Subscribe event
           \                         /
            v                       v
      +-----------------------------------+
      |        Redis Message Broker       |
      |       (Channel: mygarage_chat)    |
      +-----------------------------------+
                        |
            Lưu dữ liệu tin nhắn lâu dài
                        v
              +-------------------+
              |    MySQL Server   |
              +-------------------+
```

### 4.3. Cách thức vận hành kỹ thuật
1. **Thiết lập thư viện**: Sử dụng `flask-socketio` với cấu hình Message Queue:
   ```python
   # backend/extensions.py
   from flask_socketio import SocketIO
   socketio = SocketIO(
       cors_allowed_origins="*",
       message_queue="redis://redis-service.mygarage.svc.cluster.local:6379/0"
   )
   ```
2. **Quy trình truyền tin**:
   - Khi Pod 1 nhận `send_message` từ User A, Pod 1 lưu tin nhắn vào MySQL.
   - Pod 1 emit event `new_message` tới room `conv_123`.
   - Nhờ tham số `message_queue`, `flask-socketio` tự động publish event này vào Redis.
   - Redis broadcast event tới Pod 2.
   - Pod 2 nhận event từ Redis và gửi ngay xuống socket của User B đang kết nối vào Pod 2.
3. **Session Affinity (Sticky Session)**:
   - Trên Ingress hoặc Service, thiết lập Cookie Affinity để trình duyệt giữ kết nối WebSocket ổn định với cùng 1 Pod trong suốt phiên làm việc, tránh việc bắt tay lại (handshake loop).

---

## 5. TÀI NGUYÊN HẠ TẦNG KHI NÂNG CẤP LÊN KUBERNETES

Khi người dùng kích hoạt tính năng chat, hệ thống sẽ cần bổ sung vào Kubernetes:
1. **`k8s/redis-deployment.yaml`**:
   - 1 Deployment Redis (Image: `redis:7-alpine`) với yêu cầu tài nguyên nhỏ (`memory: 128Mi`, `cpu: 100m`).
   - 1 Service `redis-service` (Port 6379) trong namespace `mygarage`.
2. **Thư viện Backend (`requirements.txt`)**:
   - `flask-socketio==5.3.6`
   - `gevent-websocket==0.10.1` (hoặc `eventlet==0.35.2`)
   - `redis==5.0.3`
3. **Frontend UI**:
   - Bổ sung thư viện `socket.io.min.js` (nhẹ, ~10KB).
   - Component Drawer Chat hoặc Floating Chat Bubble góc phải dưới màn hình.

---

## 6. KẾT LUẬN

Phương án trên đã được thiết kế hoàn chỉnh về mặt kiến trúc, database schema và giải pháp đa replica trên Kubernetes.

> [!IMPORTANT]
> **Tuân thủ chỉ thị:** Toàn bộ mã nguồn chat **CHƯA được triển khai vào hệ thống** để ưu tiên kiểm thử hoàn thiện các chức năng Community, Profile, Vote và Top Collections theo đúng yêu cầu đề bài.
