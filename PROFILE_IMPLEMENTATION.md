# Guía de Implementación - Módulo de Perfil

## 📋 Resumen

Se ha creado un módulo completo de edición de perfil en React Native que puede ser usado tanto para:
- **Primer completado**: Cuando el usuario se registra por primera vez
- **Edición de perfil**: Cuando el usuario ya estaba registrado

## 📁 Estructura de Archivos Creados

```
src/features/profile/
├── screens/
│   └── EditProfileScreen.tsx      # Componente principal reutilizable
├── components/
│   ├── ProfileHeader.tsx          # Avatar con editor de foto
│   ├── AcademicInfoSection.tsx    # Selects de carrera y semestre
│   ├── SubjectsSection.tsx        # Gestor de materias
│   └── SaveButton.tsx             # Botón de guardar
├── hooks/
│   └── useProfileForm.ts          # Lógica de formulario
└── types/
    └── profile.ts                 # Tipos TypeScript

src/store/
└── authStore.ts                   # Estado global (bandera needsCompleteProfile)

src/services/
└── profileService.ts              # Llamadas API

app/(onboarding)/
├── _layout.tsx                    # Layout del onboarding
└── complete-profile.tsx           # Pantalla de primer completado

app/profile/
├── _layout.tsx                    # Layout de perfil
└── edit.tsx                       # Pantalla de edición
```

## 🚀 Cómo Usar

### 1. Para el Primer Completado (Onboarding)

```typescript
// app/(onboarding)/complete-profile.tsx ya está configurado
// Solo asegúrate de redirigir aquí después del login:

import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

// En tu pantalla de login, después de autenticar:
const { setNeedsCompleteProfile } = useAuthStore();
setNeedsCompleteProfile(true);
router.push('/(onboarding)/complete-profile');
```

### 2. Para Editar Perfil (Usuario Registrado)

```typescript
// Desde cualquier pantalla, navega a:
import { router } from 'expo-router';

router.push('/profile/edit');
```

### 3. Probar en Desarrollo (Con Bandera)

Para probar sin necesidad de login, la pantalla ya tiene una bandera:

```typescript
// app/(onboarding)/complete-profile.tsx
useEffect(() => {
  // Descomenta para probar automáticamente:
  setNeedsCompleteProfile(true);
}, []);
```

## 🔧 Integración con API Real

### 1. Configurar el Service

En `src/services/profileService.ts`:

```typescript
const API_BASE_URL = 'https://tu-api-real.com';

// Agregar token de autenticación:
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

### 2. Pasar Datos Iniciales

Si el usuario ya tiene perfil guardado, pasa los datos al hook:

```typescript
const { profile, ...rest } = useProfileForm({
  career: 'ingenieria-sistemas',
  semester: 5,
  subjects: [
    { id: '1', name: 'Cálculo' },
    { id: '2', name: 'Física' }
  ]
});
```

## 📱 Características Implementadas

✅ Avatar editable con cámara
✅ Selects para carrera y semestre
✅ Gestión de materias (agregar/eliminar)
✅ Dark mode automático
✅ Validación básica
✅ Carga de API
✅ Manejo de errores
✅ Modal para agregar materia
✅ Mismo formulario para onboarding y edición

## 🎨 Colores y Estilos

Ya están integrados todos los colores de tu diseño:
- **Primary**: `#00284D` (Azul oscuro)
- **Gold**: `#C5A059` (Dorado)
- **Light Background**: `#F8F9FA`
- **Dark Background**: `#0F172A`

Los estilos se adaptan automáticamente al dark mode del dispositivo.

## 🔗 Flujo Recomendado (Con el Dev del Login)

1. **Usuario se registra** (Pantalla de login)
2. **Credenciales válidas** → Establecer `needsCompleteProfile = true`
3. **Redirigir** a `/(onboarding)/complete-profile`
4. **Usuario completa perfil** → Llamada API exitosa
5. **Marca como completado** → `markProfileAsComplete()`
6. **Redirige** a `/(tabs)` (Home)

## ⚙️ Dependencias Necesarias

Las siguientes ya deberían estar instaladas:
- `expo-router` - Navegación
- `expo-image-picker` - Para cambiar avatar
- `@react-native-material/icons` - Iconos

Si no están, instala con:
```bash
npx expo install expo-image-picker
```

## 🧪 Testing

Para probar cada parte:

### Avatar
- Tap en el botón cámara
- Seleccionar imagen de la galería

### Materias
- Tap en "Añadir"
- Ingresa nombre de materia
- Tap "Agregar"
- Desliza horizontalmente para ver más
- Tap X para eliminar

### Guardar
- Completa carrera y semestre
- Tap "Guardar Perfil"

## 📝 Notas Importantes

1. **Store Global**: `useAuthStore` mantiene la bandera `needsCompleteProfile`
2. **Reutilizable**: `EditProfileScreen` se usa en ambas rutas con `isOnboarding` prop
3. **API Mock**: `profileService` está lista para conectar con tu backend
4. **Validación**: Carrera y semestre son obligatorios
5. **Materias**: Opcionales, puedes agregar después

## 🆘 Próximos Pasos

1. Conectar con el dev del login para integrar `setNeedsCompleteProfile`
2. Reemplazar `API_BASE_URL` con tu servidor real
3. Agregar token de autenticación en headers
4. Probar flujo completo
5. Agregar tests unitarios si es necesario
