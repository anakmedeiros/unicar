-- ============================================================
-- UNICAR — Schema completo do banco de dados
-- Execute no SQL Editor do Supabase:
-- Dashboard > SQL Editor > New query > cole e execute
-- Este script é idempotente: seguro rodar mesmo com tabelas já existentes.
-- ============================================================

-- ─── Função helper: atualiza atualizado_em automaticamente ───

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Tabela: clientes ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clientes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo               TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  nome               TEXT NOT NULL,
  documento          TEXT NOT NULL,
  nome_fantasia      TEXT,
  inscricao_estadual TEXT,
  responsavel        TEXT,
  telefone           TEXT NOT NULL,
  telefone2          TEXT,
  email              TEXT,
  cep                TEXT,
  rua                TEXT,
  numero             TEXT,
  complemento        TEXT,
  bairro             TEXT,
  cidade             TEXT,
  estado             TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: veiculos ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS veiculos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa      TEXT NOT NULL,
  modelo     TEXT NOT NULL,
  ano        TEXT,
  km         TEXT,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: tecnicos ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tecnicos (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: catalogo_itens ──────────────────────────────────

CREATE TABLE IF NOT EXISTS catalogo_itens (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo      TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  codigo    TEXT,
  nome      TEXT NOT NULL,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: ordens_servico ──────────────────────────────────

CREATE TABLE IF NOT EXISTS ordens_servico (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            TEXT UNIQUE,
  data              DATE NOT NULL DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'rascunho'
                      CHECK (status IN (
                        'rascunho', 'aguardando_aprovacao', 'aberta',
                        'em_execucao', 'aguardando_peca', 'pronta',
                        'veiculo_liberado', 'entregue', 'cancelada'
                      )),
  tipo_servico      TEXT CHECK (tipo_servico IN (
                      'revisao_preventiva', 'revisao_corretiva',
                      'funilaria', 'eletrica', 'suspensao', 'outros'
                    )),
  problema_relatado TEXT,
  observacoes       TEXT,
  prazo_estimado    TEXT,
  km_atual          TEXT,
  garantia_dias     INTEGER NOT NULL DEFAULT 90,
  desconto          NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_liberacao    DATE,
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  veiculo_id        UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  tecnico_id        UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Geração automática do número de OS: OS-0001, OS-0002, ...

CREATE SEQUENCE IF NOT EXISTS os_numero_seq;

CREATE OR REPLACE FUNCTION gerar_numero_os()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero = 'OS-' || LPAD(nextval('os_numero_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ordens_servico_numero ON ordens_servico;
CREATE TRIGGER ordens_servico_numero
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION gerar_numero_os();

-- ─── Tabela: os_itens ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS os_itens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id      UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('servico', 'peca')),
  codigo     TEXT,
  descricao  TEXT NOT NULL,
  qtd        NUMERIC(10,3) NOT NULL DEFAULT 1,
  valor_unit NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ─── Tabela: os_pagamentos ───────────────────────────────────

CREATE TABLE IF NOT EXISTS os_pagamentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id            UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL CHECK (tipo IN ('unico', 'parcelado')),
  forma            TEXT NOT NULL CHECK (forma IN (
                     'dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto'
                   )),
  data_vencimento  DATE,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  num_parcelas     INTEGER,
  primeira_parcela DATE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: os_parcelas ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS os_parcelas (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id                    UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  pagamento_id             UUID NOT NULL REFERENCES os_pagamentos(id) ON DELETE CASCADE,
  numero                   INTEGER NOT NULL,
  data_vencimento          DATE NOT NULL,
  valor                    NUMERIC(10,2) NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pendente'
                             CHECK (status IN ('pendente', 'pago', 'atrasado')),
  data_pagamento           DATE,
  valor_recebido           NUMERIC(10,2),
  forma_pagamento_recebido TEXT
);

-- ─── Tabela: os_tecnicos_auxiliares ──────────────────────────

CREATE TABLE IF NOT EXISTS os_tecnicos_auxiliares (
  os_id      UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES tecnicos(id) ON DELETE CASCADE,
  PRIMARY KEY (os_id, tecnico_id)
);

-- ─── Tabela: os_historico ────────────────────────────────────

CREATE TABLE IF NOT EXISTS os_historico (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id           UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabela: agendamentos ────────────────────────────────────

CREATE TABLE IF NOT EXISTS agendamentos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        TEXT NOT NULL CHECK (tipo IN ('agendamento', 'lembrete', 'pagamento')),
  titulo      TEXT NOT NULL,
  descricao   TEXT,
  data        DATE NOT NULL,
  hora_inicio TEXT,
  hora_fim    TEXT,
  dia_inteiro BOOLEAN NOT NULL DEFAULT false,
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  os_id       UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
  tecnico_id  UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  cor         TEXT NOT NULL DEFAULT '#dc2626',
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Índices ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS clientes_nome_idx         ON clientes (nome);
CREATE INDEX IF NOT EXISTS clientes_documento_idx    ON clientes (documento);

CREATE INDEX IF NOT EXISTS veiculos_cliente_id_idx   ON veiculos (cliente_id);
CREATE INDEX IF NOT EXISTS veiculos_placa_idx        ON veiculos (placa);

CREATE INDEX IF NOT EXISTS os_status_idx             ON ordens_servico (status);
CREATE INDEX IF NOT EXISTS os_cliente_id_idx         ON ordens_servico (cliente_id);
CREATE INDEX IF NOT EXISTS os_veiculo_id_idx         ON ordens_servico (veiculo_id);
CREATE INDEX IF NOT EXISTS os_created_at_idx         ON ordens_servico (created_at DESC);

CREATE INDEX IF NOT EXISTS os_itens_os_id_idx        ON os_itens (os_id);

CREATE INDEX IF NOT EXISTS os_pagamentos_os_id_idx   ON os_pagamentos (os_id);

CREATE INDEX IF NOT EXISTS parcelas_os_id_idx        ON os_parcelas (os_id);
CREATE INDEX IF NOT EXISTS parcelas_vencimento_idx   ON os_parcelas (data_vencimento);
CREATE INDEX IF NOT EXISTS parcelas_status_idx       ON os_parcelas (status);

CREATE INDEX IF NOT EXISTS os_historico_os_id_idx    ON os_historico (os_id);

CREATE INDEX IF NOT EXISTS agendamentos_data_idx     ON agendamentos (data);
CREATE INDEX IF NOT EXISTS agendamentos_cliente_idx  ON agendamentos (cliente_id);

-- ─── Triggers de atualização ─────────────────────────────────

DROP TRIGGER IF EXISTS clientes_updated_at ON clientes;
CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS ordens_servico_updated_at ON ordens_servico;
CREATE TRIGGER ordens_servico_updated_at
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────

ALTER TABLE clientes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_itens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico         ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_itens               ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_pagamentos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_parcelas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_tecnicos_auxiliares ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_historico           ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos           ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso total (ajustar por auth.uid() quando adicionar multi-tenant)

DROP POLICY IF EXISTS "acesso_total_clientes"    ON clientes;
DROP POLICY IF EXISTS "acesso_total_veiculos"    ON veiculos;
DROP POLICY IF EXISTS "acesso_total_tecnicos"    ON tecnicos;
DROP POLICY IF EXISTS "acesso_total_catalogo"    ON catalogo_itens;
DROP POLICY IF EXISTS "acesso_total_os"          ON ordens_servico;
DROP POLICY IF EXISTS "acesso_total_os_itens"    ON os_itens;
DROP POLICY IF EXISTS "acesso_total_os_pag"      ON os_pagamentos;
DROP POLICY IF EXISTS "acesso_total_os_parcelas" ON os_parcelas;
DROP POLICY IF EXISTS "acesso_total_os_aux"      ON os_tecnicos_auxiliares;
DROP POLICY IF EXISTS "acesso_total_os_hist"     ON os_historico;
DROP POLICY IF EXISTS "acesso_total_agendamentos" ON agendamentos;

CREATE POLICY "acesso_total_clientes"     ON clientes               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_veiculos"     ON veiculos               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_tecnicos"     ON tecnicos               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_catalogo"     ON catalogo_itens         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os"           ON ordens_servico         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os_itens"     ON os_itens               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os_pag"       ON os_pagamentos          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os_parcelas"  ON os_parcelas            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os_aux"       ON os_tecnicos_auxiliares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_os_hist"      ON os_historico           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_agendamentos" ON agendamentos           FOR ALL USING (true) WITH CHECK (true);
