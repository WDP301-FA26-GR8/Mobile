# KẾ HOẠCH PHÁT TRIỂN & MỞ RỘNG PHÂN HỆ MOBILE ANDROID DỰ ÁN SAAS-SENTRY

---

## MỤC LỤC

1. [TỔNG QUAN NGHIỆP VỤ & MỤC TIÊU MỞ RỘNG MOBILE](#1-tổng-quan-nghiệp-vụ--mục-tiêu-mở-rộng-mobile)
2. [HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM) & BẢNG MÃ MÀU THEME SÁNG / TỐI](#2-hệ-thống-thiết-kế-design-system--bảng-mã-màu-theme-sáng--tối)
3. [ĐẶC TẢ CHI TIẾT UI/UX & LUỒNG MÀN HÌNH THEO 3 VAI TRÒ](#3-đặc-tả-chi-tiết-uiux--luồng-màn-hình-theo-3-vai-trò)
   - 3.1. Phân hệ Nhân viên (Employee Experience)
   - 3.2. Phân hệ Trưởng phòng (Manager / Department Head Experience)
   - 3.3. Phân hệ Người duyệt chi (Spending Approver Experience)
4. [KIẾN TRÚC KỸ THUẬT & HƯỚNG HIỆN THỰC TRÊN NỀN TẢNG ANDROID](#4-kiến-trúc-kỹ-thuật--hướng-hiện-thực-trên-nền-tảng-android)
5. [CƠ CHẾ BẢO MẬT VÙNG LƯU TRỮ VÀ HIỂN THỊ TÀI KHOẢN / KEY BẢN QUYỀN](#5-cơ-chế-bảo-mật-vùng-lưu-trữ-và-hiển-thị-tài-khoản--key-bản-quyền)
6. [HỆ THỐNG THÔNG BÁO PUSH & IN-APP NOTIFICATIONS TRÊN ANDROID](#6-hệ-thống-thông-báo-push--in-app-notifications-trên-android)
7. [LỘ TRÌNH TRIỂN KHAI, PHÂN KỲ & QUẢN TRỊ RỦI RO](#7-lộ-trình-triển-khai-phân-kỳ--quản-trị-rủi-ro)

---

## 1. TỔNG QUAN NGHIỆP VỤ & MỤC TIÊU MỞ RỘNG MOBILE

### 1.1. Bối cảnh dự án SaaS-Sentry

SaaS-Sentry là hệ thống quản trị bản quyền phần mềm và tối ưu chi phí công nghệ dành cho doanh nghiệp vừa và lớn. Hệ thống giải quyết các bài toán trọng yếu:

- **PP-1 (Ghost Seat):** License phần mềm được cấp nhưng không sử dụng, gây lãng phí tài nguyên.
- **PP-2 (Auto-renewal):** Hợp đồng phần mềm tự động gia hạn mà không qua thẩm định lại nhu cầu.
- **PP-3 (Bất đối xứng thông tin):** Thiếu ngôn ngữ chung giữa IT và Tài chính trong việc theo dõi chi phí thực chịu.
- **PP-4 (Shadow IT):** Phần mềm tự phát được mua bằng thẻ cá nhân ngoài quy trình quản lý của doanh nghiệp.
- **PP-5 (Quy trình chậm chạp):** Luồng đăng ký, phê duyệt thủ công mất nhiều thời gian, làm chậm tiến độ làm việc của nhân viên.

### 1.2. Mục tiêu chiến lược của ứng dụng Mobile Android

Phân hệ Mobile Android được định vị là **kênh tương tác nhanh (Fast-action Channel)** phục vụ việc cấp phát và phê duyệt tức thì:

- Giúp nhân viên gửi yêu cầu mọi lúc mọi nơi và tra cứu tức thì thông tin đăng nhập/bản quyền phần mềm phục vụ công việc.
- Giúp cấp quản lý (Trưởng phòng) và cấp lãnh đạo (Người duyệt chi) xử lý hồ sơ phê duyệt ngay trên điện thoại thông minh chỉ với 1-2 chạm, giải quyết dứt điểm điểm nghẽn SLA.
- Bảo mật thông tin tài khoản và license key trên thiết bị cá nhân/thiết bị doanh nghiệp với các tiêu chuẩn phần cứng Android Keystore và xác thực sinh trắc học (Biometrics).

### 1.3. Phạm vi nghiệp vụ theo các Quyết định cốt lõi (QĐ-61 / BRD)

- **Nền tảng mục tiêu:** Chuyên biệt hóa cho **Android** (hỗ trợ từ Android 10 / API Level 29 trở lên, tối ưu cho chuẩn giao diện Material Design 3).
- **Phạm vi tác vụ cốt lõi:**
  1. **Employee:** Gửi yêu cầu cấp phát phần mềm từ danh mục (Catalog), theo dõi tiến trình phê duyệt nhiều cấp (Timeline Tracking), nhận thông báo trạng thái, truy cập khu vực lưu trữ thông tin tài khoản/license key đã cấp.
  2. **Manager (Trưởng phòng):** Tiếp nhận danh sách yêu cầu từ nhân viên trong phòng, thẩm định lý do/cờ cảnh báo, phê duyệt hoặc từ chối kèm lý do bắt buộc.
  3. **Role Approval (Spending Approver - Người duyệt chi):** Tiếp nhận các yêu cầu phát sinh chi phí hoặc yêu cầu của chính Trưởng phòng, kiểm tra snapshot ngân sách phòng ban và duyệt chi chuyển sang đội ngũ IT thực hiện cấp phát.
- **Ràng buộc phân quyền & Tính toàn vẹn (SoD - Separation of Duties):**
  - **SoD-4 / INV-08:** Không ai được tự phê duyệt yêu cầu của chính mình. Khi Trưởng phòng tự gửi yêu cầu phần mềm cho bản thân, hệ thống trên mobile tự động khóa nút duyệt của Trưởng phòng và chuyển tiếp bước nhu cầu lên Người duyệt chi (Spending Approver).
  - **QĐ-29b:** Finance không nằm trên luồng duyệt chặn. Người duyệt chi ra quyết định dựa trên snapshot ngân sách tham khảo.
  - **FR-2.9 / FR-2.10:** Chỉ cấp phát trên tài khoản email công ty; thông tin bản quyền (K4) phải được mã hóa và che mờ, ghi nhận Audit Trail khi mở xem.

---

## 2. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM) & BẢNG MÃ MÀU THEME SÁNG / TỐI

Ứng dụng mobile kế thừa và đồng bộ 100% hệ thống Design Tokens từ mã nguồn web hiện tại (`app.css`), đảm bảo trải nghiệm nhận diện thương hiệu nhất quán giữa phiên bản Web Dashboard và Ứng dụng Android.

### 2.1. Bảng mã màu Theme Sáng (Light Theme)

Giao diện sáng mang phong thái trang nhã, ấm áp (Warm Cream), tạo cảm giác dễ chịu khi thao tác văn phòng ban ngày.

| Tên Token CSS                | Mã Màu Hex | Ánh xạ Material 3 Android         | Mô tả & Mục đích sử dụng                                 |
| :--------------------------- | :--------- | :-------------------------------- | :------------------------------------------------------- |
| `--theme-background`         | `#fef7ef`  | `colorScheme.background`          | Màu nền chính toàn màn hình (warm sand)                  |
| `--theme-sidebar`            | `#fdfaf5`  | `colorScheme.surfaceVariant`      | Màu nền thanh Bottom Navigation / Drawer                 |
| `--theme-surface`            | `#fefbf6`  | `colorScheme.surface`             | Màu nền các Card, Panel thông tin, Bottom Sheet          |
| `--theme-surface-subtle`     | `#fdf3e7`  | `colorScheme.surfaceContainer`    | Nền các ô nhập liệu, pill badge, vùng đệm phụ            |
| `--theme-border`             | `#efe3d7`  | `colorScheme.outlineVariant`      | Đường viền ngăn cách giữa các card, divider              |
| `--theme-foreground`         | `#241c18`  | `colorScheme.onBackground`        | Màu chữ chính, tiêu đề cấp 1 & cấp 2                     |
| `--theme-muted-foreground`   | `#7c7068`  | `colorScheme.onSurfaceVariant`    | Màu chữ phụ, mô tả ngắn, placeholder                     |
| `--theme-primary`            | `#ff7020`  | `colorScheme.primary`             | Màu nhận diện chính (Cam rực rỡ) cho nút CTA, Tab active |
| `--theme-primary-hover`      | `#f06018`  | `colorScheme.primaryContainer`    | Trạng thái nhấn giữ (Pressed / Ripple effect)            |
| `--theme-primary-foreground` | `#ffffff`  | `colorScheme.onPrimary`           | Màu chữ/icon trên nền Primary                            |
| `--theme-primary-soft`       | `#ffe0c0`  | `colorScheme.tertiaryContainer`   | Nền badge nhẹ cho thẻ trạng thái nổi bật                 |
| `--theme-primary-ink`        | `#a33700`  | `colorScheme.onTertiaryContainer` | Màu chữ trên nền primary-soft                            |
| `--theme-success`            | `#40b880`  | `colorScheme.tertiary`            | Trạng thái Hoàn tất, Đã cấp, Đã duyệt                    |
| `--theme-success-ink`        | `#146b4a`  | `colorScheme.onTertiary`          | Chữ tương phản cao trên badge thành công                 |
| `--theme-warning`            | `#ffc070`  | Custom Token `warning`            | Trạng thái Chờ duyệt, Sắp hết hạn, Cảnh báo SLA          |
| `--theme-warning-ink`        | `#7a4500`  | Custom Token `onWarning`          | Chữ tương phản cao trên badge cảnh báo                   |
| `--theme-danger`             | `#e84840`  | `colorScheme.error`               | Trạng thái Bị từ chối, Lỗi cấp phát, Nút Từ chối         |
| `--theme-danger-ink`         | `#b12a22`  | `colorScheme.onError`             | Chữ tương phản cao trên badge từ chối                    |
| `--theme-info`               | `#2888d8`  | Custom Token `info`               | Trạng thái Đang cấp phát, Thông tin điều hướng           |
| `--theme-info-ink`           | `#145b99`  | Custom Token `onInfo`             | Chữ trên nền thông tin phụ                               |

### 2.2. Bảng mã màu Theme Tối (Dark Theme)

Giao diện tối được xây dựng trên tông xanh thẫm công nghệ (Deep Tech Navy), giúp bảo vệ mắt khi làm việc buổi tối, tiết kiệm pin tối đa cho màn hình OLED/AMOLED trên điện thoại Android.

| Tên Token CSS                | Mã Màu Hex | Ánh xạ Material 3 Android         | Mô tả & Mục đích sử dụng                            |
| :--------------------------- | :--------- | :-------------------------------- | :-------------------------------------------------- |
| `--theme-background`         | `#05162a`  | `colorScheme.background`          | Màu nền sâu thẳm toàn ứng dụng (Navy Dark)          |
| `--theme-sidebar`            | `#011226`  | `colorScheme.surfaceVariant`      | Nền Bottom Navigation Bar, App Bar tối sâu          |
| `--theme-surface`            | `#0d1c33`  | `colorScheme.surface`             | Nền thẻ Card hiển thị nội dung, Dialog              |
| `--theme-surface-subtle`     | `#102440`  | `colorScheme.surfaceContainer`    | Nền ô Input, thanh tìm kiếm, vùng phụ               |
| `--theme-border`             | `#1b3553`  | `colorScheme.outlineVariant`      | Đường viền tinh tế, tách lớp độ sâu (Elevation)     |
| `--theme-foreground`         | `#f8fcff`  | `colorScheme.onBackground`        | Màu chữ sáng rõ ràng trên nền tối                   |
| `--theme-muted-foreground`   | `#a8b8cc`  | `colorScheme.onSurfaceVariant`    | Chữ phụ, ngày giờ, thông số kỹ thuật                |
| `--theme-primary`            | `#2888ff`  | `colorScheme.primary`             | Xanh dương phát sáng (Electric Blue) hiện đại       |
| `--theme-primary-hover`      | `#4098ff`  | `colorScheme.primaryContainer`    | Hiệu ứng Ripple khi chạm nút chính                  |
| `--theme-primary-foreground` | `#ffffff`  | `colorScheme.onPrimary`           | Màu chữ/icon trên nền xanh chính                    |
| `--theme-primary-soft`       | `#103870`  | `colorScheme.tertiaryContainer`   | Nền badge Primary trên Dark Mode                    |
| `--theme-primary-ink`        | `#6cb2ff`  | `colorScheme.onTertiaryContainer` | Chữ xanh phát sáng trên nền badge                   |
| `--theme-success`            | `#10b8c0`  | `colorScheme.tertiary`            | Xanh ngọc phát quang biểu thị Đã duyệt / Thành công |
| `--theme-success-ink`        | `#10b8c0`  | `colorScheme.onTertiary`          | Chữ tương phản trạng thái thành công                |
| `--theme-warning`            | `#f0a830`  | Custom Token `warning`            | Vàng cam cảnh báo quá hạn SLA / Chờ duyệt           |
| `--theme-warning-ink`        | `#f0a830`  | Custom Token `onWarning`          | Chữ nổi bật trên nền cảnh báo                       |
| `--theme-danger`             | `#f04850`  | `colorScheme.error`               | Đỏ san hô báo trạng thái Từ chối / Huỷ              |
| `--theme-danger-ink`         | `#f04850`  | `colorScheme.onError`             | Chữ nổi bật trên nền từ chối                        |
| `--theme-info`               | `#2888ff`  | Custom Token `info`               | Biểu tượng thông tin tiến trình                     |
| `--theme-info-ink`           | `#6cb2ff`  | Custom Token `onInfo`             | Chữ thông tin trạng thái kỹ thuật                   |

### 2.3. Bảng màu Đồ thị & Thẻ phân loại (Data Visualization Slots)

- **Slot 1 (Phần mềm Lập trình/Dev):** Light `#2a78d6` / Dark `#3987e5`
- **Slot 2 (Thiết kế UI/UX):** Light `#eb6834` / Dark `#d95926`
- **Slot 3 (Năng suất/Office):** Light `#1baf7a` / Dark `#199e70`
- **Slot 4 (Giao tiếp/Chat):** Light `#eda100` / Dark `#c98500`
- **Slot 5 (Tiện ích dự án):** Light `#e87ba4` / Dark `#d55181`
- **Slot 6 (Bảo mật/Hạ tầng):** Light `#008300` / Dark `#008300`

### 2.4. Nguyên tắc Công thái học Mobile (Android Ergonomics & Micro-interactions)

- **Vùng chạm thuận tay (One-Handed Thumb Zone):**
  - Toàn bộ các nút hành động chính (CTA: Gửi yêu cầu, Phê duyệt, Từ chối, Sao chép key) đặt ở nửa dưới màn hình (Bottom Action Bar hoặc Floating Container).
  - Sử dụng Bottom Sheet có khả năng vuốt kéo (Draggable Modal Bottom Sheet) cho các form nhập liệu, bộ lọc và hộp thoại xác nhận.
- **Hệ thống phản hồi xúc giác (Haptic Feedback):**
  - Nhẹ (`HapticFeedbackType.TextHandleMove` / `VIRTUAL_KEY`): Khi lướt danh sách, chuyển tab.
  - Trung bình (`CONFIRM`): Khi ấn "Sao chép License Key", "Duyệt yêu cầu thành công".
  - Nặng / Rung đúp (`REJECT`): Khi xác nhận "Từ chối yêu cầu" hoặc phát sinh lỗi mạng.
- **Micro-animations & Lottie:** Chuyển đổi trạng thái mượt mà 300ms với đường cong chuyển động `EmphasizedDecelerateInterpolator` chuẩn Material 3.

---

## 3. ĐẶC TẢ CHI TIẾT UI/UX & LUỒNG MÀN HÌNH THEO 3 VAI TRÒ

Cấu trúc điều hướng chính trên Android sử dụng **Bottom Navigation Bar** linh hoạt thay đổi theo vai trò đăng nhập của người dùng.

```
       +-------------------------------------------------------------+
       |                  SAAS-SENTRY ANDROID APP                    |
       +-------------------------------------------------------------+
       |                                                             |
       |  [EMPLOYEE ROLE]        [MANAGER ROLE]     [APPROVAL ROLE]  |
       |  - Phần mềm của tôi     - Hàng đợi duyệt   - Hàng đợi chi   |
       |  - Yêu cầu cấp mới      - Đội ngũ phòng    - Snapshot ngân  |
       |  - Theo dõi tiến trình  - Thẩm định đơn    - Duyệt ngân sách|
       |  - Kho lưu trữ Key                         - Phê duyệt cấp  |
       |                                                             |
       +-------------------------------------------------------------+
       |   [Home]     [Yêu cầu]     [Hàng đợi duyệt]     [Thông báo]  |
       +-------------------------------------------------------------+
```

---

### 3.1. Phân hệ Nhân viên (Employee Experience)

Nhân viên là đối tượng trực tiếp thụ hưởng phần mềm phục vụ công việc hàng ngày. Luồng di động tập trung vào 4 màn hình chính:

#### Màn hình EMP-MOB-01: "Phần mềm của tôi & Kho bản quyền bảo mật" (My Software & Credential Vault)

- **Mục tiêu:** Cho phép nhân viên xem danh sách các phần mềm đã được cấp, tình trạng hiệu lực và lấy thông tin truy cập (tài khoản mật khẩu hoặc license key).
- **Thành phần UI:**
  1. **Thanh tìm kiếm & Lọc nhanh:** Lọc theo danh mục (Development, Design, Productivity, Communication).
  2. **Thẻ tóm tắt tổng quan:** Số phần mềm đang kích hoạt, số phần mềm sắp hết hạn (còn dưới 30 ngày).
  3. **Danh sách thẻ phần mềm (Software Cards):**
     - Logo nhà cung cấp, Tên phần mềm, Gói đăng ký (Plan: Enterprise, Pro, Standard).
     - Badge trạng thái: `Đang hiệu lực` (Xanh ngọc/Lục) hoặc `Sắp hết hạn` (Vàng hổ phách).
     - Ngày được cấp, ngày hết hạn, mức độ sử dụng tương đối (`Usage Indicator`).
  4. **Khu vực hiển thị tài khoản được cấp (Dedicated Credential Area):**
     - **Đối với K1 / K2 (Gán qua tài khoản công ty / Workspace Seat):**
       - Hiển thị email công ty được cấp: `nguyen.van.a@company.com`.
       - Workspace/Team: `Company Tech Org`.
       - Nút hành động nhanh: "Mở ứng dụng / Đăng nhập SSO".
     - **Đối với K4 (Gói cấp Khóa bản quyền - License Key Pool):**
       - Hộp License Key chuyên biệt có khung viền bo cong, nền `surface-subtle`.
       - Cơ chế bảo mật che mờ: Mặc định hiển thị `FIG-PRO-••••-••••-8819`.
       - **Nút "Hiện / Ẩn Key" (Eye Toggle):** Yêu cầu xác thực vân tay / Face Unlock (Android BiometricPrompt) trước khi mở lộ toàn bộ key.
       - **Nút "Sao chép Key" (Quick Copy Button):** 1 chạm để chép mã key vào Clipboard, hiển thị Toast thông báo _"Đã sao chép khóa bản quyền vào bộ nhớ tạm"_ kèm rung Haptic xác nhận.
       - Ghi nhận Audit Trail tự động về Backend: Thời điểm mở xem/sao chép key, ID nhân viên, IP thiết bị (`FR-2.10`).
       - Thông tin thiết bị công ty gắn kèm: _"Chỉ sử dụng trên máy trạm công ty đã đăng ký: NB-DEV-042"_.
     - **Đối với Tài khoản dùng chung (Shared Account):**
       - Hiển thị thông tin định danh nhóm, hướng dẫn truy cập theo chính sách IT, cảnh báo không tự ý thay đổi mật khẩu chung.

#### Màn hình EMP-MOB-02: "Tạo yêu cầu cấp phát mới" (Request New Software Flow)

- **Mục tiêu:** Đơn giản hóa quy trình đăng ký cấp phần mềm trên thiết bị di động theo chuẩn biểu mẫu BM-01.
- **Thiết kế theo dạng Wizard / Stepper tối ưu cho màn hình cảm ứng:**
  - **Bước 1: Chọn phần mềm từ Danh mục (Software Catalog):**
    - Nhóm **Bộ công cụ chuẩn (Standard Toolset)** của phòng ban được ghim lên đầu tiên (ví dụ: Dev được gợi ý GitHub Enterprise, JetBrains, Jira).
    - Các phần mềm ngoài bộ chuẩn được gắn nhãn cảnh báo: _"Ngoài bộ công cụ chuẩn - Yêu cầu ghi rõ lý do nghiệp vụ"_.
    - Thẻ phần mềm hiển thị rõ tình trạng: Có sẵn seat trong kho (Instant Seat) hoặc Cần mua mới.
    - **Kiểm tra quyền trùng lặp tự động (INV-02 / FR-2.7):** Nếu nhân viên đã có license phần mềm này còn hiệu lực, màn hình lập tức hiển thị thông báo chặn và dẫn thẳng về màn hình EMP-MOB-01.
  - **Bước 2: Chi tiết yêu cầu:**
    - Loại tài khoản: Cá nhân (Personal) hoặc Dùng chung (Shared Account).
    - Thời hạn sử dụng: Lựa chọn 3 tháng, 6 tháng, 12 tháng, hoặc Tùy chọn (với cảnh báo nếu > 12 tháng).
    - Lý do nghiệp vụ: Ô nhập text có gợi ý nội dung (Template mẫu: Phục vụ dự án, thay thế công cụ cũ, thử nghiệm kỹ thuật).
    - Đính kèm dự án liên quan (Project tag).
  - **Bước 3: Xem lại chi phí & Tuyến phê duyệt dự kiến (Pre-submit Review):**
    - Chi phí ước tính phát sinh (0 VNĐ nếu có sẵn seat dư trong kho, hoặc mức phí dự kiến nếu phải mua bổ sung).
    - Sơ đồ tuyến duyệt dự kiến: `Bạn gửi -> Trưởng phòng [Tên Manager] -> [Nếu phát sinh chi phí: Người duyệt chi] -> Đội IT Cấp phát`.
    - SLA ước tính hoàn thành: 2 ngày làm việc.
  - **Bước 4: Xác nhận gửi & Rút yêu cầu:**
    - Nút CTA lớn ở đáy màn hình: "Xác nhận gửi phiếu BM-01".
    - Cho phép nhân viên ấn "Rút yêu cầu" (Withdraw) bất kỳ lúc nào khi đơn còn đang ở trạng thái Chờ duyệt.

#### Màn hình EMP-MOB-03: "Theo dõi tiến trình cấp phát" (Request Tracking & Timeline View)

- **Mục tiêu:** Minh bạch hóa trạng thái xử lý đơn hàng, triệt tiêu sự sốt ruột và các câu hỏi hỏi dò tiến độ.
- **Thành phần UI:**
  - **Danh sách đơn của tôi (My Requests):** Tab lọc "Đang xử lý", "Đã duyệt", "Bị từ chối", "Đã hoàn tất".
  - **Màn hình Chi tiết Tiến trình (Visual Progress Timeline):**
    - Trực quan hóa 5 mốc xử lý bằng Timeline Stepper có màu sắc phân biệt:
      1. **Mốc 1 - Khởi tạo yêu cầu:** Nhân viên gửi thành công phiếu BM-01 (Hiển thị ngày, giờ).
      2. **Mốc 2 - Phê duyệt nhu cầu (Trưởng phòng):** Trạng thái "Đang chờ Trưởng phòng xem xét" hoặc "Đã duyệt bởi [Tên Trưởng phòng]".
      3. **Mốc 3 - Phê duyệt chi (Chỉ hiện khi phát sinh chi phí):** Trạng thái "Đang chờ Người duyệt chi kiểm tra ngân sách".
      4. **Mốc 4 - Cấp phát kỹ thuật (Đội ngũ IT Admin):** Trạng thái "IT đang tạo tài khoản / gán khóa từ kho".
      5. **Mốc 5 - Hoàn tất:** "Tài khoản đã sẵn sàng trong kho bản quyền của bạn".
    - **Trường hợp Bị từ chối (Rejected State):**
      - Thẻ cảnh báo viền đỏ nổi bật, hiển thị chính xác cấp từ chối (Trưởng phòng hay Người duyệt chi), thời điểm từ chối.
      - **Khu vực hiển thị Lý do từ chối (Rejection Reason):** Trích dẫn nguyên văn lý do từ cấp quản lý (ví dụ: _"Ngân sách phòng quý này đã chạm ngưỡng, đề nghị dùng công cụ mã nguồn mở nội bộ đã cấp"_).
      - Nút hỗ trợ: "Tạo yêu cầu mới dựa trên đơn này" hoặc "Liên hệ quản trị viên".

#### Màn hình EMP-MOB-04: "Hộp thư thông báo di động" (Notification Center)

- Danh sách thông báo dạng Feed chia theo nhóm ngày (Hôm nay, Tuần này, Cũ hơn).
- Phân loại rõ ràng qua icon & màu sắc:
  - Icon Check xanh: Đơn yêu cầu được phê duyệt.
  - Icon Alert đỏ: Đơn yêu cầu bị từ chối.
  - Icon Key vàng: Tài khoản/Key mới đã được cấp và sẵn sàng kích hoạt.
  - Icon Clock cam: Nhắc nhở phần mềm sắp hết hạn (30 ngày, 7 ngày).
- Chạm vào thông báo sẽ Deep-link trực tiếp đến màn hình chi tiết đơn hoặc chi tiết phần mềm tương ứng.

---

### 3.2. Phân hệ Trưởng phòng (Manager / Department Head Experience)

Trưởng phòng chịu trách nhiệm kiểm soát nhu cầu nghiệp vụ thực tế của các thành viên trong bộ phận, ngăn chặn việc đăng ký tràn lan không cần thiết.

#### Màn hình MGR-MOB-01: "Hàng đợi duyệt nhu cầu" (Pending Approvals Queue)

- **Mục tiêu:** Giúp Trưởng phòng nắm bắt các yêu cầu tồn đọng trong phòng và xử lý nhanh gọn.
- **Thành phần UI:**
  - **Bộ đếm KPI & SLA:** Số lượng đơn chờ duyệt, số đơn sắp quá hạn SLA (mặc định SLA xử lý là 2 ngày làm việc).
  - **Bộ lọc thông minh:** Lọc theo nhân viên, theo phần mềm, theo cờ cảnh báo.
  - **Thẻ yêu cầu chờ duyệt (Approval Request Card):**
    - Avatar nhân viên, Họ tên, Chức vụ trong phòng.
    - Phần mềm đăng ký, Tên gói, Icon phần mềm.
    - Badge cảnh báo đặc biệt:
      - Badge `Ngoài bộ công cụ chuẩn`: Nổi bật màu cam nếu nhân viên xin tool ngoài danh mục chuẩn của chức vụ.
      - Badge `Thời hạn dài (> 12 tháng)`: Nổi bật màu vàng để nhắc nhở thẩm định kỹ.
    - **Đồng hồ đếm ngược SLA (SLA Clock):** Còn lại `1 ngày 4 giờ` hoặc `Quá hạn SLA 2 giờ`.
    - Thao tác vuốt nhanh (Swipe Action): Vuốt sang phải để mở màn hình Duyệt, vuốt sang trái để Từ chối nhanh.

#### Màn hình MGR-MOB-02: "Hồ sơ chi tiết yêu cầu & Thẩm định nhu cầu" (Request Inspection View)

- **Mục tiêu:** Cung cấp đầy đủ bối cảnh để Trưởng phòng ra quyết định chuẩn xác.
- **Nội dung hiển thị:**
  - **Thông tin nhân viên & Ngữ cảnh phòng ban:** Dự án nhân viên đang tham gia, danh sách các công cụ tương tự mà nhân viên này hiện đã có (để tránh cấp thừa).
  - **Chi tiết phiếu BM-01:**
    - Lý do nghiệp vụ nhân viên ghi.
    - Thời hạn đề xuất sử dụng.
    - Hình thức: Tài khoản cá nhân hay tài khoản dùng chung của nhóm.
  - **Cờ kiểm soát ngoài bộ chuẩn (Outside Standard Toolset):** Hiển thị lý do bắt buộc mà nhân viên đã điền để giải trình cho việc không dùng công cụ tiêu chuẩn của công ty.
  - **Kiểm soát quy tắc SoD-4 (Self-Request Guard):**
    - Nếu đơn này do chính Trưởng phòng tự lập cho bản thân: Hệ thống hiển thị biểu ngữ chặn: _"Yêu cầu của chính bạn. Theo quy định SoD-4, bạn không được tự duyệt yêu cầu này. Đơn đã được chuyển lên Người duyệt chi xem xét."_
    - Hai nút Duyệt / Từ chối sẽ tự động bị vô hiệu hóa (Disabled state).

#### Màn hình MGR-MOB-03: "Bảng hành động Phê duyệt / Từ chối" (Decision Bottom Sheet)

- **Hành động Phê duyệt (Approve):**
  - Trưởng phòng nhấn "Phê duyệt nhu cầu".
  - Nếu yêu cầu có thời hạn > 12 tháng: Modal yêu cầu Trưởng phòng tích chọn xác nhận _"Tôi xác nhận nhu cầu này thực sự cần thiết kéo dài trên 12 tháng cho dự án"_ (`OI-07a`).
  - Hệ thống ghi nhận bản ghi phê duyệt điện tử và Audit Trail (`FR-3.11`).
  - Tự động chuyển tiếp đơn: Sang Người duyệt chi (nếu phát sinh chi phí) hoặc sang hàng đợi IT Admin (nếu gói có sẵn seat dư).
- **Hành động Từ chối (Reject):**
  - Trưởng phòng nhấn "Từ chối".
  - Mở Bottom Sheet bắt buộc nhập trường **"Lý do từ chối" (Rejection Reason)**: Không cho phép để trống (tối thiểu 10 ký tự). Có sẵn các gợi ý nhanh: _"Đã có công cụ thay thế trong bộ chuẩn"_, _"Dự án chưa bước vào giai đoạn này"_, _"Chi phí chưa phù hợp"_.
  - Sau khi xác nhận, đơn đóng lại, thông báo đẩy lập tức gửi về máy nhân viên kèm lý do vừa nhập.

---

### 3.3. Phân hệ Người duyệt chi (Spending Approver Experience)

Người duyệt chi (thường là Giám đốc Vận hành / CFO / Lãnh đạo phụ trách chi tiêu công nghệ) là chốt chặn tài chính tối cao trên ứng dụng mobile.

#### Màn hình APV-MOB-01: "Hàng đợi phê duyệt chi tiêu" (Spending Approval Queue)

- **Mục tiêu:** Gom toàn bộ các yêu cầu phát sinh dòng tiền thực tế vào một danh sách duy nhất.
- **Phạm vi xử lý trên Mobile (`QĐ-61h`):**
  1. Các đơn cấp phần mềm mới phát sinh chi phí (cần mua thêm seat / thuê bao mới).
  2. Các đơn do chính Trưởng phòng bộ phận tự đăng ký (Người duyệt chi xử lý cả bước thẩm định nhu cầu lẫn bước tài chính).
- **Thành phần hiển thị trên mỗi thẻ hàng đợi:**
  - Tên phòng ban yêu cầu (Cost Center: ví dụ `Phòng Kỹ thuật - CC-TECH`).
  - Tên phần mềm & Nhà cung cấp.
  - **Chi phí thực chịu (Borne Cost gồm thuế VAT):** Hiển thị rõ số tiền phát sinh mỗi tháng và tổng cam kết cả kỳ (ví dụ: `12.500.000 VNĐ / năm`).
  - Thời gian SLA còn lại.

#### Màn hình APV-MOB-02: "Hồ sơ thẩm định chi & Snapshot Ngân sách" (Spend & Budget Panel)

- **Mục tiêu:** Cung cấp bức tranh ngân sách tức thời để đảm bảo không phê duyệt vượt trần ngân sách cho phép.
- **Bảng dữ liệu Ngân sách Cost Center (Budget Snapshot - Chỉ đọc trên Mobile):**
  - Hạn mức ngân sách kỳ hiện tại của phòng ban: `200.000.000 VNĐ`.
  - Tổng số tiền đã chi & cam kết: `165.000.000 VNĐ`.
  - Ngân sách khả dụng còn lại trước khi duyệt: `35.000.000 VNĐ`.
  - **Ngân sách khả dụng còn lại sau khi duyệt:** `22.500.000 VNĐ` (Màu xanh nếu an toàn, chuyển sang màu đỏ cảnh báo nếu vượt ngân sách).
- **Lịch sử & Đánh giá bước trước:**
  - Nhận xét và xác nhận của Trưởng phòng ở bước duyệt nhu cầu.
  - **Ý kiến ngân sách từ Finance (Finance Opinion Snapshot - QĐ-29b):**
    - Trạng thái: `Trong hạn mức (Within Budget)` hoặc `Vượt hạn mức (Over Budget)`.
    - Ghi chú từ kế toán viên phụ trách (nếu có).
    - Lưu ý: Ý kiến này chỉ mang tính tham khảo, không ngăn chặn quyền quyết định tối cao của Người duyệt chi.

#### Màn hình APV-MOB-03: "Quyết định Duyệt chi" (Spending Decision)

- **Duyệt chi (Approve Spend):**
  - Nhấn "Phê duyệt & Chuyển IT cấp phát".
  - Hệ thống tạo bản ghi cam kết tài chính (Commitment), lưu Audit Trail, và tự động đẩy tác vụ cấp phát kỹ thuật vào hàng đợi `ITA-05` của IT Admin.
- **Từ chối chi (Reject Spend):**
  - Nhập lý do từ chối tài chính (ví dụ: _"Tạm hoãn chi tiêu phần mềm ngoài danh mục trong Quý 4"_).
  - Hệ thống hủy đơn, giải phóng cam kết dự kiến và gửi thông báo cho cả Trưởng phòng lẫn Nhân viên tạo đơn.

---

## 4. KIẾN TRÚC KỸ THUẬT & HƯỚNG HIỆN THỰC TRÊN NỀN TẢNG ANDROID

### 4.1. Lựa chọn Công nghệ Nền tảng: React Native (Bare/Expo) vs Jetpack Compose

Dựa trên hiện trạng dự án (Backend NestJS REST API, Frontend Web React 19 + TypeScript + TailwindCSS), phương án công nghệ đề xuất như sau:

| Tiêu chí đánh giá            | Phương án A: React Native (TypeScript)                                                                  | Phương án B: Kotlin Jetpack Compose                                                           |
| :--------------------------- | :------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| **Chia sẻ mã nguồn & Logic** | **Rất cao (70-80%):** Tái sử dụng trọn vẹn Types, DTOs, API Service, Validation rules từ `FE-dev-main`. | **Thấp (0%):** Phải viết lại toàn bộ Data models, API Client bằng Kotlin.                     |
| **Đồng bộ Design Tokens**    | **Tức thì:** Sử dụng trực tiếp các mã màu Hex và tokens từ `app.css` qua StyleSheet / NativeWind.       | Phải định nghĩa lại bộ `Color` và `ColorScheme` trong `Theme.kt`.                             |
| **Tối ưu chuẩn Android**     | Rất tốt thông qua React Native Paper / M3 UI components, hiệu năng đạt 60-120fps.                       | **Hoàn hảo:** Native 100% Android, hỗ trợ trực tiếp các API hệ điều hành mới nhất của Google. |
| **Bảo mật phần cứng**        | Tích hợp qua các thư viện native: `react-native-keychain`, `expo-local-authentication`.                 | Trực tiếp gọi Android Jetpack Security (`EncryptedSharedPreferences`, `BiometricPrompt`).     |
| **Khuyến nghị áp dụng**      | **ĐƯỢC CHỌN CHO DỰ ÁN CAPSTONE:** Tối ưu hóa thời gian phát triển, đảm bảo đồng bộ với Web team.        | Phù hợp nếu có nhân sự chuyên sâu 100% về Android Native.                                     |

> **Quyết định Kỹ thuật:** Lựa chọn **React Native (với TypeScript & Native Modules)** cho ứng dụng Android SaaS-Sentry, kết hợp thư viện bảo mật native Android để vừa tối ưu tốc độ triển khai vừa đảm bảo chuẩn mực bảo mật doanh nghiệp.

### 4.2. Cấu trúc Thư mục Ứng dụng Android (Clean Architecture / Feature-Driven)

```
mobile-android/
├── android/                        # Dự án Android Native (Gradle, Manifest, Keystore)
├── src/
│   ├── app/                        # Cấu hình App, Providers (Theme, Auth, Query)
│   ├── assets/                     # Icons, Logos, Fonts (Inter, Roboto)
│   ├── core/                       # Thành phần dùng chung
│   │   ├── config/                 # Biến môi trường, API Base URLs
│   │   ├── constants/              # Token màu sắc (Light/Dark Palette), Typography
│   │   ├── security/               # Keystore Manager, Biometrics Service, FlagSecure
│   │   └── utils/                  # Format tiền tệ VNĐ, Format ngày giờ, SLA parser
│   ├── data/                       # Tầng dữ liệu & Tương tác Backend
│   │   ├── api/                    # Axios Client, Interceptors, Refresh Token logic
│   │   ├── models/                 # TypeScript Interfaces (Đồng bộ từ FE-dev-main)
│   │   └── services/               # RequestService, SoftwareService, ApprovalService
│   ├── features/                   # Phân hệ chức năng theo Vai trò
│   │   ├── auth/                   # Màn hình Đăng nhập tài khoản công ty, 2FA
│   │   ├── employee/               # Views: MySoftware, RequestWizard, TrackingTimeline
│   │   ├── manager/                # Views: PendingQueue, InspectionDetail, DecisionModal
│   │   ├── approvals/              # Views: SpendingQueue, BudgetSnapshot, SpendDecision
│   │   └── notifications/          # NotificationCenter, FCM Handler
│   ├── navigation/                 # Android Bottom Navigation, Role-based Navigators
│   └── ui/                         # Thư viện UI Kit (Button, Card, Badge, Stepper, Dialog)
└── App.tsx                         # Entry point ứng dụng
```

### 4.3. Kiến trúc Luồng Dữ liệu (State Management & API Integration)

- **Tầng Quản lý Trạng thái Server (Server State):** Sử dụng `@tanstack/react-query` (tương đồng với Web).
  - Tự động lưu bộ nhớ đệm (Caching 5 phút cho danh sách phần mềm).
  - Hỗ trợ tính năng `Pull-to-refresh` mượt mà trên tất cả các danh sách hàng đợi.
  - Tự động Re-fetch khi ứng dụng quay trở lại từ chạy ngầm (Foreground Resume).
- **Tầng Quản lý Trạng thái Client (Client State):** Sử dụng `Zustand` với dung lượng siêu nhẹ:
  - Lưu trạng thái Theme hiện tại (Light, Dark, hoặc System Default).
  - Lưu phiên đăng nhập người dùng và vai trò hoạt động (Active Role Switcher nếu 1 người dùng kiêm nhiệm cả Employee và Manager).
- **Tầng Giao tiếp Mạng (Networking & Auth Flow):**
  - Client Axios cấu hình `interceptors` tự động gắn `Authorization: Bearer <Access_Token>`.
  - Cơ chế **Silent Token Refresh:** Khi nhận mã lỗi `401 Unauthorized`, hệ thống tự động gọi endpoint `/api/auth/refresh` bằng Refresh Token lưu trong Android Keystore để nhận cặp token mới mà không làm gián đoạn trải nghiệm người dùng.

---

## 5. CƠ CHẾ BẢO MẬT VÙNG LƯU TRỮ VÀ HIỂN THỊ TÀI KHOẢN / KEY BẢN QUYỀN

Do phần mềm doanh nghiệp chứa các tài sản vô hình có giá trị cao (License Keys cho JetBrains, Figma, Microsoft 365, Adobe...), phân hệ Android áp dụng quy trình bảo mật nghiêm ngặt theo tiêu chuẩn doanh nghiệp:

### 5.1. Cơ chế Lưu trữ Bảo mật trên Thiết bị Android (Data at Rest)

- Tuyệt đối **không** lưu trữ mật khẩu, token hoặc license key vào `AsyncStorage` hay `SharedPreferences` thông thường (vốn là file XML dạng văn bản thô dễ bị khai thác khi thiết bị bị Root).
- Sử dụng **Android Keystore System** kết hợp **EncryptedSharedPreferences** (AES-256-GCM encryption):
  - Khóa giải mã được sinh ra và lưu trữ an toàn trong phần cứng bảo mật của chip (Hardware-backed Keystore / Secure Element / StrongBox).
  - Dữ liệu token và thông tin nhạy cảm chỉ được giải mã trong bộ nhớ RAM khi ứng dụng đang chạy ở foreground.

### 5.2. Cơ chế Xác thực Sinh trắc học khi xem License Key (Biometric Gate)

1. Khi nhân viên truy cập vào chi tiết phần mềm loại K4: Khóa bản quyền mặc định được hiển thị dưới dạng che bớt (Masked string: `FIG-PRO-••••-••••-8819`).
2. Khi nhân viên bấm vào biểu tượng "Mắt" hoặc bấm "Sao chép":
   - Ứng dụng kích hoạt Android `BiometricPrompt`: Yêu cầu quét vân tay hoặc nhận diện khuôn mặt người dùng.
   - Nếu xác thực thất bại quá 3 lần: Ứng dụng yêu cầu nhập mã PIN thiết bị.
   - Khi xác thực thành công: Chuỗi Key hoàn chỉnh được giải mã và hiển thị trong 30 giây, sau đó tự động che mờ trở lại.
3. **Bảo vệ chống quay màn hình / Chụp ảnh màn hình:**
   - Tại màn hình xem chi tiết tài khoản và license key, kích hoạt cờ hệ thống Android:
     ```java
     getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
     ```
   - Ngăn chặn triệt để hành vi chụp ảnh màn hình (Screenshot blocked), quay video màn hình hoặc ứng dụng gián điệp đọc trộm giao diện.

### 5.3. Ghi nhận Vết kiểm toán Tự động (Audit Trail Logging - FR-2.10)

Mỗi hành động mở xem đầy đủ (Unmask) hoặc sao chép (Copy) License Key trên thiết bị Android đều được ứng dụng tự động gửi 1 sự kiện Audit Trail về Backend:

- **Dữ liệu log:** `{ action: "VIEW_LICENSE_KEY", softwareId: "1", employeeId: "EMP-102", deviceModel: "Samsung Galaxy S23", androidVersion: "14", timestamp: "..." }`.
- Đảm bảo tính giải trình và ngăn ngừa việc nhân viên chia sẻ trái phép bản quyền của doanh nghiệp ra ngoài.

---

## 6. HỆ THỐNG THÔNG BÁO PUSH & IN-APP NOTIFICATIONS TRÊN ANDROID

Nhằm đảm bảo tuân thủ nghiêm ngặt SLA xử lý 2 ngày làm việc và thông báo kịp thời cho nhân viên, hệ thống thông báo trên Android được thiết kế chuyên sâu:

### 6.1. Tích hợp Firebase Cloud Messaging (FCM) & Android Notification Channels

Từ Android 8.0 trở lên và đặc biệt tuân thủ chính sách quyền hạn `POST_NOTIFICATIONS` trên Android 13+, ứng dụng phân chia thành các kênh thông báo riêng biệt (Notification Channels):

| ID Kênh (Channel ID)      | Tên hiển thị người dùng | Mức độ ưu tiên     | Âm thanh & Rung               | Mục đích                                              |
| :------------------------ | :---------------------- | :----------------- | :---------------------------- | :---------------------------------------------------- |
| `channel_approvals`       | Yêu cầu chờ phê duyệt   | **High (Cấp cao)** | Rung mạnh, âm thanh thông báo | Gửi đến Trưởng phòng & Người duyệt chi khi có đơn mới |
| `channel_requests_status` | Trạng thái đơn yêu cầu  | **High (Cấp cao)** | Rung nhẹ, âm báo chuẩn        | Báo cho nhân viên: Đơn được duyệt / Bị từ chối        |
| `channel_licenses`        | Cấp phát bản quyền      | **Medium**         | Âm báo ngắn                   | Báo cho nhân viên: Key mới đã sẵn sàng                |
| `channel_reminders`       | Nhắc nhở hạn sử dụng    | **Default**        | Không rung                    | Cảnh báo phần mềm sắp hết hạn trước 14 ngày, 7 ngày   |

### 6.2. Cấu trúc Tải trọng Thông báo (Notification Payload) & Deep Linking

Mọi thông báo gửi từ Backend qua FCM đều chứa dữ liệu điều hướng chính xác:

```json
{
  "to": "device_fcm_token",
  "notification": {
    "title": "Yêu cầu cấp Figma Pro đã được duyệt!",
    "body": "Trưởng phòng Nguyễn Văn A đã duyệt yêu cầu của bạn. Tài khoản đang được IT cấp phát."
  },
  "data": {
    "type": "REQUEST_STATUS_UPDATE",
    "requestId": "req-01",
    "targetRole": "EMPLOYEE",
    "deepLink": "saassentry://requests/req-01"
  }
}
```

- Khi người dùng chạm vào thông báo ngoài màn hình khóa (Lock screen) hoặc thanh trạng thái (Status bar): Ứng dụng tự động điều hướng trực tiếp vào màn hình Theo dõi tiến trình `EMP-MOB-03` của đơn `req-01` mà không cần người dùng phải bấm tìm thủ công.

---

## 7. LỘ TRÌNH TRIỂN KHAI, PHÂN KỲ & QUẢN TRỊ RỦI RO

Kế hoạch thực hiện mở rộng sang Mobile Android được chia thành 4 giai đoạn mạch lạc, đảm bảo tính khả thi cao và đồng bộ song hành cùng đội ngũ Web.

### 7.1. Phân kỳ Thực hiện (Phases & Sprints)

#### Giai đoạn 1: Khởi tạo Nền tảng & Hệ thống Thiết kế (Sprint 1)

- Thiết lập dự án React Native Android (cấu hình Android SDK 34, JDK 17, Gradle 8+).
- Xây dựng Theme Provider với đầy đủ Tokens cho 2 chế độ Sáng/Tối lấy từ `app.css`.
- Xây dựng bộ UI Kit cơ bản (Button, Input, Card, Modal, BottomSheet, Stepper).
- Thiết lập tầng mạng Axios Client, Interceptor xác thực, mô hình hóa DTOs từ Backend.

#### Giai đoạn 2: Phân hệ Nhân viên & Kho Bản quyền Bảo mật (Sprint 2)

- Hiện thực Màn hình EMP-MOB-01: Danh sách phần mềm đã cấp, tích hợp BiometricPrompt và chức năng Sao chép/Hiện Key an toàn.
- Hiện thực Màn hình EMP-MOB-02: Luồng gửi yêu cầu theo biểu mẫu BM-01, chọn Catalog, kiểm tra trùng lặp license.
- Hiện thực Màn hình EMP-MOB-03 & EMP-MOB-04: Màn hình Timeline tiến trình đơn, xem lý do từ chối và danh sách thông báo.

#### Giai đoạn 3: Phân hệ Quản lý & Phê duyệt (Manager & Approver) (Sprint 3)

- Hiện thực Màn hình MGR-MOB-01 & MGR-MOB-02: Hàng đợi duyệt của Trưởng phòng, đồng hồ SLA, kiểm tra cờ ngoài bộ chuẩn và chặn tự duyệt yêu cầu của bản thân (SoD-4).
- Hiện thực Bottom Sheet duyệt/từ chối kèm lý do bắt buộc của Trưởng phòng.
- Hiện thực Màn hình APV-MOB-01 & APV-MOB-02: Hàng đợi duyệt chi của Spending Approver, hiển thị snapshot ngân sách Cost Center và ý kiến từ Finance.
- Hiện thực chức năng Duyệt chi và tự động đẩy tác vụ sang IT Provisioning Queue.

#### Giai đoạn 4: Tích hợp FCM, Tối ưu Hiệu năng & Đóng gói Android (Sprint 4)

- Tích hợp Firebase Cloud Messaging (FCM), cấu hình Notification Channels trên Android 13+.
- Kiểm thử bảo mật (Keystore, FLAG_SECURE, xác thực sinh trắc học).
- Kiểm thử tải và kiểm thử hồi quy trên các thiết bị Android thực tế (Samsung, Xiaomi, Google Pixel với các kích thước màn hình khác nhau).
- Tối ưu kích thước gói cài đặt APK/AAB bằng Proguard / R8 code shrinking.
- Xuất bản file cài đặt nội bộ (Release APK / AAB) để phục vụ demo đồ án tốt nghiệp.

### 7.2. Ma trận Quản trị Rủi ro Kỹ thuật & Nghiệp vụ (Risk & Mitigation)

| Rủi ro tiềm ẩn                                              | Mức độ ảnh hưởng | Giải pháp kiểm soát & Khắc phục                                                                                             |
| :---------------------------------------------------------- | :--------------: | :-------------------------------------------------------------------------------------------------------------------------- |
| **Thiết bị Android không hỗ trợ vân tay/khuôn mặt**         |    Trung bình    | Tự động chuyển đổi về phương thức fallback an toàn: Nhập mã PIN hoặc mật khẩu ứng dụng.                                     |
| **Mất kết nối mạng khi đang thao tác phê duyệt**            |       Cao        | Áp dụng cơ chế Optimistic UI có cảnh báo; nếu gọi API thất bại, rollback trạng thái giao diện kèm Toast thông báo lỗi mạng. |
| **Lỗi tràn màn hình trên các máy Android màn hình nhỏ**     |       Thấp       | 100% màn hình chi tiết được bọc trong `ScrollView` có padding theo `SafeAreaView`, sử dụng đơn vị `dp` linh hoạt.           |
| **Xung đột phân quyền khi 1 người dùng kiêm nhiều vai trò** |    Trung bình    | Tích hợp công tắc chuyển đổi vai trò (Role Switcher) ở góc trên thanh App Bar, lưu vai trò hoạt động trong Zustand.         |
| **Độ trễ thông báo đẩy FCM**                                |       Thấp       | Kết hợp cơ chế Push Notification với cơ chế Polling ngầm mỗi khi người dùng mở lại ứng dụng (App Foreground Resume).        |

---

_Tài liệu kế hoạch kỹ thuật được phê chuẩn phục vụ công tác phát triển phân hệ Mobile Android cho dự án SaaS-Sentry._
