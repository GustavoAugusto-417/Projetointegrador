import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDocs, collection, getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"; const firebaseConfig = {
    apiKey: "AIzaSyBDG1Q@VRwLFPj9NSVj_NmLo47nq2uZ284",
    authDomain: "vertex-controle-54a2b.firebaseapp.com",
    projectId: "vertex-controle-54a2b",
    storageBucket: "vertex-controle-54a2b.firebasestorage.app",
    messagingSenderId: "840897421971",
    appId: "1:840897421971:web:1811a7d78209e075ba366",
    measurementId: "G-CKeZLXRXXM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);;/* =========================================================
   CONTROLE DE ESTOQUE DE MATERIAIS
   VERSÃO LOCAL - SEM FIREBASE
   =========================================================

   IMPORTANTE:
   - Não apaga os dados existentes do localStorage.
   - Não usa Firebase nesta versão.
   - Mantém materiais e saídas salvos no navegador.
   ========================================================= */


/* =========================================================
   DADOS
   ========================================================= */

let materiais = carregarLista("materiaisEstoque");
let saidas = carregarLista("saidasEstoque");


/* =========================================================
   CARREGAR DADOS DO NAVEGADOR
   ========================================================= */

function carregarLista(chave) {

    try {

        const dados = localStorage.getItem(chave);

        if (!dados) {
            return [];
        }

        const lista = JSON.parse(dados);

        if (Array.isArray(lista)) {
            return lista;
        }

        return [];

    } catch (erro) {

        console.error(
            "Erro ao carregar " + chave + ":",
            erro
        );

        return [];
    }
}


/* =========================================================
   SALVAR DADOS
   ========================================================= */

function salvarLocalmente() {

    try {

        localStorage.setItem(
            "materiaisEstoque",
            JSON.stringify(materiais)
        );

        localStorage.setItem(
            "saidasEstoque",
            JSON.stringify(saidas)
        );

       // Salvar materiais também no Firebase
Promise.all(
    materiais.map(async (material) => {

        const identificador = String(
            material.codigo || material.id
        );

        if (!identificador) return;

        await setDoc(
            doc(db, "materiais", identificador),
            material
        );
    })
)
.then(() => {
    console.log("Materiais salvos no Firebase.");
})
.catch((erro) => {
    console.error("Erro ao salvar materiais no Firebase:", erro);
}); console.log("Dados salvos no navegador.");

        return true;

    } catch (erro) {

        console.error(
            "Erro ao salvar dados:",
            erro
        );

        alert(
            "Não foi possível salvar os dados no navegador."
        );

        return false;
    }
}


/* =========================================================
   FUNÇÃO AUXILIAR
   ENCONTRA UM ELEMENTO POR VÁRIOS IDs POSSÍVEIS
   ========================================================= */

function encontrarElemento(...ids) {

    for (const id of ids) {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            return elemento;
        }
    }

    return null;
}


/* =========================================================
   FORMATAÇÃO DE NÚMEROS
   ========================================================= */

function formatarNumero(valor) {

    const numero =
        Number(valor);

    if (isNaN(numero)) {
        return "0";
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Sistema de estoque iniciado.");

    // EVENTOS DO FUNCIONÁRIO
    const botaoSaida =
        document.getElementById("btnRegistrarSaida");

    if (botaoSaida) {
        botaoSaida.addEventListener("click", function () {
            registrarSaidaFuncionario();
        });
    }

    const materialFuncionario =
        document.getElementById("funcMaterial");

    if (materialFuncionario) {
        materialFuncionario.addEventListener("change", function () {
            mostrarEstoqueDisponivel();
        });
    }

    const metragemFuncionario =
        document.getElementById("funcMetragem");

    if (metragemFuncionario) {
        metragemFuncionario.addEventListener("input", function () {
            verificarMetragem();
        });
    }

    // INICIALIZAÇÃO DO SISTEMA
    verificarModo();
    atualizarTudo();
    gerarQRCode();

});


/* =========================================================
   ATUALIZAR TODA A INTERFACE
   ========================================================= */

function atualizarTudo() {

    atualizarTabelaMateriais();

    atualizarTabelaSaidas();

    atualizarHistorico();

    atualizarSelectMateriais();
}


/* =========================================================
   MODO ADMIN / FUNCIONÁRIO
   ========================================================= */

