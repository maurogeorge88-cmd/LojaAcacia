import React, { useState, useEffect } from 'react';

const DB = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
};

export default function SistemaLojaMaconica() {
  const [state, setState] = useState({
    usuarioLogado: null,
    tela: 'login',
    irmaos: DB.get('irmaos') || [],
    usuarios: DB.get('usuarios') || [],
    config: DB.get('config') || { nomeLoja: 'Sistema Loja Maçônica', logo: '' },
    telaIrmao: 'lista',
    irmaoSelecionado: null
  });

  const fazerLogin = (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value;
    const senha = e.target.senha.value;

    if (state.usuarios.length === 0) {
      const novoUsuario = { id: Date.now(), usuario, senha, admin: true };
      const usuarios = [novoUsuario];
      DB.set('usuarios', usuarios);
      setState({ ...state, usuarios, usuarioLogado: novoUsuario, tela: 'dashboard' });
      alert('✅ Primeiro usuário criado com sucesso!');
      return;
    }

    const usuarioEncontrado = state.usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (usuarioEncontrado) {
      setState({ ...state, usuarioLogado: usuarioEncontrado, tela: 'dashboard' });
    } else {
      alert('❌ Usuário ou senha incorretos');
    }
  };

  const logout = () => {
    setState({ ...state, usuarioLogado: null, tela: 'login' });
  };

  const mudarTela = (tela) => {
    setState({ ...state, tela });
  };

  const salvarConfig = (nome) => {
    const config = { ...state.config, nomeLoja: nome };
    DB.set('config', config);
    setState({ ...state, config });
    alert('✅ Configurações salvas! Faça logout e login novamente.');
  };

  const novoIrmao = () => {
    setState({ ...state, telaIrmao: 'formulario', irmaoSelecionado: null });
  };

  const salvarIrmao = (irmao) => {
    let irmaos;
    if (irmao.id) {
      irmaos = state.irmaos.map(i => i.id === irmao.id ? irmao : i);
    } else {
      irmao.id = Date.now();
      irmaos = [...state.irmaos, irmao];
    }
    DB.set('irmaos', irmaos);
    setState({ ...state, irmaos, telaIrmao: 'lista' });
    alert('✅ Irmão salvo com sucesso!');
  };

  const editarIrmao = (irmao) => {
    setState({ ...state, telaIrmao: 'formulario', irmaoSelecionado: irmao });
  };

  const excluirIrmao = (id) => {
    if (confirm('Deseja realmente excluir este irmão?')) {
      const irmaos = state.irmaos.filter(i => i.id !== id);
      DB.set('irmaos', irmaos);
      setState({ ...state, irmaos });
      alert('✅ Irmão excluído com sucesso!');
    }
  };

  const voltarLista = () => {
    setState({ ...state, telaIrmao: 'lista', irmaoSelecionado: null });
  };

  if (state.tela === 'login') {
    return <TelaLogin onLogin={fazerLogin} primeiroAcesso={state.usuarios.length === 0} config={state.config} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header config={state.config} usuario={state.usuarioLogado} onLogout={logout} />
      <div className="flex">
        <Sidebar tela={state.tela} onMudarTela={mudarTela} />
        <main className="flex-1 p-6">
          {state.tela === 'dashboard' && <Dashboard irmaos={state.irmaos} />}
          {state.tela === 'irmaos' && (
            <Irmaos 
              irmaos={state.irmaos} 
              telaIrmao={state.telaIrmao}
              irmaoSelecionado={state.irmaoSelecionado}
              onNovo={novoIrmao}
              onSalvar={salvarIrmao}
              onEditar={editarIrmao}
              onExcluir={excluirIrmao}
              onVoltar={voltarLista}
            />
          )}
          {state.tela === 'usuarios' && <Usuarios usuarios={state.usuarios} />}
          {state.tela === 'configuracoes' && <Configuracoes config={state.config} onSalvar={salvarConfig} />}
        </main>
      </div>
    </div>
  );
}

