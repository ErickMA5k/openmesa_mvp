# Open Mesa

Aplicativo para controle de fichas de marmitas e refeições do restaurante. Cada pessoa entra com o seu perfil (Caixa, Fiscal, Auditor ou Empresa) e vê as telas do que pode fazer. No momento, o projeto está na **Sprint 1** (perfil Caixa), com os dados guardados só no aparelho.

## Como rodar o aplicativo (Expo Go)

1. Instale o [Node.js](https://nodejs.org) (versão LTS).
2. No celular, instale o app **Expo Go** (ele precisa suportar o SDK 57, como o do projeto).
3. Baixe o projeto e instale as bibliotecas:

```bash
   git clone https://github.com/ErickMA5k/openmesa_mvp.git
   cd openmesa_mvp
   git checkout Sprint-1
   npm install
```

4. Inicie o servidor:

```bash
   npx expo start
```

5. Escaneie o QR code que aparece no terminal com o Expo Go (no iPhone, use a câmera).

Celular e computador precisam estar na **mesma rede Wi-Fi**. Se não conectar, use `npx expo start --tunnel`. Para testar no navegador do PC, aperte `w` no terminal (o leitor de QR Code não funciona lá).

## Estrutura das pastas

- `src/screens`: as telas do app
- `src/components`: peças visuais reutilizáveis (Botao, Input, popup)
- `src/context`: dados compartilhados entre as telas (Contexts)
- `src/navigation`: as rotas entre as telas
- `src/theme`: cores, espaços e tamanhos de fonte
- `src/data`: acesso aos dados guardados no aparelho

## Guia dos Contexts

Um Context é um "armário" de dados que qualquer tela pode abrir, sem precisar passar a informação de tela em tela. Cada um tem um hook (`useAuth`, `useFichas`) que serve de atalho para abri-lo.

### AuthContext (`useAuth`)

Guarda **quem está logado**. Fornece:

| Nome | O que é |
|---|---|
| `usuario` | os dados de quem está logado (`{ nome, perfil }`), ou `null` se ninguém entrou |
| `entrar(dados)` | registra o usuário logado |
| `sair()` | desloga (volta `usuario` para `null`) |

O `AppNavigator` usa o `usuario` para decidir as telas: sem usuário, só o Login; com usuário, Home, AdicionarFicha, Historico e Calendario.

**Exemplo: entrar (tela de Login)**

```js
import { useAuth } from '../context/AuthContext';

const { entrar } = useAuth();
entrar({ nome: 'Maria', perfil: 'caixa' });
```

**Exemplo: mostrar o nome e sair (tela Home)**

```js
const { usuario, sair } = useAuth();

<Text>Olá, {usuario?.nome}</Text>
<Botao titulo="Sair" variante="perigo" onPress={sair} />
```

### FichasContext (`useFichas`)

Guarda **as fichas lançadas** e calcula os totais. Cada ficha é um registro no formato `{ FichaID, tipo, data, quantidade }`, com a data em `DD-MM-AAAA`. Fornece:

| Nome | O que é |
|---|---|
| `fichas` | a lista de todas as fichas lançadas |
| `adicionarFicha(tipo, quantidade)` | cria uma ficha nova com a data de hoje (fuso de Brasília) e um `FichaID` sequencial |
| `totalGeral()` | soma a quantidade de todas as fichas |
| `receitaTotal()` | `totalGeral()` multiplicado pelo valor da ficha (fixo em R$ 2, definido no arquivo) |

O arquivo também exporta `TIPOS`, com os tipos aceitos: `TIPOS.MARMITA` (`'Marmita'`) e `TIPOS.REFEICAO` (`'Refeição'`).

O `FichasProvider` precisa envolver o app no `App.js`. Usar o `useFichas` fora dele gera um erro explicando isso.

**Exemplo: lançar fichas (tela AdicionarFicha)**

```js
import { useFichas, TIPOS } from '../context/FichasContext';

const { adicionarFicha } = useFichas();
adicionarFicha(TIPOS.MARMITA, 10);
adicionarFicha(TIPOS.REFEICAO, 25);
```

**Exemplo: mostrar totais e a lista (tela Histórico)**

```js
const { fichas, totalGeral, receitaTotal } = useFichas();

<Text>Fichas: {totalGeral()}</Text>
<Text>Receita: R$ {receitaTotal()}</Text>
{fichas.map((f) => (
  <Text key={f.FichaID}>{f.data} - {f.tipo}: {f.quantidade}</Text>
))}
```

> Por enquanto as fichas ficam só na memória do app e se perdem ao fechá-lo. O salvamento no aparelho (AsyncStorage) é uma etapa seguinte da Sprint 1.