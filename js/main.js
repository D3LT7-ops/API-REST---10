document.getElementById('consultar').addEventListener('click', function() {
    const codigoFipe = document.getElementById('codigoFipe').value;
    const url = `https://brasilapi.com.br/api/fipe/preco/v1/${codigoFipe}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na consulta');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('resultado').innerHTML = `
                <h2>Resultado:</h2>
                <p>Preço: R$ ${data.preco}</p>
                <p>Marca: ${data.marca}</p>
                <p>Modelo: ${data.modelo}</p>
                <p>Ano: ${data.ano}</p>
            `;
        })
        .catch(error => {
            window.location.href = 'erro.html';
        });
});