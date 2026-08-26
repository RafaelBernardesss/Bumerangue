import { Server } from "socket.io";

let io;
// Guarda qual socket pertence a qual usuário: usuarioId -> socketId
const usuariosConectados = new Map();

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }, // ajuste para o domínio do seu app em produção
  });

  io.on("connection", (socket) => {
    const { usuarioId } = socket.handshake.query;

    if (usuarioId) {
      usuariosConectados.set(Number(usuarioId), socket.id);
    }

    socket.on("disconnect", () => {
      for (const [uid, sid] of usuariosConectados.entries()) {
        if (sid === socket.id) usuariosConectados.delete(uid);
      }
    });
  });

  return io;
}

// Envia um evento só para o socket do usuário específico (não é broadcast)
export function emitirParaUsuario(usuarioId, evento, dados) {
  const socketId = usuariosConectados.get(Number(usuarioId));
  if (socketId && io) {
    io.to(socketId).emit(evento, dados);
  }
}