// Debouncers I wrote for a different project

class Debouncer {
  private timeout: number | undefined;

  constructor(private delay: number) {}

  public debounce(func: () => void) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(func, this.delay) as unknown as number;
  }
}

class EagerDebouncer {
  constructor(private delay: number) {}

  private sent = false;

  public debounce(func: () => void) {
    if (this.sent) {
      return;
    }

    this.sent = true;
    func();

    setTimeout(() => {
      this.sent = false;
    }, this.delay);
  }
}

export { Debouncer, EagerDebouncer };
