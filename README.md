# Breja.me — verificador da oficina

App Expo para solicitar apresentações OpenID4VP ao Inji Verify. Ao abrir, consulta as configurações ativas do Certify e mostra as credenciais disponíveis. A `ECACredential` leva à vitrine Breja.me e à verificação original de maioridade; as demais credenciais `ldp_vc` levam à verificação da credencial escolhida e à exibição do conteúdo retornado pelo Verify.

## Configuração

Copie `.env.example` para `.env` e configure as três variáveis para o **mesmo ambiente**:

- `EXPO_PUBLIC_BASE_URL`: URL pública do Verify (na oficina local: `http://<WORKSHOP_HOST>:31180`).
- `EXPO_PUBLIC_CLIENT_ID`: DID do verificador (na oficina local: `did:web:<WORKSHOP_HOST>%3A31180:v1:verify`).
- `EXPO_PUBLIC_CERTIFY_WELLKNOWN_URL`: URL completa do catálogo Certify (na oficina local: `http://<WORKSHOP_HOST>:31090/v1/certify/.well-known/openid-credential-issuer`).

Instale as dependências com `npm install` e inicie com `npm start` ou `npm run android`. Esses scripts usam a porta **8082** do Metro; o Guarda pode continuar na **8081**. Se executar `npx expo run:android` diretamente, informe `--port 8082`, pois esse comando não usa os scripts do projeto. Reinicie o Metro após alterar o `.env`. O dispositivo deve conseguir alcançar Certify e Verify e ter uma carteira compatível com `openid4vp://`.

Selecione uma credencial publicada no catálogo. Formatos diferentes de `ldp_vc` ficam listados, mas desabilitados: este app só monta VP requests para VCs JSON-LD com um tipo de domínio anunciado em `credential_definition.type`. Sucesso depende da validação do Verify, não apenas da apresentação pela carteira. A tela de resultado exibe a VC retornada pelo backend; evite usá-la com dados reais sensíveis em ambiente de demonstração.
