## Báo Cáo Cập Nhật Cube Jump Offline -> V2

### Tóm tắt thay đổi:
So với bản V1 (`Cubejump.htm`), phiên bản mới (V2) đã được nâng cấp giao diện chuẩn 100% giống bản live nhưng vẫn giữ được khả năng chạy offline:

1. **Giao diện (UI/UX) HTML & CSS:**
   - **Thêm nút Cài đặt (Settings):** Cung cấp các tuỳ chọn ngôn ngữ, bật tắt âm thanh, hướng dẫn chơi và liên kết chính thức đến "Privacy Policy".
   - **Thay đổi hình nền (Background):** Thêm tính năng chọn và đổi hình nền (Choose Background) dưới dạng grid 5 mẫu, 2 mẫu miễn phí và 3 mẫu khoá với giả lập unlock bằng cách click xác nhận xem quảng cáo giả. Thay đổi hình nền thật cho màn hình qua CSS variable `--bg` và `backgroundColor`.
   - **Tích hợp "No Ads":** Hiển thị nút mua "1,99 USD". Click vào sẽ hiển thị mock alert thông báo "Đây là demo, bản thật sẽ tiến hành giao dịch". Sau đó nút đổi thành "Purchased" và bị mờ, trạng thái được lưu qua `localStorage`.
   - **Chọn nhân vật (Pet Picker):** Các nút `< >` và vùng xem nhân vật trên start screen nay đã tương tác được với danh sách SKINS hiện có của V1. Skin chọn mới được ghi nhớ qua `localStorage`.

2. **Cấu trúc & Code (Javascript Logic):**
   - **Bảo toàn hàm vẽ `drawCharacter`:** Hàm render Canvas 2D hoàn toàn không bị thay đổi và không hề dùng bất kỳ tài nguyên WebGL hay thư viện external nào như `blockpet-models.js`. Đảm bảo code chạy độc lập (standalone) và tải nhanh.
   - **Quản lý trạng thái (State mock):** Sử dụng các key trong `localStorage` (`cubeJumpNoAds`, `cubeJumpSoundEnabled`, `cubeJumpBg`, `cubeJumpUnlockedBgs`, `cubeJumpSelectedPet`) để mô phỏng hoàn toàn chức năng mà không phụ thuộc backend.
   - Các logic UI tương tác (đổi label Sound, toggle class `hidden` của các panel) được bọc cẩn thận ngay trong IIFE chính của file và sử dụng `window.SKINS` để map đúng model khi pet được thay đổi.

### Mockup ASCII của giao diện chính:
```text
+---------------------------------------------------+
|  [AD No Ads 1,99 USD]                             |
|                                                   |
|                        [Cube Jump]                |
|                        Kỷ lục: 15                 |
|                                                   |
|  [ < ]                [ Tên Pet ]               [ > ] |
|                                                   |
|                [ Tạo phòng ]   [ Background ]     |
|                [ Chơi ngay ]                      |
|                                                   |
|  [Settings]                           [Language]  |
+---------------------------------------------------+
```
