// Allow overriding the API base URL via environment variable (useful for deployment),
// but default to the local FastAPI dev server for local development.
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
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: fetchBody,
    });
  } catch (err) {
    // Network or CORS error – surface a clearer, user‑friendly message.
    throw new Error(
      "Unable to reach the server. Please check that the backend is running and your network is available."
    );
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data as { detail?: string; message?: string })?.detail ||
      (data as { detail?: string; message?: string })?.message ||
      res.statusText;
    throw new Error(message);
  }

  return data;
}

export const api = {
  register(payload: { email: string; full_name: string; password: string }): Promise<unknown> {
    return request("/auth/register", { method: "POST", body: payload });
  },
  reviewExam(id: string, token: string): Promise<unknown> {
    return request(`/exams/${id}/review`, { token });
  },
  async login(email: string, password: string): Promise<{ access_token: string }> {
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

      const data = (await res.json()) as { detail?: string };
      if (!res.ok) {
        throw new Error(data?.detail || res.statusText);
      }
      return data as { access_token: string };
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
