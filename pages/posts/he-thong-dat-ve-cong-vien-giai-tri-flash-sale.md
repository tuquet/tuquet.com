---
title: 'Kiến trúc hệ thống bán vé công viên giải trí chịu tải cao: Xử lý Flash Sale và tối ưu Mobile WebView'
date: 2026-07-22T10:00:00Z
lang: vi
duration: 9min
type: blog
description: 'Kinh nghiệm thiết kế hạ tầng bán vé, giữ chỗ trò chơi thời gian thực cho công viên giải trí quy mô lớn: Chống bán trùng vé với Redis Lua Script, giải pháp Virtual Waiting Room và tối ưu WebView di động.'
---

Trong lĩnh vực quản lý và vận hành công viên chủ đề giải trí (Theme Park & Hospitality), hệ thống bán vé trực tuyến và cổng thông tin đặt chỗ trò chơi (Fast Pass / Virtual Queue) là mắt xích kinh doanh cốt lõi. Khác với các trang thương mại điện tử thông thường, các đợt mở bán vé lễ hội, sự kiện Countdown đón năm mới hay các chương trình ưu đãi mùa hè thường thu hút hàng chục nghìn lượt du khách đổ xô truy cập cùng một giây.

Đặc biệt, phần lớn lưu lượng giao dịch diễn ra thông qua **Mobile WebView** được nhúng trực tiếp trong ứng dụng di động của công viên hoặc các đối tác ngân hàng/ví điện tử. Điều này đặt ra những thách thức khắt khe về tính nhất quán của dữ liệu đặt chỗ và độ phản hồi tức thì của giao diện.

> [!NOTE]
> Bài viết tổng hợp các mẫu hình kiến trúc và kinh nghiệm thực chiến khi tôi đảm nhiệm vai trò Lead Frontend Engineer trong việc tối ưu hóa cổng thông tin vé và WebView cho tổ hợp giải trí hàng đầu khu vực. Các dữ liệu thương mại riêng tư đã được ẩn danh theo điều khoản NDA.

---

## 1. Những bài toán kỹ thuật hóc búa

Một hệ thống bán vé công viên giải trí tải cao phải giải quyết đồng thời 3 rào cản lớn:

1. **Hiểm họa bán trùng vé (Overselling Race Condition):** Mỗi ngày công viên chỉ có sức chứa giới hạn (Capacity Limit) để bảo đảm an toàn. Khi 10.000 người cùng bấm nút "Giữ vé" cho một khung giờ nhất định, nếu xử lý bằng câu lệnh SQL thông thường `SELECT ... FOR UPDATE`, cơ sở dữ liệu quan hệ sẽ ngay lập tức nghẽn tắc hàng đợi kết nối (connection starvation).
2. **Cơ chế giữ chỗ tạm thời (Temporary Ticket Reservation Hold):** Khi khách chọn xong loại vé, hệ thống cần "tạm khóa" số vé đó trong 10-15 phút để khách điền thông tin và thanh toán. Nếu khách hủy hoặc quá hạn, vé phải tự động hoàn lại kho ngay lập tức cho người khác mua.
3. **Môi trường Mobile WebView hạn chế:** Khách hàng đặt vé thường đứng ngay tại khuôn viên công viên, nơi sóng 3G/4G chập chờn vì lượng người đông đúc. Trang webview cần tải siêu tốc (FCP < 1.2s, LCP < 1.8s) và mã vé QR phải xuất trình được ngay cả khi mất kết nối mạng.

---

## 2. Kiến trúc giải pháp: Từ Đệm chờ đến Giao dịch nguyên tử

Sơ đồ tổng thể dòng chảy giao dịch đặt vé chịu tải cao:

```
[Mobile App / Partner WebView]
              │
              ▼
    [Virtual Waiting Room]  (Bảo vệ hệ thống khi traffic vượt ngưỡng an toàn)
              │
              ▼ (Cấp Token hợp lệ)
    [API Gateway & Rate Limiter]
              │
              ▼ (Kiểm tra & Giữ vé nguyên tử trong 10 phút)
    [Redis Cluster + Lua Script] ──(Hết hạn TTL / Hủy)──> [Tự động hồi vé]
              │
              ▼ (Giao dịch giữ chỗ thành công)
     [Payment Gateway]
              │
              ▼ (Webhook thanh toán thành công)
     [PostgreSQL Master DB] ──> [Sinh vé điện tử QR mã hóa HMAC-SHA256]
```

---

## 3. Chống bán trùng vé bằng Redis Lua Script

Để kiểm tra số lượng vé còn lại và trừ vé trong một thao tác nguyên tử (atomic operation) duy nhất mà không phụ thuộc vào lock của cơ sở dữ liệu quan hệ, chúng tôi chuyển toàn bộ logic giữ vé vào **Redis Lua Script**:

