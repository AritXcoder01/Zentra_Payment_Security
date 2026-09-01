import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography } from '../../theme';

export const ActivityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [filter, setFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [search, setSearch] = useState('');

  // Currently backend transaction endpoint GET /transactions is unbuilt (Backend Gap)
  const transactions: any[] = [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Activity</Text>
        <Text style={styles.subtitle}>View and search detected transactions</Text>
      </View>

      <AppTextInput
        placeholder="Search merchant or reference..."
        value={search}
        onChangeText={setSearch}
        containerStyle={styles.searchBox}
      />

      <View style={styles.filterRow}>
        {(['ALL', 'DEBIT', 'CREDIT'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, filter === tab && styles.activeFilterChip]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.activeFilterText]}>
              {tab === 'ALL' ? 'All Activity' : tab === 'DEBIT' ? 'Debits (Money Out)' : 'Credits (Money In)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {transactions.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No Transaction Records"
          description="Detected transactions from eligible payment SMS messages will be displayed here once active."
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
            >
              <Text>{item.merchantName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  searchBox: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.base.border,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  filterText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.base.textSecondary,
  },
  activeFilterText: {
    color: colors.base.white,
  },
});
