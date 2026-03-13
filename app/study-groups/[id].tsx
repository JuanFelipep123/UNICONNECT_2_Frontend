/**
 * Ruta: /study-groups/[id]
 * UI Shell temporal para el detalle del grupo
 */

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  primary: '#002147',
  accent: '#C5A021',
  text: '#1F2A3C',
  label: '#6B798F',
  lightBg: '#F5F7F8',
  surface: '#FFFFFF',
  border: '#E0E8F0',
  danger: '#DC2626',
};

const tabs = ['Miembros', 'Horarios', 'Archivos'];

export default function StudyGroupDetailScreen() {
  const { id, name, subjectName, description } = useLocalSearchParams();
  const groupId = typeof id === 'string' ? id : id?.[0];
  const groupName = typeof name === 'string' ? name : name?.[0];
  const subjectLabel = typeof subjectName === 'string' ? subjectName : subjectName?.[0];
  const groupDescription = typeof description === 'string' ? description : description?.[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.lightBg }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card principal */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.groupName, { color: colors.primary }]}>
              {groupName || 'Cargando detalle...'}
            </Text>
            <Text style={[styles.memberCount, { color: colors.label }]}>1 miembro</Text>
          </View>

          <TouchableOpacity style={styles.leaveButton} activeOpacity={0.7}>
            <Text style={styles.leaveButtonText}>Abandonar grupo</Text>
          </TouchableOpacity>

          <View style={styles.subjectPill}>
            <Text style={[styles.subjectPillText, { color: colors.primary }]}>
              {subjectLabel || 'Sin materia'}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.label }]}> {groupDescription || 'Cargando detalle...'}</Text>

          <Text style={styles.groupIdText}>ID: {groupId || 'N/A'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <View key={tab} style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
              <Text
                style={[
                  styles.tabText,
                  index === 0 ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRow: {
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  leaveButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  leaveButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  subjectPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 33, 71, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  subjectPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  groupIdText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.label,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabTextInactive: {
    color: colors.label,
  },
});
