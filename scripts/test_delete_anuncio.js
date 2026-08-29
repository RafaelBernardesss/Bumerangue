(async () => {
  try {
    const API = 'http://localhost:3000';

    // login
    const resLogin = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: '54843451894', senha: '123456' }),
    });
    const loginJson = await resLogin.json();
    if (!resLogin.ok) {
      console.error('Login failed', loginJson);
      return;
    }
    const token = loginJson.token;

    // create anuncio
    const form = new FormData();
    form.append('titulo', 'Anuncio de teste para exclusao');
    form.append('descricao', 'Descricao teste');
    form.append('preferencia', 'Qualquer');
    form.append('categoriaId', '1');
    form.append('usuarioId', String(loginJson.usuario.id));

    const resCreate = await fetch(`${API}/anuncios`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const createJson = await resCreate.json();
    console.log('Create status:', resCreate.status, createJson);
    if (!resCreate.ok) return;

    const id = createJson.anuncio.id;
    console.log('Created anuncio id', id);

    // now delete
    const resDel = await fetch(`${API}/anuncios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delJson = await resDel.json();
    console.log('Delete status:', resDel.status, delJson);
  } catch (e) {
    console.error('Error in script:', e);
  }
})();
