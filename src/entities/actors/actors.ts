export const demoActors = {
  employee: {
    id: 'employee',
    name: 'Nguyễn Văn A',
    email: 'nguyen.van.a@company.com',
    department: 'Phòng Kỹ thuật',
    initials: 'VA',
    jobTitle: 'Product Dev',
    departmentLine: 'CC-TECH • Khối Kỹ thuật'
  },
  manager: {
    id: 'manager',
    name: 'Trần Minh',
    email: 'tran.minh@company.com',
    department: 'Phòng Kỹ thuật',
    initials: 'TM',
    jobTitle: 'Department Head',
    departmentLine: 'CC-TECH • Khối Kỹ thuật'
  },
  approver: {
    id: 'approver',
    name: 'Lê Hoa',
    email: 'le.hoa@company.com',
    department: 'Ban điều hành',
    initials: 'LH',
    jobTitle: 'Spending Approver',
    departmentLine: 'Ban điều hành'
  }
} as const

export type PersonaId = keyof typeof demoActors
export type DemoActor = (typeof demoActors)[PersonaId]
