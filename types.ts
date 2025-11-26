
export interface Transcript {
  speaker: 'user' | 'model';
  text: string;
}

export interface User {
  name: string;
  surname: string;
  subject: string;
}
