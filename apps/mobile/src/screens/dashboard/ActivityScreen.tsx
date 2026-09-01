import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { TransactionCard } from '../../components/TransactionCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography } from '../../theme';
import { transactionApi } from '../../api/transaction.api';
import { Transaction, TransactionType } from '../../types/domain.types';
import { formatDateDisplay } from '../../utils/formatters';

export const ActivityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTransactions = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum > 1) setLoadingMore(true);
    else if (!shouldRefresh) setLoading(true);

    try {
      const typeParam = filterType === 'ALL' ? undefined : filterType;
      const res = await transactionApi.getTransactions({
        page: pageNum,
        limit: 15,
        type: typeParam,
        search: searchQuery.trim() || undefined,
      });

      if (res.success && res.data?.items) {
        if (pageNum === 1) {
          setTransactions(res.data.items);
        } else {
          setTransactions((prev) => [...prev, ...(res.data?.items || [])]);
        }
        setPage(pageNum);
        setTotalPages(res.data.meta.totalPages);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filterType, searchQuery]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchTransactions(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
        <Text style={styles.subtitle}>Track and verify your payment transactions</Text>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchant or reference..."
            placeholderTextColor={colors.base.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchTransactions(1)}
          />
        </View>

        {/* Category Filters */}
        <View style={styles.filterRow}>
          {(['ALL', 'DEBIT', 'CREDIT'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.activeFilterChip]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterChipText, filterType === type && styles.activeFilterChipText]}>
                {type === 'ALL' ? 'All Transactions' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary.main} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary.main} style={{ marginVertical: 10 }} /> : null}
          ListEmptyComponent={
            <EmptyState
              title="No Transactions Found"
              description="No transaction records match your current filter criteria."
              icon="💳"
            />
          }
          renderItem={({ item }) => (
            <TransactionCard
              item={{
                id: item.id,
                merchantName: item.merchantName || 'Payment Transaction',
                amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
                type: item.transactionType as 'CREDIT' | 'DEBIT',
                transactionDate: formatDateDisplay(item.transactionDate),
              }}
              onPress={() => navigation.navigate('TransactionDetail', { id: item.id })}
            />
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
  },
  header: {
    padding: 20,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.base.border,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.base.background,
    borderColor: colors.base.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...typography.body,
    color: colors.primary.main,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.base.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.base.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.base.textSecondary,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: colors.base.white,
  },
  listContent: {
    padding: 20,
  },
});