function verificarModo() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const modo =
        parametros.get("modo");


    const areaAdmin =
        document.getElementById(
            "areaAdmin"
        );

    const areaFuncionario =
        document.getElementById(
            "areaFuncionario"
        );


    if (
        !areaAdmin ||
        !areaFuncionario
    ) {
        return;
    }


    if (
        modo === "funcionario"
    ) {

        areaAdmin.style.display =
            "none";

        areaFuncionario.style.display =
            "block";

    } else {

        areaAdmin.style.display =
            "block";

        areaFuncionario.style.display =
            "none";
    }
}


/* =========================================================
   NAVEGAÇÃO ENTRE SEÇÕES
   ========================================================= */

function mostrarSecao(id) {

    const secoes =
        document.querySelectorAll(
            ".secao"
        );


    secoes.forEach(
        function (secao) {

            secao.style.display =
                "none";
        }
    );


    const secao =
        document.getElementById(id);


    if (secao) {

        secao.style.display =
            "block";
    }
}


window.mostrarSecao =
    mostrarSecao;


/* =========================================================
   CADASTRAR MATERIAL
   ========================================================= */

function cadastrarMaterial() {

    console.log(
        "Cadastro de material iniciado."
    );


    const campoCodigo =
        encontrarElemento(
            "codigoMaterial"
        );


    const campoNome =
        encontrarElemento(
            "nomeMaterial"
        );


    const campoEstoque =
        encontrarElemento(
            "estoqueMaterial"
        );


    if (
        !campoCodigo ||
        !campoNome ||
        !campoEstoque
    ) {

        alert(
            "Não encontrei os campos do cadastro de material."
        );

        return;
    }


    const codigo =
        campoCodigo.value.trim();


    const nome =
        campoNome.value.trim();


    const estoqueTexto =
        String(
            campoEstoque.value
        ).replace(
            ",",
            "."
        );


    const estoque =
        parseFloat(
            estoqueTexto
        );


    if (
        !codigo ||
        !nome ||
        isNaN(estoque)
    ) {

        alert(
            "Preencha todos os campos."
        );

        return;
    }


    if (estoque < 0) {

        alert(
            "O estoque não pode ser negativo."
        );

        return;
    }


    const existente =
        materiais.find(
            function (material) {

                return (
                    String(
                        material.codigo
                    ).trim().toLowerCase()
                    ===
                    codigo.toLowerCase()
                );
            }
        );


    if (existente) {

        alert(
            "Já existe um material com esse código."
        );

        return;
    }


    const novoMaterial = {

        id: Date.now(),

        codigo: codigo,

        nome: nome,

        estoque: estoque
    };


    materiais.push(
        novoMaterial
    );


    salvarLocalmente();

    salvarMateriaisFirebase();

    atualizarTudo();


    campoCodigo.value = "";

    campoNome.value = "";

    campoEstoque.value = "";


    alert(
        "Material cadastrado com sucesso!"
    );
}


window.cadastrarMaterial =
    cadastrarMaterial;


/* =========================================================
   TABELA DE MATERIAIS
   ========================================================= */

function atualizarTabelaMateriais() {

    const tabela =
        document.getElementById(
            "tabelaMateriais"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    if (materiais.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Nenhum material cadastrado.
                </td>
            </tr>
        `;

        return;
    }


    materiais.forEach(
        function (material) {

            const estoque =
                Number(
                    material.estoque
                ) || 0;


            let status = "";


            if (estoque <= 0) {

                status =
                    `
                    <span class="status status-esgotado">
                        Esgotado
                    </span>
                    `;

            } else if (estoque <= 10) {

                status =
                    `
                    <span class="status status-baixo">
                        Estoque baixo
                    </span>
                    `;

            } else {

                status =
                    `
                    <span class="status status-ok">
                        Disponível
                    </span>
                    `;
            }


            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${escaparHTML(material.codigo)}
                </td>

                <td>
                    ${escaparHTML(material.nome)}
                </td>

                <td>
                    <strong>
                        ${formatarNumero(estoque)} m
                    </strong>
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <button
                        class="btn-principal"
                        onclick="editarMaterial('${String(material.id)}')"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-principal"
                        onclick="excluirMaterial('${String(material.id)}')"
                        style="background:#b3261e;"
                    >
                        Excluir
                    </button>

                </td>
            `;


            tabela.appendChild(
                linha
            );
        }
    );
}


/* =========================================================
   EDITAR MATERIAL
   ========================================================= */

