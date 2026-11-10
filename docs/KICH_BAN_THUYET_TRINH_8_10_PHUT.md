# KỊCH BẢN THUYẾT TRÌNH & DEMO TRỰC TIẾP (8 - 10 PHÚT)
## BÀI TẬP GIỮA KỲ: TRIỂN KHAI VÀ VẬN HÀNH WEB TRÊN KUBERNETES

- **Dự án:** MyGarage – Personal Model Collection Manager
- **Cụm triển khai:** 3 Nodes AWS EC2 (1 Control Plane + 2 Workers)
- **Thời lượng:** 8 - 10 phút (Theo quy định môn học)
- **Đường dẫn Web Live:** `http://3.107.71.171:30080`
- **Repository GitHub:** `https://github.com/Thaihoang2006/mygarage-`
- **Docker Hub:** `nthoang06`

---

## 1. PHÂN BỔ THỜI GIAN & PHÂN VAI (DÀNH CHO NHÓM)

| Thời gian | Nội dung trình bày | Người phụ trách đề xuất |
|:---:|:---|:---|
| **0:00 - 1:30** | Mở đầu, Giới thiệu bài toán, Ý tưởng Web MyGarage & Demo giao diện | Thành viên 1 |
| **1:30 - 3:00** | Kiến trúc 3 tầng Microservices, Đóng gói Docker & Cụm K8s 3-node AWS | Thành viên 2 |
| **3:00 - 5:30** | Demo Triển khai K8s: Namespace, Pods, Services, Storage, PodAntiAffinity | Thành viên 3 |
| **5:30 - 8:00** | Demo Vận hành trực tiếp: Scale 4 Replicas, Rolling Update v2 & Rollback v1 | Thành viên 4 |
| **8:00 - 9:30** | Demo Thử nghiệm thảm họa: Tắt Worker 2 & Giải thích High Availability | Thành viên 5 (hoặc Trưởng nhóm) |
| **9:30 - 10:00**| Khó khăn gặp phải, Kết luận & Trả lời câu hỏi phản biện của Giảng viên | Cả nhóm |

---

## 2. KỊCH BẢN CHI TIẾT TỪNG PHÚT & LỜI THOẠI (SPEECH SCRIPT)

### PHẦN 1: MỞ ĐẦU & GIỚI THIỆU ỨNG DỤNG (Phút 0:00 - 1:30)
* **Thao tác màn hình:** Chiếu slide bìa nhóm $\rightarrow$ Chuyển sang tab trình duyệt mở web live: `http://3.107.71.171:30080`.
* **Lời nói:**
  > "Kính chào thầy cô và các bạn. Hôm nay, nhóm chúng em xin phép trình bày kết quả thực hiện bài tập giữa kỳ môn Triển khai ứng dụng Web với Docker và Kubernetes.  
  > Đề tài nhóm lựa chọn là **MyGarage** – nền tảng quản lý bộ sưu tập mô hình xe tĩnh và Gunpla cao cấp.  
  > Ứng dụng được thiết kế theo phong cách *Luxury Automotive Dashboard* với đầy đủ tính năng: Xác thực đăng nhập, chuyển đổi bảng màu Vintage Automotive độc quyền, quản lý danh mục tùy biến động và biểu đồ thống kê cơ cấu tài sản.  
  > Hiện tại, toàn bộ hệ thống đang chạy live trên cụm **Kubernetes 3-node trên nền tảng AWS Cloud**, truy cập công khai qua cổng NodePort 30080 mà thầy cô đang thấy trên màn hình."

---

### PHẦN 2: DOCKER VÀ THIẾT LẬP CỤM K8S TRÊN AWS (Phút 1:30 - 3:00)
* **Thao tác màn hình:** Mở tab Docker Hub `nthoang06` $\rightarrow$ Mở terminal SSH vào máy Control Plane `cp`.
* **Lời nói:**
  > "Để đưa ứng dụng lên đám mây, nhóm đã thực hiện 2 bước nền tảng:  
  > 1. **Đóng gói Docker:** Tách hệ thống thành các container độc lập với base image tối giản (`python:3.12-slim` và `nginx:alpine`). Nhóm tuân thủ quy chuẩn đánh tag cụ thể `v1`, `v2`, tuyệt đối không dùng `latest` và đã đẩy toàn bộ lên Docker Hub public.  
  > 2. **Dựng cụm Kubernetes trên AWS EC2:** Cụm gồm 1 Control Plane và 2 Worker Nodes chạy Ubuntu 24.04, cấu hình `t3.small` (2 vCPU, 2GB RAM), mạng Pod kết nối qua CNI Flannel."
