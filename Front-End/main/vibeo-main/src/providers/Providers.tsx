"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { ThemeProvider } from "../features/theme/contexts/ThemeContext";
import ThemeSync from "../features/theme/components/ThemeSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemeSync />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
