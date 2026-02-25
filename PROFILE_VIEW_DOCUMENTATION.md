# Pantalla de Perfil - Documentación

## Descripción General

Se ha creado una nueva pantalla de perfil que muestra la información del usuario de forma estructurada y visualmente atractiva, similar al diseño en HTML que proporcionaste.

## 📁 Archivos Creados

### Nuevos Componentes
- **[ProfileViewScreen.tsx](src/features/profile/screens/ProfileViewScreen.tsx)** - Pantalla principal que muestra todo el perfil del usuario
- **[ProfileInfoItem.tsx](src/features/profile/components/ProfileInfoItem.tsx)** - Componente reutilizable para mostrar elementos de información (Programa, Semestre, Teléfono)
- **[SubjectsDisplay.tsx](src/features/profile/components/SubjectsDisplay.tsx)** - Componente para mostrar las materias actuales en forma de tags
- **[SectionHeader.tsx](src/features/profile/components/SectionHeader.tsx)** - Encabezado de sección reutilizable

### Archivos Modificados
- **[app/(tabs)/profile.tsx](app/(tabs)/profile.tsx)** - Ahora usa el nuevo componente ProfileViewScreen

## 🎨 Estructura de la Pantalla

```
┌─────────────────────────────┐
│      Header: Mi Perfil      │
├─────────────────────────────┤
│                             │
│     Avatar Circular         │
│     Laura Montoya           │
│  Universidad de Caldas      │
│                             │
├─────────────────────────────┤
│ 📚 Información Académica    │
│                             │
│ 🎓 Programa                 │
│    Ingeniería de Sistemas   │
│                             │
│ 📅 Semestre Actual          │
│    5º Semestre              │
├─────────────────────────────┤
│ 📞 Información de Contacto  │
│                             │
│ 📱 Teléfono                 │
│    +57 300 123 4567         │
├─────────────────────────────┤
│ 📖 Materias Actuales        │
│                             │
│ [Cálculo I] [Programación] │
│ [Matemática] [Sistemas]    │
├─────────────────────────────┤
│                             │
│ [✏️ EDITAR PERFIL]          │
│                             │
└─────────────────────────────┘
```

## 🔄 Cómo Integrar Datos del Backend

### Opción 1: Cargar al abrir la pantalla (Recomendado)

En `ProfileViewScreen.tsx`, descomenta y completa el `useEffect`:

```typescript
useEffect(() => {
  const loadProfileData = async () => {
    const response = await profileService.getProfile();
    if (response.success && response.data) {
      setProfile({
        ...response.data,
        name: 'Laura Montoya', // o response.data.name
        university: 'Universidad de Caldas',
      });
    }
  };
  loadProfileData();
}, []);
```

### Opción 2: Pasar datos como props

```typescript
<ProfileViewScreen
  profileData={{
    name: userData.name,
    university: userData.university,
    career: userData.career,
    semester: userData.semester,
    phone: userData.phone,
    avatar: userData.avatar,
    subjects: userData.subjects,
  }}
/>
```

### Opción 3: Usar State Global (Zustand)

Si tienes datos en tu store global:

```typescript
const { user } = useUserStore();
return <ProfileViewScreen profileData={user} />;
```

## 💾 Actualizar profileService.ts

Asegúrate de que `profileService.getProfile()` retorna la siguiente estructura:

```typescript
{
  success: true,
  data: {
    name: 'Laura Montoya',
    university: 'Universidad de Caldas',
    career: 'engineering',
    semester: 5,
    phone: '+57 300 123 4567',
    avatar: 'https://...',
    subjects: [
      { id: '1', name: 'Cálculo I' },
      { id: '2', name: 'Programación II' },
      // ...
    ]
  }
}
```

## 🎨 Paleta de Colores

Todos los componentes usan la paleta definida:

- **Primary**: `#00284D` (Azul oscuro)
- **Gold**: `#C5A059` (Dorado)
- **Background**: `#F8F9FA` (Gris claro)
- **Surface**: `#FFFFFF` (Blanco)
- **Text**: `#1E293B` (Gris oscuro)
- **Label**: `#64748B` (Gris medio)
- **Border**: `#E2E8F0` (Gris claro)

## 🔗 Relación con EditProfileScreen

- **ProfileViewScreen**: Mostrar información (lectura)
- **EditProfileScreen**: Editar información (escritura)

Ambas pantallas pueden compartir datos a través de:
- `profileService` (API)
- Store global (Zustand)
- Props cuando sea necesario

## 📝 Datos de Ejemplo (Mock)

Actualmente hay datos de ejemplo en `MOCK_PROFILE_DATA`. Estos se usan si no hay datos del backend.

Cuando integres con backend, reemplaza los datos del mock con los datos reales del API.

## 🚀 Flujo Completo

```
Usuario abre perfil
    ↓
ProfileViewScreen se renderiza
    ↓
useEffect intenta cargar datos del backend
    ↓
Si hay datos, actualiza el state
    ↓
Si falla, usa datos de ejemplo (MOCK)
    ↓
Pantalla se muestra con datos
    ↓
Usuario presiona "Editar Perfil"
    ↓
Navigate a EditProfileScreen
    ↓
User edita datos
    ↓
Guarda cambios en backend
    ↓
Vuelve a ProfileViewScreen y recarga datos
```

## ✅ Checklist para Integración

- [ ] Conectar `profileService.getProfile()` con tu backend
- [ ] Asegurar que la respuesta del backend tiene la estructura esperada
- [ ] Agregar autenticación/token si es necesario
- [ ] Probar carga de datos desde el backend
- [ ] Actualizar pantalla de edición si es necesario
- [ ] Agregar loading state si la carga tarda
- [ ] Agregar manejo de errores

## 🆘 Troubleshooting

### La pantalla no muestra datos
- Verifica que `MOCK_PROFILE_DATA` tiene datos
- Abre DevTools y revisa la consola para errores
- Comprueba que `profileService.getProfile()` retorna datos correctos

### Las secciones están vacías
- Asegúrate que los datos tienen la estructura correcta
- Usa el componente con datos de prueba primero

### El botón "Editar Perfil" no funciona
- Verifica que la ruta `/profile/edit` existe
- Comprueba que `EditProfileScreen` está correctamente exportado