function editarMaterial(id) {

   const material =
    materiais.find(function (item) {
        return String(item.id) === String(materialId);
    });


    if (!material) {

        alert(
            "Material não encontrado."
        );

        return;
    }


    const novoNome =
        prompt(
            "Nome do material:",
            material.nome
        );


    if (
        novoNome === null
    ) {
        return;
    }


    if (
        !novoNome.trim()
    ) {

        alert(
            "O nome não pode ficar vazio."
        );

        return;
    }


    const novoEstoque =
        prompt(
            "Estoque atual em metros:",
            material.estoque
        );


    if (
        novoEstoque === null
    ) {
        return;
    }


    const estoqueNumerico =
        parseFloat(
            String(
                novoEstoque
            ).replace(
                ",",
                "."
            )
        );


    if (
        isNaN(estoqueNumerico) ||
        estoqueNumerico < 0
    ) {

        alert(
            "Estoque inválido."
        );

        return;
    }


    material.nome =
        novoNome.trim();


    material.estoque =
        estoqueNumerico;


    salvarLocalmente();

    atualizarTudo();


    alert(
        "Material atualizado!"
    );
}


window.editarMaterial =
    editarMaterial;


/* =========================================================
   EXCLUIR MATERIAL
   ========================================================= */

function excluirMaterial(id) {

    const material =
        materiais.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!material) {

        alert(
            "Material não encontrado."
        );

        return;
    }


    const confirmar =
        confirm(
            `Deseja excluir o material "${material.nome}"?`
        );


    if (!confirmar) {
        return;
    }


    materiais =
        materiais.filter(
            function (item) {

                return (
                    String(item.id) !==
                    String(id)
                );
            }
        );


    salvarLocalmente();

    atualizarTudo();


    alert(
        "Material excluído!"
    );
}


window.excluirMaterial =
    excluirMaterial;


/* =========================================================
   ATUALIZAR SELECT DE MATERIAIS
   ========================================================= */

function atualizarSelectMateriais() {

    const select =
        encontrarElemento(
            "materialSaida",
            "materialSelect",
            "selectMaterial",
            "material" ,
            "funcMaterial"
        );


    if (
        !select ||
        select.tagName !== "SELECT"
    ) {
        return;
    }


    const valorAtual =
        select.value;


    select.innerHTML = "";


    const opcaoInicial =
        document.createElement(
            "option"
        );


    opcaoInicial.value = "";

    opcaoInicial.textContent =
        "Selecione o material";


    select.appendChild(
        opcaoInicial
    );


    materiais.forEach(
        function (material) {

            const opcao =
                document.createElement(
                    "option"
                );


            opcao.value =
                material.id;


            opcao.textContent =
                `${material.codigo} - ${material.nome} (${formatarNumero(material.estoque)} m)`;


            select.appendChild(
                opcao
            );
        }
    );


    if (valorAtual) {

        const existe =
            Array.from(
                select.options
            ).some(
                function (opcao) {

                    return (
                        opcao.value ===
                        valorAtual
                    );
                }
            );


        if (existe) {
            select.value =
                valorAtual;
        }
    }
}


/* =========================================================
   CADASTRAR SAÍDA DE MATERIAL
   ========================================================= */

