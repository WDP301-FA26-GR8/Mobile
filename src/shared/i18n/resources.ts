export const resources = {
  en: {
    translation: {
      auth: {
        emailLabel: 'Work email',
        forgotPassword: 'Forgot your password? Use the web flow. It is outside the mobile MVP.',
        passwordLabel: 'Password',
        passwordMask: '••••••••••••',
        roles: {
          approver: 'Spending approver',
          employee: 'Employee',
          manager: 'Department head'
        },
        mark: 'SS',
        scopeNote: 'QĐ-61 MVP: no biometrics and no offline mode.',
        submit: 'Sign in with company SSO',
        subtitle: 'Software licenses and technology cost',
        title: 'SaaS-Sentry'
      },
      common: {
        back: 'Back',
        brand: 'SAAS-SENTRY MOBILE',
        continue: 'Continue',
        language: {
          english: 'English',
          englishShort: 'EN',
          selector: 'Language',
          switchTo: 'Switch to {{language}}',
          vietnamese: 'Vietnamese',
          vietnameseShort: 'VI'
        },
        signOut: 'Sign out'
      },
      inbox: {
        empty: 'No notifications yet.',
        groups: {
          earlier: 'Earlier',
          thisWeek: 'This week',
          today: 'Today'
        },
        markRead: 'Mark as read',
        section: 'MOBILE NOTIFICATIONS (DEEP-LINK)',
        licenseReady: '{{name}} is ready in your software vault.',
        pending: '{{name}} is waiting for your department head.',
        rejected: '{{name}} was rejected.',
        title: 'Inbox'
      },
      nav: {
        inbox: 'Inbox',
        managerQueue: 'Need queue',
        newRequest: 'New request',
        progress: 'Progress',
        requests: 'Requests',
        software: 'Software',
        spendQueue: 'Spend queue',
        vault: 'Software vault'
      },
      placeholders: {
        approver: {
          body: 'The spending queue is the next slice. This static build already signs you in as the spending approver.',
          title: 'Spending queue'
        },
        manager: {
          body: 'The department need queue is the next slice. This static build already signs you in as the department head.',
          title: 'Need queue'
        }
      },
      requests: {
        cost: 'Estimated cost {{amount}}',
        costFree: 'Estimated cost 0 VND. A spare seat is already in stock.',
        createAnother: 'Create a new request',
        empty: 'No requests in this filter.',
        filters: {
          approved: 'Approved',
          completed: 'Completed',
          pending: 'In progress',
          rejected: 'Rejected',
          withdrawn: 'Withdrawn'
        },
        missing: 'This request is not in the demo data.',
        new: 'New request',
        open: 'View progress',
        reasonLabel: 'Business reason',
        reasonPresets: {
          projectChannel: 'Needed for the WDP project channel.'
        },
        rejectedByApprover: 'Rejected by spending approver {{name}}',
        rejectedByManager: 'Rejected by department head {{name}}',
        rejectionPresets: {
          standardTool: 'A replacement is already in the standard toolset.'
        },
        rejectionTitle: 'Rejection reason',
        timeline: {
          needCurrent: 'Waiting for department head {{name}}',
          needDone: 'Need approved by {{name}}',
          needRejected: 'Need rejected by {{name}}',
          provision: 'IT provisions the account or key',
          ready: 'Ready in your software vault',
          spendCurrent: 'Waiting for spending approver {{name}}',
          spendRejected: 'Spending approver {{name}} rejected this request',
          spendUpcoming: 'Spending approver {{name}} reviews the budget if this step is reached',
          submitted: 'Request submitted on {{date}}',
          upcoming: 'Not started'
        },
        title: 'My requests',
        withdraw: 'Withdraw request',
        withdrawnNote: 'You withdrew this request while it was still waiting for approval.',
        wizard: {
          blockedBody:
            'You already have an active license for {{name}}. Open it in your vault instead of requesting another.',
          blockedTitle: 'Duplicate license blocked',
          catalogHeading: 'CHOOSE FROM THE SOFTWARE CATALOG',
          catalogTitle: 'Choose software',
          chooseSoftware: 'Choose {{name}}',
          detailsTitle: 'Request details',
          freeSeats: 'No charge ({{count}} seats in stock)',
          monthlyPrice: '{{amount}} / month (incl. VAT)',
          outsidePrice: '{{amount}} / month (outside the standard toolset)',
          outsideStandard: 'Outside the standard toolset. State the business reason clearly.',
          pinned: 'Standard tools first',
          alreadyAssigned: 'Already assigned to you',
          reasonLabel: 'Business reason',
          reasonPlaceholder: 'Example: needed for project WDP',
          reviewTitle: 'Review the approval route',
          routeWithSpend: 'You submit → {{manager}} → {{approver}} → IT provisioning',
          routeWithoutSpend: 'You submit → {{manager}} → IT provisioning',
          sla: 'Estimated completion: 2 business days.',
          standardBadge: 'Standard toolset',
          step: 'Step {{current}} of {{total}}',
          stepCatalog: '1. Catalog',
          stepDetails: '2. Details',
          stepReview: '3. Approval route',
          submit: 'Submit BM-01',
          termLabel: 'Term',
          termMonths: '{{count}} months',
          viewSoftware: 'View this software'
        }
      },
      software: {
        categories: {
          communication: 'Communication',
          design: 'Design',
          development: 'Development',
          productivity: 'Productivity'
        },
        copied: 'License key copied to the clipboard.',
        copyKey: 'Copy key',
        deviceNote: 'Use only the registered company workstation {{device}}.',
        emailLabel: 'Company email',
        emptyBody: 'Try another name or category.',
        emptyTitle: 'No software matches',
        expires: 'Expires {{date}}',
        filters: {
          all: 'All',
          design: 'Design',
          development: 'Development',
          productivity: 'Productivity'
        },
        daysLeft: '{{count}} days left',
        kinds: {
          licenseKey: 'Key K4',
          shared: 'Shared',
          ssoSeat: 'SSO Seat'
        },
        granted: 'Granted {{date}}',
        hideKey: 'Hide key',
        keyLabel: 'License key',
        missing: 'This software is not in the demo vault.',
        openSso: 'Open app / SSO',
        planLabel: 'Plan',
        revealKey: 'Reveal key',
        searchLabel: 'Search software',
        searchPlaceholder: 'Search by name',
        ssoUnavailable: 'SSO sign-in is not connected in this static build.',
        sharedNote: 'This is a shared team login. Follow the IT policy and do not change the shared password.',
        summary: {
          active: '{{count}} active',
          activeCaption: 'Active',
          activeValue: '{{count}} apps',
          expiring: '{{count}} expiring soon',
          expiringCaption: 'Expiring soon',
          expiringValue: '{{count}} license'
        },
        title: 'My software',
        usage: 'Usage {{percent}}%',
        workspaceLabel: 'Workspace'
      },
      status: {
        active: 'Active',
        approved: 'Approved',
        completed: 'Completed',
        expiring: 'Expiring soon',
        inStock: 'Seat in stock',
        info: 'In progress',
        outsideStandard: 'Outside standard toolset',
        owned: 'Already assigned',
        pending: 'Pending',
        purchase: 'Purchase required',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn'
      }
    }
  },
  vi: {
    translation: {
      auth: {
        emailLabel: 'Email công ty',
        forgotPassword: 'Quên mật khẩu? Dùng luồng web. Việc đó nằm ngoài mobile MVP.',
        passwordLabel: 'Mật khẩu',
        passwordMask: '••••••••••••',
        roles: {
          approver: 'Người duyệt chi',
          employee: 'Nhân viên',
          manager: 'Trưởng phòng'
        },
        mark: 'SS',
        scopeNote: 'QĐ-61 MVP: không sinh trắc học, không chế độ offline.',
        submit: 'Đăng nhập SSO công ty',
        subtitle: 'Quản lý bản quyền & chi phí phần mềm',
        title: 'SaaS-Sentry'
      },
      common: {
        back: 'Quay lại',
        brand: 'SAAS-SENTRY MOBILE',
        continue: 'Tiếp tục',
        language: {
          english: 'Tiếng Anh',
          englishShort: 'EN',
          selector: 'Ngôn ngữ',
          switchTo: 'Chuyển sang {{language}}',
          vietnamese: 'Tiếng Việt',
          vietnameseShort: 'VI'
        },
        signOut: 'Đăng xuất'
      },
      inbox: {
        empty: 'Chưa có thông báo.',
        groups: {
          earlier: 'Trước đó',
          thisWeek: 'Tuần này',
          today: 'Hôm nay'
        },
        markRead: 'Đánh dấu đã đọc',
        section: 'THÔNG BÁO DI ĐỘNG (DEEP-LINK)',
        licenseReady: '{{name}} đã sẵn sàng trong kho phần mềm.',
        pending: '{{name}} đang chờ trưởng phòng.',
        rejected: '{{name}} đã bị từ chối.',
        title: 'Thông báo'
      },
      nav: {
        inbox: 'Thông báo',
        managerQueue: 'Hàng đợi',
        newRequest: 'Tạo yêu cầu',
        progress: 'Tiến trình',
        requests: 'Yêu cầu',
        software: 'Phần mềm',
        spendQueue: 'Duyệt chi',
        vault: 'Kho phần mềm'
      },
      placeholders: {
        approver: {
          body: 'Hàng đợi duyệt chi là lát tiếp theo. Bản tĩnh này đã đăng nhập bạn với vai người duyệt chi.',
          title: 'Hàng đợi duyệt chi'
        },
        manager: {
          body: 'Hàng đợi duyệt nhu cầu là lát tiếp theo. Bản tĩnh này đã đăng nhập bạn với vai trưởng phòng.',
          title: 'Hàng đợi duyệt nhu cầu'
        }
      },
      requests: {
        cost: 'Chi phí ước tính {{amount}}',
        costFree: 'Chi phí ước tính 0 đồng. Kho còn seat sẵn.',
        createAnother: 'Tạo yêu cầu mới',
        empty: 'Không có yêu cầu trong bộ lọc này.',
        filters: {
          approved: 'Đã duyệt',
          completed: 'Đã hoàn tất',
          pending: 'Đang xử lý',
          rejected: 'Bị từ chối',
          withdrawn: 'Đã rút'
        },
        missing: 'Không thấy yêu cầu này trong dữ liệu giả lập.',
        new: 'Tạo yêu cầu',
        open: 'Xem tiến trình',
        reasonLabel: 'Lý do nghiệp vụ',
        reasonPresets: {
          projectChannel: 'Cần cho kênh dự án WDP.'
        },
        rejectedByApprover: 'Người duyệt chi {{name}} đã từ chối',
        rejectedByManager: 'Trưởng phòng {{name}} đã từ chối',
        rejectionPresets: {
          standardTool: 'Đã có công cụ thay thế trong bộ chuẩn.'
        },
        rejectionTitle: 'Lý do từ chối',
        timeline: {
          needCurrent: 'Đang chờ trưởng phòng {{name}}',
          needDone: 'Trưởng phòng {{name}} đã duyệt nhu cầu',
          needRejected: 'Trưởng phòng {{name}} đã từ chối nhu cầu',
          provision: 'IT cấp tài khoản hoặc khóa',
          ready: 'Sẵn sàng trong kho phần mềm',
          spendCurrent: 'Đang chờ người duyệt chi {{name}}',
          spendRejected: 'Người duyệt chi {{name}} đã từ chối',
          spendUpcoming: 'Người duyệt chi {{name}} xem ngân sách nếu tới bước này',
          submitted: 'Đã gửi yêu cầu ngày {{date}}',
          upcoming: 'Chưa tới'
        },
        title: 'Yêu cầu của tôi',
        withdraw: 'Rút yêu cầu',
        withdrawnNote: 'Bạn đã rút yêu cầu này khi đơn còn đang chờ duyệt.',
        wizard: {
          blockedBody: 'Bạn đã có bản quyền còn hiệu lực cho {{name}}. Mở trong kho thay vì gửi thêm một đơn.',
          blockedTitle: 'Đã chặn vì trùng bản quyền',
          catalogHeading: 'CHỌN TỪ DANH MỤC PHẦN MỀM',
          catalogTitle: 'Chọn phần mềm',
          chooseSoftware: 'Chọn {{name}}',
          detailsTitle: 'Chi tiết yêu cầu',
          freeSeats: 'Miễn phí (Còn {{count}} seat kho)',
          monthlyPrice: '{{amount}} / tháng (Gồm VAT)',
          outsidePrice: '{{amount}} / tháng (Ngoài bộ chuẩn)',
          outsideStandard: 'Ngoài bộ công cụ chuẩn. Cần ghi rõ lý do nghiệp vụ.',
          pinned: 'Bộ chuẩn ghim đầu',
          alreadyAssigned: 'Đã cấp phát cho bạn',
          reasonLabel: 'Lý do nghiệp vụ',
          reasonPlaceholder: 'Ví dụ: phục vụ dự án WDP',
          reviewTitle: 'Xem lại tuyến duyệt',
          routeWithSpend: 'Bạn gửi → {{manager}} → {{approver}} → IT cấp phát',
          routeWithoutSpend: 'Bạn gửi → {{manager}} → IT cấp phát',
          sla: 'SLA ước tính hoàn thành: 2 ngày làm việc.',
          standardBadge: 'Bộ công cụ chuẩn',
          step: 'Bước {{current}}/{{total}}',
          stepCatalog: '1. Danh mục',
          stepDetails: '2. Chi tiết',
          stepReview: '3. Tuyến duyệt',
          submit: 'Xác nhận gửi phiếu BM-01',
          termLabel: 'Thời hạn sử dụng',
          termMonths: '{{count}} tháng',
          viewSoftware: 'Xem phần mềm này'
        }
      },
      software: {
        categories: {
          communication: 'Giao tiếp',
          design: 'Thiết kế',
          development: 'Lập trình',
          productivity: 'Năng suất'
        },
        copied: 'Đã sao chép khóa bản quyền vào bộ nhớ tạm.',
        copyKey: 'Sao chép khóa',
        deviceNote: 'Chỉ dùng trên máy trạm công ty đã đăng ký {{device}}.',
        emailLabel: 'Email công ty',
        emptyBody: 'Thử tên hoặc danh mục khác.',
        emptyTitle: 'Không có phần mềm phù hợp',
        expires: 'Hết hạn {{date}}',
        filters: {
          all: 'Tất cả',
          design: 'Thiết kế',
          development: 'Lập trình',
          productivity: 'Năng suất'
        },
        daysLeft: 'Còn {{count}} ngày',
        kinds: {
          licenseKey: 'Key K4',
          shared: 'Dùng chung',
          ssoSeat: 'SSO Seat'
        },
        granted: 'Được cấp {{date}}',
        hideKey: 'Ẩn khóa',
        keyLabel: 'Khóa bản quyền',
        missing: 'Không thấy phần mềm này trong kho giả lập.',
        openSso: 'Mở ứng dụng / Đăng nhập SSO',
        planLabel: 'Gói',
        revealKey: 'Hiện khóa',
        searchLabel: 'Tìm phần mềm',
        searchPlaceholder: 'Tìm theo tên',
        ssoUnavailable: 'Đăng nhập SSO chưa được nối trong bản giao diện tĩnh.',
        sharedNote: 'Đây là tài khoản dùng chung của nhóm. Làm theo chính sách IT và không tự đổi mật khẩu chung.',
        summary: {
          active: '{{count}} đang dùng',
          activeCaption: 'Đang hiệu lực',
          activeValue: '{{count}} phần mềm',
          expiring: '{{count}} sắp hết hạn',
          expiringCaption: 'Sắp hết hạn',
          expiringValue: '{{count}} license'
        },
        title: 'Phần mềm của tôi',
        usage: 'Mức dùng {{percent}}%',
        workspaceLabel: 'Workspace'
      },
      status: {
        active: 'Đang hiệu lực',
        approved: 'Đã duyệt',
        completed: 'Đã hoàn tất',
        expiring: 'Sắp hết hạn',
        inStock: 'Còn seat trong kho',
        info: 'Đang xử lý',
        outsideStandard: 'Ngoài bộ chuẩn',
        owned: 'Đã cấp',
        pending: 'Chờ duyệt',
        purchase: 'Cần mua mới',
        rejected: 'Bị từ chối',
        withdrawn: 'Đã rút'
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