function TelaLogin({ onLogin, primeiroAcesso, config }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {config.logo && <img src={config.logo} alt="Logo" className="h-24 mx-auto mb-4" />}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">{config.nomeLoja}</h1>
        <p className="text-center text-gray-600 mb-6">
          {primeiroAcesso ? '🔑 Primeiro Acesso - Crie seu usuário' : '🔐 Acesso ao Sistema'}
        </p>
        
        {primeiroAcesso && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            <strong>Instruções:</strong> Digite um nome de usuário e senha para criar seu primeiro acesso.
          </div>
        )}

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
            <input
              type="text"
              id="usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu usuário"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              id="senha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              const usuario = document.getElementById('usuario').value;
              const senha = document.getElementById('senha').value;
              onLogin({ preventDefault: () => {}, target: { usuario: { value: usuario }, senha: { value: senha } } });
            }}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800"
          >
            {primeiroAcesso ? '🔑 Criar Primeiro Usuário e Entrar' : '🔓 Entrar no Sistema'}
          </button>
        </div>

        {primeiroAcesso && (
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Exemplo: usuário: <strong>admin</strong> / senha: <strong>123456</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ config, usuario, onLogout }) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {config.logo && <img src={config.logo} alt="Logo" className="h-12" />}
          <div>
            <h1 className="text-2xl font-bold">{config.nomeLoja}</h1>
            <p className="text-sm text-blue-200">Sistema de Gestão</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium">{usuario.usuario}</p>
            <p className="text-xs text-blue-200">Usuário ativo</p>
          </div>
          <button onClick={onLogout} className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ tela, onMudarTela }) {
  const menus = [
    { id: 'dashboard', nome: 'Painel', icone: '📊' },
    { id: 'irmaos', nome: 'Irmãos', icone: '👥' },
    { id: 'usuarios', nome: 'Usuários', icone: '👤' },
    { id: 'configuracoes', nome: 'Configurações', icone: '⚙️' }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="p-4">
        {menus.map(menu => (
          <button
            key={menu.id}
            onClick={() => onMudarTela(menu.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
              tela === menu.id ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{menu.icone}</span>
            <span className="font-medium">{menu.nome}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Dashboard({ irmaos }) {
  const ativos = irmaos.filter(i => i.status === 'Ativo').length;
  const inativos = irmaos.length - ativos;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Painel de Controle</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total de Irmãos</h3>
          <p className="text-4xl font-bold text-blue-900">{irmaos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Irmãos Ativos</h3>
          <p className="text-4xl font-bold text-green-600">{ativos}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Irmãos Inativos</h3>
          <p className="text-4xl font-bold text-red-600">{inativos}</p>
        </div>
      </div>
    </div>
  );
}

function Irmaos({ irmaos, telaIrmao, irmaoSelecionado, onNovo, onSalvar, onEditar, onExcluir, onVoltar }) {
  if (telaIrmao === 'formulario') {
    return <FormularioIrmao irmao={irmaoSelecionado} onSalvar={onSalvar} onVoltar={onVoltar} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Cadastro de Irmãos</h2>
        <button
          onClick={onNovo}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Novo Irmão</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {irmaos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">📋 Nenhum irmão cadastrado ainda</p>
            <p className="text-sm">Clique em "Novo Irmão" para começar</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {irmaos.map(irmao => (
                <tr key={irmao.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{irmao.cim}</td>
                  <td className="px-6 py-4 font-medium">{irmao.nome}</td>
                  <td className="px-6 py-4">{irmao.cargoAtual || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      irmao.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {irmao.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditar(irmao)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onExcluir(irmao.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FormularioIrmao({ irmao, onSalvar, onVoltar }) {
  const [dados, setDados] = useState(irmao || {
    cim: '', nome: '', cpf: '', rg: '', dataNascimento: '', estadoCivil: '',
    profissao: '', formacao: '', status: 'Ativo', naturalidade: '', endereco: '',
    cidade: '', celular: '', email: '', localTrabalho: '', cargoAtual: '',
    dataIniciacao: '', dataElevacao: '', dataExaltacao: '', tempoMaconaria: '',
    esposa: { nome: '', dataNascimento: '' },
    pai: { nome: '', dataNascimento: '', falecido: false, dataObito: '' },
    mae: { nome: '', dataNascimento: '', falecido: false, dataObito: '' },
    filhos: [],
    historioCargos: []
  });

  const calcularTempo = (dataIniciacao) => {
    if (!dataIniciacao) return '';
    const inicio = new Date(dataIniciacao);
    const hoje = new Date();
    const anos = hoje.getFullYear() - inicio.getFullYear();
    const meses = hoje.getMonth() - inicio.getMonth();
    const totalMeses = anos * 12 + meses;
    const anosCompletos = Math.floor(totalMeses / 12);
    const mesesRestantes = totalMeses % 12;
    return anosCompletos + ' anos e ' + mesesRestantes + ' meses';
  };

  const handleChange = (campo, valor) => {
    const novosDados = { ...dados, [campo]: valor };
    if (campo === 'dataIniciacao') {
      novosDados.tempoMaconaria = calcularTempo(valor);
    }
    setDados(novosDados);
  };

  const handleSubmit = () => {
    if (!dados.cim || !dados.nome) {
      alert('❌ Preencha os campos obrigatórios: CIM e Nome');
      return;
    }
    onSalvar(dados);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {irmao ? 'Editar Irmão' : 'Novo Irmão'}
        </h2>
        <button onClick={onVoltar} className="text-gray-600 hover:text-gray-800 text-2xl">
          ✖️
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CIM *</label>
              <input
                type="text"
                value={dados.cim}
                onChange={(e) => handleChange('cim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                value={dados.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
              <input
                type="text"
                value={dados.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
              <input
                type="date"
                value={dados.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
              <input
                type="text"
                value={dados.estadoCivil}
                onChange={(e) => handleChange('estadoCivil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
              <input
                type="text"
                value={dados.profissao}
                onChange={(e) => handleChange('profissao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formação</label>
              <input
                type="text"
                value={dados.formacao}
                onChange={(e) => handleChange('formacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={dados.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
              <input
                type="text"
                value={dados.naturalidade}
                onChange={(e) => handleChange('naturalidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={dados.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="text"
                value={dados.celular}
                onChange={(e) => handleChange('celular', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={dados.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={dados.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local de Trabalho</label>
              <input
                type="text"
                value={dados.localTrabalho}
                onChange={(e) => handleChange('localTrabalho', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Dados Maçônicos */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Maçônicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Atual</label>
              <input
                type="text"
                value={dados.cargoAtual}
                onChange={(e) => handleChange('cargoAtual', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ex: Venerável Mestre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Iniciação</label>
              <input
                type="date"
                value={dados.dataIniciacao}
                onChange={(e) => handleChange('dataIniciacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Elevação</label>
              <input
                type="date"
                value={dados.dataElevacao}
                onChange={(e) => handleChange('dataElevacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Exaltação</label>
              <input
                type="date"
                value={dados.dataExaltacao}
                onChange={(e) => handleChange('dataExaltacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Maçonaria</label>
              <input
                type="text"
                value={dados.tempoMaconaria}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            onClick={onVoltar}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            💾 Salvar Irmão
          </button>
        </div>
      </div>
    </div>
  );
}

function Usuarios({ usuarios }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Usuários</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Total de usuários: <strong>{usuarios.length}</strong></p>
        <ul className="space-y-2">
          {usuarios.map(u => (
            <li key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>
                <strong>{u.usuario}</strong> {u.admin ? '(Administrador)' : '(Usuário)'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Configuracoes({ config, onSalvar }) {
  const [nome, setNome] = useState(config.nomeLoja);

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Configurações da Loja</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Loja</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          onClick={() => onSalvar(nome)}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}