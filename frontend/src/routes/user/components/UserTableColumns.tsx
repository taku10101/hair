import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/table";
import { Badge } from "@/components/ui/Badge";
import { formatJapaneseDate } from "@/lib/dateFormatters";
import type { DbUser } from "@/types/auth";

export const userColumns: ColumnDef<DbUser>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="名前" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="メール" />,
  },
  {
    accessorKey: "role",
    header: "ロール",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant={role === "ADMIN" ? "default" : "secondary"}>{role}</Badge>;
    },
  },
  {
    accessorKey: "emailVerified",
    header: "メール確認",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return (
        <Badge variant={verified ? "default" : "outline"}>{verified ? "確認済み" : "未確認"}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="作成日" />,
    cell: ({ row }) => formatJapaneseDate(row.getValue("createdAt")),
  },
];
