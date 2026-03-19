import { Upload, UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ExportButton, type ExportColumn } from "@/components/export";
import { FilterForm } from "@/components/filters";
import { DataTable } from "@/components/table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useClientSideFiltering } from "@/hooks/useClientSideFiltering";
import { usePaginationState } from "@/hooks/usePaginationState";
import { authenticatedFetch } from "@/lib/apiClient";
import { userFilterConfigs } from "@/routes/user/components/UserFilters";
import { useUsers } from "@/routes/user/hooks/useUsersData";
import type { DbUser } from "@/types/auth";
import { createAdminUserColumns } from "./components/AdminUserTableColumns";
import { EditUserDialog } from "./components/EditUserDialog";
import { ImportUsersDialog } from "./components/ImportUsersDialog";
import { InviteUserDialog } from "./components/InviteUserDialog";

export function AdminUsersPage() {
  const { users, isLoading, mutate } = useUsers();
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Pagination state
  const { pageIndex, pageSize, onPaginationChange } = usePaginationState({
    defaultPageSize: 10,
  });

  // Client-side filtering
  const { filteredData } = useClientSideFiltering({
    data: users,
    filters: userFilterConfigs,
  });

  const handleEdit = useCallback((user: DbUser) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleImport = useCallback(
    async (users: Partial<DbUser>[]) => {
      try {
        await authenticatedFetch("/api/admin/users/import", {
          method: "POST",
          body: JSON.stringify({ users }),
        });
        mutate();
      } catch (_error) {
        throw new Error("ユーザーのインポートに失敗しました");
      }
    },
    [mutate]
  );

  const columns = useMemo(() => createAdminUserColumns(handleEdit), [handleEdit]);

  // Export configuration (Excel/CSV)
  const exportColumns: ExportColumn<DbUser>[] = useMemo(
    () => [
      { key: "id", header: "ID", enabled: true },
      { key: "email", header: "メールアドレス", enabled: true },
      { key: "name", header: "名前", enabled: true },
      { key: "role", header: "ロール", enabled: true },
      { key: "emailVerified", header: "メール確認", enabled: true },
      { key: "firebaseUid", header: "Firebase UID", enabled: false },
      { key: "photoUrl", header: "写真URL", enabled: false },
      { key: "lastSignInMethod", header: "最終ログイン方法", enabled: false },
      { key: "createdAt", header: "作成日", enabled: true },
      { key: "updatedAt", header: "更新日", enabled: false },
    ],
    []
  );

  return (
    <>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">ユーザー管理（管理者専用）</h1>
            <Badge variant="outline">
              {filteredData.length} / {users?.length ?? 0} 件
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              data={filteredData as unknown as Record<string, unknown>[]}
              columns={exportColumns as unknown as ExportColumn<Record<string, unknown>>[]}
              filename="users.xlsx"
            />
            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
              <Upload aria-hidden="true" className="h-4 w-4 mr-2" />
              インポート
            </Button>
            <Button variant="default" size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus aria-hidden="true" className="h-4 w-4 mr-2" />
              ユーザー招待
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FilterForm filters={userFilterConfigs} />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPaginationChange={onPaginationChange}
          manualPagination={false}
          enableSorting={true}
          isLoading={isLoading}
        />
      </div>

      {/* Dialogs */}
      <EditUserDialog
        user={editingUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
      <ImportUsersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
