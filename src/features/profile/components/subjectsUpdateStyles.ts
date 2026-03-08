import { StyleSheet } from 'react-native';
import { LIGHT_THEME } from '../../../theme/themeContext';

const THEME = LIGHT_THEME;
const ERROR_BACKGROUND = '#FEE2E2';
const SHADOW_COLOR = '#000';

export const subjectsUpdateStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerOnboarding: {
    height: 110,
    paddingHorizontal: 22,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.surface,
  },
  headerTitleOnboarding: {
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  currentSectionSpacing: {
    marginTop: 14,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  onboardingSectionTitle: {
    color: '#8B9BB3',
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 26,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: THEME.label,
  },
  chipContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  onboardingChipContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.label,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
  },
  searchBarContainerOnboarding: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F4F6F9',
    borderColor: '#D5DDE8',
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.text,
  },
  searchInputOnboarding: {
    fontSize: 16,
    color: '#54647B',
  },
  subjectsList: {
    marginTop: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: THEME.label,
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: ERROR_BACKGROUND,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: THEME.error,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: THEME.background,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  buttonContainerOnboarding: {
    backgroundColor: '#F2F2F2',
    borderTopColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 50,
  },
  saveButtonOnboarding: {
    height: 54,
    borderRadius: 14,
    marginTop: 28,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  saveButtonTextOnboarding: {
    fontSize: 16,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: THEME.label,
  },
  errorMessage: {
    marginTop: 16,
    fontSize: 14,
    color: THEME.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: THEME.label,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.surface,
  },
  onboardingHeroContainer: {
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 8,
  },
  onboardingStepLabel: {
    color: '#8B9BB3',
    fontSize: 13,
    letterSpacing: 1.6,
    fontWeight: '700',
    textAlign: 'center',
  },
  onboardingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    marginTop: 10,
  },
  onboardingDotPill: {
    width: 32,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#C8A04D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  onboardingDotActive: {
    backgroundColor: THEME.gold,
  },
  onboardingDotInactive: {
    backgroundColor: THEME.border,
  },
  onboardingDescription: {
    color: '#3C4A5F',
    fontSize: 16,
    lineHeight: 30,
    textAlign: 'left',
    marginTop: 22,
  },
});
