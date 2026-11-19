import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useCredentialVerification } from "../hooks/useCredentialVerification";

type Props = NativeStackScreenProps<RootStackParamList, "AgeCheck">;

export default function AgeCheckScreen({ navigation, route }: Props) {
  const { loading, status, error, handleVerify, cancel } = useCredentialVerification(route.params.credential, {
    onResult: (requestId, result) => {
      if (!result.verified || !result.credentials.length || result.credentials.some((item) => item.verificationStatus !== "SUCCESS")) {
        navigation.replace("Underage");
        return;
      }
      const raw = result.credentials[0]?.vc;
      let vc: any;
      try { vc = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { vc = null; }
      const subject = vc?.credential?.credentialSubject ?? vc?.credentialSubject;
      if (subject?.isOver18 === true) {
        navigation.replace("Success", { requestId });
      } else {
        navigation.replace("Underage");
      }
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.icon}>🍺</Text>
        <Text style={styles.title}>Verificação de idade</Text>
        <Text style={styles.body}>Para comprar bebida alcoólica, você precisa ter 18 anos ou mais.</Text>
        <Text style={styles.note}>A verificação é feita via credencial digital (Inji Wallet).</Text>
        {status && <Text style={styles.status}>{status}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Aguardando…" : "Verificar Idade"}</Text>
        </Pressable>
        <Pressable style={styles.back} onPress={() => { cancel(); navigation.goBack(); }}>
          <Text style={styles.backText}>{loading ? "Cancelar e voltar" : "← Voltar"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F0" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: "center" },
  icon: { fontSize: 48, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "900", color: "#1A1A1A", textAlign: "center" },
  body: { fontSize: 18, color: "#333", textAlign: "center", marginTop: 20, lineHeight: 26 },
  note: { fontSize: 13, color: "#777", textAlign: "center", marginTop: 12 },
  status: { fontSize: 14, color: "#FF5A1F", marginTop: 16 },
  error: { fontSize: 16, color: "#DC2626", marginTop: 20, textAlign: "center" },
  button: { marginTop: 40, backgroundColor: "#FF5A1F", paddingVertical: 18, paddingHorizontal: 48, borderWidth: 3, borderColor: "#000" },
  buttonText: { fontSize: 22, fontWeight: "900", color: "#FFF" },
  back: { marginTop: 24, padding: 8 },
  backText: { fontSize: 16, color: "#666" },
});