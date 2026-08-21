import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowLeftRight, Wallet } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createDebt, deleteDebt, getDebts, updateDebtPaid } from "@/lib/debts.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Utang Tracker" },
      { name: "description", content: "View and manage your debts and loans." },
      { property: "og:title", content: "Dashboard — Utang Tracker" },
      { property: "og:description", content: "View and manage your debts and loans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const debtsQueryKey = ["debts"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const fetchDebts = useServerFn(getDebts);
  const { data: debts = [] } = useQuery({
    queryKey: debtsQueryKey,
    queryFn: () => fetchDebts(),
  });

  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"lent" | "borrowed">("lent");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDebtFn = useServerFn(createDebt);
  const updatePaidFn = useServerFn(updateDebtPaid);
  const deleteDebtFn = useServerFn(deleteDebt);

  const totalLent = debts
    .filter((d) => d.type === "lent" && !d.paid)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const totalBorrowed = debts
    .filter((d) => d.type === "borrowed" && !d.paid)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const balance = totalLent - totalBorrowed;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!personName || !amount) return;

    setIsSubmitting(true);
    try {
      await createDebtFn({
        data: {
          person_name: personName,
          amount: Number(amount),
          type,
          description,
        },
      });
      setPersonName("");
      setAmount("");
      setDescription("");
      setType("lent");
      queryClient.invalidateQueries({ queryKey: debtsQueryKey });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function togglePaid(id: string, paid: boolean) {
    await updatePaidFn({ data: { id, paid: !paid } });
    queryClient.invalidateQueries({ queryKey: debtsQueryKey });
  }

  async function removeDebt(id: string) {
    await deleteDebtFn({ data: { id } });
    queryClient.invalidateQueries({ queryKey: debtsQueryKey });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
            Utang Tracker
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Owed to you
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalLent)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                You owe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalBorrowed)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-semibold ${
                  balance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5" />
                Add utang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="person">Person</Label>
                  <Input
                    id="person"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. Juan dela Cruz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₱)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "lent" | "borrowed")}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lent">I lent money</SelectItem>
                      <SelectItem value="borrowed">I borrowed money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Note (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. For lunch last week"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Add utang"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowLeftRight className="h-5 w-5" />
                Your utang list
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No utang yet. Add your first one.
                </p>
              ) : (
                <ul className="space-y-3">
                  {debts.map((debt) => (
                    <li
                      key={debt.id}
                      className="flex items-start justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-foreground">
                            {debt.person_name}
                          </span>
                          <Badge variant={debt.type === "lent" ? "default" : "secondary"}>
                            {debt.type === "lent" ? "Lent" : "Borrowed"}
                          </Badge>
                          {debt.paid && (
                            <Badge variant="outline" className="text-emerald-600">
                              Paid
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(Number(debt.amount))}
                        </p>
                        {debt.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{debt.description}</p>
                        )}
                      </div>

                      <div className="ml-4 flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={debt.paid}
                            onCheckedChange={() => togglePaid(debt.id, debt.paid)}
                            aria-label="Toggle paid status"
                          />
                          <span className="text-xs text-muted-foreground">Paid</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDebt(debt.id)}
                          aria-label="Delete utang"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
