import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { listCredentials } from "../services/certifyService";
import type { CredentialOption } from "../services/certifyService";

type Props = NativeStackScreenProps<RootStackParamList, "CredentialSelection">;

export default function CredentialSelectionScreen({ navigation }: Props) {
  const [credentials, setCredentials] = useState<CredentialOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCredentials(await listCredentials());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar as credenciais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Credenciais da oficina</Text>
        <Text style={styles.subtitle}>Selecione uma credencial publicada no well-known do Certify.</Text>
        {loading && <Text style={styles.message}>Carregando credenciais…</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && credentials.length === 0 && (
          <Text style={styles.message}>Nenhuma credencial ativa publicada neste ambiente.</Text>
        )}
        {credentials.map((credential) => {
          const available = credential.format === "ldp_vc" && !!credential.credentialType;
          return (
            <Pressable
              key={credential.id}
              disabled={!available}
              style={[styles.card, !available && styles.disabled]}
              onPress={() => credential.isEca
                ? navigation.navigate("Storefront", { credential })
                : navigation.navigate("Verification", { credential })}
            >
              <Text style={styles.name}>{credential.name}</Text>
              <Text style={styles.detail}>{credential.id} · {credential.format}</Text>
              <Text style={styles.hint}>
                {credential.isEca ? "Abrir Breja.me →" : available ? "Verificar credencial →" : "Formato não suportado neste fluxo"}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={load} disabled={loading} style={styles.refresh}>
          <Text style={styles.refreshText}>Atualizar lista</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F0" },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: "900", color: "#1A1A1A" },
  subtitle: { fontSize: 16, color: "#555", marginTop: 12, marginBottom: 24 },
  message: { fontSize: 16, color: "#555" },
  error: { fontSize: 16, color: "#DC2626" },
  card: { borderWidth: 3, borderColor: "#000", backgroundColor: "#FFF", padding: 18, marginBottom: 16 },
  disabled: { opacity: 0.5 },
  name: { fontSize: 21, fontWeight: "800", color: "#1A1A1A" },
  detail: { fontSize: 14, color: "#555", marginTop: 6 },
  hint: { fontSize: 15, fontWeight: "700", color: "#2563EB", marginTop: 12 },
  refresh: { padding: 14, alignSelf: "center" },
  refreshText: { fontSize: 16, color: "#2563EB", fontWeight: "700" },
});