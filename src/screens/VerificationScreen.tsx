import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { useCredentialVerification } from "../hooks/useCredentialVerification";

type Props = NativeStackScreenProps<RootStackParamList, "Verification">;

export default function VerificationScreen({ navigation, route }: Props) {
  const { credential } = route.params;
  const { loading, status, error, handleVerify, cancel } = useCredentialVerification(credential, {
    onResult: (requestId, result) => navigation.replace("Result", { requestId, result, credential }),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>VERIFICADOR</Text>
        <Text style={styles.title}>{credential.name}</Text>
        <Text style={styles.body}>
          Apresente a credencial {credential.id} na carteira digital para verificar sua autenticidade.
        </Text>
        <Text style={styles.note}>
          A carteira seleciona a credencial; o Inji Verify valida a apresentação.
        </Text>

        {status && <Text style={styles.statusText}>{status}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Aguardando…" : "Abrir carteira e verificar"}</Text>
        </Pressable>
        <Pressable onPress={() => { cancel(); navigation.goBack(); }} style={styles.back}>
          <Text style={styles.backText}>{loading ? "Cancelar e voltar" : "← Voltar para seleção"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F0" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64, alignItems: "center" },
  brand: { fontSize: 28, fontWeight: "900", color: "#2563EB", letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: "900", color: "#1A1A1A", textAlign: "center", marginTop: 48 },
  body: { fontSize: 18, color: "#333", textAlign: "center", marginTop: 20, lineHeight: 26 },
  note: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 16 },
  statusText: { fontSize: 14, color: "#2563EB", marginTop: 20 },
  errorText: { fontSize: 16, color: "#DC2626", marginTop: 20, textAlign: "center" },
  button: { marginTop: 40, backgroundColor: "#2563EB", padding: 18, borderWidth: 3, borderColor: "#000" },
  buttonPressed: { opacity: 0.7 },
  buttonText: { fontSize: 18, fontWeight: "900", color: "#FFF", textAlign: "center" },
  back: { marginTop: 24, padding: 8 },
  backText: { color: "#555", fontSize: 16 },
});