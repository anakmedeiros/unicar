import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { ClientesPage } from './pages/Clientes'
import { OrdensServicoPage } from './pages/OrdensServico'
import { PecasServicosPage } from './pages/PecasServicos'
import { PlaceholderPage } from './pages/Placeholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/os"            element={<OrdensServicoPage />} />
          <Route path="/orcamentos"    element={<PlaceholderPage title="Orçamentos" />} />
          <Route path="/agenda"        element={<PlaceholderPage title="Agenda" />} />
          <Route path="/clientes"      element={<ClientesPage />} />
          <Route path="/veiculos"      element={<PlaceholderPage title="Veículos" />} />
          <Route path="/pecas"         element={<PecasServicosPage />} />
          <Route path="/financeiro"    element={<PlaceholderPage title="Financeiro" />} />
          <Route path="/relatorios"    element={<PlaceholderPage title="Relatórios" />} />
          <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
