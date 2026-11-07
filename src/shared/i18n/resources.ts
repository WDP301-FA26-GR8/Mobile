export const resources = {
  en: {
    translation: {
      common: {
        brand: 'SAAS-SENTRY MOBILE',
        language: {
          english: 'English',
          englishShort: 'EN',
          selector: 'Language',
          switchTo: 'Switch to {{language}}',
          vietnamese: 'Vietnamese',
          vietnameseShort: 'VI'
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
        title: 'SaaS-Sentry on mobile'
      }
    }
  },
  vi: {
    translation: {
      common: {
        brand: 'SAAS-SENTRY MOBILE',
        language: {
          english: 'Tiếng Anh',
          englishShort: 'EN',
          selector: 'Ngôn ngữ',
          switchTo: 'Chuyển sang {{language}}',
          vietnamese: 'Tiếng Việt',
          vietnameseShort: 'VI'
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
        title: 'SaaS-Sentry trên di động'
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
