<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['go-home', 'go-logout', 'go-search'])

const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const selected = ref([])
const showCreateModal = ref(false)
const editingUser = ref(null)
const modalForm = ref({ name: '', email: '', role: 'Fund Raiser' })

const roles = ['User Admin', 'Platform Manager', 'Fund Raiser', 'Donee']

const users = ref([
  { id: 1, name: 'Jane Doe',  email: 'jane@example.com',  role: 'Fund Raiser',      status: 'active',    joined: 'Jan 2026', lastActive: '2 mins ago',  initials: 'JD', color: '#2d6a4f' },
  { id: 2, name: 'Mark Tan',  email: 'mark@example.com',  role: 'Donee',            status: 'active',    joined: 'Feb 2026', lastActive: '1 hour ago',  initials: 'MT', color: '#2b6cb0' },
  { id: 3, name: 'Sarah Lim', email: 'sarah@example.com', role: 'User Admin',       status: 'active',    joined: 'Mar 2026', lastActive: 'Yesterday',   initials: 'SL', color: '#b7791f' },
  { id: 4, name: 'David Koh', email: 'david@example.com', role: 'Fund Raiser',      status: 'suspended', joined: 'Dec 2025', lastActive: '2 weeks ago', initials: 'DK', color: '#c53030' },
  { id: 5, name: 'Amy Chen',  email: 'amy@example.com',   role: 'Platform Manager', status: 'pending',   joined: 'Apr 2026', lastActive: 'Never',       initials: 'AC', color: '#6b46c1' },
])

const filteredUsers = computed(() => users.value.filter(u => {
  const q = searchQuery.value.toLowerCase()
  const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  const matchRole   = !filterRole.value   || u.role   === filterRole.value
  const matchStatus = !filterStatus.value || u.status === filterStatus.value
  return matchSearch && matchRole && matchStatus
}))

function toggleAll(e) {
  selected.value = e.target.checked ? users.value.map(u => u.id) : []
}

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

