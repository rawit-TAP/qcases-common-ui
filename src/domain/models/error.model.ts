export class CustomError extends Error {
  constructor(public code: string, public message: string) {
    super();
  }
}
