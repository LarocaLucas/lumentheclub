# Prompt Antigravity - Site Lumen The Club (v1)

## Contexto do projeto

Você vai construir o site institucional da **Lumen The Club**, uma balada (casa noturna, pista de dança, DJs, festas) que se posiciona como "luxury club": quer transmitir uma atmosfera premium, sofisticada, exclusiva, mesmo sendo uma balada no sentido pleno da palavra (não um lounge, não um bar de coquetéis calmo). A identidade visual carrega esse "ar de luxo" através de: preto profundo + dourado/âmbar quente, a máscara veneziana como selo de marca, tipografia fluida no logo, neon script na decoração física da casa, e elementos de conforto premium (sofás de couro, iluminação quente). O site precisa transmitir "balada de alto padrão", não "bar tranquilo".

Programação varia toda semana, mas **os ingressos são vendidos exclusivamente no local, no dia do evento**: não existe pré-venda online. Isso muda a lógica da seção de ingressos: ela é informativa, não transacional.

Este não é um clone de nenhum outro site do portfólio do Laroca Dev. A identidade visual, a estrutura de seções e o tom precisam ser autorais para a Lumen. Onde este prompt referenciar a arquitetura de outro projeto (Door PG), a arquitetura está descrita por completo abaixo, para que você não precise de nenhum conhecimento externo sobre esse outro projeto.

**Arquivos de apoio nesta pasta**: além deste prompt, a pasta do projeto contém o arquivo da logo em baixa resolução e uma subpasta `referencias-visuais/` com fotos reais da casa (neon, posters, copos de evento) e um `README.md` explicando o que cada uma mostra. Consulte essas referências antes de implementar o Design System, especialmente o padrão de "texto eco" e a tipografia do logo.

---

## Liberdade de ferramentas: bibliotecas, skills e MCPs

Você tem total liberdade para usar e instalar as bibliotecas, skills e MCPs que julgar necessários para entregar o melhor resultado dentro do stack definido neste prompt. Isso inclui (mas não se limita a): bibliotecas de animação como GSAP ou motion.dev, componentes visuais como shadcn/ui ou reactbits, bibliotecas 3D como three.js, ferramentas de otimização de imagem, linters, formatadores, ou qualquer outra dependência que melhore a qualidade, performance ou manutenibilidade do projeto. Avalie a real necessidade de cada dependência antes de instalar, mas não hesite em usá-las quando fizer sentido.

---

## Design System

### Paleta de cores

| Uso | Cor | Hex |
|---|---|---|
| Fundo principal | Preto profundo | `#0B0B0D` |
| Fundo secundário (cards, seções alternadas) | Preto suave | `#17171A` |
| Dourado primário (logo, CTAs, destaques) | Dourado quente | `#C9A24C` |
| Dourado claro (glow, hover, brilho neon) | Champagne | `#E8C97A` |
| Âmbar/cobre (acentos de textura, bordas, ícones) | Cobre | `#A85C32` |
| Texto principal | Off-white quente | `#F5F0E6` |
| Texto secundário/muted | Cinza quente | `#A9A39A` |

Regra de uso: o dourado é a identidade de repouso do site e deve dominar a maior parte das telas. O cobre/âmbar entra como variação de temperatura (bordas, ícones, texturas). A energia de "balada" vem de movimento e intensidade de luz (glow mais forte em seções de destaque, animação mais viva), não da introdução de uma cor nova.

### Tipografia

- **Logotipo/wordmark**: a Lumen tem uma marca customizada em minúsculas, traço contínuo e ondulado (remete a fluidez/luz líquida). O arquivo da logo em baixa resolução já está dentro da pasta deste projeto, junto com este prompt. Use-o como base: pode ser vetorizado (ex.: com potrace, aplicando denoising, threshold em torno de 55% e parâmetros `-a 0.6 -O 0.1 -t 2` para preservar os traços finos) ou recriado do zero respeitando o mesmo desenho, para servir como placeholder de alta qualidade até que o cliente forneça o arquivo vetorial original.
- **Tagline/destaques emocionais** ("The Glow of the Night"): fonte script fluida e elegante. Sugestão: `Yellowtail` ou `Alex Brush` (Google Fonts), para ecoar o neon.
- **Títulos de seção / CTAs de impacto**: sans condensada bold, no espírito dos posters de evento da casa. Sugestão: `Anton` ou `Bebas Neue`.
- **Corpo de texto**: sans-serif limpa e de alta legibilidade em fundo escuro. Sugestão: `Inter` ou `Manrope`.

