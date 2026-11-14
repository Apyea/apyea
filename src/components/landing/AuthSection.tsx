export function AuthSection() {
  return (
    <section id="auth" className="border-t border-white/10 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Connect your Cognito app client
        </h2>
        <p className="mt-4 text-slate-400">
          Use Amplify, amazon-cognito-identity-js, or your preferred OIDC
          client to obtain access tokens, then call{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-indigo-200">
            Authorization: Bearer &lt;token&gt;
          </code>{" "}
          on the API routes. Admin routes require a user with{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-indigo-200">
            role: ADMIN
          </code>{" "}
          in PostgreSQL.
        </p>
        <div className="mt-10 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-left text-sm text-slate-200">
          <p className="font-medium text-indigo-200">Quick setup</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-300">
            <li>Copy <span className="font-mono text-xs">.env.example</span> to <span className="font-mono text-xs">.env</span></li>
            <li>Run <span className="font-mono text-xs">npm run db:push</span></li>
            <li>Grant IAM credentials for Cognito admin APIs on the server</li>
            <li>Promote your first admin: set <span className="font-mono text-xs">role = ADMIN</span> in the users table</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
