import { User } from '@src/models/User';
import 'supertest';

declare module 'supertest' {
  export interface Response {
    headers: Record<string, string[]>;
    body: {
      error: string;
      users: User[];
    };
  }
}
