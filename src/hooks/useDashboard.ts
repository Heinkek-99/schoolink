import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });
}

export function useFamillesImpayes() {
  return useQuery({
    queryKey: ['dashboard', 'top-impayes'],
    queryFn: dashboardApi.getTopImpayes,
  });
}
