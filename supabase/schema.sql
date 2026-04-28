-- =============================================
-- OPR NC PICKS — 상품 판매율 대시보드 스키마
-- =============================================

-- 사용자 역할 (관리자 / 일반)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 시즌 설정 (관리자만 수정)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE NOT NULL,
  target_rate_amount NUMERIC DEFAULT 80,
  target_rate_qty NUMERIC DEFAULT 80,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 업로드 이력
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  filename TEXT NOT NULL,
  upload_date DATE NOT NULL,
  reference_date DATE NOT NULL,
  season_id UUID REFERENCES seasons ON DELETE SET NULL,
  row_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 아이템 데이터 (계산 결과 포함)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES uploads ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  item_code TEXT,
  item_name TEXT NOT NULL,

  -- 금액 기준
  purchase_amount NUMERIC NOT NULL DEFAULT 0,
  sales_cost NUMERIC NOT NULL DEFAULT 0,
  sales_rate_amount NUMERIC,
  expected_eod_rate_amount NUMERIC,
  days_to_clearance_amount NUMERIC,
  daily_speed_amount NUMERIC,

  -- 수량 기준 (nullable — 수량 없는 파일 허용)
  purchase_qty NUMERIC,
  sales_qty NUMERIC,
  sales_rate_qty NUMERIC,
  expected_eod_rate_qty NUMERIC,
  days_to_clearance_qty NUMERIC,
  daily_speed_qty NUMERIC,

  -- 보조 지표
  avg_selling_price NUMERIC,
  remaining_qty NUMERIC,
  remaining_amount NUMERIC,

  reference_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- user_roles: 본인 row만 조회
CREATE POLICY "users read own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- seasons: 전체 조회 가능, 수정은 admin만
CREATE POLICY "anyone read seasons" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "admin manage seasons" ON seasons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- uploads: 부서 전체 공유 (모든 인증 사용자 조회 가능)
CREATE POLICY "authenticated read uploads" ON uploads
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated insert uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- items: 부서 전체 공유
CREATE POLICY "authenticated read items" ON items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated insert items" ON items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 초기 데이터: 활성 시즌 예시
-- =============================================
-- INSERT INTO seasons (season_name, start_date, end_date, is_active)
-- VALUES ('26SS', '2026-02-01', '2026-07-31', true);
