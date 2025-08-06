# JWT-Walkthrough

Um simples projeto base para aprender JWT com a IA23 >.<


---

## Passo a passo

### 1. Setup

* Abra a aplicação em sua IDE (vscode).
* Execute o seguinte comando no terminal.
    ```
    npm install
    ```
* Modifique o nome do arquivo `sample.env` pra `.env`.

### 2. MongoDb

* Crie um banco de dados do mongoDb localmente ou utilize o Atlas. ([Tutorial do atlas](https://www.mongodb.com/resources/products/platform/mongodb-atlas-tutorial)).
* Após iniciar o banco de dados, pegue o link de conexão e insira na seguinte linha do .env (leia a seção de [observações](#observações-importantes)).
    ```
    MONGO_URI=linkDeConexão
    ```
* Feito isso agora insira a seguinte linha no terminal para testar.
    ```
    npm run start
    ```
* Caso qualquer erro ocorra peça ajuda ou olhe na seção de [observações](#observações-importantes).

### 3. Middleware de Verificação

* Nas primeiras linhas do código é possível achar esta seção comentada:

    ```js
    const ValidarToken = (req, res, next) => {
        try {
            next();
        } catch (error) {
            res.status(401).json({ message: 'Autenticação falhou!' });
        }
    };
    ```
* Descomente esta seção e complete o código de acordo com as instruções.
* Dentro do try, declare uma constante que pegue o campo 'authorization' dos headers da requisição.
    ```js
    const token = req.headers.authorization.split(' ')
    ```
* Esta linha serve para pegar o campo do token e dividir-lo nos lugares com espaço.
* Crie um if para detectar a validade do token como elegível a verificação.
    ```js
    if(!token || token.length !== 2 || token[0] !== 'Bearer')
    ```
* Neste if é checado se o token existe, tem o tamanho requerido e se o primeiro item é o Bearer, que é pedido para o processamento.
* Dentro desse if faça o retorno próprio da verificação, uma vez que não foi válido.
    ```js
    return res.status(401).json({ message: 'Token inválido ou não fornecido!' });
    ```
* Ele retorna o status 401 (Não autorizado), e junto uma mensagem para identificação do problema.

### Observações importantes

* Somente descomente uma seção de código quando pedido.
* Não modificar os arquivos de HTML ou package.
* Problemas com MongoDb:
    + Erro de BadAuth: verifique se a senha de seu banco está correta.
    + Erro Forbidden: verifique dentro da seção de network access do Atlas, se o seu IP está liberado para uso.
    + Erro Malformed URI: verifique a sintaxe da URI inserida, caso ela esteja correta tente mudar a versão do node para 2.2.12 dentro do Atlas quando for pegar o URI.
* Qualquer dúvida pergunte aos mediadores da prática.