### Elemento-âncora: a máscara veneziana

A máscara dourada é o selo visual mais recorrente da marca (logo, copos, posters). Use como:
- Marca d'água discreta em seções de fundo (baixíssima opacidade, `#C9A24C` a 4-6%).
- Elemento decorativo no hero (SVG estilizado, não fotografia).
- Ícone de carregamento do site (sempre SVG, nunca emoji).

Não repita a máscara ao ponto de virar clichê: ela é assinatura, não papel de parede.

### "Texto eco": padrão gráfico da casa

Nos posters da Lumen, a marca usa um efeito de texto empilhado com outline atrás do texto sólido, criando uma sensação de eco/vibração. Replique isso digitalmente como uma animação de entrada de texto (GSAP): o texto em outline "ecoa" e se assenta atrás do texto sólido ao entrar na viewport. Use esse efeito com moderação, em títulos de seção principais (Hero, Programação), não em todo lugar.

### Motion & atmosfera

- Glow pulsante suave (`box-shadow`/`filter: blur` animado) atrás de elementos de destaque no hero, simulando o neon "The Glow of the Night".
- Partículas/bokeh sutis no hero (canvas leve, não WebGL pesado), em tons dourados, remetendo às luzes desfocadas das fotos da casa. Performance em primeiro lugar: sem impacto perceptível em mobile.
- Seções de destaque (Hero, Programação da semana) podem ter glow e animação mais intensos que seções mais informativas (Localização, Contato), sempre dentro da mesma paleta dourado/preto/cobre.

---

## Arquitetura da informação

1. **Hero**
   Logo + tagline "The Glow of the Night" com efeito glow. CTA primário: "Ver programação da semana" (scroll). CTA secundário: WhatsApp ("Reservar mesa"), usando o link de reservas definido na seção Integrações. Fundo com partículas/bokeh sutis.

2. **Conceito**
   Bloco curto de texto sobre o posicionamento "luxury club": o que diferencia a Lumen (ambientação, curadoria de som, experiência). Tom: confiante e sofisticado, mas sem ser engessado.

3. **Programação da semana**
   Grade dinâmica por dia (a definir pelo cliente semanalmente; estruturar como conteúdo editável, não hardcoded). Cada card: dia, nome do evento/tema, line-up daquela noite. Sem preço fixo. CTA "Detalhes no WhatsApp" ou link direto pro Instagram do evento.

4. **Ingressos** *(tratamento informativo)*
   Bloco simples e direto: ingressos vendidos exclusivamente na Lumen, no dia do evento. Sem tabela de preços, sem checkout. Botão de WhatsApp para reserva de mesa/camarote, usando o link definido na seção Integrações.

5. **Galeria** *(página separada, fora da rolagem principal)*
   Não é uma seção da home: é uma página própria (ex.: `/galeria`), acessada por um link no menu/nav principal, no mesmo padrão do outro projeto do portfólio do Laroca Dev que usa essa estrutura (site institucional de uma casa noturna com página de galeria dedicada). Grade de fotos com hover em glow dourado e download individual habilitado. Ver detalhes técnicos completos na seção "Referência de arquitetura: galeria de fotos" abaixo.

6. **Localização & horários**
   Endereço, mapa incorporado. Horário de funcionamento: 23h às 4h30 (os dias específicos de abertura variam conforme a programação semanal, definida pelo cliente).

7. **Contato & redes**
   WhatsApp, Instagram, footer com créditos Laroca Dev.

---

## Integrações

- **WhatsApp (reservas)**: usar exatamente este link em todos os CTAs de reserva do site (Hero, Ingressos, Contato/footer): `https://api.whatsapp.com/send/?phone=5542999103037&text=Gostaria+de+fazer+uma+reserva.&type=phone_number&app_absent=0`. Não gerar um link `wa.me` genérico: este é o link oficial já definido pelo cliente.
- **Instagram**: embed do feed mais recente ou link destacado para o perfil (@lumentheclub_), já que é o único canal oficial hoje.
- **Google Maps**: embed de localização na seção de horários.
- **Sem integração de cardápio/comandas**: essa camada não deve ser construída neste projeto.

