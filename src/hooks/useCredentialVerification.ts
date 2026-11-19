import { useState, useRef, useEffect, useCallback } from "react";
import { openWalletForVerification, pollVPStatus, getVPResult } from "../services/verifyService";
import type { VPResult } from "../services/verifyService";
import type { CredentialOption } from "../services/certifyService";

type Session = { requestId: string; transactionId: string };
const STATUS_TIMEOUT_MS = 120000;
const REQUEST_TIMEOUT_MS = 15000;
const POLL_DELAY_MS = 1500;
type Callbacks = {
  onResult: (requestId: string, result: VPResult) => void;
};

export function useCredentialVerification(credential: CredentialOption, { onResult }: Callbacks) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const pollingRef = useRef(false);
  const attemptRef = useRef(0);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const cancel = useCallback(() => {
    attemptRef.current += 1;
    pollingRef.current = false;
    sessionRef.current = null;
    setLoading(false);
    setStatus(null);
  }, []);

  const startPolling = useCallback(async (session: Session, attempt: number) => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    setStatus("Aguardando apresentação da carteira…");
    const deadline = Date.now() + STATUS_TIMEOUT_MS;

    try {
      while (pollingRef.current && attemptRef.current === attempt) {
        if (Date.now() >= deadline) throw new Error("Tempo de espera esgotado. Tente novamente.");
        const vpStatus = await pollVPStatus(session.requestId, REQUEST_TIMEOUT_MS);
        if (attemptRef.current !== attempt || !pollingRef.current) return;

        if (vpStatus === "VP_SUBMITTED") {
          setStatus("Verificando apresentação…");
          const result = await getVPResult(session.transactionId, REQUEST_TIMEOUT_MS);
          if (attemptRef.current !== attempt) return;
          pollingRef.current = false;
          sessionRef.current = null;
          setLoading(false);
          onResultRef.current(session.requestId, result);
          return;
        }

        if (vpStatus === "EXPIRED") {
          throw new Error("Solicitação expirada. Tente novamente.");
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
      }
    } catch (e) {
      if (attemptRef.current !== attempt) return;
      pollingRef.current = false;
      sessionRef.current = null;
      setError(e instanceof Error ? e.message : "Erro ao verificar apresentação.");
      setLoading(false);
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      attemptRef.current += 1;
      pollingRef.current = false;
      sessionRef.current = null;
    };
  }, []);

  const handleVerify = useCallback(async () => {
    if (loading || sessionRef.current) return;
    const attempt = ++attemptRef.current;
    setLoading(true);
    setError(null);
    setStatus("Abrindo carteira…");

    try {
      const session = await openWalletForVerification(credential, REQUEST_TIMEOUT_MS);
      if (attemptRef.current !== attempt) return;
      sessionRef.current = session;
      startPolling(session, attempt);
    } catch (e) {
      if (attemptRef.current !== attempt) return;
      setError(e instanceof Error ? e.message : "Erro ao conectar com a carteira.");
      setLoading(false);
      setStatus(null);
    }
  }, [credential, loading, startPolling]);

  return { loading, status, error, handleVerify, cancel };
}