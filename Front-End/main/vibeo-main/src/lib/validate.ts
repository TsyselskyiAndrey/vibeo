export type Validation = {
  required?: boolean;
  allowSpaces?: boolean;
  email?: boolean;
  allowNums?: boolean;
  allowSymbols?: boolean;
  requireNums?: boolean;
  requireBothCases?: boolean;
  minLength?: number;
  maxLength?: number;
  code?: boolean;
  date?: boolean;
  repassword?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAge(birth: Date, now: Date) {
  const age = now.getFullYear() - birth.getFullYear();
  const hadBirthday = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  return hadBirthday ? age : age - 1;
}

function checkDate(value: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.replace(/\s/g, ""));
  if (!m) return "* Enter the complete date.";

  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "* The date is not valid.";
  }

  const now = new Date();
  if (date > now) return "* Are you from the future?";
  const age = getAge(date, now);
  if (age < 13) return "* You are too young.";
  if (age > 140) return "* You are too old.";
  return null;
}

export function validate(value: string, rules: Validation | undefined, name: string, password = ""): string | null {
  if (!rules) return null;

  if (rules.required && value.trim() === "") return "* This field is required.";
  if (rules.allowSpaces === false && /\s/.test(value)) {
    return "* This field cannot contain spaces. Please remove any spaces and try again.";
  }
  if (rules.email && !EMAIL_RE.test(value)) return "* The email address you entered is invalid.";
  if (rules.allowNums === false && /\d/.test(value)) return `* The ${name} mustn't contain any numbers.`;
  if (rules.allowSymbols === false && /[^a-zA-Z0-9 ]/.test(value)) {
    return `* The ${name} mustn't contain any special symbols or non-latin letters.`;
  }
  if (rules.requireNums && !/\d/.test(value)) return `* The ${name} must contain numbers.`;
  if (rules.requireBothCases && !(/[A-Z]/.test(value) && /[a-z]/.test(value))) {
    return `* The ${name} must contain both upper and lower case letters.`;
  }
  if (rules.minLength && value.length < rules.minLength) {
    return `* The ${name} must contain at least ${rules.minLength} characters.`;
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return `* The ${name} must contain no more than ${rules.maxLength} characters.`;
  }
  if (rules.code && !/^\d{6}$/.test(value)) return "* The code is not complete.";
  if (rules.date) {
    const error = checkDate(value);
    if (error) return error;
  }
  if (rules.repassword && value !== password) return "* The passwords do not match.";
  return null;
}