---

## Referência de arquitetura: galeria de fotos (Cloudflare Pages + R2)

Este projeto reaproveita um padrão já validado em outro cliente do Laroca Dev, descrito aqui por completo porque este projeto não tem acesso ao código-fonte desse outro site:

- O site principal é hospedado em **Cloudflare Pages** (build estático, deploy contínuo via Git).
- A galeria **não fica dentro da rolagem da home**: é uma página HTML própria e separada (ex.: `galeria.html` ou rota `/galeria`, dependendo de como o Vite for configurado como multi-page app), com sua própria navegação de volta pra home.
- As fotos da galeria ficam em um **bucket Cloudflare R2** separado, servido em um subdomínio próprio (padrão: `fotos.<dominio-principal>`, por exemplo `fotos.lumentheclub.com.br`).
- O R2 é configurado com um domínio customizado público (via Cloudflare) para servir as imagens diretamente, sem passar pela aplicação, otimizando custo e performance.
- O front-end da página de galeria consome uma listagem das imagens (via um pequeno endpoint/JSON gerado no build ou via listagem client-side do bucket, o que for mais simples de manter) e renderiza a grade a partir dela.
- Cada imagem deve permitir download individual (botão de download no hover/lightbox).
- Justificativa do padrão: separa o custo/tráfego de imagens (que cresce com cada evento) da aplicação principal, mantém a galeria fácil de atualizar sem precisar de novo deploy do site inteiro, e evita que a home fique pesada carregando dezenas de fotos.

Implemente esse mesmo padrão para a Lumen, adaptando nomes de bucket e subdomínio. **Conteúdo inicial real**: por enquanto existe apenas o álbum do evento "Rodagem Lumen", que o cliente vai enviar para o bucket R2 como primeiro exemplo populado, então a página de galeria deve já nascer preparada para exibir esse álbum (não é só um placeholder vazio).

---

## Stack técnico

Nível de ambição definido: meio-termo entre um site simples e direto e um site rico em animações e efeitos imersivos.

- **Vite + Vanilla JS**, configurado como aplicação multi-página (home + página de galeria separada, no mínimo), com HTML, CSS e JS estritamente separados em arquivos distintos, nunca combinados.
- **GSAP + ScrollTrigger** para reveals, o efeito "texto eco" e os glows animados.
- **Cloudflare Pages** para hosting.
- **Cloudflare R2** para o bucket de fotos da galeria, conforme descrito na seção de arquitetura acima.
- **Domínio**: ainda não decidido pelo cliente. Usar `lumentheclub.com.br` como placeholder no código/config, deixando claro no README que o domínio final precisa ser confirmado antes do deploy.

---

## Padrões obrigatórios de código e conteúdo

Estes padrões valem para este projeto e para todos os projetos do Laroca Dev:

- HTML, CSS e JS sempre em arquivos separados, nunca inline, nunca combinados.
- Estrutura de pastas organizada e coerente (ex.: separar `assets/`, `styles/`, `scripts/`, `components/` conforme o que fizer sentido pro stack), documentada no README.
- Código limpo, comentado e explicado de forma que um outro desenvolvedor consiga entender a lógica sem precisar perguntar ao autor original.
- Nenhum emoji em nenhum lugar do site: todo ícone deve ser SVG.
- Nenhum uso do caractere travessão (—) em textos do site: usar pontuação padrão (vírgula, ponto, parênteses) na escrita dos textos.
- Segurança: sanitização de qualquer input (se houver formulário de contato), HTTPS obrigatório, CORS configurado corretamente no R2/Pages.
- Responsividade total (mobile-first): a maior parte do tráfego de balada vem de Instagram no celular, o site precisa funcionar perfeitamente em qualquer tamanho de tela.
- Performance: lazy-load na galeria de fotos, otimização de imagens (WebP), animações leves (evitar jank em dispositivos mais fracos).
- Boas práticas gerais de programação: nomes descritivos, funções pequenas e com responsabilidade única, evitar duplicação de código.

---

## Pendências para o cliente antes do build final

- [ ] Domínio definido (por enquanto usar `lumentheclub.com.br` como placeholder).
- [ ] Arquivo vetorial/original da logo em alta resolução, para substituir o placeholder vetorizado/recriado a partir do arquivo em baixa que já está na pasta do projeto.
