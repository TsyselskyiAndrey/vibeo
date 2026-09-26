export type LoginField = "email" | "password";
export type User = { id: string; email: string; name: string };

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

export class AuthError<K extends string = string> extends Error {
  fieldErrors: FieldErrors<K>;

  constructor(fieldErrors: FieldErrors<K>) {
    super("Auth failed");
    this.name = "AuthError";
    this.fieldErrors = fieldErrors;
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const MOCK_USER: User = { id: "1", email: "test@vibeo.app", name: "Test User" };

export async function loginWithPassword(data: { email: string; password: string }): Promise<User> {
  await sleep(800);
  if (data.email === "fail@vibeo.app") throw new Error("Network error");
  if (data.email.toLowerCase() !== MOCK_USER.email) {
    throw new AuthError({ email: "* No account with this email." });
  }
  if (data.password !== "Password1234") {
    throw new AuthError({ password: "* Wrong password." });
  }
  return MOCK_USER;
}

export async function loginWithGoogle(): Promise<User> {
  await sleep(600);
  return MOCK_USER;
}

const TAKEN_EMAILS = ["test@vibeo.app", "taken@vibeo.app"];

export async function registerStep1(data: { email: string; password: string }): Promise<void> {
  await sleep(700);
  if (data.email === "fail@vibeo.app") throw new Error("Network error");
  if (TAKEN_EMAILS.includes(data.email.toLowerCase())) {
    throw new AuthError({ email: "* This email is already registered." });
  }
}

export async function registerStep2(data: { email: string; firstname: string; lastname: string; birthdate: string }): Promise<void> {
  await sleep(700);
  if (data.firstname.toLowerCase() === "admin") {
    throw new AuthError({ firstname: "* This name is not allowed." });
  }
}

export async function registerStep3(data: { email: string; code: string }): Promise<void> {
  await sleep(700);
  if (data.code !== "123456") throw new AuthError({ code: "* Wrong code." });
}
