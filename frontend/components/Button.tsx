// Button.tsx
import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  )
}

export default Button