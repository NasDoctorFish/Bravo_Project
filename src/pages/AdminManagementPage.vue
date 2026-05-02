<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">🤝</span>
        <span class="brand-name">FundBridge</span>
      </div>
      <nav class="nav">
        <a v-for="item in navItems" :key="item.label"
          :class="['nav-item', { active: item.label === 'Admin' }]" href="#">
          <span>{{ item.icon }}</span> {{ item.label }}
        </a>
      </nav>
      <div class="sidebar-badge">User Admin</div>
    </aside>

    <main class="main">
      <div class="page-header">
        <div>
          <h2>Admin Management</h2>
          <p class="subtitle">Manage platform users and roles</p>
        </div>
        <button class="btn-primary" @click="showCreateModal = true">+ Invite User</button>
      </div>

      <!-- Search & Filters -->
      <div class="toolbar">
        <div class="search-wrap">
          <span>🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Search by name, email, or role…" />
        </div>
        <select v-model="filterRole">
          <option value="">All Roles</option>
          <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filterStatus">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleAll" /></th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td><input type="checkbox" v-model="selected" :value="user.id" /></td>
              <td>
                <div class="user-cell">
                  <div class="avatar" :style="{ background: user.color }">{{ user.initials }}</div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td><span class="role-tag">{{ user.role }}</span></td>
              <td><span :class="['status-badge', user.status]">{{ user.status }}</span></td>
              <td class="td-muted">{{ user.joined }}</td>
              <td class="td-muted">{{ user.lastActive }}</td>
              <td>
                <div class="actions">
                  <button class="action-btn" title="Edit" @click="editUser(user)">✏️</button>
                  <button class="action-btn" title="Suspend" @click="toggleSuspend(user)">
                    {{ user.status === 'suspended' ? '▶️' : '⏸️' }}
                  </button>
                  <button class="action-btn danger" title="Delete" @click="confirmDelete(user)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="empty-row">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk actions -->
      <div class="bulk-actions" v-if="selected.length > 0">
        <span>{{ selected.length }} selected</span>
        <button class="btn-bulk" @click="selected = []">Deselect</button>
        <button class="btn-bulk danger">Suspend Selected</button>
        <button class="btn-bulk danger">Delete Selected</button>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingUser ? 'Edit User' : 'Invite New User' }}</h3>
            <button class="modal-close" @click="showCreateModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Full Name</label>
              <input v-model="modalForm.name" type="text" placeholder="Jane Doe" />
            </div>
            <div class="field">
              <label>Email</label>
              <input v-model="modalForm.email" type="email" placeholder="jane@example.com" />
            </div>
            <div class="field">
              <label>Role</label>
              <select v-model="modalForm.role">
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showCreateModal = false">Cancel</button>
            <button class="btn-primary" @click="saveUser">
              {{ editingUser ? 'Save Changes' : 'Send Invite' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const selected = ref([])
const showCreateModal = ref(false)
const editingUser = ref(null)
const modalForm = ref({ name: '', email: '', role: 'Fund Raiser' })

const roles = ['User Admin', 'Platform Manager', 'Fund Raiser', 'Donee']

const navItems = [
  { icon: '🏠', label: 'Dashboard' }, { icon: '📋', label: 'Campaigns' },
  { icon: '🔍', label: 'Search' }, { icon: '📊', label: 'Reports' },
  { icon: '👥', label: 'Admin' }, { icon: '⚙️', label: 'Settings' },
]

const users = ref([
  { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'Fund Raiser', status: 'active', joined: 'Jan 2026', lastActive: '2 mins ago', initials: 'JD', color: '#2d6a4f' },
  { id: 2, name: 'Mark Tan', email: 'mark@example.com', role: 'Donee', status: 'active', joined: 'Feb 2026', lastActive: '1 hour ago', initials: 'MT', color: '#2b6cb0' },
  { id: 3, name: 'Sarah Lim', email: 'sarah@example.com', role: 'User Admin', status: 'active', joined: 'Mar 2026', lastActive: 'Yesterday', initials: 'SL', color: '#b7791f' },
  { id: 4, name: 'David Koh', email: 'david@example.com', role: 'Fund Raiser', status: 'suspended', joined: 'Dec 2025', lastActive: '2 weeks ago', initials: 'DK', color: '#c53030' },
  { id: 5, name: 'Amy Chen', email: 'amy@example.com', role: 'Platform Manager', status: 'pending', joined: 'Apr 2026', lastActive: 'Never', initials: 'AC', color: '#6b46c1' },
])

const filteredUsers = computed(() => users.value.filter(u => {
  const q = searchQuery.value.toLowerCase()
  const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  const matchRole = !filterRole.value || u.role === filterRole.value
  const matchStatus = !filterStatus.value || u.status === filterStatus.value
  return matchSearch && matchRole && matchStatus
}))

function toggleAll(e) { selected.value = e.target.checked ? users.value.map(u => u.id) : [] }

function editUser(user) {
  editingUser.value = user
  modalForm.value = { name: user.name, email: user.email, role: user.role }
  showCreateModal.value = true
}

function saveUser() {
  if (editingUser.value) {
    const u = users.value.find(u => u.id === editingUser.value.id)
    if (u) { u.name = modalForm.value.name; u.email = modalForm.value.email; u.role = modalForm.value.role }
  }
  showCreateModal.value = false
  editingUser.value = null
  modalForm.value = { name: '', email: '', role: 'Fund Raiser' }
}

function toggleSuspend(user) {
  user.status = user.status === 'suspended' ? 'active' : 'suspended'
}

function confirmDelete(user) {
  if (confirm(`Delete ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@700&display=swap');
* { box-sizing: border-box; }
.layout { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
.sidebar { width: 220px; background: #fff; border-right: 1px solid #e2e0db; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid #f0ede8; }
.logo { font-size: 1.4rem; } .brand-name { font-family: 'Fraunces', serif; font-size: 1.1rem; color: #1a1a1a; }
.nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.88rem; color: #555; font-weight: 500; transition: background 0.15s; }
.nav-item:hover { background: #f5f4f0; } .nav-item.active { background: #e8f5ee; color: #2d6a4f; font-weight: 600; }
.sidebar-badge { margin: 0 20px 16px; background: #fffbeb; border: 1px solid #f6e05e; border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; font-weight: 700; color: #b7791f; text-align: center; letter-spacing: 0.04em; }

.main { margin-left: 220px; flex: 1; padding: 32px 36px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; color: #1a1a1a; }
.subtitle { font-size: 0.85rem; color: #888; margin-top: 2px; }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
.search-wrap { display: flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 14px; flex: 1; min-width: 200px; }
.search-wrap:focus-within { border-color: #2d6a4f; }
.search-wrap input { border: none; background: transparent; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1a1a1a; width: 100%; }
.search-wrap input:focus { outline: none; }
.toolbar select { border: 1.5px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; background: #fff; color: #333; }
.toolbar select:focus { outline: none; border-color: #2d6a4f; }

.table-wrap { background: #fff; border: 1px solid #e2e0db; border-radius: 12px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
.table th { text-align: left; padding: 12px 14px; font-size: 0.72rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; background: #fafaf9; border-bottom: 1px solid #e2e0db; }
.table td { padding: 12px 14px; border-bottom: 1px solid #f0ede8; vertical-align: middle; }
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: #fafaf9; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
.user-name { font-weight: 600; color: #1a1a1a; font-size: 0.88rem; }
.user-email { font-size: 0.78rem; color: #aaa; }

.role-tag { background: #f5f4f0; border: 1px solid #e2e0db; border-radius: 6px; padding: 3px 9px; font-size: 0.75rem; font-weight: 600; color: #555; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
.status-badge.active { background: #e8f5ee; color: #2d6a4f; }
.status-badge.suspended { background: #fff5f5; color: #c53030; }
.status-badge.pending { background: #fffbeb; color: #b7791f; }

.td-muted { color: #aaa; font-size: 0.82rem; }

.actions { display: flex; gap: 4px; }
.action-btn { background: none; border: 1px solid #eee; border-radius: 6px; padding: 5px 8px; cursor: pointer; font-size: 0.85rem; transition: border-color 0.15s, background 0.15s; }
.action-btn:hover { border-color: #ddd; background: #f5f5f5; }
.action-btn.danger:hover { border-color: #fed7d7; background: #fff5f5; }

.empty-row { text-align: center; padding: 32px; color: #aaa; font-size: 0.88rem; }

.bulk-actions { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 12px 16px; background: #fff; border: 1px solid #e2e0db; border-radius: 8px; font-size: 0.85rem; flex-wrap: wrap; }
.bulk-actions span { color: #555; font-weight: 500; }
.btn-bulk { border: 1px solid #ddd; background: #fff; border-radius: 6px; padding: 6px 14px; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.btn-bulk:hover { border-color: #aaa; }
.btn-bulk.danger { border-color: #fed7d7; color: #c53030; }
.btn-bulk.danger:hover { background: #fff5f5; }

.btn-primary { background: #2d6a4f; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 0.88rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #1f4d38; }
.btn-secondary { background: #fff; color: #333; border: 1.5px solid #ddd; border-radius: 8px; padding: 9px 16px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 100%; max-width: 440px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0ede8; }
.modal-header h3 { font-size: 1rem; font-weight: 700; color: #1a1a1a; }
.modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: #aaa; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.82rem; font-weight: 600; color: #555; }
.field input, .field select { border: 1.5px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; background: #fafaf9; }
.field input:focus, .field select:focus { outline: none; border-color: #2d6a4f; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f0ede8; }
</style>
