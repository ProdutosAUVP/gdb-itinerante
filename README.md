# Giro da Bolsa Itinerante

Landing page oficial do **Giro da Bolsa Itinerante** — o evento presencial da AUVP Capital / Investidor Sardinha que leva a gravação do Giro da Bolsa, ao vivo e sem censura, para diferentes cidades do Brasil.

## Edições

| # | Cidade | Data | Local | Status |
|---|--------|------|-------|--------|
| 1 | Goiânia, GO | 2025 | — | Realizada |
| 2 | Belo Horizonte, MG | 2025 | — | Realizada |
| 3 | São Paulo, SP | 26/06/2026 | Teatro Gamaro (Mooca) | Realizada |
| 4 | **Curitiba, PR** | **24/07/2026, 19h** | *Não divulgado* | **Vendas encerradas** (ambos os ingressos) |

A página é reciclada a cada edição: a cidade atual vira "próxima parada" e a anterior entra para o histórico (galeria e acordeões de edições passadas).

## Como funciona (arquitetura)

O projeto é **uma única página estática**: `index.html`. Não há build, framework ou dependência local — tudo vem de CDN:

- **Tailwind CSS** (CDN, configurado inline com `important: true` e sem preflight);
- **D3.js** para o mapa interativo do Brasil na seção "Roteiro" (GeoJSON dos estados carregado de repositório público);
- **Lucide** para ícones;
- **Google Fonts** (Playfair Display + Inter).

### Publicação via Elementor

A página em produção é um **widget HTML do Elementor** (WordPress da AUVP). O conteúdo a partir do marcador `<div id="gdb-root">` é copiado e colado no widget. Por isso:

- Todo o CSS é escopado em `#gdb-root` com `!important`, para isolar o design do tema do WordPress;
- Os assets (logos, vídeo do hero, fotos das edições) são servidos como **URLs raw do GitHub apontando para o branch `main`** deste repositório, ex.: `https://github.com/ProdutosAUVP/gdb-itinerante/raw/main/Prancheta%2010.svg`.

> ⚠️ **Regra de ouro:** os caminhos dos arquivos deste repositório são URLs públicas da página no ar. **Não mova, renomeie ou apague arquivos referenciados** sem atualizar o `index.html` e re-colar o widget no Elementor — senão a página em produção quebra.

### Fluxo de atualização

1. Edite o `index.html` em uma branch e abra um PR;
2. Após o merge na `main`, copie o conteúdo a partir de `<div id="gdb-root">` (o comentário no arquivo marca o ponto) e cole no widget HTML do Elementor;
3. Assets novos devem ser commitados na `main` antes de a página que os referencia entrar no ar.

## Inventário de arquivos

| Arquivo | Uso |
|---------|-----|
| `index.html` | A página inteira (HTML + CSS + JS) |
| `0602(1).mp4` | Vídeo de fundo do hero |
| `Prancheta 10.svg` | Logo símbolo (favicon, menu flutuante, schema) |
| `Prancheta 2_12.svg` | Logo horizontal (header do hero) |
| `AUVP CAPITAL HORIZONTAL BRANCA.svg` | Logo AUVP Capital (rodapé/créditos) |
| `bh redux 1..4.webp` | Fotos da edição de Belo Horizonte (galeria) |
| `Goiânia/*.jpg` | Fotos da edição de Goiânia (galeria) |

## Integrações e funcionalidades

- **SEO / Schema.org**: dois blocos JSON-LD `Event` no `<head>` (edição atual com ofertas + última edição realizada);
- **Checkout**: ingressos vendidos via `checkout.auvp.com.br`; membros compram com desconto via tópico na `comunidade.auvp.com.br`;
- **UTMs**: script no fim da página propaga `utm_*` da URL para todos os links de `checkout.auvp.com.br/pay/`;
- **Sugestão de cidade**: modal "Para onde devemos ir?" envia respostas para uma planilha via Google Apps Script (`no-cors`, URL-encoded);
- **Scroll spy**: menus lateral e superior destacam a seção visível automaticamente (qualquer `section[id]` entra no radar).
