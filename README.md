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
* Dentro do .env insira uma string de sua escolha para servir de chave secreta para o JWT
    ```
    JWT_SECRET=chaveSuperSecreta
    ```

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
    const token = req.headers.authorization.split(' ');
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
* Agora é a hora de decodificar o token usando o JWT e nossa senha secreta encontrada no .env .
    ```js
    const decodedToken = jwt.verify(token[1],process.env.JWT_SECRET);
    ```
* Com isto feito, podemos retornar o token decodificado e também deixar um log no console como forma de checar se deu tudo certo.
    ```js
    console.log("Token decodificado: ", decodedToken);
    req.user = { valid: true, userName: decodedToken.user.username, safeFile: decodedToken.user.safeFile  };
    ```
* Pronto, terminamos de mecher no middleware da verificação. Vale adicionar que ao invés de um res, esta função retorna os valores dentro da requisição, sendo assim valores acessados mais facilmente.
* Antes de seguirmos para a próxima parte, podemos olhar para a as ultimas linhas do servidor, onde se encontra a seguinte função:
    ```js
    app.get("/api/validate-token", ValidarToken, (req,res)=>{
        if(!req.user || !req.user.valid) {
            res.status(403).json({valid: false, message: "Invalid token"});
            } else {
                console.log("Usuário autenticado:", req.user);
                res.json(req.user);
            }
    });
    ```
* Nestas linhas é declarada a API de validação do Token, sendo ela utilizada para fazer requerimentos de validação à nível fora do servidor.
* Agora vamos fazer o Handling do login, pode ser decomentada a seguinte seção do código:
    ```js
    app.post("/login",(req,res)=>{
        const {body} = req;
        const {username,password} = body;
    });
    ```
* Por enquanto esta seção somente pega o body da requisição e depois os valores de usuário e senha encontrados dentro do body. Mas teremos que fazer o resto desse código para ele funcionar.
* Este código é bem simples, somente precisamos utilizar uma função do mongoose para encontrar um usuário com aquele nome e senha, da seguinte forma:
    ```js
    User.findOne({username,password}).then((user)=>{
        const token = jwt.sign({user}, process.env.JWT_SECRET);
        res.json({token, redirectUrl: "/safe"});
    });
    ```
* Viu como foi simples! Enfim este código acha um usuário com o nome e senha fornecidos, e então cria um token baseado nele e a chave secreta, e após isso retorna o token e uma URL de redirecionamento.

### 4. Login

* Agora iremos olhar o arquivo [login.js](public/script/login.js) e como ele faz o handling da autentificação.
* Primeiramente o código inteiro deste script esta dentro do evento de submissão de formulário, e dentro dele que irá ficar.
* Dentro da função try, podemos encontrar o seguinte código:
    ```js
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    });
    ```
* Essa declaração de constante recebe o valor do fetch da rota de login quando post, contendo como body o nome e senha fornecidos pelo usuário em forma de um JSON "Stringficado".
* Logo abaixo pode se encontrar a seguinte linha:
    ```js
    const data = await response.json();
    ```
* Aqui ele converte o a response em um json e dá este valor para a const data.
* Logo abaixo é feito um if para handling da response do login, decindindo o que será feito caso dê erro ous esteja certo.
* Dentro deste if é colocado o token no armazenamento local do navegador, e depois redireciona a página para a URL de redirecionamento ou o default "/safe":
    ```js
    localStorage.setItem('token', data.token);
    window.location.href = data.redirectUrl || '/safe';
    ```
* Esse foi o handling do login. Na próxima seção terá a página segura.

### 5. Página Segura

* Podemos redirecionar nosso olhar agora para o código da [página segura](public/script/safe.js)
* Muito desse código pode ser ignorado, pois é para o funcionamento estético da página.
* Onde trabalharemos será na função de botão na linha 35:
    ```js
    safeimgtag.addEventListener('click', function(e) {
    ```
* A primeira coisa que é feita é um if para ver se sequer exite o token, e então poder fazer o resto do processo.
* Dentro desse if vemos as seguintes funções:
    ```js
    fetch('/api/validate-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
    ```