<template>
  <div class="admin-page">

    <!-- Header -->
    <header class="header">
      <a href="#" class="brand" @click.prevent="emit('go-home')">
        <span class="logo">♥</span>
        <span>FundRise</span>
      </a>
      <nav class="nav">
        <a href="#" class="nav-link" @click.prevent="emit('go-search')">⌕ Donate</a>
        <a href="#" class="nav-link">Fundraising</a>
      </nav>
      <nav class="nav-actions">
        <a href="#" class="nav-link" @click.prevent="emit('go-home')">Home</a>
        <a href="#" class="nav-link logout-link" @click.prevent="emit('go-logout')">
          <span class="logout-icon">⇢</span> Logout
        </a>
      </nav>
    </header>

    <div class="admin-container">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Management</h1>
          <p class="page-subtitle">Manage platform users and roles</p>
        </div>
        <button class="btn-invite" @click="showCreateModal = true">+ Invite User</button>
      </div>

      <!-- Toolbar -->
      <div class="dashboard-section toolbar-section">
        <div class="toolbar">
          <div class="search-pill">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, email, or role…"
              class="search-input"
            />
          </div>
          <select v-model="filterRole" class="filter-select">
            <option value="">All Roles</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
          <select v-model="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <section class="dashboard-section">
        <div class="table-wrap">
          <table class="table">
            <colgroup>
              <col style="width: 44px" />
              <col style="width: 26%" />
              <col style="width: 20%" />
              <col style="width: 12%" />
              <col style="width: 11%" />
              <col style="width: 13%" />
              <col style="width: 14%" />
            </colgroup>
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
                <td class="td-center"><input type="checkbox" v-model="selected" :value="user.id" /></td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar" :style="{ background: user.color }">
                      {{ user.initials }}
                    </div>
                    <div>
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="td-center"><span class="role-tag">{{ user.role }}</span></td>
                <td class="td-center"><span :class="['badge', 'badge-' + user.status]">{{ user.status }}</span></td>
                <td class="td-center td-muted">{{ user.joined }}</td>
                <td class="td-center td-muted">{{ user.lastActive }}</td>
                <td class="td-center">
                  <div class="actions">
                    <button class="action-btn" title="Edit" @click="editUser(user)">✏️</button>
                    <button class="action-btn" title="Suspend/Resume" @click="toggleSuspend(user)">
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

        <!-- Bulk Actions -->
        <div class="bulk-actions" v-if="selected.length > 0">
          <span class="bulk-count">{{ selected.length }} selected</span>
          <button class="btn-bulk" @click="selected = []">Deselect</button>
          <button class="btn-bulk danger">Suspend Selected</button>
          <button class="btn-bulk danger">Delete Selected</button>
        </div>
      </section>

    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingUser ? 'Edit User' : 'Invite New User' }}</h3>
          <button class="modal-close" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="modalForm.name" type="text" placeholder="Jane Doe" class="form-input" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="modalForm.email" type="email" placeholder="jane@example.com" class="form-input" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="modalForm.role" class="form-select">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCreateModal = false">Cancel</button>
          <button class="btn-invite" @click="saveUser">
            {{ editingUser ? 'Save Changes' : 'Send Invite' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 FundRise. Supporting dreams, one donation at a time.</p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.admin-container {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #111;
  text-align: left;
}

.page-subtitle {
  color: #666;
  margin: 0;
  text-align: left;
}

/* ── Invite Button ── */
.btn-invite {
  padding: 8px 16px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-invite:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* ── Section Card ── */
.dashboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* ── Toolbar ── */
.toolbar-section { padding: 16px 24px; }

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 12px;
  background: #fafbfc;
  transition: border-color 0.15s;
}
.search-pill:focus-within { border-color: #2563eb; background: #fff; }

.search-icon { font-size: 0.9rem; color: #9ca3af; flex-shrink: 0; }

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.88rem;
  color: #111;
  width: 100%;
  font-family: inherit;
}
.search-input::placeholder { color: #9ca3af; }

.filter-select {
  padding: 9px 32px 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafbfc;
  font-size: 0.88rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.15s;
}
.filter-select:focus { outline: none; border-color: #2563eb; background-color: #fff; }

/* ── Table ── */
.table-wrap { overflow-x: auto; }

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  table-layout: fixed;
}

.table thead tr { border-bottom: 1px solid #e5e7eb; }

.table th {
  text-align: center;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
}

.table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.12s;
}
.table tbody tr:last-child { border-bottom: none; }
.table tbody tr:hover { background: #f9fafb; }

.table td {
  padding: 12px;
  color: #374151;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-center { text-align: center; }
.td-muted  { color: #9ca3af; font-size: 0.82rem; }

/* ── User Cell ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.user-name  { font-weight: 600; color: #111; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { font-size: 0.78rem; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Role Tag ── */
.role-tag {
  display: inline-block;
  padding: 3px 10px;
  background: #f0f4ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  letter-spacing: 0.04em;
}
.badge-active    { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-suspended { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.badge-pending   { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }

/* ── Actions ── */
.actions {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.action-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.action-btn:hover { background: #f0f4ff; border-color: #bfdbfe; }
.action-btn.danger:hover { background: #fef2f2; border-color: #fecaca; }

/* ── Empty Row ── */
.empty-row {
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 40px 0;
}

/* ── Bulk Actions ── */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.bulk-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.btn-bulk {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: #374151;
  transition: all 0.15s;
}
.btn-bulk:hover { background: #f9fafb; }
.btn-bulk.danger { color: #dc2626; border-color: #fecaca; }
.btn-bulk.danger:hover { background: #fef2f2; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: #e5e7eb; }

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0;
}

/* ── Cancel Button ── */
.btn-cancel {
  padding: 8px 16px;
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { background: #f9fafb; border-color: #d1d5db; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .admin-container { padding: 20px 16px 40px; }
  .toolbar { flex-direction: column; }
  .search-pill { min-width: unset; width: 100%; }
  .filter-select { width: 100%; }
  .page-header { flex-wrap: wrap; }
}
</style>