```lua
-- KEYS[1]: Redis key quản lý số lượng vé (ví dụ: ticket:pool:2026-12-31:adult)
-- ARGV[1]: Số lượng vé khách yêu cầu đặt (ví dụ: 2)
-- ARGV[2]: Mã ID phiên đặt chỗ tạm thời (Session ID)
-- ARGV[3]: Thời gian khóa vé tạm thời tính bằng giây (ví dụ: 600 giây = 10 phút)

local available = tonumber(redis.call('get', KEYS[1]) or '0')
local requested = tonumber(ARGV[1])

if available >= requested then
    -- Trừ số lượng vé khả dụng
    redis.call('decrby', KEYS[1], requested)
    -- Ghi nhận danh sách vé tạm giữ cho phiên giao dịch với thời gian tự hủy (TTL)
    redis.call('setex', 'hold:' .. ARGV[2], ARGV[3], requested)
    return 1 -- Thành công
else
    return 0 -- Hết vé
end
```

Nhờ cơ chế đơn luồng của Redis và tính nguyên tử của Lua script:
* Thời gian xử lý mỗi lượt giữ vé chỉ mất **dưới 2ms**.
* Triệt tiêu 100% rủi ro hai giao dịch mua cùng đọc một số lượng vé tồn kho cũ.
* Nếu du khách đóng ứng dụng hoặc không thanh toán trong 10 phút, cơ chế **Key Expiration (TTL)** của Redis sẽ kích hoạt một sự kiện thông báo để tự động cộng hoàn trả số lượng vé về kho ban đầu.

---

## 4. Tối ưu trải nghiệm Mobile WebView

Để giao diện đặt vé nhúng trong ứng dụng chạy mượt mà như một màn hình native app:

### Loại bỏ triệt để Bundle rác & Code Splitting theo từng chặng
Thay vì đóng gói toàn bộ thư viện UI vào một file JS khổng lồ, chúng tôi sử dụng **Vite + Tailwind CSS** với chiến lược tách nhỏ mã nguồn:
* Màn hình chọn ngày và số lượng khách được đóng gói độc lập.
* Module thanh toán chỉ được tải động (dynamic import) khi du khách bấm sang bước nhập phương thức trả tiền.
* Dung lượng ban đầu nén Gzip chỉ còn **dưới 80KB**, giúp WebView khởi động tức thì trong vòng 800ms.

### Đồng bộ hợp đồng dữ liệu giữa Spring Boot và React
Trong dự án này, backend sử dụng **Java Spring Boot** còn frontend xây dựng trên nền tảng **React / React Native**. Để hai đội ngũ làm việc song song mà không bị phụ thuộc vào tiến độ triển khai API:
* Xây dựng tầng Mock Data Synchronization chuẩn hóa theo OpenAPI/Swagger.
* Toàn bộ trạng thái giỏ vé, mã giảm giá và thông tin khách hàng được kiểm thử hợp đồng tự động (Contract Testing), giảm 90% số lượng bug tích hợp ở các ngày mở bán lớn.

### Mã vé QR ký số Offline (HMAC-SHA256)
Khi khách đã thanh toán thành công, vé điện tử kèm mã QR được lưu trữ cục bộ vào **IndexedDB** của thiết bị. Mã QR chứa payload thông tin vé được ký bằng khóa bí mật (Secret Key) theo thuật toán **HMAC-SHA256**.

Khi du khách đứng trước cửa soát vé thông minh (Turnstile Gate) tại công viên:
* Kể cả khi khuôn viên mất mạng Internet hoàn toàn, đầu đọc quang học tại cửa xoay vẫn có thể giải mã và xác minh tính hợp lệ của chữ ký trong vòng **50ms**.
* Du khách không bao giờ gặp cảnh đứng chờ cổng soát vé quay tròn vì mất sóng di động.

---

## 5. Kết luận

Xây dựng hệ thống bán vé cho công viên giải trí quy mô lớn đòi hỏi sự kết hợp hài hòa giữa:
1. Độ tin cậy ở tầng dữ liệu (chống bán trùng bằng Redis Lua Script và phân luồng đệm).
2. Tốc độ vượt trội ở tầng giao diện di động (tối ưu WebView, nén dung lượng, thiết kế hợp đồng API chuẩn mực).

Kiến trúc này đã bảo vệ trọn vẹn hạ tầng dịch vụ trong những ngày mở bán lễ hội cao điểm, đem lại trải nghiệm mượt mà, văn minh cho hàng vạn du khách từ lúc đặt vé trên điện thoại cho đến khi quét mã bước chân vào cổng công viên.
