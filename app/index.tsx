import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { token } = useAuthStore();

  // Si el usuario tiene sesión, lo mandamos directo a sus pestañas
  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  // Si no tiene sesión, lo mandamos al login
  return <Redirect href="/login" />;
}
