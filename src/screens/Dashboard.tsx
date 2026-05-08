import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Card } from '../components/Card';
import { Menu, Bell, User, Calculator, Store, MoreVertical } from 'lucide-react-native';

export default function Dashboard() {
  const barData = [30, 50, 40, 60, 55, 75, 70, 100]; // Sample heights for bar chart

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Menu color={colors.primary} size={24} />
        <Text style={styles.headerTitle}>Mira's Sari-Sari Store</Text>
        <View style={styles.headerIcons}>
          <Bell color={colors.primary} size={24} style={styles.icon} />
          <View style={styles.profilePic}>
            <User color={colors.slate500} size={20} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Kumusta, Liza!</Text>
          <Text style={styles.greetingSubtitle}>Here's your store update for today.</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.outlineButton]}>
            <Calculator color={colors.onSurface} size={20} />
            <Text style={styles.outlineButtonText}>Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.solidButton]}>
            <Store color={colors.white} size={20} />
            <Text style={styles.solidButtonText}>New Sale</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Sales Card */}
        <Card style={styles.salesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardSmallTitle}>TODAY'S SALES</Text>
            <MoreVertical color={colors.onSurface} size={20} />
          </View>
          <View style={styles.salesValueRow}>
            <Text style={styles.salesValue}>₱2,450.00</Text>
            <View style={styles.trendBox} />
          </View>

          {/* Simple Bar Chart */}
          <View style={styles.chartContainer}>
            {barData.map((height, index) => (
              <View 
                key={index} 
                style={[
                  styles.bar, 
                  { height: height * 0.8 }, 
                  index === barData.length - 1 && styles.activeBar
                ]} 
              />
            ))}
          </View>
        </Card>

        {/* Store Status Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.cardSmallTitle}>STORE STATUS</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Total Items</Text>
            <Text style={styles.statusValue}>145</Text>
          </View>
          
          <View style={styles.statusDivider} />

          <View style={styles.statusRow}>
            <View style={styles.labelWithDot}>
              <View style={[styles.dot, { backgroundColor: colors.secondaryContainer }]} />
              <Text style={styles.statusLabel}>Fully Stocked</Text>
            </View>
            <Text style={styles.statusValue}>120</Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusRow}>
            <View style={styles.labelWithDot}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.statusLabel, { color: colors.primary }]}>Needs Restock</Text>
            </View>
            <Text style={[styles.statusValue, { color: colors.primary }]}>5</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  greetingSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: colors.slate500,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.radius,
    borderWidth: 1,
  },
  outlineButton: {
    backgroundColor: colors.white,
    borderColor: colors.slate200,
  },
  solidButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 8,
  },
  solidButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 8,
  },
  salesCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: colors.slate200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardSmallTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.5,
  },
  salesValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  salesValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  trendBox: {
    width: 40,
    height: 20,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginTop: spacing.md,
  },
  bar: {
    width: '10%',
    backgroundColor: colors.slate50,
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: colors.primary,
  },
  statusCard: {
    padding: spacing.md,
    borderColor: colors.slate200,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  statusDivider: {
    height: 1,
    backgroundColor: colors.slate50,
  },
  labelWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
