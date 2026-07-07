export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

type Listener = () => void;

function readFromBoth(key: string) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function whichStorageHas(key: string): "local" | "session" | null {
  if (localStorage.getItem(key)) return "local";
  if (sessionStorage.getItem(key)) return "session";
  return null;
}

export const authStore = (() => {
  const listeners = new Set<Listener>();

  const notify = () => listeners.forEach((l) => l());

  const getAccessToken = () => readFromBoth(ACCESS_TOKEN_KEY);
  const getRefreshToken = () => readFromBoth(REFRESH_TOKEN_KEY);

  const isLoggedIn = () => Boolean(getAccessToken());

  const saveTokens = (
    accessToken: string,
    refreshToken?: string,
    keepLogin: boolean = false
  ) => {
    const target = keepLogin ? localStorage : sessionStorage;
    const other = keepLogin ? sessionStorage : localStorage;

    // 반대 저장소 제거(중복/꼬임 방지)
    other.removeItem(ACCESS_TOKEN_KEY);
    other.removeItem(REFRESH_TOKEN_KEY);

    target.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) target.setItem(REFRESH_TOKEN_KEY, refreshToken);

    notify();
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);

    notify();
  };

  const deleteAccessToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  };

  // 리프레시 같은 곳에서 “기존 keepLogin 유지”가 필요하면 사용
  const getKeepLogin = () =>
    (whichStorageHas(REFRESH_TOKEN_KEY) ??
      whichStorageHas(ACCESS_TOKEN_KEY)) === "local";

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    isLoggedIn,
    getAccessToken,
    getRefreshToken,
    saveTokens,
    deleteAccessToken,
    getKeepLogin,
    logout,
    subscribe,
  };
})();
