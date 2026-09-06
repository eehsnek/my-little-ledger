CREATE TABLE public.debt_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    debt_id uuid NOT NULL
        REFERENCES public.debts(id)
        ON DELETE CASCADE,

    amount numeric(12,2) NOT NULL
        CHECK (amount > 0),

    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their own debts"
ON public.debt_payments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.debts
        WHERE debts.id = debt_payments.debt_id
        AND debts.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create payments for their own debts"
ON public.debt_payments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.debts
        WHERE debts.id = debt_payments.debt_id
        AND debts.user_id = auth.uid()
    )
);