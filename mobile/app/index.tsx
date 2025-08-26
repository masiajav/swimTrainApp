import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section with Gradient Background */}
      <View style={styles.heroSection}>
        
        {/* Floating Elements for Visual Interest */}
        <View style={[styles.floatingElement, { top: 80, right: 40, width: 80, height: 80 }]} />
        <View style={[styles.floatingElement, { top: 160, left: 32, width: 64, height: 64 }]} />
        <View style={[styles.floatingElement, { bottom: 128, right: 24, width: 48, height: 48 }]} />
        <View style={[styles.floatingElement, { top: 240, right: 80, width: 32, height: 32 }]} />
        <View style={[styles.floatingElement, { bottom: 240, left: 48, width: 24, height: 24 }]} />
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Swimming Icon with Glow Effect */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconEmoji}>🏊‍♀️</Text>
            </View>
            <View style={styles.iconGlow} />
          </View>
          
          {/* App Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>
              SwimTrainApp
            </Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>
              Track your swimming training sessions{'\n'}with your team like never before ✨
            </Text>
          </View>
          
          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📊</Text>
              </View>
              <Text style={styles.featureText}>Track Progress & Analytics</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>👥</Text>
              </View>
              <Text style={styles.featureText}>Team Collaboration</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🏆</Text>
              </View>
              <Text style={styles.featureText}>Goal Achievement</Text>
            </View>
          </View>
          
          {/* Action Buttons - Modern Centered Design */}
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Link href="/auth/login" asChild>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    <View style={styles.buttonIcon}>
                      <Text style={styles.buttonIconText}>→</Text>
                    </View>
                    <Text style={styles.primaryButtonText}>
                      Get Started
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
              
              <Link href="/(tabs)" asChild>
                <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                  <View style={styles.buttonContent}>
                    <View style={styles.secondaryButtonIcon}>
                      <Text style={styles.secondaryButtonIconText}>◉</Text>
                    </View>
                    <Text style={styles.secondaryButtonText}>
                      Try Demo
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
          
          {/* App Features Cards */}
          <View style={styles.cardsContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.cardTitle}>
                🌊 Swimming-Specific Features
              </Text>
              <Text style={styles.cardDescription}>
                Track strokes, laps, times, and technique improvements with specialized swimming metrics
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Text style={styles.cardTitle}>
                📱 Cross-Platform & Free Forever
              </Text>
              <Text style={styles.cardDescription}>
                Works seamlessly on phone, tablet, and web • Always free • Open source • Privacy-first
              </Text>
            </View>
          </View>
          
          {/* Stats Preview */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Sessions Tracked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Swimming Teams</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10k+</Text>
                <Text style={styles.statLabel}>Kilometers Swum</Text>
              </View>
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with ❤️ for swimmers around the world
            </Text>
            <Text style={styles.footerSubtext}>
              Free • Open Source • Privacy-First • No Ads Ever
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    flex: 1,
    minHeight: 800,
    backgroundColor: '#3b82f6',
    position: 'relative',
  },
  floatingElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 48,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconEmoji: {
    fontSize: 72,
  },
  iconGlow: {
    height: 8,
    width: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  titleUnderline: {
    height: 4,
    width: 128,
    backgroundColor: '#5eead4',
    borderRadius: 20,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    color: '#bfdbfe',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 28,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    fontSize: 18,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  secondaryButtonIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  secondaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  cardsContainer: {
    width: '100%',
    marginTop: 64,
    paddingHorizontal: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    width: '100%',
    marginTop: 48,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  footer: {
    marginTop: 64,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  footerSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
