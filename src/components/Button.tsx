import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ title, variant = 'primary', style, ...props }: ButtonProps) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'outline' && styles.outlineText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  outlineText: {
    color: colors.primary,
  },
});