function cadastrarSaida() {

    console.log(
        "Cadastro de saída iniciado."
    );


    const campoMatricula =
        encontrarElemento(
            "matricula",
            "matriculaFuncionario",
            "matriculaSaida"
        );


    const campoNome =
        encontrarElemento(
            "nomeFuncionario",
            "nomeSaida",
            "nome"
        );


    const campoSetor =
        encontrarElemento(
            "setorFuncionario",
            "setorSaida",
            "setor"
        );


    const campoFuncao =
        encontrarElemento(
            "funcaoFuncionario",
            "funcaoSaida",
            "funcao"
        );


    const campoMaterial =
        encontrarElemento(
            "materialSaida",
            "materialSelect",
            "selectMaterial"
        );


    const campoMetragem =
        encontrarElemento(
            "metragemSaida",
            "quantidadeSaida",
            "metragem"
        );


    if (
        !campoMatricula ||
        !campoNome ||
        !campoSetor ||
        !campoFuncao ||
        !campoMaterial ||
        !campoMetragem
    ) {

        alert(
            "Não encontrei todos os campos da saída de material."
        );

        console.log({
            matricula: campoMatricula,
            nome: campoNome,
            setor: campoSetor,
            funcao: campoFuncao,
            material: campoMaterial,
            metragem: campoMetragem
        });

        return;
    }


    const matricula =
        campoMatricula.value.trim();


    const nome =
        campoNome.value.trim();


    const setor =
        campoSetor.value.trim();


    const funcao =
        campoFuncao.value.trim();


    const materialId =
        campoMaterial.value;


    const metragem =
        parseFloat(
            String(
                campoMetragem.value
            ).replace(
                ",",
                "."
            )
        );


    if (
        !matricula ||
        !nome ||
        !setor ||
        !funcao ||
        !materialId ||
        isNaN(metragem)
    ) {

        alert(
            "Preencha todos os campos da saída."
        );

        return;
    }


    if (metragem <= 0) {

        alert(
            "A metragem deve ser maior que zero."
        );

        return;
    }


    const material =
        materiais.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(materialId)
                );
            }
        );


    if (!material) {

        alert(
            "Material não encontrado."
        );

        return;
    }


    const estoqueAtual =
        Number(
            material.estoque
        ) || 0;


    if (
        metragem > estoqueAtual
    ) {

        alert(
            "Estoque insuficiente.\n\n" +
            `Estoque disponível: ${formatarNumero(estoqueAtual)} m\n` +
            `Solicitado: ${formatarNumero(metragem)} m`
        );

        return;
    }


    const novaSaida = {

        id: Date.now(),

        data:
            new Date().toLocaleString(
                "pt-BR"
            ),

        matricula:
            matricula,

        nome:
            nome,

        setor:
            setor,

        funcao:
            funcao,

        materialId:
            material.id,

        material:
            material.nome,

        metragem:
            metragem
    };


    /* -----------------------------------------
       DESCONTA DO ESTOQUE
       ----------------------------------------- */

    material.estoque =
        estoqueAtual -
        metragem;


    /* -----------------------------------------
       REGISTRA A SAÍDA
       ----------------------------------------- */

    saidas.push(
        novaSaida
    );


    /* -----------------------------------------
       SALVA
       ----------------------------------------- */

    salvarLocalmente();


    /* -----------------------------------------
       ATUALIZA A TELA
       ----------------------------------------- */

    atualizarTudo();


    /* -----------------------------------------
       LIMPA OS CAMPOS
       ----------------------------------------- */

    campoMatricula.value = "";

    campoNome.value = "";

    campoSetor.value = "";

    campoFuncao.value = "";

    campoMaterial.value = "";

    campoMetragem.value = "";


    alert(
        "Saída registrada com sucesso!"
    );
}


window.cadastrarSaida =
    cadastrarSaida;


/* =========================================================
   TABELA DE SAÍDAS
   ========================================================= */

function atualizarTabelaSaidas() {

    const tabela =
        document.getElementById(
            "tabelaSaidas"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    if (saidas.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Nenhuma saída registrada.
                </td>
            </tr>
        `;

        return;
    }


    const lista =
        [...saidas].reverse();


    lista.forEach(
        function (saida) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${escaparHTML(saida.data || "")}
                </td>

                <td>
                    ${escaparHTML(saida.matricula || "")}
                </td>

                <td>
                    ${escaparHTML(saida.nome || "")}
                </td>

                <td>
                    ${escaparHTML(saida.setor || "")}
                </td>

                <td>
                    ${escaparHTML(saida.funcao || "")}
                </td>

                <td>
                    ${escaparHTML(saida.material || "")}
                </td>

                <td>
                    <strong>
                        ${formatarNumero(saida.metragem)} m
                    </strong>
                </td>

                <td>
                    <button
                        class="btn-principal"
                        onclick="excluirSaida('${String(saida.id)}')"
                        style="background:#b3261e;"
                    >
                        Excluir
                    </button>
                </td>

            `;


            tabela.appendChild(
                linha
            );
        }
    );
}


/* =========================================================
   EXCLUIR SAÍDA
   DEVOLVE O MATERIAL AO ESTOQUE
   ========================================================= */

function excluirSaida(id) {

    const saida =
        saidas.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );


    if (!saida) {

        alert(
            "Saída não encontrada."
        );

        return;
    }


    const confirmar =
        confirm(
            "Deseja excluir esta saída?\n\n" +
            `Material: ${saida.material}\n` +
            `Quantidade: ${formatarNumero(saida.metragem)} m\n` +
            `Funcionário: ${saida.nome}`
        );


    if (!confirmar) {
        return;
    }


    /* -----------------------------------------
       DEVOLVE A METRAGEM AO ESTOQUE
       ----------------------------------------- */

    const material =
        materiais.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(saida.materialId)
                );
            }
        );


    if (material) {

        material.estoque =
            (
                Number(material.estoque) || 0
            ) +
            (
                Number(saida.metragem) || 0
            );
    }


    /* -----------------------------------------
       REMOVE A SAÍDA
       ----------------------------------------- */

    saidas =
        saidas.filter(
            function (item) {

                return (
                    String(item.id) !==
                    String(id)
                );
            }
        );


    salvarLocalmente();

    atualizarTudo();


    alert(
        "Saída excluída e estoque devolvido!"
    );
}


