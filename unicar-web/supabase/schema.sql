-- ============================================================
-- UNICAR — Schema do banco de dados
-- Execute este arquivo no SQL Editor do Supabase:
-- Dashboard > SQL Editor > New query > cole e execute
-- ============================================================

-- ─── Tabela: clientes ────────────────────────────────────────

CREATE TABLE clientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo              TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  nome              TEXT NOT NULL,
  documento         TEXT NOT NULL,
  nome_fantasia     TEXT,
  inscricao_estadual TEXT,
  responsavel       TEXT,
  telefone          TEXT NOT NULL,
  telefone2         TEXT,
  email             TEXT,
  cep               TEXT,
  rua               TEXT,
  numero            TEXT,
  complemento       TEXT,
  bairro            TEXT,
  cidade            TEXT,
  estado            TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: veiculos ────────────────────────────────────────

CREATE TABLE veiculos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa       TEXT NOT NULL,
  modelo      TEXT NOT NULL,
  ano         TEXT,
  km          TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Índices ─────────────────────────────────────────────────

CREATE INDEX veiculos_cliente_id_idx ON veiculos (cliente_id);
CREATE INDEX clientes_nome_idx       ON clientes (nome);
CREATE INDEX clientes_documento_idx  ON clientes (documento);

-- ─── Trigger: atualiza atualizado_em automaticamente ─────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────
-- Por enquanto permite tudo (sem autenticação de usuário).
-- Quando adicionar login, restrinja por user_id.

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_total_clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_veiculos" ON veiculos FOR ALL USING (true) WITH CHECK (true);
