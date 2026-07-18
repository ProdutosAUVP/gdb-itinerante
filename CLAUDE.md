# CLAUDE.md

Landing page do Giro da Bolsa Itinerante (AUVP Capital / Investidor Sardinha). Evento presencial que muda de cidade a cada edição — a página é sempre a da **edição atual** e é reciclada a cada nova cidade.

## O essencial

- **Um único arquivo**: `index.html` contém todo o HTML, CSS e JS. Sem build, sem testes, sem dependências locais (Tailwind/D3/Lucide via CDN).
- **Produção = widget HTML do Elementor** (WordPress). O conteúdo a partir de `<div id="gdb-root">` é copiado e colado lá manualmente após o merge. Mudanças só entram no ar depois dessa re-colagem — avise o usuário quando uma mudança exigir isso.
- **⚠️ Os arquivos do repositório são URLs públicas.** Assets são servidos via `https://github.com/ProdutosAUVP/gdb-itinerante/raw/main/<caminho>`. NUNCA mova, renomeie ou apague um arquivo sem antes verificar (grep no `index.html`) se ele é referenciado. Mover um asset referenciado quebra a página em produção no momento do merge.

## Regras de estilo do código

- Todo CSS custom é escopado em `#gdb-root` com `!important` — isolamento contra o tema do WordPress/Elementor. Mantenha esse padrão em qualquer estilo novo.
- Tailwind está configurado com `important: true` e sem preflight (`preflight: false` implícito — não há reset global). Botões precisam de `border-style` explícito quando têm borda.
- Copys em PT-BR. Use `&nbsp;` antes da última palavra de parágrafos para evitar palavras órfãs (padrão existente).
- Commits em português, descritivos (veja `git log`).

## Mapa do index.html

| Bloco | O que é |
|-------|---------|
| `<head>` | SEO (title/description/OG), favicon e **2 blocos JSON-LD** `Event`: edição atual (com `offers`) e última edição realizada |
| CSS inline | Reset/isolamento Elementor, animações `.reveal`, tarja `containment-tape` e `locked-grid` (estado "em breve" — CSS mantido para reuso) |
| `#hero` | Vídeo de fundo, tag de destino, data, rota das cidades |
| `#ingressos` | 2 cards: Público Geral (checkout) e Membros AUVP (link da comunidade, preço com desconto) |
| `#local` | Teatro da edição atual + iframe do Google Maps |
| `#roteiro` | Mapa do Brasil em D3 + botão do modal de sugestão de cidade |
| `#galeria` | Mural polaroid de fotos das edições passadas |
| `#edicoes` | Acordeões por cidade (passadas + atual) |
| `#faq` | Perguntas frequentes (data/horário, local, dress code, etc.) |
| JS final | Scroll spy, reveals, acordeões, FAQ, modal de cidade (envia p/ Google Apps Script), mapa D3, **propagação de UTMs** para links `checkout.auvp.com.br/pay/` |

## Ciclo de vida de uma edição (checklist)

**1. Anúncio da cidade ("em breve")**: atualizar head/OG/title, JSON-LD (nova cidade, sem offers), hero (destino/data/rota), ingressos em modo "Em breve" (tarja `containment-tape-wrapper` + `locked-grid` + botões `disabled`), comentar a seção `#local` e os links "Local" dos dois menus, FAQ genérico, acordeão da cidade nova.

**2. Vendas abertas (estado atual)**: preços e links reais nos cards, remover tarja/blur, reativar `#local` com teatro/endereço/mapa, descomentar links "Local" (menu flutuante + top nav), atualizar FAQ (horário e local), JSON-LD com `offers` (`InStock`) e `startDate` com hora, CTA do acordeão → "GARANTIR MEU LUGAR".

**3. Edição realizada**: cidade vira histórico — JSON-LD da edição vai para o segundo bloco (offers → `SoldOut`), fotos entram na galeria (novo asset no repo), acordeão muda para formato "realizada", próxima cidade recomeça o ciclo.

## Referências rápidas

- Checkout geral Curitiba: `https://checkout.auvp.com.br/pay/giro-da-bolsa-curitiba-geral`
- Links de checkout seguem o padrão `checkout.auvp.com.br/pay/giro-da-bolsa-<cidade>-geral`; o script de UTMs cobre qualquer link `/pay/`.
- Desconto de membros é divulgado via tópico em `comunidade.auvp.com.br` (link muda a cada edição).
- Validar JSON-LD após editar: extrair os blocos `application/ld+json` e fazer `json.loads` (Python).
