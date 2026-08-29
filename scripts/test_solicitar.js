(async () => {
  try {
    const API = 'http://localhost:3000';

    console.log('Fazendo login...');
    const resLogin = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: '54843451894', senha: '123456' }),
    });
    let loginJson = null;
    try { loginJson = await resLogin.json(); } catch(e) {}
    console.log('Login status:', resLogin.status, loginJson);

    if (!resLogin.ok) {
      console.error('Login falhou, abortando.');
      return;
    }

    const token = loginJson?.token;
    console.log('Token obtido:', token);

    console.log('Enviando solicitação para /anuncios/5/solicitar...');
    const resSolicitar = await fetch(`${API}/anuncios/5/solicitar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ servicoOferecido: 'Teste via script', mensagem: 'Mensagem de teste' }),
    });
    let solicJson = null;
    try { solicJson = await resSolicitar.json(); } catch(e) {}
    console.log('Solicitar status:', resSolicitar.status, solicJson);
  } catch (e) {
    console.error('Erro no script:', e);
  }
})();
