import { View, StyleSheet } from 'react-native';
import { Color } from '../constants/theme';

export default function Divididor() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Color.border,
  },
});
