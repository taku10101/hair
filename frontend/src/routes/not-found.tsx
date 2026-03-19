import { Link } from "react-router";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">ページが見つかりません</h2>
          <p className="text-muted-foreground max-w-md">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>
        <Link to="/">
          <Button size="lg">ホームへ戻る</Button>
        </Link>
      </div>
    </div>
  );
}
