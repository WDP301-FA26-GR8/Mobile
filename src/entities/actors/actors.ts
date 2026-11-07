export const demoActors = {
  employee: {
    id: 'employee',
    name: 'An Nguyễn',
    email: 'an.nguyen@company.com',
    department: 'Phòng Kỹ thuật'
  },
  manager: {
    id: 'manager',
    name: 'Trần Minh',
    email: 'tran.minh@company.com',
    department: 'Phòng Kỹ thuật'
  },
  approver: {
    id: 'approver',
    name: 'Lê Hoa',
    email: 'le.hoa@company.com',
    department: 'Ban điều hành'
  }
} as const

export type PersonaId = keyof typeof demoActors
export type DemoActor = (typeof demoActors)[PersonaId]
