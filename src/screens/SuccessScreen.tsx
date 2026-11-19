import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Success">;

export default function SuccessScreen({ navigation, route }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Idade verificada</Text>
        <Text style={styles.subtitle}>Pedido liberado para compra.</Text>
        <Pressable style={styles.button} onPress={() => navigation.popToTop()}>
          <Text style={styles.buttonText}>Voltar para seleção</Text>
        </Pressable>
        <Text style={styles.requestId}>requestId: {route.params.requestId}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#16A34A" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  icon: { fontSize: 80, fontWeight: "900", color: "#FFF" },
  title: { fontSize: 34, fontWeight: "900", color: "#FFF", marginTop: 32 },
  subtitle: { fontSize: 18, color: "#D1FAE5", marginTop: 8 },
  button: { marginTop: 48, backgroundColor: "#FFF", padding: 16, borderWidth: 3, borderColor: "#000" },
  buttonText: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  requestId: { position: "absolute", bottom: 24, fontSize: 11, color: "#FFF" },
});