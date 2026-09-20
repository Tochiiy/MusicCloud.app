import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SongProvider } from './context/SongContext.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { ThemeProvider } from './components/theme.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <UserProvider>
        <SongProvider>
          <App />
        </SongProvider>
      </UserProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
