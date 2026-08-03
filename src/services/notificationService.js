import { toast } from 'react-toastify';

export const notificationService = {
  notifySuccess: (message) => toast.success(message),
  notifyError: (message) => toast.error(message),
  notifyWarning: (message) => toast.warn(message),
  notifyInfo: (message) => toast.info(message),
};
