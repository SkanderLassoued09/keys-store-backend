// Zero-dependency environment loader.
//
// Imported at the very TOP of main.ts so it runs BEFORE AppModule is evaluated
// (Mongoose URI, JWT secret, etc. are read at module-load time). It only
// activates when NODE_ENV is explicitly set — which the `start:dev` / `start:prod`
// npm scripts do. A run with NODE_ENV unset (e.g. the Docker container's
// `nest start --watch`) loads NOTHING and keeps using only its injected
// environment, so existing deployments are unaffected.
//
// Precedence (highest first): real shell/Docker env  >  .env.<mode>.local  >
// .env.<mode>. Existing process.env keys are never overwritten.
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv) {
  for (const file of [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;

    for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eq = line.indexOf('=');
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim();
      if (!key || key in process.env) continue; // never override an existing value

      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}
