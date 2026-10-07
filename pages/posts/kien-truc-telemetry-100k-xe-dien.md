---
title: Kiến trúc xử lý Telemetry thời gian thực cho hơn 100.000 xe điện thông minh
date: 2026-03-15T09:00:00Z
lang: vi
duration: 7min
type: blog
description: Hành trình thiết kế hệ thống streaming dữ liệu xe điện tải cao với Kafka, WebSocket cluster và hạn chế áp lực backpressure tại CMC Global.
---

Khi số lượng phương tiện giao thông thông minh kết nối vào hệ thống tăng từ vài nghìn lên hơn 100.000 xe điện, bài toán kỹ thuật không còn đơn thuần là "lưu dữ liệu vào database". Mỗi giây, hàng trăm nghìn gói tin trạng thái pin (SOC), tọa độ GPS, mã lỗi CAN bus và nhiệt độ động cơ đổ về máy chủ liên tục 24/7.

Trong bài viết này, tôi muốn chia sẻ lại những bài học kiến trúc thực chiến khi dẫn dắt đội ngũ kỹ thuật xây dựng hạ tầng telemetry chịu tải cao.

> [!NOTE]
> Các tên thương hiệu và dữ liệu nhạy cảm của khách hàng đã được lược bỏ nhằm tuân thủ thỏa thuận bảo mật (NDA). Trọng tâm bài viết tập trung vào các mẫu thiết kế kiến trúc phân tán (distributed design patterns).

---

## 1. Thách thức cốt lõi: Cơn bão I/O và nghẽn mạng Backpressure

Xe điện di chuyển qua các vùng hầm hoặc mất sóng di động (cellular dead-zone) sẽ tạm lưu trữ dữ liệu tại bộ nhớ đệm trên xe. Khi vừa bắt lại sóng 4G/5G, toàn bộ dữ liệu dồn ứ sẽ được xả về máy chủ trong một tích tắc:

```
[100,000+ Smart EVs] ──(MQTT / WSS)──> [Ingestion Gateway Cluster]
                                                │
                                                ▼ (Burst Buffer)
                                         [Apache Kafka Topic]
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          ▼                                           ▼
            [Real-Time Anomaly Streamer]                [Time-Series Hot Storage]
```

Nếu gateway cố gắng ghi đồng bộ (synchronous write) vào cơ sở dữ liệu quan hệ, hệ thống sẽ sập nguồn ngay lập tức vì cạn kiệt connection pool.

---

## 2. Chiến lược phân tách luồng: Hot vs Cold Path

Để đảm bảo độ trễ phản hồi dưới 50ms cho ứng dụng người dùng cuối (xem xe đang sạc ở đâu) trong khi vẫn lưu trữ đầy đủ lịch sử phục vụ phân tích máy học:

1. **Hot Path (Thời gian thực):**
   * Dữ liệu telemetry đi thẳng qua **Kafka cluster** và được gom cụm bằng bộ lọc bộ nhớ trong (in-memory deduplication).
   * Phân phối trực tiếp tới các dashboard giám sát và ứng dụng di động qua cụm **WebSocket Cluster** với cơ chế heartbeat tự động.
2. **Cold Path (Phân tích lịch sử):**
   * Ghi nhận dạng lô (Micro-batching) vào **TimescaleDB / ClickHouse** theo chu kỳ 10 giây/lần.
   * Giảm tải hơn 90% số lượng truy vấn `INSERT` riêng lẻ vào database.

---

## 3. Quản lý luồng WebSocket và ngắt kết nối an toàn

Khi người vận hành giám sát hàng nghìn xe cùng lúc, việc duy trì kết nối WebSocket đòi hỏi cơ chế phòng chống rò rỉ bộ nhớ (leakage):
* Sử dụng **Tokio broadcast channel** với giới hạn dung lượng hàng đợi (bounded capacity).
* Khi client mạng chậm không kịp tiêu thụ dữ liệu (slow consumer), hệ thống chủ động bỏ qua (drop) các frame định vị cũ thay vì tích lũy buffer khiến RAM server phình to.

Hệ sinh thái này giúp đảm bảo độ sẵn sàng 99.9% ngay cả trong những đợt cao điểm ngày lễ tết, khi lượng xe lưu thông trên đường đạt mức kỷ lục.
