"use client";
import { useActionState, useEffect, useRef } from "react";
import { loginAction } from "./actions";
export function LoginForm({ next, developmentPassword }: { next: string; developmentPassword: string }) {
  const [state, action, pending] = useActionState(loginAction, { error: undefined as string | undefined }); const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (developmentPassword) formRef.current?.requestSubmit(); }, [developmentPassword]);
  return <form ref={formRef} action={action} className="admin-login__form">
    <input type="hidden" name="next" value={next} />
    <label htmlFor="admin-username">账号</label><input id="admin-username" name="username" autoComplete="username" defaultValue="admin" required />
    <label htmlFor="admin-password">密码</label><input id="admin-password" name="password" type="password" autoComplete="current-password" defaultValue={developmentPassword} required />
    {state.error && <p className="note-error" role="alert">{state.error}</p>}
    <button className="primary-link" type="submit" disabled={pending}>{pending ? "登录中…" : "进入管理台"}</button>
  </form>;
}
