import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const debtTypeSchema = z.enum(["lent", "borrowed"]);

const createDebtSchema = z.object({
  person_name: z.string().min(1, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: debtTypeSchema,
  description: z.string().max(500).optional(),
});

const updatePaidSchema = z.object({
  id: z.string().uuid(),
  paid: z.boolean(),
});

const deleteDebtSchema = z.object({
  id: z.string().uuid(),
});

export const getDebts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("debts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createDebtSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: debt, error } = await context.supabase
      .from("debts")
      .insert({
        user_id: context.userId,
        person_name: data.person_name,
        amount: data.amount,
        type: data.type,
        description: data.description ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return debt;
  });

export const updateDebtPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updatePaidSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: debt, error } = await context.supabase
      .from("debts")
      .update({ paid: data.paid })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return debt;
  });

export const deleteDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteDebtSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("debts")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
