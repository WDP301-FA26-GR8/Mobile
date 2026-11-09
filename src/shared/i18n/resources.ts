export const resources = {
  en: {
    translation: {
      common: {
        brand: 'SAAS-SENTRY MOBILE',
        brandInitial: 'S',
        brandName: 'SaaS-Sentry',
        demo: 'demo',
        demoDecisionError: 'This demo item is no longer available for that action. Please review its current status.',
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
      manager: {
        approveNeed: 'Approve need',
        approvedResult: 'Need approval recorded for {{id}}.',
        backToHome: 'Back to demo home',
        backToQueue: 'Back to department queue',
        budgetLink: 'Budget plan',
        businessReason: 'Business reason',
        cancel: 'Cancel',
        confirmApproval: 'Confirm need approval',
        confirmRejection: 'Confirm rejection',
        closeRejectSheet: 'Close rejection form',
        department: 'Department',
        departmentVisibleCount: 'Department-visible items',
        departmentVisibilityHint: 'Visible for context, but not assigned to your approval queue.',
        departmentVisibilityTitle: 'Department visibility · not assigned',
        demoActionNote: 'Demo only · this action stays in this session and is not sent to an API.',
        demoNote: 'Static demo data · SLA values are illustrative snapshots.',
        detailSubtitle: 'Review the work context and request conditions before deciding.',
        duration: '{{months}} months',
        durationLabel: 'Requested duration',
        emptyQueue: 'No requests are waiting for your decision.',
        emptyQueueHint: 'Completed demo decisions are removed from the assigned queue.',
        emptySearch: 'No requests match these filters.',
        emptySearchHint: 'Try a different employee, software name or request flag.',
        filters: {
          all: 'All',
          label: 'Filter department requests',
          longTerm: 'Over 12 months',
          outsideStandard: 'Outside standard'
        },
        initials: 'LH',
        kicker: 'Department head · demo',
        longTermConfirmation: 'I confirm this request is genuinely needed for more than 12 months for the project.',
        longTermFlag: 'OI-07a · Over 12 months',
        longTermNoticeBody:
          'Requests over 12 months need additional review (OI-07a). Confirm the extended need before approval.',
        longTermNoticeTitle: 'Extended duration review',
        managerMeta: 'Department head · CC-TECH',
        managerName: 'Lê Hoàng',
        assignedCount: 'Assigned to you',
        openRequest: 'Review request {{id}} for {{software}}',
        outsideStandard: 'Outside standard',
        outsideStandardDetail: 'Outside the standard toolset · the requester provided a business reason.',
        plannedBudget: 'Plan line {{plan}}',
        planUnavailable: 'Budget plan not provided in this demo',
        queueHint: 'Only requests assigned to the department head appear in this queue.',
        queueTitle: 'Assigned need approvals',
        requesterTitle: 'Employee and department context',
        reasons: {
          claude:
            'Development and research work needs an AI workspace for the requested 18-month period (demo reason).',
          raycast: 'The employee needs a productivity launcher for daily engineering workflows (demo reason).'
        },
        reject: 'Reject',
        rejectDescription: 'A rejection reason is required and will appear in the demo decision record.',
        rejectReasonLabel: 'Rejection reason',
        rejectReasonLength: '{{count}} / 10 characters minimum',
        rejectReasonPlaceholder: 'Explain why the business need is not approved',
        rejectTitle: 'Reject need',
        rejectedResult: 'Request {{id}} rejected in this demo.',
        rejectionSuggestions: {
          cost: 'The cost is not suitable for this project at this time.',
          projectTiming: 'The project has not reached the stage where this tool is needed.',
          standardAlternative: 'A suitable alternative is already available in the standard toolset.'
        },
        searchLabel: 'Search by employee, software or request ID',
        searchPlaceholder: 'Search department requests',
        slaRemainingDays: 'SLA · {{days}}d {{hours}}h remaining',
        slaRemainingHours: 'SLA · {{hours}}h remaining',
        slaTitle: 'Service-level target',
        slaUnavailable: 'SLA not provided in this demo',
        employeeVisibilityNote: 'Visible within your department; this item is not assigned to the need approval queue.',
        standardUnknown: 'Standard status not provided',
        statusUnavailable: 'Demo status unavailable',
        reasonUnavailable: 'No business reason provided in this demo.',
        standardTool: 'Standard toolset',
        subtitle: 'Review your department’s software needs and take assigned actions.',
        suggestionsTitle: 'Suggested reasons',
        tabs: {
          department: 'Department',
          queue: 'Queue'
        },
        title: 'Need approval queue',
        unplannedBudget: 'Outside the approved plan · demo',
        visibility: {
          otherApproved: {
            label: 'Need approved · department view',
            note: 'Need approval was recorded in this demo.'
          },
          otherRejected: {
            label: 'Rejected · department view',
            note: 'The manager rejected this need in this demo.'
          },
          needApproved: {
            label: 'Need approved · department view',
            note: 'The spending approver approved this self-request’s need step. Subsequent steps are not simulated.'
          },
          rejected: {
            label: 'Rejected · department view',
            note: 'The spending approver rejected this self-request’s need step.'
          },
          withdrawn: {
            label: 'Withdrawn · department view',
            note: 'The employee withdrew this request.'
          },
          financeReview: {
            label: 'Finance review · department view',
            note: 'Visible within your department. Finance is reviewing this request; it is not in the spending approver queue.'
          },
          selfRequest: {
            label: 'SoD-4 · self-request',
            note: 'This is the manager’s own request. Need review is routed to the spending approver; no manager decision is available here.'
          }
        }
      },
      spending: {
        annualCost: '{{amount}} VND/year',
        annualCostLabel: 'Annual cost',
        amountVnd: '{{amount}} VND',
        approveNeed: 'Approve need step',
        approveSpending: 'Approve spending',
        approverHeaderMeta: 'Spending approver · CC-TECH',
        approverInitials: 'TB',
        approverName: 'Trần Quốc Bảo',
        assignedCount: 'Assigned items',
        availableAfter: 'Available after decision',
        availableBefore: 'Available before decision',
        backToHome: 'Back to demo home',
        backToQueue: 'Back to spending queue',
        budgetLimit: 'Budget limit',
        budgetPlan: 'Budget plan line',
        cancel: 'Cancel',
        closeDecisionSheet: 'Close decision form',
        committed: 'Spent and committed',
        confirmOverride: 'Confirm override',
        confirmRejection: 'Confirm rejection',
        department: 'Cost center',
        demoActionNote: 'Demo only · this action stays in this session and is not sent to an API.',
        demoNote: 'Static demo values · budget snapshot and SLA are illustrative; amounts are not live.',
        decisionStatus: {
          approved: 'Approved',
          override: 'Override',
          rejected: 'Rejected'
        },
        emptyQueue: 'No spending tasks are assigned to you.',
        emptyQueueHint: 'Completed demo decisions are removed from this queue.',
        emptySearch: 'No items match these filters.',
        emptySearchHint: 'Try a different software name or request ID.',
        filters: {
          all: 'All',
          label: 'Filter assigned tasks',
          need: 'Need step',
          spending: 'Spending step'
        },
        historyEmpty: 'No demo decisions have been recorded yet.',
        historyHint: 'Completed demo actions are shown here for this session only.',
        historyTitle: 'Recent decisions',
        kicker: 'Individual decisions · no batch submission',
        needStep: 'Need step',
        needStepCount: 'Need approval steps',
        noDemoQuote: 'No demo quote provided',
        notCalculated: 'Not calculated · no demo quote',
        openRequest: 'Review {{id}} for {{software}}',
        overrideDescription:
          'This demo item requires an approver override. Enter a reason before recording the decision.',
        overrideReasonDescription: 'A reason is required to record this override in the demo.',
        overrideReasonTitle: 'Override reason',
        overrideRequired: 'Reason required for override',
        overrideTitle: 'Approver override required',
        queueHint: 'Only assigned need or spending decisions appear here. Finance review is not a mobile task.',
        queueTitle: 'Assigned decisions',
        reasonLabel: 'Decision reason',
        reasonLength: '{{count}} / 10 characters minimum',
        reasonPlaceholder: 'Write the reason for this decision',
        reject: 'Reject',
        rejectDescription: 'A rejection reason is required to record this demo decision.',
        rejectTitle: 'Reject request',
        requestContext: 'Request context',
        requestId: 'Request ID',
        results: {
          approved: 'Decision recorded for {{id}}.',
          override: 'Override decision recorded for {{id}}.',
          rejected: 'Rejection recorded for {{id}}.'
        },
        searchLabel: 'Search software, cost center or request ID',
        searchPlaceholder: 'Search assigned tasks',
        slaRemainingDays: 'SLA · {{days}}d {{hours}}h remaining',
        slaRemainingHours: 'SLA · {{hours}}h remaining',
        slaTitle: 'Service-level target',
        snapshotAccessibleLabel: 'Read-only budget snapshot',
        snapshotReadOnly: 'Reference data · cannot be edited on mobile',
        snapshotStatus: 'Budget reference status',
        snapshotTitle: 'Budget snapshot',
        sodNeedStepNotice:
          'This is the manager’s own request. SoD-4 assigns the need step to you as Spending Approver; the manager cannot approve their own request.',
        sodTag: 'SoD-4 · self-request',
        sodTitle: 'Separation of duties',
        spendingStep: 'Spending step',
        readOnly: 'Read-only',
        reason: 'Reason',
        subtitle: 'Review each assigned item and its read-only budget context.',
        tabs: {
          history: 'History',
          queue: 'Approvals'
        },
        title: 'Spending approval queue',
        withinBudget: 'Within budget · reference only'
      },
      inbox: {
        approverEmpty: 'No demo notifications are available for this role yet.',
        demoNote: 'Demo notifications only · no push notifications',
        items: {
          assignedNeed: {
            body: 'Request {{requestId}} was submitted for need review.',
            title: 'New need review'
          },
          withdrawn: {
            body: 'Request {{requestId}} was withdrawn by the employee.',
            title: 'Request withdrawn'
          },
          otherNeedApproved: {
            body: 'The need step for request {{requestId}} was approved by the spending approver.',
            title: 'Need approved'
          },
          otherRejected: {
            title: 'Need rejected'
          },
          needApproved: {
            body: 'The need for request {{requestId}} was approved and moved to manager submission on the web.',
            title: 'Need approved'
          },
          spendApproved: {
            body: 'Spending was approved for request {{requestId}} and it moved to waiting for IT.',
            title: 'Spending approved'
          },
          approved: {
            body: 'The need for request {{requestId}} was approved and then sent for Finance review.',
            title: 'Need approved'
          },
          expired: {
            body: 'The {{software}} license has expired.',
            title: 'License expired'
          },
          ready: {
            body: 'Request {{requestId}} for {{software}} was ready for IT to start provisioning.',
            title: 'Ready to provision'
          },
          rejected: {
            title: 'Request rejected'
          }
        },
        openNotification: 'Open notification about {{software}}',
        reasonUnavailable: 'The demo rejection reason is unavailable.',
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
        filterLabel: 'Filter software',
        kicker: 'Employee workspace · demo',
        listFilters: {
          all: 'All software',
          expiring: 'Expiring'
        },
        listTitle: 'Your software',
        noExpiring: 'No software is marked as expiring in this demo.',
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
        listKicker: 'Employee workspace · demo',
        listSubtitle: 'Track your requests and review their current status.',
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
        rejectedBySpending: 'Rejected by spending approver {{name}} · {{date}}',
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
          rejected: 'Request rejected',
          spendApproved: 'Spending approved',
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
        demoDecisionError: 'Yêu cầu demo không còn hợp lệ cho thao tác này. Vui lòng xem lại trạng thái hiện tại.',
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
      manager: {
        approveNeed: 'Duyệt nhu cầu',
        approvedResult: 'Đã ghi nhận duyệt nhu cầu cho {{id}}.',
        backToHome: 'Về trang demo',
        backToQueue: 'Về hàng đợi phòng ban',
        budgetLink: 'Kế hoạch ngân sách',
        businessReason: 'Lý do nghiệp vụ',
        cancel: 'Hủy',
        confirmApproval: 'Xác nhận duyệt nhu cầu',
        confirmRejection: 'Xác nhận từ chối',
        closeRejectSheet: 'Đóng biểu mẫu từ chối',
        department: 'Phòng ban',
        departmentVisibleCount: 'Mục phòng ban có thể xem',
        departmentVisibilityHint: 'Có thể xem để nắm tình hình nhưng không được giao cho bạn xử lý.',
        departmentVisibilityTitle: 'Phạm vi phòng ban · không được giao',
        demoActionNote: 'Chỉ là demo · thao tác lưu trong phiên này, chưa gửi lên API.',
        demoNote: 'Dữ liệu tĩnh · SLA là ảnh chụp minh họa.',
        detailSubtitle: 'Xem bối cảnh công việc và điều kiện yêu cầu trước khi quyết định.',
        duration: '{{months}} tháng',
        durationLabel: 'Thời hạn đề nghị',
        emptyQueue: 'Không có yêu cầu đang chờ bạn quyết định.',
        emptyQueueHint: 'Yêu cầu đã xử lý trong demo được gỡ khỏi hàng đợi được giao.',
        emptySearch: 'Không có yêu cầu khớp bộ lọc.',
        emptySearchHint: 'Thử tên nhân viên, phần mềm hoặc cờ yêu cầu khác.',
        filters: {
          all: 'Tất cả',
          label: 'Lọc yêu cầu phòng ban',
          longTerm: 'Trên 12 tháng',
          outsideStandard: 'Ngoài bộ chuẩn'
        },
        initials: 'LH',
        kicker: 'Trưởng phòng · demo',
        longTermConfirmation: 'Tôi xác nhận nhu cầu này thực sự cần thiết kéo dài trên 12 tháng cho dự án.',
        longTermFlag: 'OI-07a · Trên 12 tháng',
        longTermNoticeBody:
          'Yêu cầu trên 12 tháng cần rà soát bổ sung (OI-07a). Hãy xác nhận nhu cầu kéo dài trước khi duyệt.',
        longTermNoticeTitle: 'Rà soát thời hạn dài',
        managerMeta: 'Trưởng phòng · CC-TECH',
        managerName: 'Lê Hoàng',
        assignedCount: 'Được giao cho bạn',
        openRequest: 'Xem yêu cầu {{id}} cho {{software}}',
        outsideStandard: 'Ngoài bộ chuẩn',
        outsideStandardDetail: 'Ngoài bộ công cụ chuẩn · nhân viên đã cung cấp lý do nghiệp vụ.',
        plannedBudget: 'Dòng kế hoạch {{plan}}',
        planUnavailable: 'Chưa có thông tin kế hoạch ngân sách trong demo',
        queueHint: 'Chỉ yêu cầu được giao cho trưởng phòng mới xuất hiện trong hàng đợi này.',
        queueTitle: 'Yêu cầu chờ duyệt nhu cầu',
        requesterTitle: 'Nhân viên và bối cảnh phòng ban',
        reasons: {
          claude: 'Nhu cầu công việc phát triển và nghiên cứu cần workspace AI trong thời hạn 18 tháng (lý do demo).',
          raycast: 'Nhân viên cần công cụ khởi chạy để hỗ trợ quy trình kỹ thuật hằng ngày (lý do demo).'
        },
        reject: 'Từ chối',
        rejectDescription: 'Cần có lý do từ chối; lý do sẽ xuất hiện trong bản ghi quyết định demo.',
        rejectReasonLabel: 'Lý do từ chối',
        rejectReasonLength: '{{count}} / tối thiểu 10 ký tự',
        rejectReasonPlaceholder: 'Giải thích vì sao nhu cầu công việc không được duyệt',
        rejectTitle: 'Từ chối nhu cầu',
        rejectedResult: 'Đã ghi nhận từ chối yêu cầu {{id}} trong demo.',
        rejectionSuggestions: {
          cost: 'Chi phí hiện chưa phù hợp với dự án này.',
          projectTiming: 'Dự án chưa đến giai đoạn cần công cụ này.',
          standardAlternative: 'Bộ công cụ chuẩn đã có phần mềm phù hợp để thay thế.'
        },
        searchLabel: 'Tìm theo nhân viên, phần mềm hoặc mã yêu cầu',
        searchPlaceholder: 'Tìm yêu cầu phòng ban',
        slaRemainingDays: 'SLA · còn {{days}} ngày {{hours}} giờ',
        slaRemainingHours: 'SLA · còn {{hours}} giờ',
        slaTitle: 'Thời hạn xử lý',
        slaUnavailable: 'Chưa có SLA trong dữ liệu demo',
        employeeVisibilityNote: 'Yêu cầu thuộc phạm vi phòng ban; hiện không nằm trong hàng đợi duyệt nhu cầu.',
        standardUnknown: 'Chưa có thông tin bộ chuẩn',
        statusUnavailable: 'Chưa có trạng thái demo',
        reasonUnavailable: 'Dữ liệu demo chưa có lý do nghiệp vụ.',
        standardTool: 'Bộ công cụ chuẩn',
        subtitle: 'Rà soát nhu cầu phần mềm của phòng và xử lý các mục được giao.',
        suggestionsTitle: 'Lý do gợi ý',
        tabs: {
          department: 'Phòng ban',
          queue: 'Hàng đợi'
        },
        title: 'Hàng đợi duyệt nhu cầu',
        unplannedBudget: 'Ngoài kế hoạch đã duyệt · demo',
        visibility: {
          otherApproved: {
            label: 'Đã duyệt nhu cầu · phạm vi phòng',
            note: 'Đã ghi nhận duyệt nhu cầu trong phiên demo.'
          },
          otherRejected: {
            label: 'Đã từ chối · phạm vi phòng',
            note: 'Trưởng phòng đã từ chối nhu cầu trong phiên demo.'
          },
          needApproved: {
            label: 'Đã duyệt nhu cầu · phạm vi phòng',
            note: 'Người duyệt chi đã duyệt bước nhu cầu của yêu cầu tự gửi. Các bước tiếp theo chưa được mô phỏng.'
          },
          rejected: {
            label: 'Đã từ chối · phạm vi phòng',
            note: 'Người duyệt chi đã từ chối bước nhu cầu của yêu cầu tự gửi.'
          },
          withdrawn: {
            label: 'Đã rút · phạm vi phòng',
            note: 'Nhân viên đã rút yêu cầu này.'
          },
          financeReview: {
            label: 'Finance rà soát · phạm vi phòng',
            note: 'Trưởng phòng xem được trong phạm vi phòng ban. Finance đang rà soát; yêu cầu chưa vào hàng đợi Người duyệt chi.'
          },
          selfRequest: {
            label: 'SoD-4 · yêu cầu của chính mình',
            note: 'Đây là yêu cầu của trưởng phòng. Bước duyệt nhu cầu được chuyển cho Người duyệt chi; trưởng phòng không thể tự quyết ở đây.'
          }
        }
      },
      spending: {
        annualCost: '{{amount}} VNĐ/năm',
        annualCostLabel: 'Chi phí năm',
        amountVnd: '{{amount}} VNĐ',
        approveNeed: 'Duyệt bước nhu cầu',
        approveSpending: 'Duyệt chi',
        approverHeaderMeta: 'Duyệt chi · CC-TECH',
        approverInitials: 'TB',
        approverName: 'Trần Quốc Bảo',
        assignedCount: 'Mục được giao',
        availableAfter: 'Khả dụng sau quyết định',
        availableBefore: 'Khả dụng trước quyết định',
        backToHome: 'Về trang demo',
        backToQueue: 'Về hàng đợi duyệt chi',
        budgetLimit: 'Hạn mức ngân sách',
        budgetPlan: 'Dòng kế hoạch ngân sách',
        cancel: 'Hủy',
        closeDecisionSheet: 'Đóng biểu mẫu quyết định',
        committed: 'Đã chi và đã cam kết',
        confirmOverride: 'Xác nhận override',
        confirmRejection: 'Xác nhận từ chối',
        department: 'Cost center',
        demoActionNote: 'Chỉ là demo · thao tác lưu trong phiên này, chưa gửi lên API.',
        demoNote: 'Số liệu tĩnh · snapshot ngân sách và SLA chỉ để minh họa, không phải dữ liệu thật.',
        decisionStatus: {
          approved: 'Đã duyệt',
          override: 'Override',
          rejected: 'Đã từ chối'
        },
        emptyQueue: 'Không có việc duyệt chi được giao cho bạn.',
        emptyQueueHint: 'Quyết định demo đã xử lý sẽ được gỡ khỏi hàng đợi này.',
        emptySearch: 'Không có mục nào khớp bộ lọc.',
        emptySearchHint: 'Thử tên phần mềm hoặc mã yêu cầu khác.',
        filters: {
          all: 'Tất cả',
          label: 'Lọc việc được giao',
          need: 'Bước nhu cầu',
          spending: 'Bước duyệt chi'
        },
        historyEmpty: 'Chưa có quyết định demo nào được ghi nhận.',
        historyHint: 'Các thao tác demo đã xử lý chỉ hiển thị trong phiên này.',
        historyTitle: 'Quyết định gần đây',
        kicker: 'Quyết định từng mục · không trình lô',
        needStep: 'Bước nhu cầu',
        needStepCount: 'Bước duyệt nhu cầu',
        noDemoQuote: 'Chưa có báo giá minh họa',
        notCalculated: 'Chưa tính · không có báo giá demo',
        openRequest: 'Xem {{id}} cho {{software}}',
        overrideDescription: 'Mục demo này cần người duyệt override. Nhập lý do trước khi ghi nhận quyết định.',
        overrideReasonDescription: 'Cần có lý do để ghi nhận override trong demo.',
        overrideReasonTitle: 'Lý do override',
        overrideRequired: 'Override cần lý do',
        overrideTitle: 'Cần người duyệt override',
        queueHint: 'Chỉ có việc duyệt nhu cầu hoặc duyệt chi được giao. Finance không phải tác vụ Mobile.',
        queueTitle: 'Việc được giao',
        reasonLabel: 'Lý do quyết định',
        reasonLength: '{{count}} / tối thiểu 10 ký tự',
        reasonPlaceholder: 'Nhập lý do cho quyết định này',
        reject: 'Từ chối',
        rejectDescription: 'Cần có lý do từ chối để ghi nhận quyết định demo.',
        rejectTitle: 'Từ chối yêu cầu',
        requestContext: 'Thông tin yêu cầu',
        requestId: 'Mã yêu cầu',
        results: {
          approved: 'Đã ghi nhận quyết định cho {{id}}.',
          override: 'Đã ghi nhận quyết định override cho {{id}}.',
          rejected: 'Đã ghi nhận từ chối {{id}}.'
        },
        searchLabel: 'Tìm phần mềm, cost center hoặc mã yêu cầu',
        searchPlaceholder: 'Tìm việc được giao',
        slaRemainingDays: 'SLA · còn {{days}} ngày {{hours}} giờ',
        slaRemainingHours: 'SLA · còn {{hours}} giờ',
        slaTitle: 'Thời hạn xử lý',
        snapshotAccessibleLabel: 'Snapshot ngân sách chỉ đọc',
        snapshotReadOnly: 'Dữ liệu tham khảo · không thể chỉnh sửa trên mobile',
        snapshotStatus: 'Trạng thái tham khảo ngân sách',
        snapshotTitle: 'Snapshot ngân sách',
        sodNeedStepNotice:
          'Đây là yêu cầu của trưởng phòng. SoD-4 giao bước nhu cầu cho bạn với vai trò Người duyệt chi; trưởng phòng không thể tự duyệt yêu cầu của mình.',
        sodTag: 'SoD-4 · yêu cầu của chính mình',
        sodTitle: 'Tách biệt nhiệm vụ',
        spendingStep: 'Bước duyệt chi',
        readOnly: 'Chỉ đọc',
        reason: 'Lý do',
        subtitle: 'Rà soát từng mục được giao cùng bối cảnh ngân sách chỉ đọc.',
        tabs: {
          history: 'Đã xử lý',
          queue: 'Duyệt chi'
        },
        title: 'Hàng đợi duyệt chi',
        withinBudget: 'Trong hạn mức · chỉ để tham khảo'
      },
      inbox: {
        approverEmpty: 'Chưa có thông báo demo cho vai trò này.',
        demoNote: 'Thông báo giả lập · không có thông báo đẩy',
        items: {
          assignedNeed: {
            body: 'Yêu cầu {{requestId}} đã được gửi để duyệt nhu cầu.',
            title: 'Yêu cầu cần duyệt nhu cầu'
          },
          withdrawn: {
            body: 'Nhân viên đã rút yêu cầu {{requestId}}.',
            title: 'Yêu cầu đã rút'
          },
          otherNeedApproved: {
            body: 'Người duyệt chi đã duyệt bước nhu cầu của yêu cầu {{requestId}}.',
            title: 'Nhu cầu đã được duyệt'
          },
          otherRejected: {
            title: 'Nhu cầu bị từ chối'
          },
          needApproved: {
            body: 'Nhu cầu của yêu cầu {{requestId}} đã được duyệt và chuyển sang chờ trưởng phòng trình trên web.',
            title: 'Nhu cầu đã được duyệt'
          },
          spendApproved: {
            body: 'Yêu cầu {{requestId}} đã được duyệt chi và chuyển sang chờ IT.',
            title: 'Đã duyệt chi'
          },
          approved: {
            body: 'Nhu cầu của yêu cầu {{requestId}} đã được duyệt và chuyển sang Finance rà soát.',
            title: 'Nhu cầu đã được duyệt'
          },
          expired: {
            body: 'Giấy phép {{software}} đã hết hạn.',
            title: 'Giấy phép đã hết hạn'
          },
          ready: {
            body: 'Yêu cầu {{requestId}} cho {{software}} đã sẵn sàng để IT bắt đầu cấp phát.',
            title: 'Sẵn sàng cấp phát'
          },
          rejected: {
            title: 'Yêu cầu bị từ chối'
          }
        },
        openNotification: 'Mở thông báo về {{software}}',
        reasonUnavailable: 'Dữ liệu demo chưa có lý do từ chối.',
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
        filterLabel: 'Lọc phần mềm',
        kicker: 'Không gian nhân viên · demo',
        listFilters: {
          all: 'Tất cả',
          expiring: 'Sắp hết hạn'
        },
        listTitle: 'Phần mềm được cấp',
        noExpiring: 'Không có phần mềm nào được đánh dấu sắp hết hạn trong demo.',
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
        listKicker: 'Không gian nhân viên · demo',
        listSubtitle: 'Theo dõi yêu cầu và trạng thái xử lý của bạn.',
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
        rejectedBySpending: 'Từ chối bởi người duyệt chi {{name}} · {{date}}',
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
          rejected: 'Yêu cầu đã bị từ chối',
          spendApproved: 'Đã duyệt chi',
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
