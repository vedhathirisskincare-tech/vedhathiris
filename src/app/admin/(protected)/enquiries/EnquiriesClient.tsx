'use client'

import { useState } from 'react'
import { deleteEnquiry } from '../actions'
import { Mail, Trash2, Eye, X, Calendar, User, Phone } from 'lucide-react'
import { useToast } from '@/components/Toast'

type Enquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  created_at: string
}

export function EnquiriesClient({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const toast = useToast()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact enquiry?')) {
      try {
        await deleteEnquiry(id)
        toast.success('Enquiry deleted successfully')
        setEnquiries(enquiries.filter((e) => e.id !== id))
        if (selectedEnquiry?.id === id) {
          setIsModalOpen(false)
        }
      } catch (err: any) {
        toast.error(`Failed to delete enquiry: ${err.message || err}`)
      }
    }
  }

  const openDetailsModal = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setIsModalOpen(true)
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">User Enquiries</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Date</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Name</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Email</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Phone</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Message Preview</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap" suppressHydrationWarning={true}>
                  {new Date(enquiry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 md:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{enquiry.name}</td>
                <td className="px-4 md:px-6 py-4 text-gray-600 whitespace-nowrap">
                  <a href={`mailto:${enquiry.email}`} className="hover:text-violet-600 transition-colors">{enquiry.email}</a>
                </td>
                <td className="px-4 md:px-6 py-4 text-gray-500 whitespace-nowrap">{enquiry.phone || 'N/A'}</td>
                <td className="px-4 md:px-6 py-4 text-gray-500 truncate max-w-xs whitespace-nowrap" title={enquiry.message}>
                  {enquiry.message}
                </td>
                <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                  <button 
                    onClick={() => openDetailsModal(enquiry)} 
                    className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1.5 mr-2"
                    title="View Message"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(enquiry.id)} 
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-white">
                  <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No enquiries found</p>
                  <p className="text-sm text-gray-400 mt-1">When users submit contact form enquiries, they will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enquiry Details Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1" suppressHydrationWarning={true}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted on {new Date(selectedEnquiry.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="bg-violet-50/50 rounded-2xl p-4 border border-violet-100/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedEnquiry.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-sm font-semibold text-violet-600 hover:underline">{selectedEnquiry.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2 border-t border-violet-100/40 pt-3 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedEnquiry.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message Body</span>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-gray-700 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors text-sm inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              
              <div className="flex gap-2">
                <a 
                  href={`mailto:${selectedEnquiry.email}`}
                  className="px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 rounded-xl font-medium transition-colors text-sm inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply Email
                </a>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