window.excluirSaida =
    excluirSaida;


/* =========================================================
   HISTÓRICO
   ========================================================= */

function atualizarHistorico() {

    const tabela =
        encontrarElemento(
            "tabelaHistorico",
            "historicoTabela"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    if (saidas.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Nenhum registro no histórico.
                </td>
            </tr>
        `;

        return;
    }


    const lista =
        [...saidas].reverse();


    lista.forEach(
        function (saida) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${escaparHTML(saida.data || "")}
                </td>

                <td>
                    ${escaparHTML(saida.matricula || "")}
                </td>

                <td>
                    ${escaparHTML(saida.nome || "")}
                </td>

                <td>
                    ${escaparHTML(saida.setor || "")}
                </td>

                <td>
                    ${escaparHTML(saida.funcao || "")}
                </td>

                <td>
                    ${escaparHTML(saida.material || "")}
                </td>

                <td>
                    ${formatarNumero(saida.metragem)} m
                </td>

            `;


            tabela.appendChild(
                linha
            );
        }
    );
}


/* =========================================================
   QR CODE
   ========================================================= */

function gerarQRCode() {

    const elemento =
        document.getElementById(
            "qrcode"
        );


    if (!elemento) {

        console.log(
            "Elemento #qrcode não encontrado."
        );

        return;
    }


    elemento.innerHTML = "";


    /*
     * O QR Code depende da biblioteca QRCode
     * que deve estar carregada pelo index.html.
     */

    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.warn(
            "Biblioteca QRCode não encontrada."
        );

        return;
    }


    try {

        new QRCode(
            elemento,
            {
                text:
                
    "http://192.168.1.103:5500/index.html?modo=funcionario",
                width:
                    200,

                height:
                    200,

                correctLevel:
                    QRCode.CorrectLevel
                        ? QRCode.CorrectLevel.H
                        : undefined
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao gerar QR Code:",
            erro
        );
    }
}


/* =========================================================
   ATUALIZAR QR CODE
   ========================================================= */

window.gerarQRCode =
    gerarQRCode;


/* =========================================================
   LIMPAR TODOS OS DADOS
   =========================================================

   ATENÇÃO:
   Esta função NÃO é executada automaticamente.

   Só será executada se você chamar:
   limparTodosDados()

   Não usamos isso na inicialização justamente
   para evitar apagar seus materiais.
   ========================================================= */

function limparTodosDados() {

    const confirmar =
        confirm(
            "ATENÇÃO!\n\n" +
            "Isso apagará TODOS os materiais e TODAS as saídas " +
            "salvas neste navegador.\n\n" +
            "Deseja realmente continuar?"
        );


    if (!confirmar) {
        return;
    }


    materiais = [];

    saidas = [];


    localStorage.removeItem(
        "materiaisEstoque"
    );


    localStorage.removeItem(
        "saidasEstoque"
    );


    atualizarTudo();


    alert(
        "Todos os dados foram apagados."
    );
}


window.limparTodosDados =
    limparTodosDados;


/* =========================================================
   EXPORTAR DADOS
   ========================================================= */

