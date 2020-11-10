Descrição:
    Este projeto se trata de uma API que recebe requisições HTTP e realiza operações como criação, atualização e remoção de clientes/usuarios de uma banco de dados.

Instalação:
    Instale o postgreSQL versão 12.1.3 - windows-x64, apos isso realize a instalação do mesmo. É recomendável que durante a instalação do postgreSQL, a senha do banco seja definida como "2262333" caso contrario será necessário acessar o arquivo "DB.js" e alterar a linha 7 para a senha de sua preferencia.

    Outro ponto importante é que após a instalação, seja realizada a abertura do SQLShell(psql), realize o login e rode o seguinte comando para criar uma database "CREATE DATABASE pgmais;"

    Apos isso certifique-se que esta conectado a internet para que a API não tenha problemas para validar o CEP.

Testar:
    Para testar a API é recomendado acessar a documentação da API para ter acesso aos end-points 
    
Propriedades da API:

    Sistema Operacional:
        Windows 10
    Editor de texto: 
        VScode
    Bibliotecas:
        Multer, CSV-TO-JSON, PG, FS, body-parser, express
