import { StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Text, Input, InputProps } from '@ui-kitten/components';
import { Color } from '../constants/theme';

interface CampoProps extends InputProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Campo({
  label,
  style,
  textStyle,
  ...inputProps
}: CampoProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Input
        size="large"
        status="basic"
        style={[styles.input, style]}
        textStyle={[styles.inputText, textStyle]}
        placeholderTextColor={Color.secondaryText}
        {...inputProps}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Color.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Color.inputBackground,
    borderRadius: 15,
    borderColor: Color.border,
    marginBottom: 23,
  },
  inputText: {
    fontSize: 14,
    color: Color.text,
  },
});