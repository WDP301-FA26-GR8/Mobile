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
        description:
          'The current BRD defines Web as the MVP. This client remains buildable for research without creating a production-scope dependency.',
        foundationHeading: 'Architecture foundations',
        foundations: {
          api: 'Orval generates the API client from OpenAPI',
          query: 'TanStack Query owns server state',
          router: 'Expo Router only owns navigation'
        },
        title: 'The Mobile foundation is ready for the research phase.'
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
        description:
          'BRD hiện xác định Web là MVP. Client này giữ cấu trúc buildable để nghiên cứu mà không tạo phụ thuộc cho phạm vi production.',
        foundationHeading: 'Nền tảng kiến trúc',
        foundations: {
          api: 'Orval sinh API client từ OpenAPI',
          query: 'TanStack Query quản lý server state',
          router: 'Expo Router chỉ quản lý điều hướng'
        },
        title: 'Nền tảng Mobile đã sẵn sàng cho giai đoạn nghiên cứu.'
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
