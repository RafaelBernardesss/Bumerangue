# Bumerangue — como rodar

## Requisitos
- Node.js **20.19+** (ou 22.12+). O Prisma 7 não roda em versões mais antigas.
- Celular e computador na **mesma rede** (Wi-Fi ou ponto de acesso do Windows).

## 1) Instalar tudo (uma vez só)
Na pasta do projeto (onde está o `package.json`):

```
npm run setup
```

Esse comando instala o app, ajusta as versões do Expo, instala o back end
(Prisma **7.10.0** + adapter SQLite), gera o Prisma Client e cria o banco `BackEnd/dev.db`.

## 2) Iniciar
Abra **dois terminais** na pasta do projeto:

```
# terminal 1 – servidor
npm run backend

# terminal 2 – app
npx expo start -c
```

O servidor mostra os endereços (`http://SEU-IP:3000`). O app descobre o IP do computador sozinho
(o mesmo IP do Metro), então **não precisa mais editar o IP nas telas**.
Se precisar forçar um endereço, crie um arquivo `.env` na raiz com:
`EXPO_PUBLIC_API_URL=http://192.168.0.10:3000`

## O que mudou no Prisma 7
- `schema.prisma`: gerador `prisma-client` (saída em `BackEnd/src/generated/prisma`), sem `url` no datasource.
- `BackEnd/prisma.config.ts`: guarda a URL do banco (`DATABASE_URL` no `BackEnd/.env`).
- `BackEnd/src/prisma/client.js`: cria o client com o adapter `@prisma/adapter-better-sqlite3`.
- O back end roda com `tsx` (o client gerado do Prisma 7 é TypeScript).
- Depois de mudar o `schema.prisma`: `npm --prefix BackEnd run db:setup`.

## Problemas comuns
- **Celular não conecta**: libere as portas 3000 e 8081 no Firewall do Windows (rede privada).
- **"Não foi possível abrir o banco"**: rode `npm --prefix BackEnd run db:setup`. Confirme que existe `BackEnd/dev.db`;
  se o arquivo foi criado em `BackEnd/prisma/dev.db`, troque no `BackEnd/.env` para `DATABASE_URL="file:./prisma/dev.db"`.
- **Notificações push**: não funcionam no Expo Go do Android; precisam de um development build. O app funciona normalmente sem elas.
- **CHAT_SECRET** (`BackEnd/.env`): criptografa as mensagens. Faça backup; sem ela as mensagens antigas não abrem.
- A tela **Admin** (`/Admin`) não tem login: não publique esse servidor na internet sem proteger essas rotas.
