# Hướng dẫn khởi chạy Hệ thống Giải Đấu "PickaballPCB"

Hệ thống quản lý giải đấu của bạn bao gồm một giao diện web trực quan và một máy chủ cục bộ nhỏ (NodeJS) phụ trách việc tự động ghi nhận và đồng bộ kết quả thi đấu ra file máy tính.

## Yêu cầu cài đặt
Máy của bạn cần được cài đặt sẵn phần mềm **Node.js** để chạy được máy chủ tự động lưu.
*(Nếu chưa có, hãy cài đặt bản LTS mới nhất từ trang chủ [nodejs.org](https://nodejs.org/)).*

---

## Cách khởi chạy Hệ thống (Mỗi lần sử dụng)

### Bước 1: Bật Máy Chủ Auto-Save (Bắt buộc)
Máy chủ này giúp lưu tự động trạng thái giải đấu. Nếu tắt nó, tính năng khôi phục và xuất file TXT sẽ không hoạt động.

1. Mở **Command Prompt** (Gõ `cmd` vào Start Menu).
2. Di chuyển vào thư mục chức giải đấu:
   ```cmd
   cd D:\work\GoogleAntigravity\PickaballPCB
   ```
3. Cài đặt thư viện phụ thuộc bằng lệnh (Chỉ làm 1 lần thao tác này trong lần đầu tiên):
   ```cmd
   npm install
   ```
4. Khởi chạy máy chủ:
   ```cmd
   node server.js
   ```
   > **Lưu ý:** Khi thấy dòng chữ `Backend is running on http://localhost:3001`, bạn hãy hạ nhỏ cửa sổ đen này xuống (không được nhấn dấu X tắt nó đi trong lúc chơi).

### Bước 2: Xem Giao Diện Web
1. Mở thêm một **Command Prompt** mới.
2. Di chuyển vào thư mục:
   ```cmd
   cd D:\work\GoogleAntigravity\PickaballPCB
   ```
3. Bật máy chủ giao diện lên bằng lệnh:
   ```cmd
   npx serve .
   ```
4. Mở trình duyệt Web (Chrome, Edge, Cốc Cốc) và truy cập vào đường link sau:
   **[http://localhost:3000/badminton-tournament.html](http://localhost:3000/badminton-tournament.html)**

*(Hoặc cách 2 đơn giản hơn: bạn có thể ấn đúp chuột thẳng vào file `badminton-tournament.html` để mở).*

---

## Theo dõi File Tự Cập Nhật
Sau khi hệ thống được chạy:
- Bất cứ khi nào bạn nhập đội viên, bốc thăm nhánh đấu hay thay đổi tỉ số ván đấu.
- File **`KetQua_GiaiCauLong.txt`** nằm trong cùng thư mục `PickaballPCB` sẽ tự động thay đổi chữ bên trong nó.
- Bạn có thể lấy file txt này để in, hoặc gửi cho bạn bè nội dung giải đấu mà không cần thao tác tải thủ công nữa.

Chúc bạn có một giải đấu thành công!
