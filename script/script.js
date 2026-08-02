const form = document.getElementById('registro');
const campoData = document.getElementById('data');
const campoHoras = document.getElementById('horas');
const campoTexto = document.getElementById('texto');
const registros = document.querySelector('.registros');
const rodapeResumo = document.querySelector('footer.resumo');

function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function formatarData(dataISO) {
    if (!dataISO) {
        return '';
    }

    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarResumoHoras(totalHoras) {
    const totalMinutos = Math.round(totalHoras * 60);
    const dias = Math.floor(totalMinutos / 1440);
    const minutosRestantesDoDia = totalMinutos % 1440;
    const horasRestantes = Math.floor(minutosRestantesDoDia / 60);
    const minutosRestantes = minutosRestantesDoDia % 60;
    const partes = [];

    if (dias > 0) {
        partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
    }

    if (horasRestantes > 0) {
        partes.push(`${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}`);
    }

    if (minutosRestantes > 0 || partes.length === 0) {
        partes.push(`${minutosRestantes} ${minutosRestantes === 1 ? 'minuto' : 'minutos'}`);
    }

    return partes.join(' e ');
}

function converterHorasDigitadas(valor) {
    const texto = String(valor || '').trim();

    if (!texto) {
        return 0;
    }

    if (texto.includes(',')) {
        const [horasTexto, minutosTexto = ''] = texto.split(',');
        const horas = Number.parseInt(horasTexto, 10) || 0;
        const minutosBrutos = minutosTexto.replace(/\D/g, '');
        const minutos = minutosBrutos ? Number.parseInt(minutosBrutos.padEnd(2, '0').slice(0, 2), 10) : 0;

        return horas + (minutos / 60);
    }

    return Number.parseFloat(texto) || 0;
}

function formatarHoras(horas) {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    if (minutos === 0) {
        return `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'}`;
    }

    return `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'} e ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
}

function preencherDataPadrao() {
    if (!campoData.value) {
        campoData.value = obterDataHoje();
    }
}

function registrar(event) {
    event.preventDefault();

    const registro = {
        id: crypto.randomUUID(),
        data: campoData.value || obterDataHoje(),
        horas: campoHoras.value,
        texto: campoTexto.value
    };

    const dados = JSON.parse(localStorage.getItem('dados')) || [];
    dados.push(registro);

    localStorage.setItem('dados', JSON.stringify(dados));

    form.reset();
    preencherDataPadrao();

    mostrar();
}

form.addEventListener('submit', registrar);

function mostrar() {
    const dados = JSON.parse(localStorage.getItem('dados')) || [];

    registros.innerHTML = "";
    rodapeResumo.innerHTML = "";

    let totalHoras = 0;
    const diasFeitos = new Set();

    dados.forEach((registro, i) => {
        const card = document.createElement('div');
        card.classList.add('card');

        const horas = converterHorasDigitadas(registro.horas);
        totalHoras += horas;
        diasFeitos.add(registro.data);

        card.innerHTML = `
        <div>
            <p><strong>${formatarData(registro.data)}</strong> - ${formatarHoras(horas)} - ${registro.texto}</p>
        </div>    
        <div class="btn-excluir">Excluir</div>
        `;

        const btn = card.querySelector('.btn-excluir');
        btn.addEventListener('click', () => {
            excluir(i);
        });

        registros.appendChild(card);
    });

    const resumo = document.createElement('div');
    resumo.classList.add('card');
    resumo.innerHTML = `
        <p><strong>Total:</strong> ${formatarHoras(totalHoras)}, equivalente a ${formatarResumoHoras(totalHoras)}</p>
    `;

    rodapeResumo.appendChild(resumo);
}

function excluir(i) {
    const dados = JSON.parse(localStorage.getItem('dados')) || [];

    dados.splice(i, 1);

    localStorage.setItem('dados', JSON.stringify(dados));
    
    mostrar();
}

preencherDataPadrao();
mostrar();
