import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { ClientesPage } from './pages/Clientes'
import { OrdensServicoPage } from './pages/OrdensServico'
import { PecasServicosPage } from './pages/PecasServicos'
import { ContasReceberPage } from './pages/ContasReceber'
import { PlaceholderPage } from './pages/Placeholder'
import { AgendamentosPage } from './pages/Agendamentos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/os"            element={<OrdensServicoPage />} />
          <Route path="/orcamentos"    element={<PlaceholderPage title="Orçamentos" />} />
          <Route path="/agendamentos"   element={<AgendamentosPage />} />
          <Route path="/clientes"      element={<ClientesPage />} />
          <Route path="/veiculos"      element={<PlaceholderPage title="Veículos" />} />
          <Route path="/pecas"         element={<PecasServicosPage />} />
          <Route path="/financeiro"    element={<Navigate to="/financeiro/contas-a-receber" replace />} />
          <Route path="/financeiro/contas-a-receber" element={<ContasReceberPage />} />
          <Route path="/financeiro/contas-a-pagar"   element={<PlaceholderPage title="Contas a Pagar" />} />
          <Route path="/relatorios"    element={<PlaceholderPage title="Relatórios" />} />
          <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
