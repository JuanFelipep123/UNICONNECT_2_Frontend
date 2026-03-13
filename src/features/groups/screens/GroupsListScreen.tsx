/**
 * Pantalla: Lista de grupos de estudio con dos pestañas
 */

import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserGroups } from '../hooks/useUserGroups';
import type { StudyGroup } from '../types/groups';

const colors = {
  primary: '#002147',
  accent: '#C5A021',
  surface: '#FFFFFF',
  text: '#1F2A3C',
  label: '#6B798F',
  lightBg: '#F8F9FA',
  border: '#E0E8F0',
};

interface TabType {
  id: 'admin' | 'participant';
  label: string;
}

const TABS: TabType[] = [
  { id: 'admin', label: 'Grupos que Administro' },
  { id: 'participant', label: 'Grupos en los que Participo' },
];

export function GroupsListScreen() {
  const router = useRouter();
  const { adminGroups, participantGroups, loading, error, reload } = useUserGroups();
  const [activeTab, setActiveTab] = useState<'admin' | 'participant'>('admin');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  // Recargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const currentGroups = activeTab === 'admin' ? adminGroups : participantGroups;
  const hasGroups = currentGroups.length > 0;

  const handleCreateGroup = () => {
    router.push('/study-groups/create');
  };

  const handleGroupPress = (group: StudyGroup) => {
    router.push({
      pathname: '/study-groups/[id]',
      params: {
        id: group.id,
        name: group.name,
        subjectName: group.subject?.name ?? '',
        description: group.description ?? '',
      },
    } as any);
  };

  const renderGroupCard = ({ item }: { item: StudyGroup }) => (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.surface }]}
      onPress={() => handleGroupPress(item)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
        <MaterialIcons name="group" size={24} color="#FFFFFF" />
      </View>

      {/* Contenido */}
      <View style={styles.groupContent}>
        <Text style={[styles.groupName, { color: colors.primary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.groupDescription, { color: colors.label }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Metadata */}
        <View style={styles.groupMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="book" size={14} color={colors.label} />
            <Text style={[styles.metaText, { color: colors.label }]}>
              {item.subject?.name || 'Sin materia'}
            </Text>
          </View>

          {item.member_count && (
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={14} color={colors.label} />
              <Text style={[styles.metaText, { color: colors.label }]}>
                {item.member_count} miembros
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Icono de navegación */}
      <MaterialIcons name="chevron-right" size={24} color={colors.label} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="group-work" size={64} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Aún no perteneces a ningún grupo de estudio
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.label }]}>
        Crea tu primer grupo y empieza a colaborar con otros estudiantes.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={handleCreateGroup}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>Crear mi primer grupo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.lightBg }]}
      edges={['left', 'right', 'bottom']}
    >

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              activeTab === tab.id && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab.id ? colors.primary : colors.label,
                  fontWeight: activeTab === tab.id ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.label }]}>
            Cargando grupos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#DC2626" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Error al Cargar
          </Text>
          <Text style={[styles.errorMessage, { color: colors.label }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            activeOpacity={0.6}
          >
            <Text style={styles.retryButtonText}>Intentar de Nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentGroups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

        {/* Botón flotante para crear grupo */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={handleCreateGroup}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={28} color={colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  groupMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
