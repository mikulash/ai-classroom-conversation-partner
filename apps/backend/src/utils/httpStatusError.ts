export class HttpStatusError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'HttpStatusError';
  }
}
