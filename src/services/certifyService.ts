export type CredentialOption = {
  id: string;
  name: string;
  format: string;
  credentialType: string | null;
  isEca: boolean;
};

type Configuration = {
  format?: string;
  credential_definition?: { type?: string[] };
  display?: { name?: string; locale?: string }[];
};

export async function listCredentials(): Promise<CredentialOption[]> {
  const url = process.env.EXPO_PUBLIC_CERTIFY_WELLKNOWN_URL;
  if (!url) {
    throw new Error("Configure EXPO_PUBLIC_CERTIFY_WELLKNOWN_URL com o well-known do Certify da oficina (porta 31090).");
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Não foi possível consultar o Certify (${response.status}).`);

  const metadata = await response.json();
  const configurations = metadata?.credential_configurations_supported;
  if (!configurations || typeof configurations !== "object" || Array.isArray(configurations)) {
    throw new Error("O well-known do Certify não contém credential_configurations_supported.");
  }

  return Object.entries(configurations as Record<string, Configuration>).map(([id, config]) => {
    const types = config?.credential_definition?.type;
    const credentialType = Array.isArray(types)
      ? types.find((type) => type !== "VerifiableCredential") ?? null
      : null;
    const display = config?.display;
    const name = Array.isArray(display)
      ? (display.find((item) => item.locale?.toLowerCase().startsWith("pt")) ?? display[0])?.name
      : undefined;

    return {
      id,
      name: name || id,
      format: config?.format || "desconhecido",
      credentialType,
      isEca: id === "ECACredential" && config?.format === "ldp_vc" && credentialType === "ECACredential",
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}