export class UpstreamLeadError extends Error {
  readonly status: number;
  readonly upstream5xx: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'UpstreamLeadError';
    this.status = status;
    this.upstream5xx = status >= 500;
  }
}

export function isUpstreamLeadError(error: unknown): error is UpstreamLeadError {
  return error instanceof UpstreamLeadError;
}
