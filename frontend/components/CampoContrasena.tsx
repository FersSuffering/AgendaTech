import { TouchableOpacity, StyleSheet } from 'react-native';
import { InputProps } from '@ui-kitten/components';
import { Icon, Text } from '@ui-kitten/components';
import Campo from './Campo';

interface CampoContrasenaProps extends InputProps {
  label: string;
  onToggleVisibility: () => void;
}

export default function CampoContrasena({
  label,
  secureTextEntry,
  onToggleVisibility,
  ...inputProps
}: CampoContrasenaProps) {
  return (
    <Campo
      label={label}
      secureTextEntry={secureTextEntry}
      accessoryRight={() => (
        <TouchableOpacity onPress={onToggleVisibility}>
          <Icon
            name={secureTextEntry ? 'eye-off' : 'eye'}
            fill="#8F9BB3"
            style={styles.icon}
          />
        </TouchableOpacity>
      )}
      {...inputProps}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
  },
});
