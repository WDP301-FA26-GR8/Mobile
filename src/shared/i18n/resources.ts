export const resources = {
  en: {
    translation: {
      common: {
        brand: 'SAAS-SENTRY MOBILE',
        brandInitial: 'S',
        brandName: 'SaaS-Sentry',
        demo: 'demo',
        language: {
          english: 'English',
          englishShort: 'EN',
          selector: 'Language',
          switchTo: 'Switch to {{language}}',
          vietnamese: 'Vietnamese',
          vietnameseShort: 'VI'
        }
      },
      navigation: {
        createRequest: 'Create request',
        inbox: 'Inbox',
        openTab: 'Open {{tab}}',
        requests: 'Requests',
        software: 'Software',
        tabs: 'Main navigation'
      },
      auth: {
        back: 'Back',
        demoNote: 'UF-17 / QĐ-46a · Internal email and password only; no external sign-in provider. Demo data.',
        email: 'Company email',
        emailPlaceholder: 'name@company.tech',
        forgotPassword: 'Forgot password?',
        login: 'Sign in',
        loginTitle: 'Sign in to your internal account',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        recovery: {
          backToLogin: 'Back to sign in',
          done: {
            description: 'Your demo password has been updated. You can now return to sign in.',
            title: 'Password updated'
          },
          email: {
            description: 'Enter your company email and we will send reset instructions.',
            title: 'Reset your password'
          },
          newPassword: 'New password',
          openLink: 'Open simulated reset link',
          resetButton: 'Set new password',
          send: 'Send instructions',
          sent: {
            description:
              'If an account matches that email, reset instructions will be sent. This response is the same for every address.',
            title: 'Check your email'
          },
          passwordStep: {
            description: 'Choose a new password for your internal account.',
            title: 'Create a new password'
          }
        }
      },
      home: {
        capabilitiesHeading: 'Mobile scope',
        capabilities: {
          myRequests: {
            title: 'My software and requests',
            description:
              'Employees view their software and requests, and submit or withdraw a simple request for catalog software.'
          },
          needApproval: {
            title: 'Need approval',
            description: 'Managers decide the need approval step for requests from their department.'
          },
          spendApproval: {
            title: 'Spending approval',
            description:
              'The spending approver decides one item at a time using a read-only budget snapshot, and handles the need step when a manager submits their own request.'
          },
          inbox: {
            title: 'In-app inbox',
            description: 'Users read workflow updates in the app without push notifications.'
          }
        },
        contractNote:
          'These are the four mobile tasks in BRD 3.53. The current OpenAPI snapshot only defines a system status endpoint, so business actions are not connected yet.',
        description: 'Native iOS and Android companion for the four workflows defined in the BRD.',
        openEmployeeDemo: 'Open employee demo',
        title: 'SaaS-Sentry on mobile'
      },
      inbox: {
        demoNote: 'Demo notifications only · no push notifications',
        items: {
          approved: {
            body: 'The need for request {{requestId}} was approved. Finance is reviewing it; it is not in the spending approver queue.',
            title: 'Need approved'
          },
          expired: {
            body: 'The {{software}} license has expired.',
            title: 'License expired'
          },
          ready: {
            body: 'Request {{requestId}} for {{software}} is approved and ready for IT to start provisioning.',
            title: 'Ready to provision'
          },
          rejected: {
            title: 'Request rejected'
          }
        },
        openNotification: 'Open notification about {{software}}',
        read: 'Read',
        title: 'Inbox',
        unread: 'Unread · {{count}}'
      },
      licenses: {
        accessTypes: {
          licenseKey: 'License key (K4)',
          workspaceSeat: 'Workspace seat'
        },
        back: 'Back to my software',
        categories: {
          all: 'All',
          design: 'Design',
          development: 'Development',
          productivity: 'Productivity'
        },
        detail: {
          account: 'Company account',
          email: 'Company email',
          key: 'License key',
          keyMasked: 'Masked license key',
          noPassword: 'Passwords are not shown in this app.',
          status: 'Status',
          workspace: 'Workspace'
        },
        demoData: 'Demo data · not connected to live accounts',
        empty: 'No software found in this category.',
        activeCount: '{{count}} software',
        expiringCount: '{{count}} expiring',
        employeeDepartment: 'CC-TECH',
        employeeName: 'Nguyen Van A',
        employeeRole: 'Product Dev',
        openSoftware: 'Open {{name}} details',
        securityNote: 'One company account or seat per employee. Credentials are not shared (QĐ-75).',
        screenTitle: 'My software',
        screenSubtitle: 'Your company-provided software and access',
        status: {
          active: 'Active',
          expiring: 'Expires in {{days}} days'
        },
        summary: {
          active: 'Active',
          expiring: 'Expiring soon'
        }
      },
      requests: {
        back: 'Back',
        backToSoftware: 'Back to my software',
        annualCost: '{{amount}} VND/year',
        catalogCount: '{{count}} items',
        catalogEmptyDescription: 'Try another software name or clear the search.',
        catalogEmptyTitle: 'No matching software',
        catalogFilters: 'Filter catalog',
        catalogHint: 'Choose a tool already included in the company catalog.',
        catalogSubtitle: 'Select a catalog tool and tell us how you will use it.',
        categories: {
          ai: 'AI tools',
          productivity: 'Productivity'
        },
        cancel: 'Keep request',
        chooseCatalogTool: 'Choose software from the catalog',
        chooseTool: 'Choose {{name}}',
        confirm: 'Withdraw request',
        confirmWithdraw: 'Withdraw request {{id}}?',
        cost: '{{amount}} VND',
        createNew: 'Request software',
        continue: 'Continue',
        detailsSubtitle: 'Choose a duration and explain the work need.',
        detailsTitle: 'Request details',
        demoData: 'Demo data · actions stay in this session only',
        duration: '{{months}} months',
        durationDefault: 'Standard period',
        durationExtended: 'Extended period',
        durationHint: 'Choose 12 or 18 months.',
        durationLabel: 'Requested duration',
        edit: 'Edit',
        estimatedCost: 'Estimated amount',
        errors: {
          reasonRequired: 'Add a business reason for software outside the standard toolset.'
        },
        financeReview: 'Finance review',
        filters: {
          all: 'All',
          outside: 'Outside standard',
          standard: 'Standard'
        },
        kicker: 'Employee request',
        managerName: 'Le Hoang',
        longTermWarning: 'OI-07a · Requests over 12 months need additional review.',
        newTitle: 'New software request',
        noDemoQuote: 'No demo quote provided',
        noMobileBatch:
          'Mobile does not submit spending batches. A manager may submit a batch on the web when applicable.',
        noBudgetCode: 'Budget check codes and balances are not shown. Rejected requests cannot be withdrawn.',
        notices: {
          financeReview: 'Finance is reviewing this request. It is not yet in the spending approver queue.',
          longTerm: 'OI-07a · 18-month request; additional review applies.',
          submittedWeb: 'Lê Hoàng submitted the spending batch on the web.'
        },
        rejectedBy: 'Rejected by manager {{name}} · {{date}}',
        rejectionReasons: {
          adobeBudgetOptimized:
            'The department budget has been optimized this quarter. Use Figma Pro or Canva Team from the standard toolset.'
        },
        openRequest: 'Open request {{id}} for {{name}}',
        outOfStandard: 'Outside the standard toolset',
        outOfStandardReason: 'A business reason is required for software outside the standard toolset.',
        personalOnly: 'This mobile request is for your own access only.',
        planReference: 'Plan reference',
        possibleSteps:
          'Possible steps: need review, web batch submission when applicable, Finance review when required, spending approval when required, and IT provisioning. The actual route depends on the request.',
        possibleStepsTitle: 'Possible review steps',
        personalAccess: 'For my own access',
        progress: 'Request progress: step {{current}} of {{total}}',
        reasonOptional: 'Optional for software in the standard toolset.',
        reasonLabel: 'Business reason',
        reasonPlaceholder: 'Describe how this software supports your work',
        review: 'Review request',
        reviewSubtitle: 'Check the request details before sending it for review.',
        reviewTitle: 'Review before submitting',
        requestFor: 'Request for',
        searchCatalog: 'Search software',
        selectedTool: 'Selected software',
        standardTool: 'Standard toolset',
        steps: {
          catalog: 'Catalog',
          details: 'Details',
          review: 'Review'
        },
        summaryTitle: 'Request summary',
        status: {
          awaitingExecution: 'Waiting for IT to start',
          awaitingManagerSubmission: 'Waiting for manager to submit',
          awaitingNeed: 'Waiting for need approval',
          completed: 'Completed',
          executing: 'IT is provisioning · cannot withdraw',
          financeReview: 'Finance review',
          provisioningFailed: 'Provisioning failed',
          rejected: 'Rejected',
          spendApproval: 'Waiting for spending approval',
          waitingInvitation: 'Waiting for invitation acceptance',
          withdrawn: 'Withdrawn'
        },
        submit: 'Submit request',
        submittedWeb: 'Submitted on the web',
        changeTool: 'Change',
        catalog: {
          descriptions: {
            claude: 'AI workspace for analysis, writing and coding tasks.',
            raycast: 'Productivity launcher for tools and everyday workflows.'
          }
        },
        timeline: {
          awaitingExecution: 'IT has not started provisioning yet',
          created: 'Request submitted',
          executionStarted: 'IT started provisioning',
          financeReview: 'Finance review started',
          needApproved: 'Need approved',
          needReviewPending: 'Waiting for need review',
          rejected: 'Request rejected by the manager',
          spendReviewPending: 'Waiting for spending decision',
          submittedWeb: 'Lê Hoàng submitted the spending batch on the web',
          withdrawn: 'Request withdrawn'
        },
        timelineTitle: 'Request timeline',
        title: 'My requests',
        withdraw: 'Withdraw',
        withdrawPolicy:
          'Withdraw while pending approval, awaiting execution, failed, or waiting for an invitation. Do not withdraw while provisioning or after completion. A queue shows assigned work, not the full visibility scope.',
        withdrawNamed: 'Withdraw request {{id}}',
        withdrawResult: 'The request will be marked withdrawn in this demo.',
        withdrawn: 'Withdrawn',
        standard: 'Standard toolset'
      }
    }
  },
  vi: {
    translation: {
      common: {
        brand: 'SAAS-SENTRY MOBILE',
        brandInitial: 'S',
        brandName: 'SaaS-Sentry',
        demo: 'giả lập',
        language: {
          english: 'Tiếng Anh',
          englishShort: 'EN',
          selector: 'Ngôn ngữ',
          switchTo: 'Chuyển sang {{language}}',
          vietnamese: 'Tiếng Việt',
          vietnameseShort: 'VI'
        }
      },
      navigation: {
        createRequest: 'Tạo yêu cầu',
        inbox: 'Thông báo',
        openTab: 'Mở mục {{tab}}',
        requests: 'Yêu cầu',
        software: 'Phần mềm',
        tabs: 'Điều hướng chính'
      },
      auth: {
        back: 'Quay lại',
        demoNote: 'UF-17 / QĐ-46a: email và mật khẩu nội bộ, không đăng nhập qua nhà cung cấp ngoài. Dữ liệu giả lập.',
        email: 'Email công ty',
        emailPlaceholder: 'ten@company.tech',
        forgotPassword: 'Quên mật khẩu?',
        login: 'Đăng nhập',
        loginTitle: 'Đăng nhập tài khoản nội bộ',
        password: 'Mật khẩu',
        passwordPlaceholder: 'Nhập mật khẩu',
        recovery: {
          backToLogin: 'Về đăng nhập',
          done: {
            description: 'Mật khẩu giả lập đã được cập nhật. Bạn có thể quay lại đăng nhập.',
            title: 'Đã cập nhật mật khẩu'
          },
          email: {
            description: 'Nhập email công ty để nhận hướng dẫn đặt lại mật khẩu.',
            title: 'Đặt lại mật khẩu'
          },
          newPassword: 'Mật khẩu mới',
          openLink: 'Mở liên kết đặt lại giả lập',
          resetButton: 'Đặt mật khẩu mới',
          send: 'Gửi hướng dẫn',
          sent: {
            description:
              'Nếu email khớp với tài khoản, hướng dẫn đặt lại sẽ được gửi. Phản hồi này giống nhau với mọi địa chỉ.',
            title: 'Kiểm tra email'
          },
          passwordStep: {
            description: 'Chọn mật khẩu mới cho tài khoản nội bộ.',
            title: 'Tạo mật khẩu mới'
          }
        }
      },
      home: {
        capabilitiesHeading: 'Phạm vi Mobile',
        capabilities: {
          myRequests: {
            title: 'Phần mềm và yêu cầu của tôi',
            description:
              'Nhân viên xem phần mềm, yêu cầu của mình và gửi hoặc rút yêu cầu đơn giản cho phần mềm đã có trong danh mục.'
          },
          needApproval: {
            title: 'Duyệt nhu cầu',
            description: 'Trưởng phòng quyết định bước duyệt nhu cầu cho yêu cầu của phòng mình.'
          },
          spendApproval: {
            title: 'Duyệt chi',
            description:
              'Người duyệt chi quyết định từng mục trên snapshot ngân sách chỉ đọc, đồng thời duyệt bước nhu cầu khi trưởng phòng tự gửi yêu cầu.'
          },
          inbox: {
            title: 'Hộp thông báo trong ứng dụng',
            description: 'Người dùng xem cập nhật quy trình trong ứng dụng, không dùng thông báo đẩy.'
          }
        },
        contractNote:
          'Đây là bốn tác vụ mobile của BRD 3.53. OpenAPI hiện chỉ có endpoint trạng thái hệ thống nên các thao tác nghiệp vụ chưa được kết nối.',
        description: 'Ứng dụng native iOS và Android cho bốn luồng được xác định trong BRD.',
        openEmployeeDemo: 'Mở demo nhân viên',
        title: 'SaaS-Sentry trên di động'
      },
      inbox: {
        demoNote: 'Thông báo giả lập · không có thông báo đẩy',
        items: {
          approved: {
            body: 'Nhu cầu của yêu cầu {{requestId}} đã được duyệt. Finance đang rà soát; yêu cầu chưa vào hàng đợi Người duyệt chi.',
            title: 'Nhu cầu đã được duyệt'
          },
          expired: {
            body: 'Giấy phép {{software}} đã hết hạn.',
            title: 'Giấy phép đã hết hạn'
          },
          ready: {
            body: 'Yêu cầu {{requestId}} cho {{software}} đã được duyệt và sẵn sàng để IT bắt đầu cấp phát.',
            title: 'Sẵn sàng cấp phát'
          },
          rejected: {
            title: 'Yêu cầu bị từ chối'
          }
        },
        openNotification: 'Mở thông báo về {{software}}',
        read: 'Đã đọc',
        title: 'Thông báo',
        unread: 'Chưa đọc · {{count}}'
      },
      licenses: {
        accessTypes: {
          licenseKey: 'Khóa bản quyền (K4)',
          workspaceSeat: 'Workspace seat'
        },
        back: 'Quay lại phần mềm của tôi',
        categories: {
          all: 'Tất cả',
          design: 'Thiết kế',
          development: 'Lập trình',
          productivity: 'Năng suất'
        },
        detail: {
          account: 'Tài khoản công ty',
          email: 'Email công ty',
          key: 'Khóa bản quyền',
          keyMasked: 'Khóa bản quyền đã che',
          noPassword: 'Ứng dụng không hiển thị mật khẩu.',
          status: 'Trạng thái',
          workspace: 'Workspace'
        },
        demoData: 'Dữ liệu minh họa · chưa kết nối tài khoản thật',
        empty: 'Không tìm thấy phần mềm trong danh mục này.',
        activeCount: '{{count}} phần mềm',
        expiringCount: '{{count}} mục',
        employeeDepartment: 'CC-TECH',
        employeeName: 'Nguyễn Văn A',
        employeeRole: 'Product Dev',
        openSoftware: 'Mở chi tiết {{name}}',
        securityNote: 'Mỗi người một tài khoản công ty / seat riêng. Không chia sẻ thông tin đăng nhập (QĐ-75).',
        screenTitle: 'Phần mềm của tôi',
        screenSubtitle: 'Phần mềm và quyền truy cập do công ty cấp',
        status: {
          active: 'Đang hiệu lực',
          expiring: 'Còn {{days}} ngày'
        },
        summary: {
          active: 'Đang hiệu lực',
          expiring: 'Sắp hết hạn'
        }
      },
      requests: {
        back: 'Quay lại',
        backToSoftware: 'Về phần mềm của tôi',
        annualCost: '{{amount}} VNĐ/năm',
        catalogCount: '{{count}} mục',
        catalogEmptyDescription: 'Thử tên phần mềm khác hoặc xóa nội dung tìm kiếm.',
        catalogEmptyTitle: 'Không tìm thấy phần mềm',
        catalogFilters: 'Lọc danh mục phần mềm',
        catalogHint: 'Chọn công cụ đã có trong danh mục của công ty.',
        catalogSubtitle: 'Chọn phần mềm trong danh mục và mô tả nhu cầu sử dụng.',
        categories: {
          ai: 'Công cụ AI',
          productivity: 'Năng suất'
        },
        cancel: 'Giữ yêu cầu',
        chooseCatalogTool: 'Chọn phần mềm trong danh mục',
        chooseTool: 'Chọn {{name}}',
        confirm: 'Xác nhận rút',
        confirmWithdraw: 'Rút yêu cầu {{id}}?',
        cost: '{{amount}} VNĐ',
        createNew: 'Tạo yêu cầu phần mềm',
        continue: 'Tiếp tục',
        detailsSubtitle: 'Chọn thời hạn và nêu nhu cầu công việc.',
        detailsTitle: 'Thông tin yêu cầu',
        demoData: 'Dữ liệu minh họa · thao tác chỉ lưu trong phiên này',
        duration: '{{months}} tháng',
        durationDefault: 'Thời hạn chuẩn',
        durationExtended: 'Thời hạn mở rộng',
        durationHint: 'Chọn 12 hoặc 18 tháng.',
        durationLabel: 'Thời hạn đề nghị',
        edit: 'Chỉnh sửa',
        estimatedCost: 'Số tiền dự kiến',
        errors: {
          reasonRequired: 'Hãy nhập lý do nghiệp vụ cho phần mềm ngoài bộ công cụ chuẩn.'
        },
        financeReview: 'Finance rà soát',
        filters: {
          all: 'Tất cả',
          outside: 'Ngoài bộ chuẩn',
          standard: 'Bộ công cụ chuẩn'
        },
        kicker: 'Yêu cầu của nhân viên',
        managerName: 'Lê Hoàng',
        longTermWarning: 'OI-07a · Yêu cầu trên 12 tháng cần rà soát bổ sung.',
        newTitle: 'Yêu cầu phần mềm mới',
        noDemoQuote: 'Chưa có báo giá minh họa',
        noMobileBatch: 'Mobile không trình lô. Khi áp dụng, trưởng phòng có thể trình lô trên web.',
        noBudgetCode: 'Không hiện mã kiểm tra ngân sách hay số dư. Không rút đơn đã kết thúc.',
        notices: {
          financeReview: 'Finance đang rà soát. Yêu cầu chưa vào hàng đợi Người duyệt chi.',
          longTerm: 'OI-07a · Yêu cầu 18 tháng; cần rà soát bổ sung.',
          submittedWeb: 'Lê Hoàng đã trình lô duyệt chi trên web.'
        },
        rejectedBy: 'Từ chối bởi trưởng phòng {{name}} · {{date}}',
        rejectionReasons: {
          adobeBudgetOptimized: 'Ngân sách phòng quý này đã tối ưu. Dùng Figma Pro hoặc Canva Team trong bộ chuẩn.'
        },
        openRequest: 'Mở yêu cầu {{id}} cho {{name}}',
        outOfStandard: 'Ngoài bộ công cụ chuẩn',
        outOfStandardReason: 'Phần mềm ngoài bộ chuẩn cần có lý do nghiệp vụ.',
        personalOnly: 'Yêu cầu mobile chỉ dành cho quyền truy cập của chính bạn.',
        planReference: 'Mã dòng kế hoạch',
        possibleSteps:
          'Các bước có thể có: duyệt nhu cầu, trình lô trên web khi áp dụng, Finance rà soát khi cần, duyệt chi khi cần và IT cấp phát. Tuyến thực tế tùy từng yêu cầu.',
        possibleStepsTitle: 'Các bước có thể cần duyệt',
        personalAccess: 'Cho quyền truy cập của tôi',
        progress: 'Tiến trình yêu cầu: bước {{current}}/{{total}}',
        reasonOptional: 'Không bắt buộc với phần mềm trong bộ công cụ chuẩn.',
        reasonLabel: 'Lý do nghiệp vụ',
        reasonPlaceholder: 'Mô tả phần mềm hỗ trợ công việc của bạn như thế nào',
        review: 'Xem lại yêu cầu',
        reviewSubtitle: 'Kiểm tra thông tin trước khi gửi yêu cầu.',
        reviewTitle: 'Xem lại trước khi gửi',
        requestFor: 'Yêu cầu cho',
        searchCatalog: 'Tìm phần mềm',
        selectedTool: 'Phần mềm đã chọn',
        standardTool: 'Bộ công cụ chuẩn',
        steps: {
          catalog: 'Danh mục',
          details: 'Thông tin',
          review: 'Xem lại'
        },
        summaryTitle: 'Tóm tắt yêu cầu',
        status: {
          awaitingExecution: 'Chờ IT thực thi',
          awaitingManagerSubmission: 'Chờ trưởng phòng trình',
          awaitingNeed: 'Chờ duyệt nhu cầu',
          completed: 'Hoàn tất',
          executing: 'Đang thực thi · không thể rút',
          financeReview: 'Finance rà soát',
          provisioningFailed: 'Cấp phát lỗi',
          rejected: 'Từ chối',
          spendApproval: 'Chờ duyệt chi',
          waitingInvitation: 'Chờ chấp nhận lời mời',
          withdrawn: 'Đã rút'
        },
        submit: 'Gửi yêu cầu',
        submittedWeb: 'Đã trình trên web',
        changeTool: 'Thay đổi',
        catalog: {
          descriptions: {
            claude: 'Không gian AI hỗ trợ phân tích, viết nội dung và lập trình.',
            raycast: 'Trình khởi chạy công cụ và thao tác thường dùng trong công việc.'
          }
        },
        timeline: {
          awaitingExecution: 'IT chưa bắt đầu cấp phát',
          created: 'Đã gửi yêu cầu',
          executionStarted: 'IT đã bắt đầu cấp phát',
          financeReview: 'Bắt đầu rà soát Finance',
          needApproved: 'Đã duyệt nhu cầu',
          needReviewPending: 'Đang chờ duyệt nhu cầu',
          rejected: 'Trưởng phòng đã từ chối yêu cầu',
          spendReviewPending: 'Đang chờ quyết định duyệt chi',
          submittedWeb: 'Lê Hoàng đã trình lô trên web',
          withdrawn: 'Đã rút yêu cầu'
        },
        timelineTitle: 'Tiến trình yêu cầu',
        title: 'Yêu cầu của tôi',
        withdraw: 'Rút yêu cầu',
        withdrawPolicy:
          'Rút khi đang chờ duyệt, chờ thực thi, cấp phát lỗi hoặc chờ lời mời. Không rút khi đang thực thi hoặc đã xong. Hàng đợi là việc được giao, không phải toàn bộ phạm vi xem.',
        withdrawNamed: 'Rút yêu cầu {{id}}',
        withdrawResult: 'Yêu cầu sẽ được chuyển sang trạng thái Đã rút trong bản demo.',
        withdrawn: 'Đã rút',
        standard: 'Bộ công cụ chuẩn'
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
