---
title: 'Tối ưu hiệu năng Dashboard giám sát xe điện: Duy trì 60 FPS dưới cơn bão Telemetry'
date: 2026-05-18T10:00:00Z
lang: vi
duration: 8min
type: blog
description: 'Kỹ thuật giải quyết bài toán nghẽn Main Thread, rớt khung hình khi render hàng chục nghìn điểm dữ liệu xe điện thời gian thực với Web Workers, Virtualized Canvas và Zustand transient updates.'
---

Khi quản lý và điều hành một hạm đội phương tiện giao thông thông minh quy mô lớn, bảng điều khiển (Fleet Monitoring Dashboard) là "bộ não" trung tâm của đội ngũ kỹ sư và điều hành viên. Trên một màn hình duy nhất, hệ thống phải liên tục hiển thị trạng thái của hàng chục nghìn xe: tọa độ di chuyển theo thời gian thực trên bản đồ vệ tinh, biểu đồ điện áp từng cell pin (SoC/SoH), nhiệt độ động cơ, công suất sạc và các cảnh báo khẩn cấp từ giao thức CAN bus.

Khi dữ liệu đổ về từ cụm WebSocket Gateway lên tới hàng chục nghìn gói tin mỗi giây, bài toán nan giải nhất không còn nằm ở máy chủ hay băng thông mạng, mà nằm ngay tại **Main Thread của trình duyệt người dùng**.

> [!NOTE]
> Toàn bộ số liệu kiến trúc và giải pháp trong bài viết được đúc kết từ trải nghiệm thực tế trong quá trình dẫn dắt đội ngũ kỹ thuật frontend cho dự án giám sát xe điện thông minh. Các thông tin định danh khách hàng đã được lược bỏ để tuân thủ thỏa thuận bảo mật (NDA).

---

## 1. Nút thắt hiệu năng: Tại sao DOM truyền thống sụp đổ?

Trong các ứng dụng React thông thường, luồng cập nhật dữ liệu thường tuân theo chu trình:

```
WebSocket onmessage ──> setState() ──> Virtual DOM Diffing ──> Re-render ──> Browser Paint
```

Khi tần suất cập nhật chỉ là 1-2 lần mỗi giây, chu trình này hoạt động hoàn hảo. Nhưng khi 5.000 phương tiện đồng loạt gửi trạng thái với chu kỳ 500ms:

1. **Nghẽn Main Thread (Long Tasks > 100ms):** Tác vụ giải mã JSON/Protobuf và tính toán diff trong Virtual DOM liên tục chiếm dụng Main Thread, khiến giao diện bị "đơ" cứng, thao tác click chuột hay zoom bản đồ bị giật lag nặng nề.
2. **Cơn bão Garbage Collection (GC):** Việc khởi tạo hàng chục nghìn object JavaScript mới mỗi giây để cập nhật state kích hoạt trình dọn rác (GC) chạy liên tục, gây ra hiện tượng rớt khung hình (jank) đột ngột từ 60 FPS xuống chỉ còn 10-15 FPS.
3. **Quá tải Layout & Paint:** Hàng nghìn phần tử DOM thay đổi kích thước và màu sắc khiến trình duyệt phải tính toán lại cây bố cục (Reflow/Recalculate Style) trên phạm vi toàn trang.

---

## 2. Giải pháp kiến trúc: Giải phóng Main Thread

Để duy trì tốc độ khung hình mượt mà 60 FPS, chúng tôi đã tái cấu trúc toàn bộ đường ống xử lý dữ liệu ở tầng giao diện theo mô hình 4 lớp:

```
[WebSocket Stream]
        │
        ▼ (Gói tin nhị phân Protobuf)
[Dedicated Web Worker] ──> (Giải mã, lọc trùng & nội suy vị trí)
        │
        ▼ (Batch payload theo nhịp 60Hz - requestAnimationFrame)
[Zustand Transient State Store]
        │
        ├──> [Offscreen Canvas / WebGL Map Layer] (Render điểm xe & vệt di chuyển)
        └──> [Direct DOM Node Ref Updates] (Nhảy số km/h, % pin không qua React render)
```

