// cookieUtils.js
// Safe browser cookie helpers for EduCloud authentication persistence.

export function setCookie(name, value, days = null) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length));
      } catch {
        return c.substring(nameEQ.length);
      }
    }
  }
  return null;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
