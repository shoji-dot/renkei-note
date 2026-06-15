// 共通の型定義（フォーム選択肢など、将来のCSV出力にも流用しやすいように一元管理）

export const POST_TYPES = [
  { value: "topic", label: "今週のトピックス" },
  { value: "problem", label: "困りごと" },
  { value: "idea", label: "改善アイデア" },
  { value: "shop_status", label: "店舗状況" },
  { value: "other_store", label: "他店情報" },
] as const;

export const POST_CATEGORIES = [
  { value: "yokatta_koto", label: "良かったこと" },
  { value: "komari_goto", label: "困りごと" },
  { value: "kokyaku_koe", label: "顧客の声" },
  { value: "shohin_hyoka", label: "商品評価" },
  { value: "kaizen_an", label: "改善案" },
  { value: "shohin_kaihatsu", label: "商品開発" },
] as const;

export const IDEA_STATUSES = [
  { value: "shinki", label: "新規" },
  { value: "kentochu", label: "検討中" },
  { value: "shisakuchu", label: "試作中" },
  { value: "saiyo", label: "採用" },
  { value: "horyu", label: "保留" },
  { value: "fusaiyo", label: "不採用" },
] as const;

export const BREWING_STATUSES = [
  { value: "junbichu", label: "準備中" },
  { value: "shikomichu", label: "仕込み中" },
  { value: "jukuseichu", label: "熟成中" },
  { value: "kansei", label: "完成" },
] as const;

export const TASK_STATUSES = [
  { value: "michakushu", label: "未着手" },
  { value: "shinkochu", label: "進行中" },
  { value: "kanryo", label: "完了" },
] as const;

export function labelOf<T extends { value: string; label: string }>(
  list: readonly T[],
  value?: string | null
) {
  return list.find((i) => i.value === value)?.label ?? value ?? "";
}