* **Lệnh gõ live trên terminal:**
  ```bash
  kubectl get nodes -o wide
  ```
* **Điểm nhấn:** Chỉ cho thầy cô thấy 3 node đều đang ở trạng thái **`Ready`**, phiên bản K8s v1.31.

---

### PHẦN 3: DEMO TRIỂN KHAI ỨNG DỤNG LÊN K8S (Phút 3:00 - 5:30)
* **Thao tác màn hình:** Giữ terminal Control Plane.
* **Lời nói:**
  > "Ứng dụng được khai báo hoàn toàn bằng các file YAML trong namespace riêng biệt `mygarage`.  
  > Để dữ liệu không bị mất khi container khởi động lại, nhóm sử dụng `PersistentVolume` và `PVC` cho cả MySQL database và thư mục hình ảnh upload.  
  > Đặc biệt, để đảm bảo tiêu chí chịu lỗi cao, các Deployment Frontend và Backend đều chạy từ **2 replicas trở lên** và cấu hình **`podAntiAffinity`** để phân bổ đều sang 2 Worker Nodes khác nhau."
* **Lệnh gõ live trên terminal:**
  ```bash
  kubectl get pods -n mygarage -o wide
  kubectl get svc -n mygarage
  ```
* **Điểm nhấn:**
  - Chỉ rõ cột `NODE`: 1 pod frontend nằm ở `ip-172-31-42-90` (worker1) và 1 pod nằm ở `ip-172-31-45-172` (worker2).
  - Service `frontend` là loại **NodePort** đang mở cổng **`30080`**.

---

### PHẦN 4: DEMO VẬN HÀNH: SCALE, ROLLING UPDATE & ROLLBACK (Phút 5:30 - 8:00)
* **Thao tác màn hình:** Chia đôi màn hình: Nửa trái là Terminal K8s, Nửa phải là Trình duyệt Web.

#### 1. Demo Scale lên 4 Replicas:
* **Lời nói:** *"Khi chiến dịch marketing có lượng người dùng tăng vọt, em thực hiện scale frontend lên 4 Pods:"*
* **Lệnh gõ:**
  ```bash
  kubectl scale deployment frontend -n mygarage --replicas=4
  kubectl get pods -n mygarage -l app=frontend -o wide
  ```
* **Điểm nhấn:** Kube-scheduler lập tức tạo thêm 2 Pods mới và chia đều: 2 Pods trên Worker 1, 2 Pods trên Worker 2.

#### 2. Demo Rolling Update lên phiên bản v2 (Zero-Downtime):
* **Lời nói:** *"Bây giờ nhóm thực hiện phát hành phiên bản mới `v2`. Kubernetes sẽ lần lượt thay thế từng Pod cũ bằng Pod mới, đảm bảo web liên tục sẵn sàng:"*
* **Lệnh gõ:**
  ```bash
  kubectl set image deployment/frontend frontend=nthoang06/mygarage-frontend:v2 -n mygarage
  kubectl rollout status deployment/frontend -n mygarage
  ```
* **Thao tác web:** F5 liên tục trên trình duyệt, web không hề gián đoạn và xuất hiện badge phiên bản `v2.0`.

#### 3. Demo Rollback về phiên bản v1:
* **Lời nói:** *"Nếu phát hiện lỗi logic ở phiên bản mới, ta chỉ mất 1 giây để quay lui về phiên bản ổn định trước đó:"*
* **Lệnh gõ:**
  ```bash
  kubectl rollout undo deployment/frontend -n mygarage
  kubectl rollout status deployment/frontend -n mygarage
  ```

---

### PHẦN 5: DEMO TẮT NODE & GIẢI THÍCH HIGH AVAILABILITY (Phút 8:00 - 9:30)
* **Thao tác màn hình:** Chiếu tab AWS EC2 Console $\rightarrow$ Chọn `worker2` $\rightarrow$ bấm **Stop instance**.
* **Lời nói:**
  > "Một trong những năng lực mạnh mẽ nhất của Kubernetes là **Self-Healing (Tự phục hồi)** và **High Availability (Tính sẵn sàng cao)**.  
  > Nhóm em xin phép giả lập sự cố phần cứng: Tắt nguồn máy ảo `worker2` ngay trên bảng điều khiển AWS."
