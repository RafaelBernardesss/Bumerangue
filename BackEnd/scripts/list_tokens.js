import prisma from '../src/prisma/Client.js';

(async () => {
  try {
    const users = await prisma.usuario.findMany({ select: { id: true, nome: true, expoPushToken: true } });
    console.log('Usuarios:', users);
  } catch (e) {
    console.error('Erro listando tokens:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
