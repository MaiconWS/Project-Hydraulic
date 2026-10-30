-- Cache non-row-dependent authorization helpers once per statement in RLS policies.
-- The authorization rules and role targets are unchanged.

ALTER POLICY "insert component" ON public.componentes
WITH CHECK ((SELECT private.perfil_atual()) = 'Admin'::text);

ALTER POLICY "admin delete pecas" ON public.pecas
USING ((SELECT private.perfil_atual()) = 'Admin'::text);

ALTER POLICY "admin update pecas" ON public.pecas
USING ((SELECT private.perfil_atual()) = 'Admin'::text)
WITH CHECK ((SELECT private.perfil_atual()) = 'Admin'::text);

ALTER POLICY "insert peç]ca" ON public.pecas
WITH CHECK ((SELECT private.perfil_atual()) = 'Admin'::text);

ALTER POLICY "atualizar itens" ON public.solicitacao_itens
USING ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
WITH CHECK ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]));

ALTER POLICY "consulta" ON public.solicitacao_itens
USING (
    ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
    OR EXISTS (
        SELECT 1
        FROM public.solicitacoes s
        WHERE s.id = solicitacao_itens.solicitacao_id
          AND s.solicitante_auth_id = (SELECT auth.uid())
    )
);

ALTER POLICY "usuarios autorizados podem criar itens" ON public.solicitacao_itens
WITH CHECK (
    ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
    OR (
        (SELECT private.perfil_atual()) = 'Mecanico'::text
        AND EXISTS (
            SELECT 1
            FROM public.solicitacoes s
            WHERE s.id = solicitacao_itens.solicitacao_id
              AND s.solicitante_auth_id = (SELECT auth.uid())
              AND s.status = 'Pendente'::text
        )
    )
);

ALTER POLICY "Atualizar dados da solicitação" ON public.solicitacoes
USING ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
WITH CHECK ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]));

ALTER POLICY "usuarios autorizados podem criar solicitacoes" ON public.solicitacoes
WITH CHECK (
    ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
    OR (
        (SELECT private.perfil_atual()) = 'Mecanico'::text
        AND solicitante_auth_id = (SELECT auth.uid())
    )
);

ALTER POLICY "visão das solicitações" ON public.solicitacoes
USING (
    ((SELECT private.perfil_atual()) = ANY (ARRAY['Aprovisionador'::text, 'Admin'::text]))
    OR solicitante_auth_id = (SELECT auth.uid())
);

ALTER POLICY "usuario" ON public.usuarios
USING (
    (SELECT auth.uid()) = auth_user_id
    OR (SELECT private.perfil_atual()) = 'Admin'::text
);
