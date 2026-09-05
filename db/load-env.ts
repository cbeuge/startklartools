// Fuer die Standalone-Skripte (migrate, seed). Laedt .env.local vor .env,
// ohne Shell-Interpolation von $ (anders als der Env-Loader von Next).
// .env.local gewinnt, weil dotenv einen bereits gesetzten Schluessel nicht
// ueberschreibt. quiet: unterdrueckt dotenvs eigene Konsolen-Ausgabe
// (rotierende Werbezeilen fuer eigene Produkte, u.a. vestauth.com).
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });
