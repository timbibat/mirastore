import React from 'react';
import { View, ViewProps } from 'react-native';
import tw from 'twrnc';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <View style={[tw`bg-white rounded-2xl border border-slate-200 p-4 mb-4`, style]} {...props}>
      {children}
    </View>
  );
};
