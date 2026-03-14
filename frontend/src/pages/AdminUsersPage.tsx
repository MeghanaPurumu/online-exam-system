<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
=======
import React, { useEffect, useMemo, useState } from "react";
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

<<<<<<< HEAD
interface User {
  id: number;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  is_active?: boolean;
  [key: string]: unknown;
}

function AdminUsersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
=======
function AdminUsersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
  const [error, setError] = useState("");

  const isAdmin = Boolean(user?.is_admin);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user && !isAdmin) {
      navigate("/exams");
      return;
    }
    const load = async () => {
      setError("");
      setLoading(true);
      try {
<<<<<<< HEAD
        const data = (await api.listUsers(token)) as User[];
        setUsers(data);
      } catch (e) {
        setError((e as Error).message || "Failed to load users");
=======
        const data = await api.listUsers(token);
        setUsers(data);
      } catch (e) {
        setError(e.message || "Failed to load users");
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user, isAdmin, navigate]);

  const rows = useMemo(() => users, [users]);

<<<<<<< HEAD
  const toggleBlock = async (u: User) => {
    if (!token) return;
    setBusyUserId(u.id);
    setError("");
    try {
      const updated = (u.is_active ? await api.blockUser(u.id, token) : await api.unblockUser(u.id, token)) as User;
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message || "Action failed");
=======
  const toggleBlock = async (u) => {
    setBusyUserId(u.id);
    setError("");
    try {
      const updated = u.is_active ? await api.blockUser(u.id, token) : await api.unblockUser(u.id, token);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError(e.message || "Action failed");
>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
    } finally {
      setBusyUserId(null);
    }
  };

  if (!token) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User management</h1>
          <p className="page-subtitle">Block or unblock users to control access.</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading users...</p>}

      {!loading && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.full_name || "—"}</td>
                  <td>{u.is_admin ? "Admin" : "Student"}</td>
                  <td>{u.is_active ? "Active" : "Blocked"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => toggleBlock(u)}
                      disabled={busyUserId === u.id || u.is_admin}
                      title={u.is_admin ? "Admins cannot be blocked from here" : ""}
                    >
                      {busyUserId === u.id ? "Working..." : u.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "1rem" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
<<<<<<< HEAD
=======




>>>>>>> a00c66199331bfd4797fbcfdc023931434c4210a
