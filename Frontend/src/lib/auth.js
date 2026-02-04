export function isLoggedIn() {
  return localStorage.getItem("auth") === "1";
}

export function loginMock() {
  localStorage.setItem("auth", "1");
}

export function logoutMock() {
  localStorage.removeItem("auth");
}
