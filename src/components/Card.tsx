import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
