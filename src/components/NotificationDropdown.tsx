'use client';

import { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes as FaTimesIcon } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface DeleteRequest {
  _id: string;
  type: 'customer' | 'party' | 'transaction' | 'fee' | 'expense' | 'package';
  identifier: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  context?: {
    partyName?: string;
    passportNumber?: string;
    amount?: number;
    type?: string;
    date?: string;
    description?: string;
    visaType?: string;
    title?: string;
    category?: string;
    name?: string;
    price?: number;
  };
}

interface NotificationDropdownProps {
  userRole: string | undefined;
  notifications: DeleteRequest[];
  setNotifications: React.Dispatch<React.SetStateAction<DeleteRequest[]>>;
}

export default function NotificationDropdown({ userRole, notifications, setNotifications }: NotificationDropdownProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApproveDeny = async (requestId: string, action: 'approve' | 'deny') => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      const res = await fetch('/api/delete-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, requestId }),
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        setNotifications((prev) => prev.filter((req) => req._id !== requestId));
        toast.success(`Delete request ${action}d successfully.`, {
          style: {
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #16a34a',
          },
        });
      } else {
        toast.error(result.message || `Failed to ${action} delete request.`, {
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #dc2626',
          },
        });
      }
    } catch (err) {
      console.error(`Error ${action}ing delete request:`, err);
      toast.error(`Failed to ${action} delete request.`, {
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #dc2626',
        },
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'Customer';
      case 'party':
        return 'Party';
      case 'transaction':
        return 'Transaction';
      case 'fee':
        return 'Visa Fee';
      case 'expense':
        return 'Expense';
      case 'package':
        return 'Package';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getDisplayText = (notification: DeleteRequest) => {
    const { type, identifier, context } = notification;
    
    if (context) {
      switch (type) {
        case 'transaction':
          if (context.description) {
            return context.description;
          }
          return `${context.partyName || 'Unknown'} - ${context.type || 'Transaction'} ₨${context.amount || 0}`;
        
        case 'fee':
          return context.description || `${context.visaType || 'Visa'} fee - ₨${context.amount || 0}`;
        
        case 'expense':
          return context.description || `${context.title || 'Expense'} - ₨${context.amount || 0}`;
        
        case 'package':
          return context.description || `${context.name || 'Package'} - ₨${context.price || 0}`;
        
        default:
          return identifier;
      }
    }
    
    // Fallback to identifier if no context
    return identifier;
  };

  const getSubtitle = (notification: DeleteRequest) => {
    const { type, context } = notification;
    
    if (!context) return null;
    
    switch (type) {
      case 'transaction':
        return context.passportNumber ? `Passport: ${context.passportNumber}` : null;
      
      case 'expense':
        return context.category || null;
      
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors w-full text-left relative"
      >
        <FaBell className="text-xl" />
        {notifications.length > 0 && (
          <span className="absolute left-8 top-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
        <span>Notifications</span>
      </button>

      {showNotifications && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Requests</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No pending requests
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="mb-2">
                    <p className="text-sm text-gray-800 font-medium">
                      {notification.requestedBy}
                    </p>
                    <p className="text-xs text-gray-600">
                      wants to delete {getItemTypeLabel(notification.type)}:
                    </p>
                    <p className="text-xs text-gray-800 font-medium mt-1">
                      "{getDisplayText(notification)}"
                    </p>
                    {getSubtitle(notification) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getSubtitle(notification)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                        processingRequests.has(notification._id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      onClick={() => handleApproveDeny(notification._id, 'approve')}
                      disabled={processingRequests.has(notification._id)}
                    >
                      <FaCheck size={10} />
                      Approve
                    </button>
                    <button
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                        processingRequests.has(notification._id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                      onClick={() => handleApproveDeny(notification._id, 'deny')}
                      disabled={processingRequests.has(notification._id)}
                    >
                      <FaTimesIcon size={10} />
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}