interface SessionStore {
  findSession: (id: string) => any;
  saveSession: (id: string, session: string) => void;
  findAllSessions: () => any[];
}

class InMemorySessionStore implements SessionStore {
  constructor(private sessions: Map<any, any> = new Map()) {}

  public findSession(id) {
    return this.sessions.get(id);
  }

  public saveSession(id, session) {
    this.sessions.set(id, session);
  }

  public findAllSessions() {
    return [...this.sessions.values()];
  }
}

export { InMemorySessionStore };
