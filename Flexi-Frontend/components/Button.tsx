// Button.tsx
import { useTextColorClass } from '@/utils/themeUtils'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { CustomText } from './CustomText'

interface ButtonProps {
  title: string
  onPress: () => void
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <CustomText className={`${useTextColorClass()}`}>{title}</CustomText>
    </TouchableOpacity>
  )
}

export default Button