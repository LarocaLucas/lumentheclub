# Lumen The Club - Site Oficial

Site institucional da **Lumen The Club**, luxury nightclub em Ponta Grossa - PR.

---

## Stack Tecnico

- **Vite** - Build tool e dev server (multi-page app)
- **Vanilla JS** - Sem frameworks, codigo limpo e direto
- **GSAP + ScrollTrigger** - Animacoes (texto eco, scroll reveals, glow)
- **Cloudflare Pages** - Hospedagem do front-end (deploy via GitHub)
- **Cloudflare R2** - Armazenamento de fotos da galeria (bucket `lumen-the-club`)

---

## Estrutura de Pastas

```
/
├── index.html              # Home (single page com todas as secoes)
├── galeria.html            # Galeria de fotos (pagina separada)
├── CNAME                   # Dominio para Cloudflare Pages
├── vite.config.js          # Config do Vite (multi-page)
├── package.json
├── styles/
│   ├── variables.css       # Design tokens (cores, tipografia, espacamentos)
│   ├── reset.css           # Reset CSS moderno
│   ├── main.css            # Estilos globais (nav, footer, botoes)
│   ├── home.css            # Estilos da home
│   └── galeria.css         # Estilos da galeria
├── scripts/
│   ├── main.js             # JS da home (GSAP, particulas bokeh, nav)
│   └── galeria.js          # JS da galeria (grid, lightbox, download)
└── assets/
    └── svg/
        ├── logo-lumen.svg  # Logo placeholder (substituir pelo original)
        └── mascara.svg     # Mascara veneziana (decoracao)
```

---

## Como Rodar Localmente

```bash
npm install
npm run dev
```

O site abre automaticamente em `http://localhost:5173`.

---

## Como Atualizar a Programacao da Semana

Edite o array `PROGRAMACAO` no arquivo `scripts/main.js`:

```javascript
const PROGRAMACAO = [
  {
    dia: 'Sexta',
    data: '22/08',
    nome: 'Lumen Sessions',
    lineup: 'DJ Fulano, DJ Ciclano',
    destaque: false,
  },
  {
    dia: 'Sabado',
    data: '23/08',
    nome: 'The Glow Night',
    lineup: 'Line-up especial',
    destaque: true,
  },
];
```

Commit, push, e o Cloudflare Pages faz o deploy automaticamente.

---

## Como Adicionar um Novo Album na Galeria

1. Suba as fotos para o bucket R2 `lumen-the-club`, dentro de uma pasta com o nome do evento
   - Exemplo: `RODAGEM LUMEN/01.jpg`, `RODAGEM LUMEN/02.jpg`, ..., `RODAGEM LUMEN/200.jpg`
   - Fotos sempre numeradas com zero-pad de 2 digitos (01, 02, ..., 99) ou 3 digitos se passar de 99

2. Edite o array `ALBUNS` no arquivo `scripts/galeria.js`:

```javascript
const ALBUNS = [
  { folder: 'RODAGEM LUMEN', label: 'Rodagem Lumen', total: 200 },
  { folder: 'NOVO EVENTO', label: 'Novo Evento', total: 150 },
];
```

3. Commit, push, deploy automatico.

---

## Hospedagem e Infraestrutura

- **Front-end**: Cloudflare Pages (deploy automatico via branch `main` do GitHub)
- **Fotos da Galeria**: Cloudflare R2 (bucket `lumen-the-club`, subdominio `fotos.lumentheclub.com.br`)
- **DNS**: Gerenciado pela Cloudflare

---

## Pendencias para Deploy

- [ ] Dominio definido (atualmente usando `lumentheclub.com.br` como placeholder)
- [ ] Subdominio R2 configurado (`fotos.lumentheclub.com.br` apontando para o bucket `lumen-the-club`)
- [ ] Logo vetorial original do cliente (para substituir o placeholder SVG)

---

## Contato

**Instagram**: [@lumentheclub_](https://instagram.com/lumentheclub_)
**WhatsApp**: (42) 99910-3037
**Endereco**: R. Riachuelo, 625 - Centro, Ponta Grossa - PR, 84010-230

---

Desenvolvido por [Laroca Dev](https://github.com/LarocaLucas)
