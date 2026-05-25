
-- Restringir EXECUTE em SECURITY DEFINER functions: revogar de anon/public em todas;
-- revogar de authenticated nas que são internas (RLS / triggers / outras funções).
-- Manter GRANT a authenticated apenas para RPCs intencionalmente expostas: use_token, admin_grant_tokens.

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.has_active_subscription(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_in_trial(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_remaining_tokens(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.use_token(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_grant_tokens(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.use_token(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_tokens(uuid, integer) TO authenticated;
