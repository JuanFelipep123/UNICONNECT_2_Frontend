/**
 * Ruta: /study-groups/[id]
 * UI Shell temporal para el detalle del grupo
 */

import { groupsColors } from '@/src/features/groups/constants/colors';
import { useGroupDetail } from '@/src/features/groups/hooks/useGroupDetail';
import { useAuthStore } from '@/src/store/authStore';
import { profileHttpService } from '@/src/services/profileHttpService';
import type { ProfileData } from '@/src/features/profile/types/profile';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = groupsColors;

const tabs = ['Miembros', 'Horarios', 'Archivos'];

export default function StudyGroupDetailScreen() {
  const { id, name, subjectName, description, isAdmin: isAdminParam, isMember: isMemberParam } = useLocalSearchParams();
  const groupId = typeof id === 'string' ? id : id?.[0];
  const router = useRouter();
  const { group, loading, joinGroup, leaveGroup, transferAdmin } = useGroupDetail(groupId ?? '');
  const { userId, token } = useAuthStore();
  const [localIsMember, setLocalIsMember] = React.useState<boolean | null>(null);
  const [localIsAdmin, setLocalIsAdmin] = React.useState<boolean | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Miembros');
  const [profiles, setProfiles] = React.useState<Record<string, ProfileData>>({});

  const groupNameFromParams = typeof name === 'string' ? name : name?.[0];
  const rawSubjectLabel = typeof subjectName === 'string' ? subjectName : subjectName?.[0];
  const subjectLabel = group?.subject?.name || rawSubjectLabel?.trim() || 'Sin materia';
  const groupDescriptionFromParams = typeof description === 'string' ? description : description?.[0];
  const groupName = group?.name || groupNameFromParams;
  const groupDescription = group?.description || groupDescriptionFromParams;

  // Pre-fill from URL params (only when navigating from GroupsList which passes these params)
  React.useEffect(() => {
    const parseBoolParam = (value: unknown): boolean | undefined => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
      }
      return undefined;
    };

    const parsedMember = parseBoolParam(isMemberParam);
    const parsedAdmin = parseBoolParam(isAdminParam);

    if (parsedMember !== undefined) setLocalIsMember(parsedMember);
    if (parsedAdmin !== undefined) setLocalIsAdmin(parsedAdmin);
  // Only re-run when the URL params change (i.e. navigating to a different group)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, isAdminParam, isMemberParam]);

  // Fetch member profiles when the group members list is available
  React.useEffect(() => {
    if (!token || !group?.members) return;

    const fetchProfiles = async () => {
      const memberIds = group.members as string[];
      if (!Array.isArray(memberIds)) return;

      const missing = memberIds.filter(id => !profiles[id]);
      if (missing.length === 0) return;

      await Promise.all(
        missing.map(async (uid) => {
          const res = await profileHttpService.getProfileById(uid, token);
          if (res.success && res.data) {
            setProfiles(prev => ({ ...prev, [uid]: res.data! }));
          }
        })
      );
    };

    fetchProfiles();
  }, [group?.members, token]);

  const isCreator = Boolean(group?.creator_id && group?.creator_id === userId);

  // A user is a member if:
  //   1. They are the creator (always true)
  //   2. The API returned is_member=true explicitly
  //   3. Their userId appears in the members array loaded from the API
  //   4. The URL params said so (fast pre-fill from GroupsList, before API responds)
  const isInMembersArray = Boolean(
    userId &&
    Array.isArray(group?.members) &&
    (group!.members as string[]).includes(userId)
  );
  const isAdmin = Boolean(isCreator || group?.is_admin || (localIsAdmin !== null ? localIsAdmin : false));
  const isMember = Boolean(isCreator || isInMembersArray || group?.is_member || (localIsMember !== null ? localIsMember : false));
  const memberCount = group?.member_count;
  const memberCountLabel = typeof memberCount === 'number'
    ? `${memberCount} miembro${memberCount === 1 ? '' : 's'}`
    : '';

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const result = await joinGroup();
      if (result.success) {
        // Backend always returns isMember:false after join — it's a pending request
        setHasPendingRequest(true);
        Alert.alert(
          '¡Solicitud enviada!',
          'Tu solicitud de ingreso fue enviada al administrador del grupo. Podrás acceder una vez que sea aceptada.'
        );
      } else {
        const msg = result.error || 'Intenta de nuevo más tarde.';
        // 409 = ya tienes solicitud pendiente
        if (msg.toLowerCase().includes('pending') || msg.includes('409')) {
          setHasPendingRequest(true);
        }
        Alert.alert('No se pudo enviar la solicitud', msg);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (isAdmin && (group?.members?.length || 0) > 1) {
      Alert.alert(
        'Transferir Administración',
        'Eres el administrador de este grupo. Antes de salir, debes transferir la administración tocando a otro miembro en la lista de Miembros.',
        [
          { text: 'Entendido', onPress: () => setActiveTab('Miembros') }
        ]
      );
      return;
    }

    Alert.alert(
      'Abandonar Grupo',
      '¿Estás seguro de que quieres abandonar este grupo de estudio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, salir', 
          style: 'destructive',
          onPress: async () => {
            const result = await leaveGroup();
            if (result.success) {
              setLocalIsMember(false);
              setLocalIsAdmin(false);
              Alert.alert('Éxito', 'Has abandonado el grupo.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } else {
              Alert.alert('Error', result.error || 'No se pudo abandonar el grupo.');
            }
          }
        }
      ]
    );
  };

  const [isTransferringAdmin, setIsTransferringAdmin] = React.useState<string | null>(null);

  const handleTransferAdmin = async (memberId: string) => {
    Alert.alert(
      'Transferir Administración',
      '¿Estás seguro de que quieres transferir la administración a este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          onPress: async () => {
            setIsTransferringAdmin(memberId);
            const result = await transferAdmin(memberId);
            setIsTransferringAdmin(null);
            
            if (result.success) {
              Alert.alert('Solicitud Enviada', 'Se ha enviado la solicitud de transferencia de administración.');
            } else {
              Alert.alert('Error', result.error || 'No se pudo enviar la solicitud.');
            }
          }
        }
      ]
    );
  };

  const handleGoToWall = () => {
    router.push(
      `/study-groups/wall?groupId=${groupId}&groupName=${encodeURIComponent(groupName || '')}`
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.lightBg }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Card principal */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.groupName, { color: colors.primary }]}> 
                {groupName || 'Cargando detalle...'}
              </Text>
              {memberCountLabel ? (
                <Text style={[styles.memberCount, { color: colors.label }]}> 
                  {memberCountLabel}
                </Text>
              ) : null}
            </View>

            {isAdmin ? (
              <View style={styles.infoRow}>
                <Text style={[styles.infoText, { color: colors.primary }]}>Eres el administrador de este grupo.</Text>
              </View>
            ) : isMember ? (
              <View style={styles.infoRow}>
                <Text style={[styles.infoText, { color: colors.success }]}>Ya estás en este grupo.</Text>
              </View>
            ) : hasPendingRequest ? (
              <View style={[styles.infoRow, styles.pendingRow]}>
                <Ionicons name="time-outline" size={15} color="#D97706" />
                <Text style={[styles.infoText, { color: '#D97706', marginLeft: 6 }]}>
                  Solicitud pendiente — esperando aprobación del administrador.
                </Text>
              </View>
            ) : null}

            <View style={styles.subjectPill}>
              <Text style={[styles.subjectPillText, { color: colors.primary }]}>
                {subjectLabel}
              </Text>
            </View>

            <Text style={[styles.description, { color: colors.label }]}> 
              {groupDescription || 'Cargando detalle...'}
            </Text>
            <Text style={styles.groupIdText}>ID: {groupId || 'N/A'}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Members List */}
          {activeTab === 'Miembros' && (
            <View style={styles.membersContainer}>
              {Array.isArray(group?.members) && group.members.map((memberId: string) => {
                const profile = profiles[memberId] as Record<string, any>;
                const isGroupAdmin = group.creator_id === memberId;
                const displayName = profile?.name || profile?.full_name || profile?.email || 'Cargando...';
                const initials = typeof displayName === 'string' && displayName !== 'Cargando...' 
                  ? displayName.substring(0, 2).toUpperCase() 
                  : 'U';

                return (
                  <View key={memberId} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.memberInitials}>{initials}</Text>
                      )}
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{displayName}</Text>
                      <Text style={styles.memberRole}>
                        {isGroupAdmin ? 'Administrador del grupo' : 'Miembro activo'}
                      </Text>
                    </View>
                    {isAdmin && !isGroupAdmin && (
                      <TouchableOpacity 
                        style={styles.transferButton} 
                        onPress={() => handleTransferAdmin(memberId)}
                        disabled={isTransferringAdmin === memberId}
                      >
                        {isTransferringAdmin === memberId ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {(!group?.members || group.members.length === 0) && (
                <Text style={styles.noMembersText}>Aún no hay miembros en este grupo.</Text>
              )}
            </View>
          )}

          {/* Spacer so content isn't hidden behind footer */}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Footer action */}
        <View style={styles.footer}>
          {loading && group === null ? (
            // Still fetching group data — don't show action buttons yet (prevents join flash for members)
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : isAdmin || isMember ? (
            <>
              <TouchableOpacity
                style={styles.wallButton}
                activeOpacity={0.8}
                onPress={handleGoToWall}
              >
                <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" style={styles.wallButtonIcon} />
                <Text style={styles.actionButtonText}>MURO DEL GRUPO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger, styles.leaveButton]}
                activeOpacity={0.7}
                onPress={handleLeave}
              >
                <Text style={styles.actionButtonText}>
                  {isAdmin ? 'ABANDONAR' : 'SALIR DEL GRUPO'}
                </Text>
              </TouchableOpacity>
            </>
          ) : hasPendingRequest ? (
            <View style={styles.pendingBanner}>
              <Ionicons name="time-outline" size={20} color="#D97706" />
              <Text style={styles.pendingBannerText}>
                Solicitud enviada — en espera de aprobación
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={isJoining ? [styles.actionButton, styles.actionButtonDisabled] : styles.actionButton}
              activeOpacity={0.7}
              onPress={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.actionButtonSpinner} />
                  <Text style={[styles.actionButtonText, styles.actionButtonTextWithIcon]}>
                    ENVIANDO SOLICITUD...
                  </Text>
                </>
              ) : (
                <Text style={styles.actionButtonText}>UNIRME AL GRUPO</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  footerSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'flex-end',
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
  actionButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 0,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionButtonSpinner: {
    marginRight: 8,
  },
  actionButtonTextWithIcon: {
    marginLeft: 4,
  },
  actionButtonDanger: {
    backgroundColor: colors.danger,
  },
  wallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  wallButtonIcon: {
    marginRight: 8,
  },
  leaveButton: {
    marginTop: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
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
  membersContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 33, 71, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: colors.label,
  },
  noMembersText: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.label,
    fontSize: 14,
  },
  transferButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 33, 71, 0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pendingRow: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pendingBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
    flexShrink: 1,
  },
  footerLoading: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
});
