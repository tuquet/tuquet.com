---
title: 'Biến Telegram thành trung tâm điều khiển VPS và GitHub Actions: Đi cà phê vẫn quản lý được dự án'
date: 2026-10-03T12:30:00Z
lang: vi
duration: 6min
type: blog
description: 'Cách mình tự làm một trợ lý bot Telegram bằng Node.js để theo dõi sức khỏe server VPS, nhận báo lỗi CI/CD GitHub tức thì trên điện thoại và tự động thông báo bài viết mới.'
---

Có bao giờ bạn rơi vào tình huống này chưa: Cuối tuần vừa bấm `git push` một nhánh tính năng mới lên GitHub, sau đó rời máy tính đi ăn trưa hay ngồi cà phê với bạn bè. Trong đầu bạn vẫn lấn cấn:

> *"Không biết code vừa push lên GitHub Actions chạy có bị lỗi (fail) không nhỉ?"*  
> *"Con VPS ở nhà đang kéo cron job không biết có bị tràn RAM hay đứng máy không?"*

Mỗi lần như vậy, việc phải móc laptop ra, mở màn hình, phát Wi-Fi điện thoại rồi gõ lệnh SSH vào server hay mở trình duyệt F5 GitHub quả thực rất phiền toái.

Đó là lý do mình tự viết một chú bot Telegram nhỏ gọn mang tên **Telegram Bot** ([tuquet/bot](https://github.com/tuquet/bot), bot handle `@FlowupAI_bot`) để phục vụ nhu cầu cá nhân. Trong bài viết này, mình sẽ chia sẻ lại cách làm cực kỳ đơn giản để bạn có thể tự dựng một "phòng điều khiển mini" nằm gọn trong chiếc điện thoại của mình.

---

## 1. Con bot này làm được những gì?

Nói một cách dân dã, con bot này đóng vai trò như một **người trực ban 24/7** ngồi trên máy chủ VPS:

* **Báo cáo tài nguyên máy chủ:** Bấm nút `/server`, bot trả lời ngay lập tức mức sử dụng CPU, dung lượng RAM còn lại và ổ cứng đã dùng hết bao nhiêu phần trăm.
* **Theo dõi nhiều dự án GitHub cùng lúc:** Bấm `/ci all`, bot tự quét toàn bộ các repository của bạn và hiển thị danh sách xem nhánh nào Xanh (Build thành công), nhánh nào Đỏ (Build lỗi).
* **Đọc log lỗi khi build fail:** Nếu GitHub Actions bị fail, bot tự động trích xuất vài chục dòng log lỗi quan trọng nhất và gửi thẳng vào tin nhắn. Bạn chỉ cần liếc màn hình điện thoại là biết do sai cú pháp hay thiếu biến môi trường.
* **Bấm nút Deploy từ xa:** Khi muốn phát hành website, chỉ cần ấn nút **Deploy** trên Telegram, bot sẽ tự gọi GitHub trigger quy trình phát hành mà không cần mở máy tính.
* **Tự động báo khi có bài viết hoặc bản release mới:** Khi blog của bạn đăng bài mới hoặc có package mới được release, bot tự "ting ting" gửi link tóm tắt vào nhóm chat.

```text
📱 Màn hình điện thoại của bạn
┌───────────────────────────────────────────────┐
│ @FlowupAI_bot                                 │
│                                               │
│ 💻 Báo cáo hệ thống VPS:                      │
│ • CPU: 12% | 4 Cores                          │
│ • RAM: 1.8GB / 7.6GB (23.7%)                 │
│ • Disk: 14.2GB / 80GB (18%)                   │
│ • Uptime: 14 ngày 6 giờ                       │
│                                               │
│ [ 📊 Xem CI ] [ 🚀 Deploy ] [ 📦 Releases ]   │
└───────────────────────────────────────────────┘
```

---

## 2. Vì sao dùng Telegram mà không phải Discord hay Slack?

* **Ứng dụng có sẵn trên điện thoại:** Telegram mở nhanh, thông báo mượt mà, hỗ trợ cả giao diện nút bấm (Inline Keyboard) rất tiện tay khi dùng một tay.
* **Cực kỳ nhẹ:** Thư viện Telegram Bot trên Node.js ngốn chưa tới **25MB RAM**, chạy tốn rất ít tài nguyên trên các gói VPS giá rẻ (thậm chí gói 1GB RAM vẫn dư dả).
* **Không cần mở cổng mạng (Port):** Bot sử dụng cơ chế *Long Polling* — nghĩa là bot tự chủ động "hỏi" máy chủ Telegram xem có tin nhắn mới không. Do đó, bạn **không cần mua tên miền, không cần cấu hình HTTPS webhook, và không cần mở bất kỳ port nào trên firewall của VPS**. Rất an toàn!

---

## 3. Hướng dẫn tự làm bot trong 4 bước đơn giản

Bạn hoàn toàn có thể tự dựng một con bot tương tự chỉ với Node.js.

### Bước 1: Tạo bot trên Telegram

1. Mở Telegram, tìm kiếm con bot chính chủ của Telegram là `@BotFather`.
2. Gõ `/newbot`, đặt tên cho bot (ví dụ: `MyDevOpsBot`).
3. BotFather sẽ cấp cho bạn một chuỗi **Token** dạng: `7123456789:AAFxxx_your_token_here`. Hãy lưu token này lại thật cẩn thận.

### Bước 2: Khởi tạo dự án Node.js với thư viện GrammY

GrammY là thư viện Node.js hiện đại, viết bằng TypeScript, xử lý tin nhắn rất nhanh và dễ hiểu:

```bash
mkdir my-bot && cd my-bot
npm init -y
npm install grammy
```

Tạo file `bot.js`:

```javascript
import { Bot, InlineKeyboard } from 'grammy';
import os from 'os';

// Điền token bạn nhận được từ BotFather
const bot = new Bot(process.env.TELEGRAM_TOKEN);

// Khóa bảo mật: Chỉ cho phép User ID của bạn điều khiển bot
const ADMIN_ID = 123456789; // Thay bằng User ID Telegram của bạn (lấy từ @userinfobot)

// Lệnh /start: Hiện nút bấm nhanh
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('💻 Kiểm tra VPS', 'check_server')
    .text('🚀 Deploy Website', 'do_deploy');

  await ctx.reply('Chào bạn! Mình là trợ lý DevOps của bạn.', {
    reply_markup: keyboard,
  });
});

// Xử lý khi bấm nút "Kiểm tra VPS"
bot.callbackQuery('check_server', async (ctx) => {
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
  
  await ctx.reply(
    `💻 <b>Tình trạng VPS:</b>\n` +
    `• RAM còn trống: ${freeMem} GB / ${totalMem} GB\n` +
    `• Uptime: ${(os.uptime() / 3600).toFixed(1)} giờ`,
    { parse_mode: 'HTML' }
  );
  await ctx.answerCallbackQuery();
});

// Bật bot chạy liên tục
bot.start();
console.log('Bot đang chạy...');
```

Chạy thử bằng lệnh:
```bash
TELEGRAM_TOKEN="token_cua_ban" node bot.js
```
Bây giờ, hãy mở Telegram trên điện thoại, bấm `/start` với con bot của bạn và ấn nút **Kiểm tra VPS**, bạn sẽ thấy kết quả phản hồi chỉ sau 1 giây!

---

## 4. Hai bài học kinh nghiệm về bảo mật khi làm ChatOps

Khi giao quyền điều khiển máy chủ cho một con bot nhắn tin, có hai điều bạn bắt buộc phải lưu ý:

### 1. Phải có lớp lọc người dùng (Whitelist)
Đừng bao giờ để bot mở cho tất cả mọi người bấm. Nếu bạn thêm bot vào một nhóm chat có bạn bè hoặc đồng nghiệp, hãy viết một đoạn middleware kiểm tra `ctx.from.id`:
* Nếu ID không phải là bạn ➔ Từ chối thực thi các lệnh nguy hiểm như reboot, deploy hay xóa file.
* Các thành viên khác chỉ được xem các thông tin công khai (như trạng thái website hay danh sách bài viết).

### 2. Ưu tiên Outbound Polling thay vì Webhook
Nhiều người nghĩ làm Webhook nhận tin nhắn sẽ nhanh hơn, nhưng Webhook bắt buộc bạn phải trỏ domain về VPS và mở port 443/8443 ra ngoài Internet. Điều này dễ khiến IP máy chủ bị lộ và bị dò quét lỗ hổng.  
Dùng Long Polling vừa an toàn, vừa không sợ tường lửa hay mạng nội bộ chặn kết nối.

---

## 5. Lời kết

Tự làm một con bot Telegram không hề phức tạp như nhiều người nghĩ. Chỉ với vài chục dòng mã Node.js, bạn đã giải phóng bản thân khỏi việc phải ngồi ôm laptop canh chừng máy chủ hay F5 trang GitHub.

Nếu bạn đang quản lý một vài trang web cá nhân, một con VPS hay vài repo mã nguồn mở, hãy thử làm một chú bot cho riêng mình. Cảm giác vừa ngồi nhâm nhi ly trà đá vừa bấm điện thoại deploy sản phẩm thực sự rất thú vị!
 
Toàn bộ mã nguồn hoàn chỉnh của dự án đã được công khai tại repository [tuquet/bot](https://github.com/tuquet/bot). Bạn có thể ghé thăm để tham khảo cấu trúc daemon, systemd unit và các bộ lệnh ChatOps nhé!
