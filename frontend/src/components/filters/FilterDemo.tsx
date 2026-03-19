import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";
import {
  MultiSelectFilter,
  NumberRangeFilter,
  SearchFilter,
  SelectFilter,
} from "@/components/filters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

// サンプルデータ
interface Product {
  id: number;
  name: string;
  category: string;
  status: "active" | "inactive" | "pending";
  price: number;
  tags: string[];
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    category: "electronics",
    status: "active",
    price: 1299,
    tags: ["new", "featured"],
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "electronics",
    status: "active",
    price: 29,
    tags: ["popular"],
  },
  {
    id: 3,
    name: "Desk Chair",
    category: "furniture",
    status: "inactive",
    price: 199,
    tags: ["sale"],
  },
  {
    id: 4,
    name: "LED Monitor",
    category: "electronics",
    status: "active",
    price: 349,
    tags: ["new", "popular"],
  },
  {
    id: 5,
    name: "Standing Desk",
    category: "furniture",
    status: "pending",
    price: 599,
    tags: ["featured"],
  },
  {
    id: 6,
    name: "Keyboard Mechanical",
    category: "electronics",
    status: "active",
    price: 129,
    tags: ["new", "popular"],
  },
  {
    id: 7,
    name: "Office Cabinet",
    category: "furniture",
    status: "active",
    price: 279,
    tags: ["sale"],
  },
  {
    id: 8,
    name: "Webcam HD",
    category: "electronics",
    status: "inactive",
    price: 89,
    tags: ["popular"],
  },
  {
    id: 9,
    name: "Bookshelf",
    category: "furniture",
    status: "active",
    price: 149,
    tags: ["featured"],
  },
  { id: 10, name: "USB Hub", category: "electronics", status: "pending", price: 39, tags: ["new"] },
];

export function FilterDemo() {
  // URLパラメータを管理
  const [filters] = useQueryStates({
    search: parseAsString.withDefault(""),
    category: parseAsStringLiteral(["electronics", "furniture"] as const).withDefault(
      "electronics"
    ),
    status: parseAsStringLiteral(["active", "inactive", "pending"] as const).withDefault("active"),
    tags: parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
  });

  // フィルタリングされたデータ
  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((product) => {
      // 検索フィルター
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // カテゴリフィルター
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // ステータスフィルター
      if (filters.status && product.status !== filters.status) {
        return false;
      }

      // タグフィルター（複数選択）
      if (filters.tags.length > 0) {
        const hasAnyTag = filters.tags.some((tag) => product.tags.includes(tag));
        if (!hasAnyTag) return false;
      }

      // 価格範囲フィルター
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // フィルターをクリア
  const clearAllFilters = () => {
    window.history.pushState({}, "", window.location.pathname);
    window.location.reload();
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.status ||
    filters.tags.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">フィルターデモ</h1>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters}>
              すべてクリア
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          nuqsを使ったフィルターコンポーネントの動作例。フィルター条件はURLに保存されるため、ページを共有できます。
        </p>
      </div>

      {/* フィルターパネル */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">フィルター</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchFilter paramName="search" label="検索" placeholder="商品名で検索..." />

          <SelectFilter
            paramName="category"
            label="カテゴリ"
            placeholder="すべて"
            options={[
              { value: "electronics", label: "電子機器" },
              { value: "furniture", label: "家具" },
            ]}
          />

          <SelectFilter
            paramName="status"
            label="ステータス"
            placeholder="すべて"
            options={[
              { value: "active", label: "アクティブ" },
              { value: "inactive", label: "非アクティブ" },
              { value: "pending", label: "保留中" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectFilter
            paramName="tags"
            label="タグ"
            placeholder="タグを選択..."
            options={[
              { value: "new", label: "新着" },
              { value: "featured", label: "おすすめ" },
              { value: "popular", label: "人気" },
              { value: "sale", label: "セール" },
            ]}
          />

          <NumberRangeFilter
            minParamName="minPrice"
            maxParamName="maxPrice"
            label="価格帯"
            minPlaceholder="最小価格"
            maxPlaceholder="最大価格"
          />
        </div>
      </div>

      {/* 結果表示 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">商品一覧 ({filteredProducts.length}件)</h2>
          {hasActiveFilters && (
            <p className="text-sm text-muted-foreground">
              {sampleProducts.length}件中{filteredProducts.length}件を表示
            </p>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>タグ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    該当する商品が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.category === "electronics" ? "電子機器" : "家具"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : product.status === "inactive"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {product.status === "active"
                          ? "アクティブ"
                          : product.status === "inactive"
                            ? "非アクティブ"
                            : "保留中"}
                      </Badge>
                    </TableCell>
                    <TableCell>¥{product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag === "new"
                              ? "新着"
                              : tag === "featured"
                                ? "おすすめ"
                                : tag === "popular"
                                  ? "人気"
                                  : "セール"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* URLプレビュー */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold">現在のURL</h3>
        <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
          {window.location.href}
        </code>
        <p className="text-xs text-muted-foreground">
          このURLをコピーして共有すると、同じフィルター条件が適用されます
        </p>
      </div>
    </div>
  );
}