function exportarDados() {

    const dados = {

        materiais:
            materiais,

        saidas:
            saidas,

        dataExportacao:
            new Date().toLocaleString(
                "pt-BR"
            )
    };


    const arquivo =
        new Blob(
            [
                JSON.stringify(
                    dados,
                    null,
                    4
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            arquivo
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "backup-estoque.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    alert(
        "Backup criado com sucesso!"
    );
}


window.exportarDados =
    exportarDados;


/* =====================================================
   IMPORTAR BACKUP
===================================================== */

function importarDados(evento) {

    try {

        // Aceita tanto um evento quanto o próprio input
        const arquivo =
            evento?.target?.files?.[0] ||
            evento?.files?.[0];

        if (!arquivo) {
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (e) {

            try {

                const dados = JSON.parse(
                    e.target.result
                );

                /* -----------------------------------------
                   VERIFICAR FORMATO DO BACKUP
                ----------------------------------------- */

                if (
                    !Array.isArray(dados.materiais) &&
                    !Array.isArray(dados.saidas)
                ) {

                    alert(
                        "Este arquivo não é um backup válido do sistema."
                    );

                    return;
                }


                /* -----------------------------------------
                   RECUPERAR MATERIAIS
                ----------------------------------------- */

                if (
                    Array.isArray(dados.materiais)
                ) {

                    materiais =
                        dados.materiais.map(
                            function (material) {

                                return {

                                    id:
                                        Number(material.id) ||
                                        Date.now() +
                                        Math.random(),

                                    codigo:
                                        String(
                                            material.codigo || ""
                                        ),

                                    nome:
                                        String(
                                            material.nome || ""
                                        ),

                                    estoque:
                                        Number(
                                            material.estoque
                                        ) || 0
                                };
                            }
                        );
                }


                /* -----------------------------------------
                   RECUPERAR SAÍDAS
                ----------------------------------------- */

                if (
                    Array.isArray(dados.saidas)
                ) {

                    saidas =
                        dados.saidas.map(
                            function (saida) {

                                return {

                                    id:
                                        Number(saida.id) ||
                                        Date.now() +
                                        Math.random(),

                                    data:
                                        saida.data || "",

                                    matricula:
                                        saida.matricula || "",

                                    nome:
                                        saida.nome || "",

                                    setor:
                                        saida.setor || "",

                                    funcao:
                                        saida.funcao || "",

                                    materialId:
                                        saida.materialId || "",

                                    material:
                                        saida.material || "",

                                    metragem:
                                        Number(
                                            saida.metragem
                                        ) || 0
                                };
                            }
                        );
                }


                /* -----------------------------------------
                   SALVAR NO COMPUTADOR
                ----------------------------------------- */

                salvarLocalmente();


                /* -----------------------------------------
                   ATUALIZAR O SITE
                ----------------------------------------- */

                atualizarTudo();


                /* -----------------------------------------
                   SALVAR NOVAMENTE NO FIREBASE
                ----------------------------------------- */

                salvarDados()
                    .then(
                        function () {

                            console.log(
                                "Backup restaurado e enviado ao Firebase."
                            );
                        }
                    )
                    .catch(
                        function (erro) {

                            console.error(
                                "Erro ao enviar backup para o Firebase:",
                                erro
                            );
                        }
                    );


                alert(
                    "Backup importado com sucesso!\n\n" +
                    "Materiais: " +
                    materiais.length +
                    "\nSaídas: " +
                    saidas.length
                );


                /* -----------------------------------------
                   LIMPAR INPUT
                ----------------------------------------- */

                if (
                    evento?.target
                ) {

                    evento.target.value = "";
                }

            } catch (erro) {

                console.error(
                    "Erro ao ler backup:",
                    erro
                );

                alert(
                    "Não foi possível ler o backup.\n\n" +
                    "O arquivo pode estar corrompido ou não ser um backup válido."
                );
            }
        };


        leitor.onerror = function () {

            alert(
                "Não foi possível abrir o arquivo de backup."
            );
        };


        leitor.readAsText(arquivo);

    } catch (erro) {

        console.error(
            "Erro ao importar backup:",
            erro
        );

        alert(
            "Ocorreu um erro ao importar o backup."
        );
    }
}


window.importarDados =
    importarDados;

/* =========================================================
   ESCAPAR HTML
   Evita problemas quando nomes possuem caracteres especiais.
   ========================================================= */

function escaparHTML(valor) {

    const texto =
        String(
            valor ?? ""
        );


    return texto
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   PESQUISA DE MATERIAIS
   ========================================================= */

function pesquisarMateriais() {

    const campo =
        encontrarElemento(
            "pesquisaMaterial",
            "buscarMaterial",
            "filtroMaterial"
        );


    const tabela =
        document.getElementById(
            "tabelaMateriais"
        );


    if (
        !campo ||
        !tabela
    ) {
        return;
    }


    const texto =
        campo.value
            .trim()
            .toLowerCase();


    const linhas =
        tabela.querySelectorAll(
            "tr"
        );


    linhas.forEach(
        function (linha) {

            const conteudo =
                linha.textContent
                    .toLowerCase();


            linha.style.display =
                conteudo.includes(texto)
                    ? ""
                    : "none";
        }
    );
}


window.pesquisarMateriais =
    pesquisarMateriais;


/* =========================================================
   MOSTRAR RESUMO DO ESTOQUE
   ========================================================= */

function atualizarResumo() {

    const totalMateriais =
        materiais.length;


    const totalEstoque =
        materiais.reduce(
            function (total, material) {

                return (
                    total +
                    (
                        Number(
                            material.estoque
                        ) || 0
                    )
                );
            },
            0
        );


    const totalSaidas =
        saidas.length;


    const elementoMateriais =
        encontrarElemento(
            "totalMateriais",
            "contadorMateriais"
        );


    const elementoEstoque =
        encontrarElemento(
            "totalEstoque",
            "contadorEstoque"
        );


    const elementoSaidas =
        encontrarElemento(
            "totalSaidas",
            "contadorSaidas"
        );


    if (elementoMateriais) {

        elementoMateriais.textContent =
            totalMateriais;
    }


    if (elementoEstoque) {

        elementoEstoque.textContent =
            `${formatarNumero(totalEstoque)} m`;
    }


    if (elementoSaidas) {

        elementoSaidas.textContent =
            totalSaidas;
    }
}


/* =========================================================
   ATUALIZAÇÃO FINAL DO SISTEMA
   ========================================================= */

const atualizarTudoOriginal =
    atualizarTudo;


/*
 * Substitui a função por uma versão que também
 * atualiza os contadores, caso existam no HTML.
 */

atualizarTudo =
    function () {

        atualizarTudoOriginal();

        atualizarResumo();
    };


/* =========================================================
   GARANTIA DE ATUALIZAÇÃO DOS DADOS
   ========================================================= */

console.log(
    "Materiais carregados:",
    materiais
);

console.log(
    "Saídas carregadas:",
    saidas
);

console.log(
    "Script do sistema carregado corretamente."
);
/* =====================================================
   RECUPERAR MATERIAIS DO FIREBASE
===================================================== */

async function recuperarMateriaisFirebase() {

    console.log("=================================");
    console.log("INICIANDO RECUPERAÇÃO DO FIREBASE");
    console.log("=================================");

    try {

        const snapshot = await getDocs(
            collection(db, "materiais")
        );

        const materiaisRecuperados = [];

        snapshot.forEach(function(documento) {

            const dados = documento.data();

            console.log(
                "Material encontrado:",
                documento.id,
                dados
            );

            if (dados.nome) {

                const material = {

                    id:
                        dados.id ??
                        documento.id,

                    codigo:
                        dados.codigo ??
                        documento.id,

                    nome:
                        dados.nome,

                    estoque:
                        Number(
                            dados.estoque ??
                            dados.quantidade ??
                            0
                        )
                };

                materiaisRecuperados.push(material);
               
atualizarTudo();
            }
        });


        /* =============================================
           COLOCAR OS MATERIAIS NA MEMÓRIA DO SISTEMA
        ============================================= */

        materiais = materiaisRecuperados;


        /* =============================================
           SALVAR NO NAVEGADOR
        ============================================= */

        localStorage.setItem(
            "materiaisEstoque",
            JSON.stringify(materiais)
        );


        /* =============================================
           ATUALIZAR A TELA
        ============================================= */

        atualizarTabelaMateriais();

        if (
            typeof atualizarSelectMateriais ===
            "function"
        ) {

            atualizarSelectMateriais();
        }


        console.log(
            "Materiais recuperados:",
            materiais.length
        );

        console.log(
            materiais
        );


        if (materiais.length > 0) {

            alert(
                materiais.length +
                " materiais recuperados do Firebase!"
            );

        } else {

            alert(
                "O Firebase respondeu, mas nenhum material foi encontrado."
            );
        }


    } catch (erro) {

        console.error(
            "ERRO AO RECUPERAR MATERIAIS:",
            erro
        );

        alert(
            "Erro ao recuperar os materiais do Firebase.\n\n" +
            "Abra o F12 e veja o Console."
        );
    }
}


/* =====================================================
   EXECUTAR RECUPERAÇÃO AO ABRIR O SITE
===================================================== */

window.addEventListener(
    "load",
    function() {

       if (!materiais.length) {
    recuperarMateriaisFirebase();
}

    }
);  // ======================================================
// MIGRAR MATERIAIS DO LOCALSTORAGE PARA O FIREBASE
// NÃO APAGA OS DADOS LOCAIS
// ======================================================

async function migrarMateriaisParaFirebase() {

    try {

        // Faz uma cópia dos materiais locais
        const materiaisParaEnviar = [...materiais];

        if (!materiaisParaEnviar.length) {
            alert("Nenhum material local encontrado.");
            return;
        }

        console.log("Iniciando migração de", materiaisParaEnviar.length, "materiais...");

        let enviados = 0;

        for (let i = 0; i < materiaisParaEnviar.length; i++) {

            const material = materiaisParaEnviar[i];

            // Usa o código ou ID existente como identificador
            const identificador = String(
                material.codigo ||
                material.id ||
                `material-${i + 1}`
            );

            await setDoc(
                doc(db, "materiais", identificador),
                {
                    ...material
                }
            );

            enviados++;

            console.log(
                `Material ${enviados}/${materiaisParaEnviar.length} enviado:`,
                material.nome
            );
        }

        console.log(
            "MIGRAÇÃO CONCLUÍDA:",
            enviados,
            "materiais enviados para o Firebase."
        );

        alert(
            `Migração concluída!\n\n${enviados} materiais foram enviados para o Firebase.\n\nSeus dados locais foram mantidos.`
        );

    } catch (erro) {

        console.error("ERRO NA MIGRAÇÃO:", erro);

        alert(
            "Ocorreu um erro durante a migração.\n\n" +
            "Seus materiais locais NÃO foram apagados."
        );
    }
}

// Permite executar a função pelo navegador
async function salvarDados() {
    localStorage.setItem(
        "materiaisEstoque",
        JSON.stringify(materiais)
    );

    localStorage.setItem(
        "saidasEstoque",
        JSON.stringify(saidas)
    );

    try {
        await setDoc(DADOS_REF, {
            materiais: materiais,
            saidas: saidas,
            atualizadoEm: new Date().toISOString()
        });

        console.log("Dados salvos no Firebase com sucesso.");
        return true;

   } catch (erro) {
    console.error("Erro ao salvar no Firebase:", erro);
    alert("ERRO FIREBASE: " + erro.message);
    return false;
}

}
async function registrarSaidaFuncionario() {
    alert("A FUNÇÃO DE REGISTRAR SAÍDA FOI CHAMADA");
    console.log("CLIQUE NO REGISTRAR SAÍDA FUNCIONOU");
    const matricula =
        document.getElementById("funcMatricula").value.trim();

    const nome =
        document.getElementById("funcNome").value.trim();

    const setor =
        document.getElementById("funcSetor").value.trim();

    const funcao =
        document.getElementById("funcaoFuncionario").value.trim();

    const materialId =
        document.getElementById("funcMaterial").value;

    const metragem =
        parseFloat(
            String(
                document.getElementById("funcMetragem").value
            ).replace(",", ".")
        );

    if (
        !matricula ||
        !nome ||
        !setor ||
        !funcao ||
        !materialId ||
        isNaN(metragem)
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    if (metragem <= 0) {
        alert("Informe uma metragem válida.");
        return;
    }

    const material =
        materiais.find(function (item) {
            return Number(item.id) === Number(materialId);
        });

    if (!material) {
        alert("Material não encontrado.");
        return;
    }

    if (metragem > Number(material.estoque)) {
        alert(
            `Estoque insuficiente!\n\nDisponível: ${formatarNumero(material.estoque)} m`
        );
        return;
    }

    material.estoque =
        Number(material.estoque) - metragem;

    const novaSaida = {
        id: Date.now(),
        data: new Date().toLocaleDateString("pt-BR"),
        matricula: matricula,
        nome: nome,
        setor: setor,
        funcao: funcao,
        materialId: material.id,
        material: material.nome,
        metragem: metragem
    };

    saidas.push(novaSaida);

    const salvou = await salvarLocalmente();

    atualizarTudo();

    document.getElementById("funcMatricula").value = "";
    document.getElementById("funcNome").value = "";
    document.getElementById("funcSetor").value = "";
    document.getElementById("funcaoFuncionario").value = "";
    document.getElementById("funcMaterial").value = "";
    document.getElementById("funcMetragem").value = "";

    const estoqueDisponivel =
        document.getElementById("estoqueDisponivel");

    if (estoqueDisponivel) {
        estoqueDisponivel.textContent =
            "Selecione um material para visualizar o estoque.";
    }

    const mensagemEstoque =
        document.getElementById("mensagemEstoque");

    if (mensagemEstoque) {
        mensagemEstoque.style.display = "none";
    }

    if (salvou) {
        alert(
            `Retirada registrada com sucesso!\n\nMaterial: ${material.nome}\nMetragem: ${formatarNumero(metragem)} m`
        );
    } else {
        alert(
            "Retirada registrada neste computador, mas houve erro ao sincronizar com o Firebase."
        );
    }
}
const botaoRegistrarSaida = document.getElementById("btnRegistrarSaida");

if (botaoRegistrarSaida) {
    botaoRegistrarSaida.onclick = registrarSaidaFuncionario;
}
