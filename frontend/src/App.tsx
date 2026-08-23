import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Hangman } from "./games/hangman/Hangman";
import { I18nProvider } from "./i18n/I18nContext";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/hangman" element={<Hangman />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
