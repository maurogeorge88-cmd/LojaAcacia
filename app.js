import React, { useState, useEffect } from 'react';
import { User, Users, Settings, LogOut, Search, Plus, Edit2, Trash2, Download, Eye, X } from 'lucide-react';

// Componente principal
export default function SistemaLojaMaconica() {
  const [telaAtual, setTelaAtual] = useState('login');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const config = await window.storage.get('config-loja');
      if (config) {
        setConfiguracoes(JSON.parse(config.value));
      }
    } catch (error) {
      console.log('Primeira inicialização do sistema');
    }
    setCarregando(false);
  };

  const handleLogin = (usuario) => {
    setUsuarioLogado(usuario);
    setTelaAtual('dashboard');
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setTelaAtual('login');
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Carregando sistema...</div>
      </div>
    );
  }

  if (telaAtual === 'login') {
    return <TelaLogin onLogin={handleLogin} configuracoes={configuracoes} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        configuracoes={configuracoes} 
        usuarioLogado={usuarioLogado}
        onLogout={handleLogout}
      />
      <div className="flex">
        <Sidebar telaAtual={telaAtual} setTelaAtual={setTelaAtual} />
        <main className="flex-1 p-6">
          {telaAtual === 'dashboard' && <Dashboard />}
          {telaAtual === 'irmaos' && <ModuloIrmaos />}
          {telaAtual === 'usuarios' && <ModuloUsuarios />}
          {telaAtual === 'configuracoes' && <ModuloConfiguracoes setConfiguracoes={setConfiguracoes} />}
        </main>
      </div>
    </div>
  );
}

