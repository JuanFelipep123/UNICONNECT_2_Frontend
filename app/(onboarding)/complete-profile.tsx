import React from 'react';
import { EditProfileScreen } from '../../src/features/profile/screens/EditProfileScreen';

/**
 * Pantalla para completar registro (primer acceso)
 * Se muestra después del login si needsCompleteProfile es true
 */
export default function CompleteProfileScreen() {
  return <EditProfileScreen isOnboarding />;
}
