import type { BackendConfig, DataTableState } from '../core/types'
import { buildQueryString } from '../core/qsp'

/** Emit state change for backend mode. Builds QSP and calls the user's callback. */
export function emitStateChange(config: BackendConfig, state: DataTableState): void {
  const qs = buildQueryString(state)
  config.onStateChange(qs, { ...state })
}
