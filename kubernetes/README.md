# Kubernetes Deployment Guide - MyGarage

Thư mục này chứa các tài liệu và cấu hình triển khai dự án MyGarage trên Kubernetes cluster với `kubeadm` (3 VMs: `cp`, `worker1`, `worker2`).

## Cấu trúc dự kiến các manifests YAML (Giai đoạn 4)

- `00-namespace.yaml`: Tạo namespace `mygarage`
- `01-secret-configmap.yaml`: Quản lý mật khẩu MySQL và cấu hình kết nối
- `02-storage.yaml`: PersistentVolume (PV) và PersistentVolumeClaim (PVC) cho MySQL và uploads
- `03-mysql.yaml`: Deployment / StatefulSet và ClusterIP Service cho MySQL
- `04-backend.yaml`: Deployment (2 replicas, podAntiAffinity) và ClusterIP Service cho Backend
- `05-frontend.yaml`: Deployment (2 replicas, podAntiAffinity) và NodePort / Ingress Service cho Frontend

*Lưu ý: Các file YAML chi tiết sẽ được hướng dẫn tạo từng bước trong Giai đoạn 4 theo Chế độ B (Giảng viên thực hành).*
