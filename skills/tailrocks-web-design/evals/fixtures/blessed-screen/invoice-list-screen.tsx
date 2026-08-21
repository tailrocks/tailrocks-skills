import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Invoice {
  readonly id: string;
  readonly issuedAt: string;
  readonly amount: string;
  readonly status: "paid" | "open" | "overdue";
}

export interface InvoiceListScreenProps {
  readonly invoices: readonly Invoice[];
  readonly state: "default" | "empty" | "loading" | "error";
}

export function InvoiceListScreen({ invoices, state }: InvoiceListScreenProps) {
  if (state === "loading") return <p className="p-8 text-muted-foreground">Loading invoices…</p>;
  if (state === "error") return <p className="p-8 text-destructive">Invoices could not be loaded.</p>;
  if (state === "empty") return <p className="p-8 text-muted-foreground">No invoices yet.</p>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issued</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.issuedAt}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === "overdue" ? "destructive" : "secondary"}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Download</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