### Bước 1: Đẩy toàn bộ giải mã và tính toán sang Web Worker

Trình duyệt hiện đại hỗ trợ cơ chế đa luồng thông qua Web Worker. Chúng tôi chuyển toàn bộ kết nối WebSocket và logic tiền xử lý dữ liệu sang Worker:

* **Giải mã nhị phân:** Gói tin từ xe được mã hóa dạng Protobuf nhỏ gọn, giải mã hoàn toàn trong worker thread mà không ảnh hưởng tới luồng UI.
* **Nội suy chuyển động (Dead Reckoning & Interpolation):** Xe gửi tọa độ GPS ngắt quãng (mỗi 1-2 giây). Worker tính toán trước các bước nội suy vi mô mượt mà giữa điểm A và điểm B.
* **Điều tiết nhịp phát (Tick Batching):** Dữ liệu không được bắn tự do lên UI mà gom lại (batching) và chỉ gửi lên Main Thread đúng theo nhịp quét màn hình (16.6ms một lần).

### Bước 2: Thay thế DOM bằng Canvas & WebGL cho dữ liệu mật độ cao

Thay vì render hàng nghìn component React đại diện cho marker xe trên bản đồ:

* Sử dụng **HTML5 Canvas / WebGL** để vẽ trực tiếp toàn bộ các điểm phương tiện và vệt sạc pin. GPU đảm nhận việc tính toán tọa độ và hiệu ứng chuyển động với chi phí bộ nhớ gần như bằng không so với việc duy trì hàng chục nghìn thẻ `<div>` trong DOM tree.
* Áp dụng **OffscreenCanvas** để việc vẽ đồ thị tải điện áp pin diễn ra ngay trong Web Worker, giúp Main Thread hoàn toàn rảnh tay phục vụ tương tác người dùng.

### Bước 3: Cập nhật trực tiếp không qua React Re-render (Transient Updates)

Đối với các bảng thông số nhảy liên tục như tốc độ xe (km/h), dung lượng pin khả dụng (SoC %) hay điện áp trạm sạc:

Nếu đặt các giá trị này vào React State, mỗi thay đổi nhỏ sẽ kích hoạt re-render toàn bộ cụm component con. Chúng tôi áp dụng kỹ thuật **Transient Update** với Zustand:

```typescript
// Lấy trực tiếp tham chiếu phần tử DOM thực tế
const speedTextRef = useRef<HTMLSpanElement>(null)

useEffect(() => {
  // Lắng nghe trực tiếp từ store mà KHÔNG gây re-render component
  const unsubscribe = useTelemetryStore.subscribe(
    state => state.activeVehicle.speed,
    (newSpeed) => {
      if (speedTextRef.current) {
        speedTextRef.current.textContent = `${newSpeed} km/h`
      }
    }
  )
  return unsubscribe
}, [])
```

Bằng cách này, giá trị số thay đổi trực tiếp trên DOM node với chi phí CPU gần như bằng 0, không phát sinh bất kỳ chu kỳ so sánh Virtual DOM nào.

---

## 3. Kết quả đo lường thực tế

Sau khi triển khai bộ tối ưu hóa này:

* **Tốc độ khung hình (Frame Rate):** Ổn định ở mức 58 - 60 FPS liên tục ngay cả khi mở giám sát đồng thời hơn 20.000 xe trên cùng một góc nhìn.
* **Thời gian đáp ứng tương tác (Interaction to Next Paint - INP):** Giảm từ 380ms xuống dưới **120ms**, đạt chuẩn xanh tuyệt đối theo Core Web Vitals của Google.
* **Mức tiêu thụ bộ nhớ RAM:** Giảm hơn 55% nhờ cơ chế tái sử dụng bộ đệm (ArrayBuffer Transfer) thay vì cấp phát object liên tục.

Hạ tầng giao diện mượt mà chính là nền tảng vững chắc giúp các chuyên gia vận hành đưa ra quyết định điều phối trạm sạc và xử lý sự cố kỹ thuật kịp thời cho hàng trăm nghìn phương tiện đang lăn bánh trên đường.
