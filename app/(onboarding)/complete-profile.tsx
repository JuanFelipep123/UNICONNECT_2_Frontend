import React, { useEffect } from 'react';
import { EditProfileScreen } from '../../src/features/profile/screens/EditProfileScreen';
import { useAuthStore } from '../../src/store/authStore';

/**
 * Pantalla para completar registro (primer acceso)
 * Se muestra después del login si needsCompleteProfile es true
 */
export default function CompleteProfileScreen() {
  // TODO: Una vez que el dev del login integre el sistema,
  // reemplazar esta lógica con el valor real del store
  const { needsCompleteProfile, setNeedsCompleteProfile } = useAuthStore();

  // Por ahora, simulamos que el usuario necesita completar perfil
  useEffect(() => {
    // Descomenta la siguiente línea para probar:
    setNeedsCompleteProfile(true);
  }, []);

  return <EditProfileScreen isOnboarding />;
}
