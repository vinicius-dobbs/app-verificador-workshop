import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

function credentialText(vc: unknown): string {
  if (typeof vc === "string") {
    try { return JSON.stringify(JSON.parse(vc), null, 2); } catch { return vc; }
  }
  return vc == null ? "Conteúdo não disponibilizado pelo Verify." : JSON.stringify(vc, null, 2);
}

export default function ResultScreen({ navigation, route }: Props) {
  const { requestId, result, credential } = route.params;
  const verified = result.verified && result.credentials.length > 0 &&
    result.credentials.every((item) => item.verificationStatus === "SUCCESS");
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: verified ? "#16A34A" : "#DC2626" }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.icon}>{verified ? "✓" : "×"}</Text>
        <Text style={styles.title}>{verified ? "Apresentação verificada" : "Verificação falhou"}</Text>
        <Text style={styles.subtitle}>{credential.name}</Text>
        {verified ? (
          result.credentials.length ? result.credentials.map((item, index) => (
            <View key={index} style={styles.credentialCard}>
              <Text style={styles.cardTitle}>Credencial verificada {result.credentials.length > 1 ? index + 1 : ""}</Text>
              <Text style={styles.status}>Status da VC: {item.verificationStatus}</Text>
              <Text selectable style={styles.credentialText}>{credentialText(item.vc)}</Text>
            </View>
          )) : <Text style={styles.subtitle}>O Verify não disponibilizou os dados da credencial.</Text>
        ) : <Text style={styles.subtitle}>A apresentação não foi validada pelo Inji Verify.</Text>}
        <Pressable style={styles.button} onPress={() => navigation.popToTop()}>
          <Text style={styles.buttonText}>Selecionar outra credencial</Text>
        </Pressable>
        <Text style={styles.requestId}>requestId: {requestId}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { alignItems: "center", paddingHorizontal: 24, paddingTop: 36, paddingBottom: 32 },
  icon: { fontSize: 72, fontWeight: "900", color: "#FFF" },
  title: { fontSize: 30, fontWeight: "900", color: "#FFF", marginTop: 16, textAlign: "center" },
  subtitle: { fontSize: 18, color: "#FFF", marginTop: 12, textAlign: "center" },
  credentialCard: { width: "100%", backgroundColor: "#FFF", borderColor: "#000", borderWidth: 2, padding: 16, marginTop: 24 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
  status: { fontSize: 14, color: "#555", marginTop: 6 },
  credentialText: { fontSize: 13, color: "#1A1A1A", marginTop: 12 },
  button: { marginTop: 32, backgroundColor: "#FFF", padding: 16, borderWidth: 3, borderColor: "#000" },
  buttonText: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  requestId: { marginTop: 24, fontSize: 11, color: "#FFF" },
});