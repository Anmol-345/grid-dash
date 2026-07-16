// Time utility
export default class Time {
  start: number;
  constructor() {
    this.start = performance.now();
  }
  getElapsed(): number {
    return performance.now() - this.start;
  }
}
