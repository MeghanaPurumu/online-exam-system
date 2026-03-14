// Allow overriding the API base URL via environment variable (useful for deployment),
// but default to the local FastAPI dev server for local development.
<<<<<<< HEAD
const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

async function request(
  path: string,
  { method = "GET", body, token }: { method?: string; body?: unknown; token?: string } = {}
): Promise<unknown> {
  const headers: Record<string, string> = {};
  let fetchBody: string | FormData | undefined = undefined;
  if (body) {
    if (body instanceof FormData) {
      fetchBody = body;
    } else {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }
=======
const API_BASE_URL: string = (import.meta.env as any)?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function request(path: string, { method = "GET", body, token }: RequestOptions = {}): Promise<any> {
  const headers: Record<string, string> = {};
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
<<<<<<< HEAD
      body: fetchBody,
=======
      body,
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    });
  } catch (err) {
    // Network or CORS error – surface a clearer, user‑friendly message.
    throw new Error(
      "Unable to reach the server. Please check that the backend is running and your network is available."
    );
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
<<<<<<< HEAD
  const data: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data as { detail?: string; message?: string })?.detail ||
      (data as { detail?: string; message?: string })?.message ||
      res.statusText;
=======
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = data?.detail || data?.message || res.statusText;
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    throw new Error(message);
  }

  return data;
}

export const api = {
<<<<<<< HEAD
  register(payload: { email: string; full_name: string; password: string }): Promise<unknown> {
    return request("/auth/register", { method: "POST", body: payload });
  },
  reviewExam(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}/review`, { token });
  },
  async login(email: string, password: string): Promise<{ access_token: string }> {
=======
  register(payload: any) {
    return request("/auth/register", { method: "POST", body: payload });
  },
  reviewExam(id: string | number, token: string) {
    return request(`/exams/${id}/review`, { token });
  },
  async login(email: string, password: string): Promise<any> {
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

<<<<<<< HEAD
      const data = (await res.json()) as { detail?: string };
      if (!res.ok) {
        throw new Error(data?.detail || res.statusText);
      }
      return data as { access_token: string };
=======
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || res.statusText);
      }
      return data;
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    } catch (err) {
      // Match the behaviour of the shared request helper for network failures.
      if (err instanceof TypeError) {
        throw new Error(
          "Unable to reach the server. Please check that the backend is running and your network is available."
        );
      }
      throw err;
    }
  },
<<<<<<< HEAD
  listExams(token: string): Promise<unknown> {
    return request("/exams/", { token });
  },
  getExam(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}`, { token });
  },
  takeExam(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}/take`, { token });
  },
  submitExam(
    id: string,
    payload: unknown,
    token: string
  ): Promise<unknown> {
    return request(`/exams/${id}/submit`, {
      method: "POST",
      body: payload,
      token,
    });
  },
  getLeaderboard(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}/leaderboard`, { token });
  },
  createExam(payload: unknown, token: string): Promise<unknown> {
    return request("/exams/", { method: "POST", body: payload, token });
  },
  updateExam(
    id: string,
    payload: unknown,
    token: string
  ): Promise<unknown> {
    return request(`/exams/${id}`, { method: "PUT", body: payload, token });
  },
  getExamAttempts(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}/attempts`, { token });
  },
  listExamStatus(token: string): Promise<unknown> {
    return request("/exams/status", { token });
  },
  getProfile(token: string): Promise<unknown> {
    return request("/auth/me/profile", { token });
  },
  getMe(token: string): Promise<unknown> {
    return request("/auth/me", { token });
  },
  listUsers(token: string): Promise<unknown> {
    return request("/auth/users", { token });
  },
  blockUser(userId: number, token: string): Promise<unknown> {
    return request(`/auth/users/${userId}/block`, { method: "PATCH", token });
  },
  unblockUser(userId: number, token: string): Promise<unknown> {
    return request(`/auth/users/${userId}/unblock`, { method: "PATCH", token });
  },
};
=======
  listExams(token: string) {
    return request("/exams/", { token });
  },
  getExam(id: string | number, token: string) {
    return request(`/exams/${id}`, { token });
  },
  takeExam(id: string | number, token: string) {
    return request(`/exams/${id}/take`, { token });
  },
  submitExam(id: string | number, payload: any, token: string) {
    return request(`/exams/${id}/submit`, { method: "POST", body: payload, token });
  },
  getLeaderboard(id: string | number, token: string) {
    return request(`/exams/${id}/leaderboard`, { token });
  },
  createExam(payload: any, token: string) {
    return request("/exams/", { method: "POST", body: payload, token });
  },
  updateExam(id: string | number, payload: any, token: string) {
    return request(`/exams/${id}`, { method: "PUT", body: payload, token });
  },
  getExamAttempts(id: string | number, token: string) {
    return request(`/exams/${id}/attempts`, { token });
  },
  listExamStatus(token: string) {
    return request("/exams/status", { token });
  },
  getProfile(token: string) {
    return request("/auth/me/profile", { token });
  },
  getMe(token: string) {
    return request("/auth/me", { token });
  },
  listUsers(token: string) {
    return request("/auth/users", { token });
  },
  blockUser(userId: string | number, token: string) {
    return request(`/auth/users/${userId}/block`, { method: "PATCH", token });
  },
  unblockUser(userId: string | number, token: string) {
    return request(`/auth/users/${userId}/unblock`, { method: "PATCH", token });
  },
};

>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
