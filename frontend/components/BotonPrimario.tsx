import { Button, type ButtonProps } from '@ui-kitten/components';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Color } from '../constants/theme';

interface BotonPrimarioProps extends ButtonProps {
  style?: StyleProp<ViewStyle>;
}

export default function BotonPrimario({
  style,
  ...buttonProps
}: BotonPrimarioProps) {
  return (
    <Button
      size="giant"
      style={[styles.button, style]}
      {...buttonProps}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    height: 55,
    backgroundColor: Color.primary,
    borderColor: Color.primary,
    shadowColor: Color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 4,
  },
});