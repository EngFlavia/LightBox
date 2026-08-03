# LightBox mobile — design

## Objetivo

Criar um visualizador de imagens instalável em celulares e tablets. A pessoa usuária escolhe uma imagem da galeria, câmera ou armazenamento local, ajusta seu enquadramento com zoom e arraste e pode congelar a interação com um cadeado.

## Plataforma e arquitetura

O produto será uma PWA estática, construída com HTML, CSS e JavaScript sem dependências de servidor. Um manifesto e um service worker permitirão instalação e uso offline após a primeira abertura. O seletor nativo de arquivos será usado para acessar imagens do dispositivo, incluindo Fotos, Câmera e Downloads, conforme as opções expostas pelo sistema operacional.

## Interface e comportamento

- A tela principal exibe uma área de visualização em tela cheia e um botão `Abrir imagem`.
- Depois da seleção, a imagem fica centralizada e pode receber gesto de pinça para zoom e arraste com um dedo para reposicionamento.
- Um botão de cadeado permanece no canto superior direito. No estado desbloqueado, gestos atualizam a transformação da imagem. No estado bloqueado, a área da imagem ignora todos os gestos e mantém exatamente o último zoom e posição.
- O cadeado permanece clicável no estado bloqueado para restaurar a interação.
- Um botão de redefinição restaura escala e posição iniciais.
- Um botão `Transformar` abre um painel inferior com efeitos aplicados de forma não destrutiva: alternâncias independentes para preto e branco e sépia, além de botões para aumentar ou diminuir o contraste em níveis.
- Os efeitos são empilháveis; por exemplo, sépia e contraste aumentado podem ficar ativos simultaneamente. O botão `Original` remove todos os efeitos e devolve o contraste ao nível neutro.
- Os controles de transformação permanecem utilizáveis enquanto o cadeado está ativo; o bloqueio afeta somente os gestos de zoom e arraste na imagem.
- A interface se adapta a retrato e paisagem, preservando a transformação enquanto houver espaço disponível.

## Dados e privacidade

A imagem escolhida é lida localmente pelo navegador e nunca é enviada a um servidor. Ela existe apenas durante a sessão atual do app; recarregar ou fechar a página remove a imagem selecionada.

## Erros e limites

- Arquivos não-imagem mostram uma mensagem orientando a escolher uma imagem compatível.
- Se a seleção for cancelada, o estado atual é preservado.
- Gestos são limitados a uma faixa de escala para evitar valores inválidos ou uma imagem impossível de recuperar; a redefinição sempre restaura um enquadramento visível.

## Critérios de aceite

1. O seletor aceita imagens do armazenamento e oferece opções do dispositivo, como galeria/câmera quando disponíveis.
2. Uma imagem aberta responde a zoom por pinça e arraste por toque.
3. Ao bloquear, novos toques, pinças e arrastes não mudam a imagem.
4. Ao desbloquear, os mesmos gestos voltam a funcionar.
5. A redefinição recupera zoom e posição padrão.
6. O app pode ser instalado como PWA e carregar sua interface offline após a instalação.
7. Preto e branco, sépia e ajustes de contraste podem ser combinados, com atualização imediata da prévia.
8. `Original` remove todos os efeitos sem modificar o arquivo selecionado.
