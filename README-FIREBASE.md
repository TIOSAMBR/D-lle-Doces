# Délle Doces — PWA + Firebase

## 1. Firebase

Crie um projeto no Firebase e registre um aplicativo Web.

Ative:
- Authentication → E-mail/senha
- Firestore Database → modo bloqueado

## 2. Configuração

Abra `firebase-config.js` e cole os valores do `firebaseConfig` do seu aplicativo Web.

## 3. Regras do Firestore

Publique o conteúdo de `firestore.rules` na aba **Regras** do Cloud Firestore.

Os dados ficam separados por usuário em:

`usuarios/{UID}/delleDoces/dados`

## 4. Funcionamento

- `localStorage` mantém os dados localmente.
- Firestore mantém a cópia na nuvem.
- `onSnapshot` atualiza os dados em tempo real.
- O primeiro acesso de uma conta sem documento envia os dados locais para a nuvem.
- Alterações recebidas da nuvem não chamam `save()`, evitando loops de sincronização.

## 5. PWA

Hospede em HTTPS (por exemplo, GitHub Pages) e abra pelo Safari para usar **Adicionar à Tela de Início**.
