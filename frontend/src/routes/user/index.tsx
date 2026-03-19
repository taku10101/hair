import { useMemo } from "react";
import { CsvExportButton, type CsvExportColumn } from "@/components/export";
import { FilterForm } from "@/components/filters";
import { DataTable } from "@/components/table";
import { Badge } from "@/components/ui/Badge";
import { useClientSideFiltering } from "@/hooks/useClientSideFiltering";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { DbUser } from "@/types/auth";
import { userFilterConfigs } from "./components/UserFilters";
import { userColumns } from "./components/UserTableColumns";
import { useUsers } from "./hooks/useUsersData";

export function UsersPage() {
  const { users, isLoading } = useUsers();

  // Pagination state
  const { pageIndex, pageSize, onPaginationChange } = usePaginationState({
    defaultPageSize: 10,
  });

  // Client-side filtering
  const { filteredData } = useClientSideFiltering({
    data: users,
    filters: userFilterConfigs,
  });

  // CSV export configuration
  const csvExportColumns: CsvExportColumn<DbUser>[] = useMemo(
    () => [
      { key: "id", header: "ID", enabled: true },
      { key: "name", header: "名前", enabled: true },
      { key: "email", header: "メールアドレス", enabled: true },
      { key: "role", header: "ロール", enabled: true },
      { key: "createdAt", header: "作成日", enabled: true },
    ],
    []
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">ユーザー</h1>
          <Badge variant="outline">
            {filteredData.length} / {users?.length ?? 0} 件
          </Badge>
        </div>
        <CsvExportButton
          data={filteredData as unknown as Record<string, unknown>[]}
          columns={csvExportColumns as unknown as CsvExportColumn<Record<string, unknown>>[]}
          filename="users.csv"
        />
      </div>

      {/* Filters */}
      <FilterForm filters={userFilterConfigs} />

      {/* Table */}
      <DataTable
        columns={userColumns}
        data={filteredData}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={onPaginationChange}
        manualPagination={false}
        enableSorting={true}
        isLoading={isLoading}
      />
    </div>
  );
}
