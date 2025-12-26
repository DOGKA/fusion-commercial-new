"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Users, Shield, ShieldCheck, User, Search, RefreshCw,
  ChevronDown, Check, Trash2, Plus, X, Mail, Phone,
  Calendar, ShoppingBag, AlertCircle, Eye, EyeOff
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
  phone: string | null;
  emailVerified: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
}

interface Stats {
  total: number;
  SUPER_ADMIN: number;
  ADMIN: number;
  CUSTOMER: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string; icon: any }> = {
  SUPER_ADMIN: { label: "Süper Admin", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10", icon: ShieldCheck },
  ADMIN: { label: "Admin", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-500/10", icon: Shield },
  CUSTOMER: { label: "Müşteri", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10", icon: User },
};

// Frontend URL for avatar images (cross-app)
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3003";

// Helper to get full avatar URL
const getAvatarUrl = (image: string | null): string | null => {
  if (!image) return null;
  // If already absolute URL, return as is
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  
  // Müşteri avatarları - frontend'de kayıtlı (/storage/users/)
  if (image.startsWith("/storage/users/")) {
    return `${FRONTEND_URL}${image}`;
  }
  
  // Admin avatarları - admin panelde kayıtlı (/storage/avatars/)
  // Lokal path olarak bırak, Next.js Image optimization kullanabilir
  return image;
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role;
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  // Create form
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Kullanıcılar alınamadı");
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdatingUsers((prev) => new Set(prev).add(userId));
    setActiveRoleDropdown(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız");

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Delete user
  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Silme başarısız");

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create user
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Oluşturma başarısız");

      setShowCreateModal(false);
      setNewUser({ name: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
      alert(`${data.user.name} başarıyla oluşturuldu!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setActiveRoleDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Üyeler</h1>
          <p className="text-gray-500">Kullanıcıları ve yetkileri yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus size={16} />
              Yeni Admin
            </button>
          )}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500">Toplam</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRoleFilter(roleFilter === "SUPER_ADMIN" ? "ALL" : "SUPER_ADMIN")}
            className={`rounded-xl border p-4 text-left transition-all ${roleFilter === "SUPER_ADMIN" ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <ShieldCheck size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.SUPER_ADMIN}</p>
                <p className="text-sm text-gray-500">Süper Admin</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setRoleFilter(roleFilter === "ADMIN" ? "ALL" : "ADMIN")}
            className={`rounded-xl border p-4 text-left transition-all ${roleFilter === "ADMIN" ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/10">
                <Shield size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{stats.ADMIN}</p>
                <p className="text-sm text-gray-500">Admin</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setRoleFilter(roleFilter === "CUSTOMER" ? "ALL" : "CUSTOMER")}
            className={`rounded-xl border p-4 text-left transition-all ${roleFilter === "CUSTOMER" ? "border-gray-500 bg-gray-50 dark:bg-gray-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/10">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">{stats.CUSTOMER}</p>
                <p className="text-sm text-gray-500">Müşteri</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-4 rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="İsim veya email ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:text-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
          className="rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
        >
          <option value="ALL">Tüm Roller</option>
          <option value="SUPER_ADMIN">Süper Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">Müşteri</option>
        </select>
        {(roleFilter !== "ALL" || searchQuery) && (
          <button
            onClick={() => { setRoleFilter("ALL"); setSearchQuery(""); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X size={14} />
            Temizle
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Kullanıcı Listesi
            <span className="ml-2 text-sm font-normal text-gray-500">({users.length} kullanıcı)</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-gray-500">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Kullanıcı</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">İletişim</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Rol</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Siparişler</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Kayıt</th>
                  <th className="px-4 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const isUpdating = updatingUsers.has(user.id);
                  const isCurrentUser = user.id === session?.user?.id;

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-stroke last:border-0 dark:border-dark-3 ${isUpdating ? "opacity-50" : ""}`}
                    >
                      {/* User Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium overflow-hidden">
                            {getAvatarUrl(user.image) ? (
                              <Image src={getAvatarUrl(user.image)!} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
                            ) : (
                              (user.name?.[0] || user.email?.[0] || "?").toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-dark dark:text-white">
                              {user.name || "-"}
                              {isCurrentUser && <span className="ml-2 text-xs text-primary">(Sen)</span>}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <p className="flex items-center gap-1 text-sm text-gray-500">
                              <Phone size={12} />
                              {user.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail size={12} />
                            {user.emailVerified ? "Onaylı" : "Onaysız"}
                          </p>
                        </div>
                      </td>

                      {/* Role - Dropdown */}
                      <td className="px-4 py-4">
                        {isSuperAdmin && !isCurrentUser ? (
                          <div className="relative" data-dropdown>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveRoleDropdown(activeRoleDropdown === user.id ? null : user.id);
                              }}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color} hover:opacity-80`}
                            >
                              <roleConfig.icon size={12} />
                              {roleConfig.label}
                              <ChevronDown size={12} />
                            </button>

                            {activeRoleDropdown === user.id && (
                              <div
                                data-dropdown
                                className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-stroke bg-white py-1 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
                              >
                                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                  <button
                                    key={key}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateUserRole(user.id, key as UserRole);
                                    }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${
                                      user.role === key ? "bg-gray-50 dark:bg-dark-2" : ""
                                    }`}
                                  >
                                    <config.icon size={14} className={config.color} />
                                    <span className={config.color}>{config.label}</span>
                                    {user.role === key && <Check size={14} className="ml-auto" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
                            <roleConfig.icon size={12} />
                            {roleConfig.label}
                          </span>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <ShoppingBag size={14} />
                          {user._count.orders}
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {isSuperAdmin && !isCurrentUser && user.role !== "SUPER_ADMIN" && (
                            <button
                              onClick={() => deleteUser(user.id, user.name || user.email || "")}
                              className="rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-dark">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark dark:text-white">Yeni Admin Oluştur</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-500">Ad Soyad</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  placeholder="Admin Adı"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-500">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  placeholder="admin@fusionmarkt.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-500">Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                    placeholder="En az 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-500">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Süper Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {creating && <RefreshCw size={16} className="animate-spin" />}
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
