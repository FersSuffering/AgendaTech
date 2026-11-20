import { View, StyleSheet, ViewStyle } from "react-native";
import { Color } from "../constants/theme";

interface TarjetaProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Tarjeta = ({ children, style }: TarjetaProps) => {
  return (
    <View style={[styles.card, style]}>
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.white,
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "#F1EFF7",
    shadowColor: "#5B43A0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 4,
  },
});

export default Tarjeta;