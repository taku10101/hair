import type { FilterConfig } from "@/components/filters";

export const userFilterConfigs: FilterConfig[] = [
  {
    id: "search",
    type: "search",
    paramName: "q",
    label: "検索",
    placeholder: "ユーザーを検索...",
  },
  {
    id: "createdAt",
    type: "date",
    paramName: "createdAt",
    label: "作成日",
    placeholder: "作成日を選択",
  },
];
