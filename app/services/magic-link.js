import fs from "fs";
import path from "path";
import crypto from "crypto";
import { APP_NAME, APP_URL, SECRET } from "~/config.server";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.cjs";
const fullConfig = resolveConfig(tailwindConfig);

const linkExpirationTime = 1000 * 60 * 30;
const magicLinkSearchParam = "ambrosIo";

export const validateMagicLink = (link) => {
  const url = new URL(link);
  const linkCode = url.searchParams.get(magicLinkSearchParam) ?? "";
  try {
    const decryptedString = decrypt(linkCode);
    const { emailAddress, createdAt } = JSON.parse(decryptedString);

    if (typeof emailAddress !== "string") {
      console.error(`Email is not a string. Maybe wasn't set in the session?`);
      throw new Error("Sign in link invalid. Please request a new one.");
    }

    if (typeof createdAt !== "string") {
      console.error("Link expiration is not a string.");
      throw new Error("Sign in link invalid. Please request a new one.");
    }

    const expirationTime = new Date(createdAt).getTime() + linkExpirationTime;
    if (Date.now() > expirationTime) {
      throw new Error("Magic link expired. Please request a new one.");
    }
    return emailAddress;
  } catch (error) {
    console.error(error);
    throw new Error("Sign in link invalid. Please request a new one.");
  }
};

export const createMagicLink = (emailAddress) => {
  const stringToEncrypt = JSON.stringify({
    emailAddress,
    createdAt: new Date().toISOString(),
  });
  const encryptedString = encrypt(stringToEncrypt);
  const url = new URL(APP_URL);
  url.pathname = "welcome/magic";
  url.searchParams.set(magicLinkSearchParam, encryptedString);
  return url.toString();
};

export const createMagicLinkEmail = (user) => {
  const emailAddress = user.email;
  if (!emailAddress) throw new Error("No email provided for magic link");
  const userExists = Boolean(user.firstName);

  const magicLink = createMagicLink(emailAddress);

  const text = `
Voici votre lien de connection vers ${APP_NAME}:

${magicLink}

${
  userExists
    ? `Heureux de vous voir de retour ${user.firstName} !`
    : `
Cliquer sur le lien ci-dessus créera un *nouveau* compte sur ${APP_NAME} avec l'email ${emailAddress}. Bienvenue !
`.trim()
}

L'équipe de ${APP_NAME}

P.S. Si vous n'avez pas demandé à recevoir cet email, vous pouvez l'ignorer.
  `.trim();

  const html = fs
    .readFileSync(path.join(__dirname, "../templates/magic-link.html"), "utf8")
    .split("{APP_NAME}")
    .join(APP_NAME)
    .split("{APP_URL}")
    .join(APP_URL)
    .replace("{MAGIC_LINK}", magicLink)
    .replace("{MAGIC_LINK}", magicLink)
    .replace("{APP_COLOR}", fullConfig.theme.colors.app)
    .replace("{BUTTON_CAPTION}", userExists ? "Se connecter" : "Créer mon compte")
    .replace(
      "{WELCOME_MESSAGE}",
      userExists
        ? `Bonjour ${user?.firstName ? `${user?.firstName} !` : "!"} Heureux de vous revoir sur ${APP_NAME}!`
        : `Bienvenue sur ${APP_NAME} !`
    );

  return {
    emails: [emailAddress],
    subject: `Voici votre lien de connection vers ${APP_NAME}`,
    text,
    html,
  };
};

const algorithm = "aes-256-ctr";

const ENCRYPTION_KEY = crypto.scryptSync(SECRET, "salt", 32);

const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (text) => {
  const [ivPart, encryptedPart] = text.split(":");
  if (!ivPart || !encryptedPart) {
    throw new Error("Invalid text.");
  }

  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(encryptedPart, "hex");
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
};
