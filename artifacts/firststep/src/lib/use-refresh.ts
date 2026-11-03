import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetApplicationQueryKey,
  getGetDashboardQueryKey,
  getGetProfileQueryKey,
  getListApplicationsQueryKey,
  getListInterviewsQueryKey,
} from '@workspace/api-client-react';

export function useRefresh() {
  const qc = useQueryClient();
  return useCallback((opts?: { applicationId?: string; profile?: boolean }) => {
    qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    qc.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
    if (opts?.applicationId) qc.invalidateQueries({ queryKey: getGetApplicationQueryKey(opts.applicationId) });
    if (opts?.profile) qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
  }, [qc]);
}
