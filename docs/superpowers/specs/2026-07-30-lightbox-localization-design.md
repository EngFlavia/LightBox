# LightBox localization — design

## Objetivo

Adicionar seleção de idioma para português (PT), espanhol (ES) e inglês (EN) ao LightBox Android.

## Interface e comportamento

Um seletor compacto no topo mostra o idioma ativo e permite escolher PT, ES ou EN. A troca é imediata, traduz todos os controles, mensagens temporárias, texto vazio e rótulos de acessibilidade, sem reiniciar o app nem remover a imagem atual.

## Persistência

O idioma escolhido é salvo em `localStorage` com a chave `lightbox-language`. Ao iniciar, o app usa o idioma salvo; se não existir uma escolha válida, inicia em PT.

## Implementação

Um módulo de traduções centraliza as três coleções de textos. Cada elemento de interface terá uma chave de tradução, e a função de renderização atualizará texto, atributos `aria-label`, o atributo `lang` de `html` e mensagens de status no idioma atual.

## Critérios de aceite

1. PT, ES e EN traduzem toda a interface e mensagens do app.
2. O idioma muda imediatamente, sem perder imagem, zoom, filtros ou bloqueio.
3. A escolha sobrevive ao fechamento e à reabertura do aplicativo.
4. Sem escolha salva, o idioma padrão é PT.
