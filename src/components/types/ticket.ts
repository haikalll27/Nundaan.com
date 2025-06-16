export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'To Do' | 'In Process' | 'Done';
  createdAt: string;
}