import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import type { ReactElement } from 'react'

import { ChangePasswordScreen, ForgotPasswordScreen, SetPasswordScreen } from '@/features/auth'
import { authRedeemInvitation, authRequestPasswordReset, authResetPassword } from '@/shared/api/generated/api/auth/auth'
import { meChangePassword } from '@/shared/api/generated/api/me/me'
import { setAppLanguage } from '@/shared/i18n/i18n'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) }
const mockSession = {
  state: 'authenticated',
  write: <T,>(operation: (token: string) => Promise<T>) => operation('test-token'),
  endLocally: jest.fn(async () => undefined)
}
jest.mock('expo-router', () => ({ Redirect: () => null, useRouter: () => mockRouter }))
jest.mock('@/shared/api/session-context', () => ({ useSession: () => mockSession }))
jest.mock('@/shared/api/generated/api/auth/auth', () => ({
  authRedeemInvitation: jest.fn(),
  authRequestPasswordReset: jest.fn(),
  authResetPassword: jest.fn()
}))
jest.mock('@/shared/api/generated/api/me/me', () => ({ meChangePassword: jest.fn() }))

const strong = 'correct horse battery'

function renderScreen(element: ReactElement) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(<QueryClientProvider client={client}>{element}</QueryClientProvider>)
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
  jest.clearAllMocks()
})

test('forgot password shows the same notice after any email', async () => {
  jest.mocked(authRequestPasswordReset).mockResolvedValue({} as never)
  const screen = await renderScreen(<ForgotPasswordScreen />)
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi liên kết đặt lại' }))
  screen.getByText('Hãy nhập email công việc.')
  expect(authRequestPasswordReset).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Email công ty'), 'a@b.vn')
  await fireEvent.press(screen.getByRole('button', { name: 'Gửi liên kết đặt lại' }))
  await screen.findByText(/liên kết đặt lại đã được gửi/)
  expect(authRequestPasswordReset).toHaveBeenCalledWith({ email: 'a@b.vn' })
})

test('set password validates before calling the server and redeems the invitation', async () => {
  jest.mocked(authRedeemInvitation).mockResolvedValue({} as never)
  const screen = await renderScreen(<SetPasswordScreen purpose='invitation' token='token-123456' />)
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), 'short')
  await fireEvent.press(screen.getByRole('button', { name: 'Lưu mật khẩu' }))
  screen.getByText('Mật khẩu phải có từ 12 đến 128 ký tự.')
  expect(authRedeemInvitation).not.toHaveBeenCalled()
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), strong)
  await fireEvent.changeText(screen.getByLabelText('Nhập lại mật khẩu mới'), strong)
  await fireEvent.press(screen.getByRole('button', { name: 'Lưu mật khẩu' }))
  await screen.findByText(/Tài khoản đã được kích hoạt/)
  expect(authRedeemInvitation).toHaveBeenCalledWith({ token: 'token-123456', password: strong })
})

test('reset uses the reset endpoint and an invalid link offers a new one', async () => {
  jest
    .mocked(authResetPassword)
    .mockRejectedValue({ status: 400, info: { error: { code: 'AUTH.PASSWORD_RESET_INVALID' } } })
  const screen = await renderScreen(<SetPasswordScreen purpose='reset' token='token-123456' />)
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), strong)
  await fireEvent.changeText(screen.getByLabelText('Nhập lại mật khẩu mới'), strong)
  await fireEvent.press(screen.getByRole('button', { name: 'Lưu mật khẩu' }))
  await screen.findByText('Liên kết đặt lại không còn dùng được. Hãy yêu cầu liên kết mới.')
  expect(authResetPassword).toHaveBeenCalledWith({ token: 'token-123456', newPassword: strong })
})

test('a missing token shows the invalid link state', async () => {
  const screen = await renderScreen(<SetPasswordScreen purpose='invitation' token={undefined} />)
  screen.getByText(/Liên kết kích hoạt không còn dùng được/)
})

test('change password ends the local session after success', async () => {
  jest.mocked(meChangePassword).mockResolvedValue({} as never)
  const screen = await renderScreen(<ChangePasswordScreen />)
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu hiện tại'), 'old password value')
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), strong)
  await fireEvent.changeText(screen.getByLabelText('Nhập lại mật khẩu mới'), strong)
  await fireEvent.press(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
  await waitFor(() => expect(mockSession.endLocally).toHaveBeenCalled())
  expect(meChangePassword).toHaveBeenCalledWith(
    { currentPassword: 'old password value', newPassword: strong },
    expect.anything()
  )
})

test('change password maps an incorrect current password to its field', async () => {
  jest.mocked(meChangePassword).mockRejectedValue({
    status: 422,
    info: { error: { code: 'AUTH.CURRENT_PASSWORD_INVALID', requestId: 'req-1' } }
  })
  const screen = await renderScreen(<ChangePasswordScreen />)
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu hiện tại'), 'wrong password value')
  await fireEvent.changeText(screen.getByLabelText('Mật khẩu mới'), strong)
  await fireEvent.changeText(screen.getByLabelText('Nhập lại mật khẩu mới'), strong)
  await fireEvent.press(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
  await screen.findByText('Mật khẩu hiện tại không đúng.')
  expect(mockSession.endLocally).not.toHaveBeenCalled()
})