// Componente de Login
function TelaLogin({ onLogin, configuracoes }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  useEffect(() => {
    verificarPrimeiroAcesso();
  }, []);

  const verificarPrimeiroAcesso = async () => {
    try {
      await window.storage.get('usuarios');
    } catch (error) {
      setPrimeiroAcesso(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const result = await window.storage.get('usuarios');
      const usuarios = result ? JSON.parse(result.value) : [];

      if (usuarios.length === 0 && primeiroAcesso) {
        const novoUsuario = { id: Date.now(), usuario, senha, admin: true };
        await window.storage.set('usuarios', JSON.stringify([novoUsuario]));
        onLogin(novoUsuario);
        return;
      }

      const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
      if (usuarioEncontrado) {
        onLogin(usuarioEncontrado);
      } else {
        setErro('Usuário ou senha incorretos');
      }
    } catch (error) {
      setErro('Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {configuracoes?.logo && (
          <div className="text-center mb-6">
            <img src={configuracoes.logo} alt="Logo" className="h-24 mx-auto mb-4" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
          {configuracoes?.nomeLoja || 'Sistema Loja Maçônica'}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {primeiroAcesso ? 'Primeiro Acesso - Crie seu usuário administrador' : 'Controle de Acesso'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {erro && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            {primeiroAcesso ? 'Criar Usuário e Entrar' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Header
function Header({ configuracoes, usuarioLogado, onLogout }) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {configuracoes?.logo && (
            <img src={configuracoes.logo} alt="Logo" className="h-12" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{configuracoes?.nomeLoja || 'Loja Maçônica'}</h1>
            <p className="text-sm text-blue-200">Sistema de Gestão</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium">{usuarioLogado?.usuario}</p>
            <p className="text-xs text-blue-200">Usuário ativo</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Sidebar
function Sidebar({ telaAtual, setTelaAtual }) {
  const menus = [
    { id: 'dashboard', nome: 'Painel', icone: User },
    { id: 'irmaos', nome: 'Irmãos', icone: Users },
    { id: 'usuarios', nome: 'Usuários', icone: User },
    { id: 'configuracoes', nome: 'Configurações', icone: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="p-4">
        {menus.map((menu) => {
          const Icone = menu.icone;
          return (
            <button
              key={menu.id}
              onClick={() => setTelaAtual(menu.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                telaAtual === menu.id
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icone size={20} />
              <span className="font-medium">{menu.nome}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// Dashboard
function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, inativos: 0 });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const result = await window.storage.get('irmaos');
      if (result) {
        const irmaos = JSON.parse(result.value);
        const ativos = irmaos.filter(i => i.status === 'Ativo').length;
        setEstatisticas({
          total: irmaos.length,
          ativos: ativos,
          inativos: irmaos.length - ativos
        });
      }
    } catch (error) {
      console.log('Nenhum dado ainda');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Painel de Controle</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total de Irmãos</h3>
          <p className="text-4xl font-bold text-blue-900">{estatisticas.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Irmãos Ativos</h3>
          <p className="text-4xl font-bold text-green-600">{estatisticas.ativos}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Irmãos Inativos</h3>
          <p className="text-4xl font-bold text-red-600">{estatisticas.inativos}</p>
        </div>
      </div>
    </div>
  );
}

// Módulo de Irmãos
function ModuloIrmaos() {
  const [visualizacao, setVisualizacao] = useState('lista');
  const [irmaos, setIrmaos] = useState([]);
  const [irmaoSelecionado, setIrmaoSelecionado] = useState(null);
  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarIrmaos();
  }, []);

  const carregarIrmaos = async () => {
    try {
      const result = await window.storage.get('irmaos');
      if (result) {
        setIrmaos(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Nenhum irmão cadastrado ainda');
    }
    setCarregando(false);
  };

  const salvarIrmaos = async (novosIrmaos) => {
    try {
      await window.storage.set('irmaos', JSON.stringify(novosIrmaos));
      setIrmaos(novosIrmaos);
    } catch (error) {
      alert('Erro ao salvar dados');
    }
  };

  const handleNovo = () => {
    setIrmaoSelecionado(null);
    setVisualizacao('formulario');
  };

  const handleEditar = (irmao) => {
    setIrmaoSelecionado(irmao);
    setVisualizacao('formulario');
  };

  const handleVisualizar = (irmao) => {
    setIrmaoSelecionado(irmao);
    setVisualizacao('detalhes');
  };

  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este irmão?')) {
      const novosIrmaos = irmaos.filter(i => i.id !== id);
      await salvarIrmaos(novosIrmaos);
    }
  };

  const handleSalvar = async (irmao) => {
    let novosIrmaos;
    if (irmao.id) {
      novosIrmaos = irmaos.map(i => i.id === irmao.id ? irmao : i);
    } else {
      irmao.id = Date.now();
      novosIrmaos = [...irmaos, irmao];
    }
    await salvarIrmaos(novosIrmaos);
    setVisualizacao('lista');
  };

  const irmaosFiltrados = irmaos.filter(i => 
    i.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    i.cim.toLowerCase().includes(pesquisa.toLowerCase())
  );

  if (visualizacao === 'formulario') {
    return (
      <FormularioIrmao
        irmao={irmaoSelecionado}
        onSalvar={handleSalvar}
        onCancelar={() => setVisualizacao('lista')}
      />
    );
  }

  if (visualizacao === 'detalhes') {
    return (
      <DetalhesIrmao
        irmao={irmaoSelecionado}
        onVoltar={() => setVisualizacao('lista')}
        onEditar={() => setVisualizacao('formulario')}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Cadastro de Irmãos</h2>
        <button
          onClick={handleNovo}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-800 transition"
        >
          <Plus size={20} />
          <span>Novo Irmão</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou CIM..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CIM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo Maçonaria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {irmaosFiltrados.map((irmao) => (
              <tr key={irmao.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{irmao.cim}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{irmao.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{irmao.cargoAtual}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    irmao.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {irmao.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{irmao.tempoMaconaria}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVisualizar(irmao)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditar(irmao)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleExcluir(irmao.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {irmaosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {pesquisa ? 'Nenhum irmão encontrado' : 'Nenhum irmão cadastrado ainda'}
          </div>
        )}
      </div>
    </div>
  );
}

// Formulário de Irmão
function FormularioIrmao({ irmao, onSalvar, onCancelar }) {
  const [dados, setDados] = useState(irmao || {
    cim: '', nome: '', cpf: '', rg: '', dataNascimento: '', estadoCivil: '',
    profissao: '', formacao: '', status: 'Ativo', naturalidade: '', endereco: '',
    cidade: '', celular: '', email: '', localTrabalho: '', foto: '', cargoAtual: '',
    dataIniciacao: '', dataElevacao: '', dataExaltacao: '', tempoMaconaria: '',
    esposa: { nome: '', dataNascimento: '' },
    pai: { nome: '', dataNascimento: '', falecido: false, dataObito: '' },
    mae: { nome: '', dataNascimento: '', falecido: false, dataObito: '' },
    filhos: [],
    historioCargos: []
  });

  const calcularTempoMaconaria = (dataIniciacao) => {
    if (!dataIniciacao) return '';
    const inicio = new Date(dataIniciacao);
    const hoje = new Date();
    const anos = hoje.getFullYear() - inicio.getFullYear();
    const meses = hoje.getMonth() - inicio.getMonth();
    const totalMeses = anos * 12 + meses;
    const anosCompletos = Math.floor(totalMeses / 12);
    const mesesRestantes = totalMeses % 12;
    return `${anosCompletos} anos e ${mesesRestantes} meses`;
  };

  const handleChange = (campo, valor) => {
    const novosDados = { ...dados, [campo]: valor };
    if (campo === 'dataIniciacao') {
      novosDados.tempoMaconaria = calcularTempoMaconaria(valor);
    }
    setDados(novosDados);
  };

  const handleChangeAninhado = (objeto, campo, valor) => {
    setDados({
      ...dados,
      [objeto]: { ...dados[objeto], [campo]: valor }
    });
  };

  const handleAdicionarFilho = () => {
    setDados({
      ...dados,
      filhos: [...dados.filhos, { nome: '', dataNascimento: '', falecido: false, dataObito: '' }]
    });
  };

  const handleRemoverFilho = (index) => {
    const novosFilhos = dados.filhos.filter((_, i) => i !== index);
    setDados({ ...dados, filhos: novosFilhos });
  };

  const handleChangeFilho = (index, campo, valor) => {
    const novosFilhos = [...dados.filhos];
    novosFilhos[index] = { ...novosFilhos[index], [campo]: valor };
    setDados({ ...dados, filhos: novosFilhos });
  };

  const handleAdicionarCargo = () => {
    setDados({
      ...dados,
      historioCargos: [...dados.historioCargos, { ano: '', cargo: '' }]
    });
  };

  const handleRemoverCargo = (index) => {
    const novosCargos = dados.historioCargos.filter((_, i) => i !== index);
    setDados({ ...dados, historioCargos: novosCargos });
  };

  const handleChangeCargo = (index, campo, valor) => {
    const novosCargos = [...dados.historioCargos];
    novosCargos[index] = { ...novosCargos[index], [campo]: valor };
    setDados({ ...dados, historioCargos: novosCargos });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(dados);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {irmao ? 'Editar Irmão' : 'Novo Irmão'}
        </h2>
        <button
          onClick={onCancelar}
          className="text-gray-600 hover:text-gray-800"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                value={dados.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
              <input
                type="text"
                value={dados.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
              <input
                type="date"
                value={dados.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
              <input
                type="text"
                value={dados.estadoCivil}
                onChange={(e) => handleChange('estadoCivil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
              <input
                type="text"
                value={dados.profissao}
                onChange={(e) => handleChange('profissao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formação</label>
              <input
                type="text"
                value={dados.formacao}
                onChange={(e) => handleChange('formacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={dados.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={dados.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                type="text"
                value={dados.celular}
                onChange={(e) => handleChange('celular', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={dados.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={dados.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local de Trabalho</label>
              <input
                type="text"
                value={dados.localTrabalho}
                onChange={(e) => handleChange('localTrabalho', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Venerável Mestre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Iniciação</label>
              <input
                type="date"
                value={dados.dataIniciacao}
                onChange={(e) => handleChange('dataIniciacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Elevação</label>
              <input
                type="date"
                value={dados.dataElevacao}
                onChange={(e) => handleChange('dataElevacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Exaltação</label>
              <input
                type="date"
                value={dados.dataExaltacao}
                onChange={(e) => handleChange('dataExaltacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {/* Histórico de Cargos */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Histórico de Cargos</label>
              <button
                type="button"
                onClick={handleAdicionarCargo}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Adicionar Cargo</span>
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dados.historioCargos.map((cargo, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={cargo.ano}
                          onChange={(e) => handleChangeCargo(index, 'ano', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="2024"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={cargo.cargo}
                          onChange={(e) => handleChangeCargo(index, 'cargo', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="Venerável Mestre"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoverCargo(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dados.historioCargos.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                        Nenhum cargo cadastrado. Clique em "Adicionar Cargo" para começar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dados Familiares */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Familiares</h3>
          
          {/* Esposa */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Esposa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={dados.esposa.nome}
                  onChange={(e) => handleChangeAninhado('esposa', 'nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={dados.esposa.dataNascimento}
                  onChange={(e) => handleChangeAninhado('esposa', 'dataNascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pai */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Pai</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={dados.pai.nome}
                  onChange={(e) => handleChangeAninhado('pai', 'nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                <input
                  type="date"
                  value={dados.pai.dataNascimento}
                  onChange={(e) => handleChangeAninhado('pai', 'dataNascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Falecido</label>
                <select
                  value={dados.pai.falecido}
                  onChange={(e) => handleChangeAninhado('pai', 'falecido', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>
              {dados.pai.falecido && (
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Óbito</label>
                  <input
                    type="date"
                    value={dados.pai.dataObito}
                    onChange={(e) => handleChangeAninhado('pai', 'dataObito', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mãe */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Mãe</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={dados.mae.nome}
                  onChange={(e) => handleChangeAninhado('mae', 'nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                <input
                  type="date"
                  value={dados.mae.dataNascimento}
                  onChange={(e) => handleChangeAninhado('mae', 'dataNascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Falecido</label>
                <select
                  value={dados.mae.falecido}
                  onChange={(e) => handleChangeAninhado('mae', 'falecido', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>
              {dados.mae.falecido && (
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Óbito</label>
                  <input
                    type="date"
                    value={dados.mae.dataObito}
                    onChange={(e) => handleChangeAninhado('mae', 'dataObito', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filhos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Filhos</h4>
              <button
                type="button"
                onClick={handleAdicionarFilho}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Adicionar Filho</span>
              </button>
            </div>
            {dados.filhos.map((filho, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Filho {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoverFilho(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={filho.nome}
                      onChange={(e) => handleChangeFilho(index, 'nome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                    <input
                      type="date"
                      value={filho.dataNascimento}
                      onChange={(e) => handleChangeFilho(index, 'dataNascimento', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Falecido</label>
                    <select
                      value={filho.falecido}
                      onChange={(e) => handleChangeFilho(index, 'falecido', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>
                  {filho.falecido && (
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Óbito</label>
                      <input
                        type="date"
                        value={filho.dataObito}
                        onChange={(e) => handleChangeFilho(index, 'dataObito', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {dados.filhos.length === 0 && (
              <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-lg">
                Nenhum filho cadastrado. Clique em "Adicionar Filho" para começar.
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Salvar Irmão
          </button>
        </div>
      </form>
    </div>
  );
}

// Detalhes do Irmão
function DetalhesIrmao({ irmao, onVoltar, onEditar }) {
  const gerarPDF = () => {
    const conteudo = `
FICHA CADASTRAL - ${irmao.nome}

=== DADOS PESSOAIS ===
CIM: ${irmao.cim}
Nome: ${irmao.nome}
CPF: ${irmao.cpf || 'Não informado'}
RG: ${irmao.rg || 'Não informado'}
Data de Nascimento: ${irmao.dataNascimento || 'Não informado'}
Estado Civil: ${irmao.estadoCivil || 'Não informado'}
Profissão: ${irmao.profissao || 'Não informado'}
Formação: ${irmao.formacao || 'Não informado'}
Naturalidade: ${irmao.naturalidade || 'Não informado'}
Endereço: ${irmao.endereco || 'Não informado'}
Cidade: ${irmao.cidade || 'Não informado'}
Celular: ${irmao.celular || 'Não informado'}
E-mail: ${irmao.email || 'Não informado'}
Local de Trabalho: ${irmao.localTrabalho || 'Não informado'}

=== DADOS MAÇÔNICOS ===
Status: ${irmao.status}
Cargo Atual: ${irmao.cargoAtual || 'Não informado'}
Data de Iniciação: ${irmao.dataIniciacao || 'Não informado'}
Data de Elevação: ${irmao.dataElevacao || 'Não informado'}
Data de Exaltação: ${irmao.dataExaltacao || 'Não informado'}
Tempo de Maçonaria: ${irmao.tempoMaconaria || 'Não calculado'}

=== HISTÓRICO DE CARGOS ===
${irmao.historioCargos && irmao.historioCargos.length > 0 
  ? irmao.historioCargos.map(c => `${c.ano} - ${c.cargo}`).join('\n')
  : 'Nenhum cargo registrado'}

=== DADOS FAMILIARES ===
Esposa: ${irmao.esposa?.nome || 'Não informado'}
${irmao.esposa?.dataNascimento ? `Data Nascimento: ${irmao.esposa.dataNascimento}` : ''}

Pai: ${irmao.pai?.nome || 'Não informado'}
${irmao.pai?.dataNascimento ? `Data Nascimento: ${irmao.pai.dataNascimento}` : ''}
${irmao.pai?.falecido ? `Falecido em: ${irmao.pai.dataObito}` : ''}

Mãe: ${irmao.mae?.nome || 'Não informado'}
${irmao.mae?.dataNascimento ? `Data Nascimento: ${irmao.mae.dataNascimento}` : ''}
${irmao.mae?.falecido ? `Falecido em: ${irmao.mae.dataObito}` : ''}

Filhos:
${irmao.filhos && irmao.filhos.length > 0
  ? irmao.filhos.map((f, i) => `${i + 1}. ${f.nome} - Nasc: ${f.dataNascimento}${f.falecido ? ` (Falecido em ${f.dataObito})` : ''}`).join('\n')
  : 'Nenhum filho registrado'}
    `;

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha_${irmao.nome.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Detalhes do Irmão</h2>
        <div className="flex space-x-2">
          <button
            onClick={gerarPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Baixar PDF</span>
          </button>
          <button
            onClick={onEditar}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center space-x-2"
          >
            <Edit2 size={18} />
            <span>Editar</span>
          </button>
          <button
            onClick={onVoltar}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Voltar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">CIM:</span> {irmao.cim}</div>
            <div><span className="font-semibold">Nome:</span> {irmao.nome}</div>
            <div><span className="font-semibold">CPF:</span> {irmao.cpf || 'Não informado'}</div>
            <div><span className="font-semibold">RG:</span> {irmao.rg || 'Não informado'}</div>
            <div><span className="font-semibold">Data Nascimento:</span> {irmao.dataNascimento || 'Não informado'}</div>
            <div><span className="font-semibold">Estado Civil:</span> {irmao.estadoCivil || 'Não informado'}</div>
            <div><span className="font-semibold">Profissão:</span> {irmao.profissao || 'Não informado'}</div>
            <div><span className="font-semibold">Formação:</span> {irmao.formacao || 'Não informado'}</div>
            <div><span className="font-semibold">Naturalidade:</span> {irmao.naturalidade || 'Não informado'}</div>
            <div><span className="font-semibold">Cidade:</span> {irmao.cidade || 'Não informado'}</div>
            <div><span className="font-semibold">Celular:</span> {irmao.celular || 'Não informado'}</div>
            <div><span className="font-semibold">E-mail:</span> {irmao.email || 'Não informado'}</div>
            <div className="md:col-span-2"><span className="font-semibold">Endereço:</span> {irmao.endereco || 'Não informado'}</div>
            <div><span className="font-semibold">Local Trabalho:</span> {irmao.localTrabalho || 'Não informado'}</div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                irmao.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {irmao.status}
              </span>
            </div>
          </div>
        </div>

        {/* Dados Maçônicos */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Maçônicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">Cargo Atual:</span> {irmao.cargoAtual || 'Não informado'}</div>
            <div><span className="font-semibold">Tempo Maçonaria:</span> {irmao.tempoMaconaria || 'Não calculado'}</div>
            <div><span className="font-semibold">Data Iniciação:</span> {irmao.dataIniciacao || 'Não informado'}</div>
            <div><span className="font-semibold">Data Elevação:</span> {irmao.dataElevacao || 'Não informado'}</div>
            <div><span className="font-semibold">Data Exaltação:</span> {irmao.dataExaltacao || 'Não informado'}</div>
          </div>

          {irmao.historioCargos && irmao.historioCargos.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Histórico de Cargos</h4>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {irmao.historioCargos.map((cargo, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{cargo.ano}</td>
                        <td className="px-4 py-2">{cargo.cargo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Dados Familiares */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Dados Familiares</h3>
          
          {irmao.esposa?.nome && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Esposa</h4>
              <div className="pl-4">
                <div><span className="font-semibold">Nome:</span> {irmao.esposa.nome}</div>
                {irmao.esposa.dataNascimento && (
                  <div><span className="font-semibold">Data Nascimento:</span> {irmao.esposa.dataNascimento}</div>
                )}
              </div>
            </div>
          )}

          {irmao.pai?.nome && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Pai</h4>
              <div className="pl-4">
                <div><span className="font-semibold">Nome:</span> {irmao.pai.nome}</div>
                {irmao.pai.dataNascimento && (
                  <div><span className="font-semibold">Data Nascimento:</span> {irmao.pai.dataNascimento}</div>
                )}
                {irmao.pai.falecido && (
                  <div className="text-red-600">
                    <span className="font-semibold">Falecido em:</span> {irmao.pai.dataObito}
                  </div>
                )}
              </div>
            </div>
          )}

          {irmao.mae?.nome && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Mãe</h4>
              <div className="pl-4">
                <div><span className="font-semibold">Nome:</span> {irmao.mae.nome}</div>
                {irmao.mae.dataNascimento && (
                  <div><span className="font-semibold">Data Nascimento:</span> {irmao.mae.dataNascimento}</div>
                )}
                {irmao.mae.falecido && (
                  <div className="text-red-600">
                    <span className="font-semibold">Falecido em:</span> {irmao.mae.dataObito}
                  </div>
                )}
              </div>
            </div>
          )}

          {irmao.filhos && irmao.filhos.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Filhos</h4>
              <div className="space-y-3">
                {irmao.filhos.map((filho, index) => (
                  <div key={index} className="pl-4 border-l-2 border-blue-500">
                    <div><span className="font-semibold">Nome:</span> {filho.nome}</div>
                    {filho.dataNascimento && (
                      <div><span className="font-semibold">Data Nascimento:</span> {filho.dataNascimento}</div>
                    )}
                    {filho.falecido && (
                      <div className="text-red-600">
                        <span className="font-semibold">Falecido em:</span> {filho.dataObito}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Módulo de Usuários
function ModuloUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ usuario: '', senha: '', admin: false });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const result = await window.storage.get('usuarios');
      if (result) {
        setUsuarios(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Erro ao carregar usuários');
    }
  };

  const handleAdicionar = async () => {
    if (!novoUsuario.usuario || !novoUsuario.senha) {
      alert('Preencha todos os campos');
      return;
    }

    const novo = { ...novoUsuario, id: Date.now() };
    const novosUsuarios = [...usuarios, novo];
    
    try {
      await window.storage.set('usuarios', JSON.stringify(novosUsuarios));
      setUsuarios(novosUsuarios);
      setNovoUsuario({ usuario: '', senha: '', admin: false });
      setMostrarForm(false);
      alert('Usuário cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar usuário');
    }
  };

  const handleExcluir = async (id) => {
    if (usuarios.length === 1) {
      alert('Não é possível excluir o último usuário do sistema');
      return;
    }

    if (confirm('Deseja realmente excluir este usuário?')) {
      const novosUsuarios = usuarios.filter(u => u.id !== id);
      try {
        await window.storage.set('usuarios', JSON.stringify(novosUsuarios));
        setUsuarios(novosUsuarios);
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-800 transition"
        >
          <Plus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Cadastrar Novo Usuário</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <input
                type="text"
                value={novoUsuario.usuario}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, usuario: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={novoUsuario.admin}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, admin: e.target.value === 'true' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Usuário Normal</option>
                <option value="true">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setMostrarForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdicionar}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{usuario.usuario}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    usuario.admin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {usuario.admin ? 'Administrador' : 'Usuário Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleExcluir(usuario.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Módulo de Configurações
function ModuloConfiguracoes({ setConfiguracoes }) {
  const [dados, setDados] = useState({ nomeLoja: '', logo: '' });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const result = await window.storage.get('config-loja');
      if (result) {
        setDados(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Nenhuma configuração salva ainda');
    }
    setCarregando(false);
  };

  const handleSalvar = async () => {
    try {
      await window.storage.set('config-loja', JSON.stringify(dados));
      setConfiguracoes(dados);
      alert('Configurações salvas com sucesso! Faça logout e login novamente para ver as alterações.');
    } catch (error) {
      alert('Erro ao salvar configurações');
    }
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDados({ ...dados, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (carregando) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Configurações da Loja</h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Loja
          </label>
          <input
            type="text"
            value={dados.nomeLoja}
            onChange={(e) => setDados({ ...dados, nomeLoja: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Loja Maçônica Estrela do Oriente"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo da Loja
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagemChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {dados.logo && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Pré-visualização:</p>
              <img src={dados.logo} alt="Logo" className="h-32 border border-gray-300 rounded-lg" />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSalvar}
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Salvar Configurações
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Informações Importantes</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Os dados são salvos de forma segura e persistente</li>
          <li>• Faça logout e login novamente após alterar as configurações</li>
          <li>• Recomendamos fazer backup regular dos dados importantes</li>
        </ul>
      </div>
    </div>
  );
}