* Aqui fazemos algo similar ao que é apresentado no login, fazemos um fetch na API de validação enviando o token que temos.Então a resposta é convertida em json e atribuída a 'data'. Igual no login.
* Tendo a os dados(data) em mão, fazemos um if para verificar se esta data é válida e então realizamos o código a seguir:
    ````js
    let videoPath = data.safeFile;  
    safeimgtag.src = '/safe/opened.png';
    videotag.innerHTML = `<video id="videoPlayer" controls autoplay>  <source src="/api/safe-file/${videoPath}" type="video/mp4"></video>`;
    ```
* Aqui pegamos o valor de safeFile atribuído ao usuário que é encontrado em data, e damos este valor a videoPath. A segunda linha é cosmética. Já a terceira linha insere dentro do HTML do objeto videotag, o html para receber o video do servidor e utiliza a API que faremos a seguir para receber o vídeo baseado no videoPath.
* Pronto, é assim que foi feita a verificação de autencidade para acessar a página segura, embora seja possível acessar a página sem a verificação, nada será mostrando durante a mesma.
* Caso queira é possível executar o código a seguir no terminal para testar a aplicação até agora.Lembre-se de olhar o nome e senha na declaração de usuários no [server.js](server.js)
```
    npm run start
```

### 6. Video
* Agora faremos a API para enviar o vídeo requerido.
* Descomente o seguinte código:
    ```js
    app.get("/api/safe-file/:videofile", (req, res) => {
        const videofile = req.params.videofile;
        const filePath = path.join(__dirname, 'safe-videos', videofile);
    });
    ```
* Por enquanto a API está declarando o caminho do vídeo baseado no nome dado na URL da API, mas ainda precisamos enviar o vídeo de alguma forma.
* São duas formas possíveis de se fazer:
#### 6.1. Enviar Arquivo
* Essa é uma forma mais simples de se fazer o envio do vídeo, porém não é o ideal, uma vez que manda o vídeo de uma vez só não importando o seu tamanho.
* O código para ele é o seguinte:
    ```js
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Erro ao enviar o arquivo:', err);
            if (!res.headersSent) {
                res.status(404).json({ message: 'Arquivo não encontrado' });
            }
        }
    });
    ```
* Aqui é simplesmente mandado o arquivo e feito handling para erros.

#### 6.2. Streaming
* Esse meio de enviar o arquivo é a melhor opção pois manda de forma continua ao invés de uma vez só, sendo melhor para arquivos grandes.
* O código é o seguinte:
    ```js
    const stat = fs.statSync(filePath); // aqui esta fazendo stream do arquivo
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size
    });
    fs.createReadStream(filePath).pipe(res);
    ```
* Primeiro é pego dados importantes do vídeo de forma síncrona usando a função fs.statSync() .
* Depois a response do header informa o formato do vídeo e o tamanho dele.
* E para finalizar é criada a stream e sua handling correta.
* Essa é a melhor forma de se fazer embora ela tenha sido feita muito simples e pode ser expandida de forma mais adequada e com handling para mudar o momento do vídeo.

### 7. Finalizar
* Acabamos, agora somente rode o código a seguir e qualquer dúvida lembre de perguntar
    ```
    npm run start
    ```
* Muito obrigado galerinha >.<!!!!!!
### Observações importantes

* Somente descomente uma seção de código quando pedido.
* Não modificar os arquivos de HTML ou package.
* Variaveis dentro do .env devem ser feitas da seguinte forma
    + Nome em maiúsculo sem caracteres especias
    + Sem espaço na declaração, nem entre a variavel e o símbolo de igual, ou entre o igual e o valor declarado
    + Segue exemplo:
        ```
        VARIAVEL=VALOR
        ```
* Problemas com MongoDb:
    + Erro de BadAuth: verifique se a senha de seu banco está correta.
    + Erro Forbidden: verifique dentro da seção de network access do Atlas, se o seu IP está liberado para uso.
    + Erro Malformed URI: verifique a sintaxe da URI inserida, caso ela esteja correta tente mudar a versão do node para 2.2.12 dentro do Atlas quando for pegar o URI.
* Qualquer dúvida pergunte aos mediadores da prática.

