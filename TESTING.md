# Testes manuais

1. Abra `index.html` em um navegador móvel ou no modo de dispositivo das ferramentas do navegador.
2. Selecione uma imagem por **Abrir imagem**; cancele o seletor e confirme que a imagem atual permanece visível.
3. Tente escolher um arquivo que não seja imagem e confirme a mensagem de erro, sem substituir a imagem atual.
4. Arraste com um dedo para mover a imagem e use dois dedos para ampliar/reduzir. Confirme que a escala fica entre 1x e 5x.
5. Toque no cadeado e confirme que pan/zoom param imediatamente; use os controles de filtro e confirme que continuam ativos.
6. Exercite Escala de cinza, Sépia, contraste +/−, Original e Redefinir, verificando o texto de estado e as mudanças visuais.
7. Verifique foco visível por teclado, leitura dos botões pressionados por leitor de tela e o layout em telas estreitas com área segura.

## Salvar PNG

1. Confirme que **Salvar PNG** permanece desabilitado até a imagem terminar de carregar.
2. Aplique pan, zoom e filtros, salve e confirme que o PNG preserva o enquadramento atual, as áreas vazias transparentes e a resolução do viewport pela densidade de pixels da tela.
3. Confirme o nome `<nome>-lightbox.png`, a mensagem de sucesso (ou falha) e que a imagem carregada permanece visível, sem ser substituída, após salvar.

## Teste automatizado

```powershell
& 'C:\Users\flavi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test --test-isolation=none
```
