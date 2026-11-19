import { Linking } from "react-native";
import type { CredentialOption } from "./certifyService";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL!;
const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;
const ORIGIN = "brejame://";

function presentationDefinition(credential: CredentialOption) {
  if (!credential.credentialType || credential.format !== "ldp_vc") {
    throw new Error("Este formato de credencial ainda não é suportado neste verificador.");
  }

  return {
    id: credential.isEca ? "eca-age-verification" : `credential-${credential.id}`,
    purpose: credential.isEca
      ? "Verificação de idade conforme o Estatuto da Criança e do Adolescente"
      : `Verificação da credencial ${credential.name}`,
    format: { ldp_vc: { proof_type: ["Ed25519Signature2020"] } },
    input_descriptors: [{
      id: credential.isEca ? "eca credential" : credential.id,
      format: { ldp_vc: { proof_type: ["Ed25519Signature2020"] } },
      constraints: {
        fields: [{
          path: ["$.type"],
          filter: credential.isEca
            ? { type: "object", pattern: "ECACredential" }
            : { type: "object", pattern: credential.credentialType },
        }],
      },
    }],
  };
}


type QrData = {
  transactionId: string;
  requestId: string;
  requestUri: string;
  expiresAt?: number;
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new Error("O Verify demorou para responder. Tente novamente.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function buildDeepLinkUrl(data: QrData): string {
  const params = new URLSearchParams();
  params.set("client_id", CLIENT_ID);

  if (!data.requestUri) throw new Error("Missing requestUri in VP request response");
  params.set("request_uri", data.requestUri);

  if (data.requestId) params.set("origin", ORIGIN);

  return `openid4vp://authorize?${params.toString()}`;
}

export async function createVPRequest(credential: CredentialOption, timeoutMs = 15000): Promise<{
  transactionId: string;
  requestId: string;
  deepLinkUrl: string;
}> {
  const response = await fetchWithTimeout(`${BASE_URL}/v1/verify/vp-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      presentationDefinition: presentationDefinition(credential),
    }),
  }, timeoutMs);

  if (!response.ok) {
    throw new Error(`Não foi possível criar a solicitação de verificação (${response.status}).`);
  }

  const data: QrData = await response.json();
  if (!data.requestId || !data.transactionId) {
    throw new Error("O Verify não retornou os identificadores da solicitação.");
  }
  const deepLinkUrl = buildDeepLinkUrl(data);

  return {
    transactionId: data.transactionId,
    requestId: data.requestId,
    deepLinkUrl,
  };
}

export async function pollVPStatus(
  requestId: string,
  timeoutMs = 15000
): Promise<"ACTIVE" | "VP_SUBMITTED" | "EXPIRED"> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/v1/verify/vp-request/${encodeURIComponent(requestId)}/status`,
    {}, timeoutMs
  );
  if (!response.ok) {
    throw new Error(`Não foi possível consultar a solicitação (${response.status}).`);
  }
  const data = await response.json();
  if (data.status !== "ACTIVE" && data.status !== "VP_SUBMITTED" && data.status !== "EXPIRED") {
    throw new Error("O Verify retornou um status de solicitação desconhecido.");
  }
  return data.status;
}

export type VPResult = {
  verified: boolean;
  credentials: { vc: unknown; verificationStatus: string }[];
};

export async function getVPResult(
  transactionId: string,
  timeoutMs = 15000
): Promise<VPResult> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/v1/verify/vp-result/${encodeURIComponent(transactionId)}`,
    {}, timeoutMs
  );

  if (!response.ok) {
    throw new Error(`Não foi possível consultar o resultado (${response.status}).`);
  }

  const data = await response.json();
  if (data.vpResultStatus !== "SUCCESS" && data.vpResultStatus !== "FAILED") {
    throw new Error("Resultado da apresentação ainda não disponível.");
  }
  return {
    verified: data.vpResultStatus === "SUCCESS",
    credentials: Array.isArray(data.vcResults)
      ? data.vcResults.filter((result: unknown) => result && typeof result === "object")
        .map((result: { vc?: unknown; verificationStatus?: string }) => ({
          vc: result.vc,
          verificationStatus: result.verificationStatus || "DESCONHECIDO",
        }))
      : [],
  };
}

export async function openWalletForVerification(credential: CredentialOption, timeoutMs = 15000): Promise<{
  transactionId: string;
  requestId: string;
}> {
  const { transactionId, requestId, deepLinkUrl } = await createVPRequest(credential, timeoutMs);
  try {
    await Linking.openURL(deepLinkUrl);
  } catch (error) {
    throw new Error("Nenhum wallet compatível encontrado. Instale o Inji Wallet.");
  }

  return { transactionId, requestId };
}
