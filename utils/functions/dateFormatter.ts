export function dateFormatter(
  input: string | Date,
  toISO: boolean = false
): string {
  let dateString = "";

  if (input instanceof Date) {
    dateString = input.toISOString().split("T")[0];
  } else {
    dateString = input;
  }

  if (toISO && dateString.includes("/")) {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (!toISO && dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  return dateString;
}

export function getLocalDateString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
