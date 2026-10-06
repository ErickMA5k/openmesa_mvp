# Assets do Open Mesa

Pacote visual baseado na referência enviada.

## Logo original

`logo/open-mesa-original.png` é o arquivo original enviado pelo usuário, preservado sem redesenho ou alteração. Use este arquivo na tela de login quando quiser reproduzir o logo exatamente como na referência.

Exemplo no React Native:

```jsx
import { Image } from 'react-native';

<Image
  source={require('./assets/logo/open-mesa-original.png')}
  style={{ width: 140, height: 143 }}
  resizeMode="contain"
/>
```

## Outros arquivos

- `logo/open-mesa-logo.svg`: versão vetorial aproximada/editável.
- `logo/open-mesa-mark.svg`: símbolo vetorial reduzido.
- `icons/icons.svg`: símbolos `back`, `history`, `qr`, `plus` e `calendar`.
- `theme.js`: cores, espaçamentos, raios e tipografia.

Para maior fidelidade, prefira `open-mesa-original.png` em vez das versões SVG.

## Tema

```js
import { colors, spacing, radius } from './assets/theme';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  button: {
    borderRadius: radius.md,
    backgroundColor: colors.action,
  },
});
```
