import { AlertCircle, CheckCircle2, FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { parseCSV, readFileAsText } from "@/lib/csvUtils";
import type { DbUser, UserRole } from "@/types/auth";

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (users: Partial<DbUser>[]) => Promise<void>;
}

interface ParsedUser {
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

const importColumns = [
  { key: "email" as const, header: "メールアドレス" },
  { key: "name" as const, header: "名前" },
  { key: "role" as const, header: "ロール" },
  { key: "emailVerified" as const, header: "メール確認" },
];

export function ImportUsersDialog({ open, onOpenChange, onImport }: ImportUsersDialogProps) {
  const [preview, setPreview] = useState<ParsedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setPreview([]);

    try {
      const text = await readFileAsText(selectedFile);
      const parsed = parseCSV<ParsedUser>(text, importColumns);

      // Validate data
      const errors: string[] = [];
      parsed.forEach((user, index) => {
        if (!user.email || !user.email.includes("@")) {
          errors.push(`行${index + 2}: 有効なメールアドレスが必要です`);
        }
        if (!user.name) {
          errors.push(`行${index + 2}: 名前が必要です`);
        }
        if (!["ADMIN", "SALARY"].includes(user.role)) {
          errors.push(`行${index + 2}: ロールはADMINまたはSALARYである必要があります`);
        }
      });

      if (errors.length > 0) {
        setError(errors.slice(0, 5).join("\n"));
        return;
      }

      // Convert emailVerified to boolean
      const processedData = parsed.map((user) => {
        const emailVerifiedStr = String(user.emailVerified);
        return {
          ...user,
          emailVerified:
            emailVerifiedStr === "true" ||
            emailVerifiedStr === "確認済み" ||
            emailVerifiedStr === "1",
        };
      });

      setPreview(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSVの解析に失敗しました");
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(preview);
      toast.success(`${preview.length}件のユーザーをインポートしました`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "インポートに失敗しました");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setPreview([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const handleDownloadTemplate = () => {
    const template = [
      importColumns.map((col) => col.header).join(","),
      "user@example.com,山田太郎,SALARY,確認済み",
      "admin@example.com,管理者,ADMIN,確認済み",
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "users_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload aria-hidden="true" className="h-5 w-5" />
            ユーザーデータのインポート
          </DialogTitle>
          <DialogDescription>CSVファイルからユーザーデータをインポートします</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">CSVテンプレートをダウンロード</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
              ダウンロード
            </Button>
          </div>

          {/* File upload */}
          <div>
            <label htmlFor="csv-file-input" className="sr-only">
              CSVファイルを選択
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="csv-file-input"
              className="w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-4 border border-destructive rounded-lg bg-destructive/10">
              <AlertCircle
                aria-hidden="true"
                className="h-5 w-5 text-destructive mt-0.5 shrink-0"
              />
              <div className="text-sm text-destructive whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-green-600" />
                {preview.length}件のユーザーが見つかりました
              </div>
              <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">メールアドレス</th>
                      <th className="text-left p-2">名前</th>
                      <th className="text-left p-2">ロール</th>
                      <th className="text-left p-2">確認</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((user, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.role}</td>
                        <td className="p-2">{user.emailVerified ? "確認済み" : "未確認"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    他 {preview.length - 10} 件
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format guide */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
            <div className="font-medium">CSVフォーマット:</div>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>ヘッダー行：メールアドレス,名前,ロール,メール確認</li>
              <li>ロール：ADMIN または SALARY</li>
              <li>メール確認：確認済み または 未確認（true/false も可）</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || isImporting}>
            <Upload aria-hidden="true" className="h-4 w-4 mr-2" />
            {isImporting ? "インポート中..." : "インポート"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
