import { fireEvent, render } from '@testing-library/react-native'

import { AppButton } from './app-button'

describe('<AppButton />', () => {
  test('does not call onPress while disabled', async () => {
    const onPress = jest.fn()
    const label = 'Lưu'
    const screen = await render(<AppButton disabled label={label} onPress={onPress} />)

    await fireEvent.press(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button').props.accessibilityState).toEqual({ disabled: true })
  })
})
