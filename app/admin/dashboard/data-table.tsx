"use client";

interface Companion {
  id: string;
  name: string;
  userName: string;
  private: boolean;
  createdAt: string;
  // ... other fields
}

interface Column {
  accessorKey: string;
  header: string;
  cell?: ({ row }: { row: { original: Companion } }) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Companion[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="rounded-md border border-input">
      <table className="w-full">
        <thead>
          <tr className="border-b border-input bg-muted">
            {columns.map((column) => (
              <th 
                key={column.accessorKey}
                className="p-4 text-left text-sm font-medium text-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-input hover:bg-muted/50">
              {columns.map((column) => (
                <td 
                  key={column.accessorKey}
                  className="p-4 text-sm text-muted-foreground"
                >
                  {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey as keyof Companion]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 