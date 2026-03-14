// Allow overriding the API base URL via environment variable (useful for deployment),
// but default to the local FastAPI dev server for local development.
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
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body,
    });
  } catch (err) {
    // Network or CORS error – surface a clearer, user‑friendly message.
    throw new Error(
      "Unable to reach the server. Please check that the backend is running and your network is available."
    );
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = data?.detail || data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
}

export const api = {
  register(payload: any) {
    return request("/auth/register", { method: "POST", body: payload });
  },
  reviewExam(id: string | number, token: string) {
    return request(`/exams/${id}/review`, { token });
  },
  async login(email: string, password: string): Promise<any> {
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || res.statusText);
      }
      return data;
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

