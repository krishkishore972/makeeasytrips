import { stdin, stdout, argv, env, exit } from "node:process";
import { hashAdminPassword } from "../lib/admin/password";

const MIN_LENGTH = 12;

function usage(): never {
  console.log(`Usage:
  npm run admin:hash-password                 # prompt with hidden input
  printf '%s' 'your-password' | npm run admin:hash-password
  npm run admin:hash-password -- --password 'your-password'

The value is printed as ADMIN_PASSWORD_HASH=<hash>. Copy it into .env.local
and never commit the file.`);
  exit(0);
}

async function readPipedInput(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of stdin) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks)
    .toString("utf8")
    .replace(/\r?\n$/u, "");
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";

    const cleanup = () => {
      stdin.setRawMode?.(false);
      stdin.pause();
      stdin.off("data", onData);
    };

    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === "\r" || character === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }

        if (character === "\u0003") {
          cleanup();
          stdout.write("\n");
          reject(new Error("Cancelled."));
          return;
        }

        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        value += character;
      }
    };

    stdin.on("data", onData);
  });
}

async function resolvePassword(): Promise<string> {
  if (argv.includes("--help") || argv.includes("-h")) {
    usage();
  }

  const flagIndex = argv.indexOf("--password");

  if (flagIndex !== -1) {
    const value = argv[flagIndex + 1];
    if (!value) {
      throw new Error("--password needs a value.");
    }
    return value;
  }

  if (env.ADMIN_PASSWORD) {
    return env.ADMIN_PASSWORD;
  }

  if (!stdin.isTTY) {
    return readPipedInput();
  }

  const password = await promptHidden("Admin password: ");
  const confirmation = await promptHidden("Confirm password: ");

  if (password !== confirmation) {
    throw new Error("The passwords did not match.");
  }

  return password;
}

async function main(): Promise<void> {
  try {
    const password = await resolvePassword();

    if (password.length < MIN_LENGTH) {
      throw new Error(`Choose a password with at least ${MIN_LENGTH} characters.`);
    }

    const hash = await hashAdminPassword(password);
    console.log(`\nADMIN_PASSWORD_HASH=${hash}`);
    console.log("\nAdd that line to .env.local and keep the file out of version control.");
  } catch (error) {
    console.error(`\n${error instanceof Error ? error.message : String(error)}`);
    exit(1);
  }
}

void main();
