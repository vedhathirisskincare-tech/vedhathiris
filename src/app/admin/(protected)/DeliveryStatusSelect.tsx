'use client'

import { useState } from 'react'
import { updateDeliveryStatus } from './actions'

export function DeliveryStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus || 'Processing')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdating(true)
    try {
      await updateDeliveryStatus(orderId, newStatus)
    } catch (err) {
      console.error(err)
      alert('Failed to update delivery status')
      setStatus(initialStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isUpdating}
      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500 bg-white px-2 py-1 disabled:opacity-50"
    >
      <option value="Processing">Processing</option>
      <option value="Packed">Packed</option>
      <option value="Arriving in next days">Arriving in next days</option>
      <option value="Delivered">Delivered</option>
    </select>
  )
}
