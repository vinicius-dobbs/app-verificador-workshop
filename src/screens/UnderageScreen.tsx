import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Underage">;

export default function UnderageScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>🚫</Text>
        <Text style={styles.title}>Venda não permitida</Text>
        <Text style={styles.body}>A credencial não comprovou idade maior ou igual a 18 anos ou não foi validada.</Text>
        <Pressable style={styles.button} onPress={() => navigation.popToTop()}>
          <Text style={styles.buttonText}>Voltar para seleção</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#DC2626" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  icon: { fontSize: 64 },
  title: { fontSize: 34, fontWeight: "900", color: "#FFF", marginTop: 32, textAlign: "center" },
  body: { fontSize: 18, color: "#FEE2E2", marginTop: 12, textAlign: "center", lineHeight: 26 },
  button: { marginTop: 48, backgroundColor: "#FFF", padding: 16, borderWidth: 3, borderColor: "#000" },
  buttonText: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
});