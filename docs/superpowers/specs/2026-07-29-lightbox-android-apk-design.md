# LightBox Android APK — design

## Objetivo

Entregar o LightBox como APK Android instalável diretamente em um tablet, sem depender de navegador, conexão com internet ou publicação na Play Store.

## Arquitetura

Capacitor envolverá os arquivos estáticos existentes do LightBox em um projeto Android. A interface continuará sendo HTML, CSS e JavaScript, carregada de dentro do APK. O seletor de imagem do sistema Android será aberto pelo campo de arquivo existente, oferecendo galeria, câmera e arquivos baixados conforme o tablet.

## Distribuição

Será gerado um APK de teste assinado pelo certificado de depuração do Android. A pessoa usuária transfere esse APK ao tablet e permite a instalação de fontes desconhecidas quando o Android solicitar. O app será identificado como `LightBox`, terá ícone próprio e iniciará em modo tela cheia de aplicativo.

## Dados e comportamento

Imagens permanecem locais no dispositivo e não são enviadas a servidores. Zoom, arraste, bloqueio, filtros e fundo branco para transparência preservam os comportamentos atuais. O app funciona offline porque todos os recursos são incluídos no APK.

## Verificação

O processo validará a compilação Android, a presença do APK gerado e os testes JavaScript existentes. A instalação final e os gestos no hardware exigem abrir o APK em um tablet Android.
