import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';

const ProtectedRoute = ({ children }) => {
  const { session, authLoading } = useCrm();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium text-sm animate-pulse">Initializing AXiM Nexus...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
