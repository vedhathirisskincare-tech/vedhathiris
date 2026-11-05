'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser, toggleVisitorPopupSetting } from '../actions'
import { useToast } from '@/components/Toast'
import { Sparkles } from 'lucide-react'

type User = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string
  created_at: string
}

export function UsersClient({
  initialUsers: users,
  initialPopupEnabled = false,
}: {
  initialUsers: User[]
  initialPopupEnabled?: boolean
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [popupEnabled, setPopupEnabled] = useState(initialPopupEnabled)
  const [isUpdatingPopup, setIsUpdatingPopup] = useState(false)
  const toast = useToast()

  const handleTogglePopup = async () => {
    const nextState = !popupEnabled
    setPopupEnabled(nextState)
    setIsUpdatingPopup(true)
    try {
      await toggleVisitorPopupSetting(nextState)
      toast.success(nextState ? 'Visitor login popup turned ON (appears in 3s)' : 'Visitor login popup turned OFF (hidden)')
    } catch (err: any) {
      setPopupEnabled(!nextState)
      toast.error(err.message || 'Failed to update popup setting')
    } finally {
      setIsUpdatingPopup(false)
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user profile?')) {
      try {
        await deleteUser(id)
        toast.success('User deleted successfully')
      } catch (error: any) {
        toast.error(`Failed to delete user: ${error.message || error}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const role = formData.get('role')?.toString() || 'user'
    try {
      await updateUserRole(editingUser.id, role)
      toast.success('User role updated successfully')
      setIsModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(`Failed to save user role: ${error.message || error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage registered customer profiles, administrative roles, and visitor popup behavior.
          </p>
        </div>
      </div>

      {/* Visitor Welcome / Login Popup Control Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Visitor Login / Registration Popup
              </h2>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                popupEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {popupEnabled ? '🟢 ON (Appears in 3s)' : '⚪ OFF (Hidden)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              Dynamically control whether visitors see the login popup 3 seconds after opening the website. Turning it OFF hides the popup completely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            {popupEnabled ? 'Popup Active' : 'Popup Hidden'}
          </span>
          <button
            type="button"
            onClick={handleTogglePopup}
            disabled={isUpdatingPopup}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              popupEnabled ? 'bg-violet-600' : 'bg-gray-300'
            } ${isUpdatingPopup ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={popupEnabled ? 'Click to Turn OFF (Hide Popup)' : 'Click to Turn ON (Show in 3s)'}
            aria-label="Toggle visitor popup on or off"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                popupEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">ID</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Name</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Email</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Mobile</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Role</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Joined</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{user.id.slice(0,8)}...</td>
                <td className="px-4 md:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.full_name || 'N/A'}</td>
                <td className="px-4 md:px-6 py-4 text-gray-500 whitespace-nowrap">{user.email}</td>
                <td className="px-4 md:px-6 py-4 text-gray-500 whitespace-nowrap">{user.phone || 'N/A'}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap" suppressHydrationWarning={true}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => openEditModal(user)} className="text-violet-600 hover:text-violet-800 font-medium text-sm mr-4">Edit Role</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit User Role</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editingUser.full_name || ''} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="text" value={editingUser.email} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" defaultValue={editingUser.role || 'user'} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-colors disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
