import { eventsHttpService } from '@/src/features/events/services/eventsHttpService';
import type { EventCardSummary } from '@/src/features/events/types/events';
import { useAuthStore } from '@/src/store/authStore';
import { colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const formatDate = (dateValue: string): string => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTime = (timeValue: string): string => {
  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const eventFallbackImage = require('@/assets/images/logo-ucaldas.png');

const getEventImageSource = (imageUrl: string | null | undefined) => {
  const normalized = imageUrl?.trim();
  if (normalized) {
    return { uri: normalized };
  }

  return eventFallbackImage;
};

function EventCard({
  event,
  onPress,
}: {
  event: EventCardSummary;
  onPress: (eventId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Image
        source={getEventImageSource(event.image_url)}
        style={styles.cardImage}
        contentFit="cover"
        transition={120}
      />

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.cardFaculty}>{event.faculty || 'Facultad no disponible'}</Text>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {event.description || 'Sin descripción disponible.'}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.gold} />
          <Text style={styles.metaText}>{formatDate(event.event_date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.gold} />
          <Text style={styles.metaText}>{formatTime(event.event_time)}</Text>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => onPress(event.id)}
          accessibilityRole="button"
          accessibilityLabel={`Ver más del evento ${event.title}`}
        >
          <Text style={styles.moreButtonText}>Ver más</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [events, setEvents] = useState<EventCardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEvents = useMemo(() => events.length > 0, [events.length]);

  const loadEvents = useCallback(
    async (refresh = false) => {
      if (!token) {
        setEvents([]);
        setError('No se encontró sesión activa para consultar eventos.');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await eventsHttpService.getEvents(token, 20);

      if (response.success && response.data) {
        setEvents(response.data);
        setError(null);
      } else {
        setEvents([]);
        setError(response.error ?? 'No se pudieron cargar los eventos.');
      }

      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleOpenEvent = useCallback(
    (eventId: string) => {
      router.push(`/events/${eventId}`);
    },
    [router]
  );

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerStateText}>Cargando eventos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.centerStateText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadEvents(true)}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga de eventos"
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasEvents) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="calendar-clear-outline" size={36} color={colors.gold} />
        <Text style={styles.centerStateTitle}>No hay eventos por ahora</Text>
        <Text style={styles.centerStateText}>Cuando se publiquen eventos aparecerán aquí.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => loadEvents(true)} />
      }
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Eventos</Text>
          <Text style={styles.headerSubtitle}>Mantente al día con los eventos de UniConnect</Text>
        </View>
      }
      renderItem={({ item }) => <EventCard event={item} onPress={handleOpenEvent} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.backgroundLight,
  },
  headerContainer: {
    marginBottom: 14,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardImage: {
    height: 132,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardFaculty: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 10,
  },
  cardDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    color: '#334155',
    fontSize: 13,
  },
  moreButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreButtonText: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  centerState: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  centerStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  centerStateText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});