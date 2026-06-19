'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser } from '../actions'
import { useToast } from '@/components/Toast'

type User = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string
  created_at: string
}

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users] = useState<User[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

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
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Users</h1>
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
