// Configuração do Metro (bundler do app).
// A pasta BackEnd é do servidor e não faz parte do app: bloqueamos para o Metro não tentar
// ler o node_modules dela (deixa o bundle lento e pode gerar erros de módulos duplicados).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const pastaBackEnd = path.resolve(__dirname, "BackEnd").replace(/[/\\]/g, "[/\\\\]");
const atual = config.resolver.blockList;
const blocos = Array.isArray(atual) ? atual : atual ? [atual] : [];

config.resolver.blockList = [...blocos, new RegExp(`${pastaBackEnd}[/\\\\].*`)];

module.exports = config;