* **Lệnh gõ trên terminal:**
  ```bash
  kubectl get nodes
  ```
  *(Đợi 30-40s node worker2 chuyển sang `NotReady`)*.
* **Lệnh kiểm tra pods:**
  ```bash
  kubectl get pods -n mygarage -o wide
  ```
* **Thao tác web:** Mở tab ẩn danh mới hoặc thiết bị di động truy cập lại: `http://3.107.71.171:30080`.
* **Giải thích nguyên lý:**
  > "Như thầy cô thấy: Mặc dù máy ảo `worker2` đã sập hoàn toàn (`NotReady`), website MyGarage **vẫn truy cập và thao tác bình thường**.  
  > Đó là nhờ vào sự kết hợp giữa:  
  > 1. `podAntiAffinity` đã dự phòng sẵn các bản sao trên `worker1`.  
  > 2. `Endpoint Controller` và `Kube-proxy` ngay lập tức gạch tên các Pod chết ra khỏi danh sách Service Endpoints, tự động chuyển toàn bộ traffic người dùng sang các Pod đang chạy trên Worker 1 mà không phát sinh lỗi 502/504."

---

### PHẦN 6: KẾT LUẬN & TRẢ LỜI CÂU HỎI PHẢN BIỆN (Phút 9:30 - 10:00)
* **Lời nói:**
  > "Nhóm đã hoàn thành trọn vẹn 100% các yêu cầu từ đóng gói Docker, dựng cụm cloud, khai báo manifests đến các kịch bản vận hành thực tế. Em xin chân thành cảm ơn thầy cô và sẵn sàng trả lời các câu hỏi phản biện ạ!"

---

## 3. CẨM NANG TRẢ LỜI CÂU HỎI PHẢN BIỆN (CHEAT-SHEET)

**Câu hỏi 1: Tại sao nhóm không dùng tag `latest` khi build Docker image?**
> *Trả lời:* Tag `latest` không mang tính định danh phiên bản. Trong môi trường Kubernetes, nếu dùng `latest`, Kubelet mặc định đặt chính sách `imagePullPolicy: Always`, gây tốn băng thông và khó khăn khi muốn Rollback chính xác về một bản build cũ nếu có lỗi.

**Câu hỏi 2: Sự khác nhau giữa `preferredDuringScheduling...` và `requiredDuringScheduling...` trong PodAntiAffinity?**
> *Trả lời:*
> - `preferred`: Là điều kiện ưu tiên mềm (Soft rule). Scheduler sẽ cố gắng tách Pod sang các node khác nhau, nhưng nếu cụm thiếu node (ví dụ chỉ có 1 node), Pod vẫn được chạy chứ không bị treo (Pending).
> - `required`: Là điều kiện bắt buộc cứng (Hard rule). Nếu không tìm thấy node thỏa mãn, Pod sẽ mãi ở trạng thái Pending không khởi động được.

**Câu hỏi 3: Dữ liệu MySQL được lưu ở đâu? Khi Pod MySQL bị xóa hoặc chuyển node thì dữ liệu có bị mất không?**
> *Trả lời:* Dữ liệu được lưu tại thư mục `/mnt/data/mysql` trên ổ đĩa của máy chủ thông qua PersistentVolume `hostPath`. Khi Pod MySQL bị xóa và dựng lại, Pod mới sẽ tự động mount lại thư mục này nên toàn bộ tài khoản và mô hình người dùng đã tạo được bảo toàn 100%.

**Câu hỏi 4: Khi Worker 2 bị tắt, sau bao lâu thì Kubernetes tự tạo lại các Pod mới trên Worker 1?**
> *Trả lời:* Theo mặc định của Kubernetes, tham số `--pod-eviction-timeout` trong `kube-controller-manager` là **5 phút (300 giây)**. Trong 5 phút này, K8s chờ xem node có khởi động lại không. Sau 5 phút, K8s sẽ đánh dấu các Pod trên node chết là `Terminating` và tự động kích hoạt tạo lại (reschedule) các Pod thay thế sang Worker 1.
