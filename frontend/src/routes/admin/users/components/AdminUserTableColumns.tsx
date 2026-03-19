import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { SortableHeader } from "@/components/table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatJapaneseDate } from "@/lib/dateFormatters";
import type { DbUser } from "@/types/auth";

export const createAdminUserColumns = (onEdit: (user: DbUser) => void): ColumnDef<DbUser>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    size: 80,
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
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
      );
    },
    size: 80,
  },
];
