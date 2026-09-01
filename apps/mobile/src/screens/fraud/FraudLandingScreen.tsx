import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SelectableCard } from '../../components/SelectableCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../theme';
import { fraudApi } from '../../api/fraud.api';
import { FraudCategory } from '../../types/domain.types';

export const FraudLandingScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const prefilledData = route.params?.prefilledData || {};
  const [categories, setCategories] = useState<FraudCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    prefilledData.fraudCategory || null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fraudApi.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleNext = () => {
    if (!selectedCategory) return;
    navigation.navigate('PaymentMode', {
      reportData: {
        ...prefilledData,
        fraudCategory: selectedCategory,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Fraud Incident</Text>
        <Text style={styles.subtitle}>Select the category that best describes what happened</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary.main} style={{ marginVertical: 30 }} />
      ) : (
        categories.map((cat) => (
          <SelectableCard
            key={cat.id || cat.code}
            title={cat.name}
            subtitle={cat.description}
            selected={selectedCategory === cat.code || selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.code)}
          />
        ))
      )}

      <PrimaryButton
        title="Continue to Payment Mode"
        onPress={handleNext}
        disabled={!selectedCategory}
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.base.textSecondary,
  },
  button: {
    marginVertical: 20,
  },
});
