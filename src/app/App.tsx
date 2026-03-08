import { RouterProvider } from 'react-router';
import { router } from './routes';
import { NotesProvider } from './context/NotesContext';

export default function App() {
  return (
    <NotesProvider>
      <RouterProvider router={router} />
    </NotesProvider>
  );
}
