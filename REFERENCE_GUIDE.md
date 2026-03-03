# Guía de Referencia Rápida - Nuevas Abstracciones

## 1. Usar Temas Centralizados

### Antes (❌ Evitar)
```tsx
const colors = {
  background: '#F8F9FA',
  primary: '#00284D',
};

export const MyComponent = () => {
  return <View style={{ backgroundColor: colors.background }} />;
};
```

### Ahora (✅ Usar)
```tsx
import { LIGHT_THEME } from '@/theme/themeContext';

export const MyComponent = () => {
  const colors = LIGHT_THEME;
  return <View style={{ backgroundColor: colors.background }} />;
};
```

---

## 2. Manejar Errores de Forma Unificada

### Antes (❌ Evitar)
```tsx
try {
  await fetchData();
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', error.message);
}
```

### Ahora (✅ Usar)
```tsx
import { parseError, getErrorMessage } from '@/utils/errorHandler';

try {
  await fetchData();
} catch (error) {
  const appError = parseError(error);
  const message = getErrorMessage(appError);
  Alert.alert('Error', message);
}
```

---

## 3. Guardar Perfil

### Usar Hook personalizado
```tsx
import { useProfileSave } from '@/features/profile/hooks/useProfileSave';

export const EditProfileScreen = () => {
  const { saving, error, saveProfile, clearError } = useProfileSave();

  const handleSave = async () => {
    const success = await saveProfile(profile);
    if (success) {
      Alert.alert('¡Éxito!', 'Perfil actualizado');
    }
  };

  return (
    <>
      <SaveButton onPress={handleSave} loading={saving} />
      {error && <Text>{error}</Text>}
    </>
  );
};
```

---

## 4. Cargar Perfil

### Usar Hook personalizado
```tsx
import { useProfileLoad } from '@/features/profile/hooks/useProfileLoad';
import { useFocusEffect } from 'expo-router';

export const ProfileScreen = () => {
  const { profile, loading, error, loadProfile } = useProfileLoad();

  // Recargar cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return <DisplayProfile profile={profile} />;
};
```

---

## 5. Memoizar Componentes

### Para evitar re-renders innecesarios
```tsx
import { memo } from 'react';

// Antes
export const MyComponent = ({ title, onPress }) => {
  return <Button onPress={onPress}>{title}</Button>;
};

// Ahora
export const MyComponent = memo(({ title, onPress }) => {
  return <Button onPress={onPress}>{title}</Button>;
});
```

---

## 6. Callbacks Optimizados

### Usar useCallback para handlers
```tsx
import { useCallback } from 'react';

export const MyComponent = ({ onChange }) => {
  // Memoizar para que no se recree en cada render
  const handleChange = useCallback((value) => {
    onChange(value);
  }, [onChange]);

  return <TextInput onChangeText={handleChange} />;
};
```

---

## 7. Datos Memoizados

### Evitar recomputación
```tsx
import { useMemo } from 'react';

export const EditProfileScreen = ({ params }) => {
  // Solo se recomputa si params.initialData?.id cambia
  const initialData = useMemo(() => {
    return params.initialData 
      ? JSON.parse(params.initialData) 
      : undefined;
  }, [params.initialData?.id]);

  return <EditForm initialData={initialData} />;
};
```

---

## 8. Estructura de Servicios HTTP

### Agregar nuevo servicio HTTP
```typescript
// src/services/userHttpService.ts
import { AppResponse, parseError } from '@/utils/errorHandler';

export const userHttpService = {
  async getUser(id: string, token: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: parseError(error).message };
    }
  },
};
```

---

## 9. Crear Nuevo Hook Personalizado

### Patrón de Hook reutilizable
```typescript
// src/features/myFeature/hooks/useMyLogic.ts
import { useCallback, useState, useEffect } from 'react';

interface UseMyLogicReturn {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyLogic = (): UseMyLogicReturn => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      // Tu lógica aquí
      setData({});
    } catch (err) {
      setError('Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};
```

---

## 10. Errores Comunes a Evitar

### ❌ No hacer esto
```tsx
// God Component - todo en un lugar
export const ProfileScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const load = async () => {
    // lógica HTTP
    // parsing
    // validación
    // actualización UI
  };
  
  const save = async () => {
    // más lógica...
  };
  
  return <ComplexUI />;
};
```

### ✅ Hacer esto
```tsx
// Separar en hooks
const { data, loading, loadData } = useMyDataLoad();
const { saving, saveData } = useMyDataSave();

export const ProfileScreen = () => {
  return (
    <UI 
      data={data} 
      onLoad={loadData}
      onSave={saveData}
    />
  );
};
```

---

## 11. Tipos Disponibles

### ErrorHandler
```typescript
import { ErrorType, AppError } from '@/utils/errorHandler';

type ErrorType = 
  | 'NETWORK'
  | 'VALIDATION'
  | 'AUTHENTICATION'
  | 'SERVER'
  | 'UNKNOWN';

interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
}
```

### Theme
```typescript
import { ThemeColors } from '@/theme/themeContext';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  label: string;
  border: string;
  primary: string;
  gold: string;
  error: string;
}
```

---

## Checklist para Agregar Nueva Funcionalidad

- [ ] ¿La lógica está en un hook, no en el componente?
- [ ] ¿He usado `useCallback` para handlers?
- [ ] ¿He usado `useMemo` para datos costosos?
- [ ] ¿Está memoizado el componente si no necesita re-renders?
- [ ] ¿He centralizado el manejo de errores?
- [ ] ¿Estoy usando temas centralizados?
- [ ] ¿He testeado performance con React DevTools?
- [ ] ¿Hay código comentado que eliminar?

---

## Recursos Útiles

- [React Hooks Documentation](https://react.dev/reference/react)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [TypeScript en React Native](https://www.typescriptlang.org/docs/handbook/react.html)
