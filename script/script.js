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

    if (texto.includes(':')) {
        const [horasTexto, minutosTexto = '0'] = texto.split(':');
        const horas = Number.parseInt(horasTexto, 10) || 0;
        const minutos = Number.parseInt(minutosTexto, 10) || 0;

        return horas + (minutos / 60);
    }

    if (texto.includes(',') || texto.includes('.')) {
        const separador = texto.includes(',') ? ',' : '.';
        const [horasTexto, parteFinal = ''] = texto.split(separador);
        const horas = Number.parseInt(horasTexto, 10) || 0;
        const parteLimpa = parteFinal.replace(/\D/g, '');

        if (parteLimpa.length === 2) {
            const minutos = Number.parseInt(parteLimpa, 10) || 0;

            if (minutos <= 59) {
                return horas + (minutos / 60);
            }
        }

        const decimal = Number.parseFloat(`${horasTexto}.${parteLimpa}`);

        return Number.isFinite(decimal) ? decimal : horas;
    }

    return Number.parseFloat(texto) || 0;
}

function formatarHoras(horas) {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    if (minutos === 60) {
        return `${horasInteiras + 1} ${horasInteiras + 1 === 1 ? 'hora' : 'horas'}`;
    }

    if (minutos === 0) {
        return `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'}`;
    }

    return `${horasInteiras} ${horasInteiras === 1 ? 'hora' : 'horas'} e ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
}

function ordenarDadosPorDataDesc(dados) {
    return [...dados].sort((a, b) => {
        const dataA = new Date(`${a.data}T00:00:00`);
        const dataB = new Date(`${b.data}T00:00:00`);

        return dataB - dataA;
    });
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
    const dadosOrdenados = ordenarDadosPorDataDesc(dados);

    localStorage.setItem('dados', JSON.stringify(dadosOrdenados));

    form.reset();
    preencherDataPadrao();

    mostrar();
}

form.addEventListener('submit', registrar);

function mostrar() {
    const dados = JSON.parse(localStorage.getItem('dados')) || [];
    const dadosOrdenados = ordenarDadosPorDataDesc(dados);

    registros.innerHTML = "";
    rodapeResumo.innerHTML = "";

    let totalHoras = 0;
    const diasFeitos = new Set();

    dadosOrdenados.forEach((registro) => {
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
            excluir(registro.id);
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

function excluir(id) {
    const dados = JSON.parse(localStorage.getItem('dados')) || [];

    const dadosAtualizados = dados.filter((registro) => registro.id !== id);

    localStorage.setItem('dados', JSON.stringify(dadosAtualizados));
    
    mostrar();
}

preencherDataPadrao();
mostrar();
