// Re-export implementations from the internal `_ui` folder so the real code
// lives outside the `app/` routes. Also provide a harmless default export to
// satisfy Expo Router (files under `app/` must default-export a component).
export * from '../_ui/Buttons';

import React from 'react';
import { View } from 'react-native';

export default function _UIButtonsRouterPlaceholder() {
  // This component is only here so Expo Router does not warn about a missing
  // default export for the `app/ui/Buttons.tsx` file. It should never render
  // because the app imports named exports.
  return <View />;
}
