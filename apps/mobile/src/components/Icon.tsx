import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export type IconName =
  | 'home'
  | 'activity'
  | 'safety'
  | 'security'
  | 'alerts'
  | 'profile'
  | 'report-fraud'
  | 'check-activity'
  | 'safety-guide'
  | 'emergency-help'
  | 'history'
  | 'wrong-recipient'
  | 'unauthorized-transaction'
  | 'upi-fraud'
  | 'card-fraud'
  | 'phishing'
  | 'fake-customer-care'
  | 'otp-scam'
  | 'investment-scam'
  | 'account-takeover'
  | 'sim-related'
  | 'other-fraud'
  | 'upi'
  | 'bank-transfer'
  | 'card'
  | 'net-banking'
  | 'wallet'
  | 'atm'
  | 'other-payment'
  | 'phone'
  | 'external-link'
  | 'check-circle'
  | 'chevron-right'
  | 'lock'
  | 'user-info'
  | 'devices'
  | 'help'
  | 'alert-triangle'
  | 'book-open'
  | 'life-buoy';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Pure Vector Icon Component.
 * Implemented using resolution-independent geometric SVG vector primitives.
 * Zero Unicode emoji or font-character dependencies.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = colors.primary.main,
}) => {
  const renderVectorGlyph = () => {
    switch (name) {
      case 'home':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            {/* Roof Triangle */}
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: size * 0.42,
                borderRightWidth: size * 0.42,
                borderBottomWidth: size * 0.38,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
              }}
            />
            {/* House Body */}
            <View
              style={{
                width: size * 0.62,
                height: size * 0.42,
                backgroundColor: color,
                marginTop: -1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  width: size * 0.22,
                  height: size * 0.24,
                  backgroundColor: colors.base.white,
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                }}
              />
            </View>
          </View>
        );

      case 'activity':
        return (
          <View style={[styles.rowBottom, { width: size, height: size, paddingBottom: 2 }]}>
            <View style={{ width: size * 0.16, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.16, height: size * 0.6, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.16, height: size * 0.85, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.16, height: size * 0.45, backgroundColor: color, borderRadius: 1 }} />
          </View>
        );

      case 'safety':
      case 'security':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.72,
                height: size * 0.8,
                backgroundColor: color,
                borderTopLeftRadius: size * 0.36,
                borderTopRightRadius: size * 0.36,
                borderBottomLeftRadius: size * 0.36,
                borderBottomRightRadius: size * 0.36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: size * 0.35,
                  height: size * 0.4,
                  borderWidth: 2,
                  borderColor: colors.base.white,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        );

      case 'alerts':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            {/* Bell Top Handle */}
            <View style={{ width: 3, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
            {/* Bell Body */}
            <View
              style={{
                width: size * 0.6,
                height: size * 0.55,
                backgroundColor: color,
                borderTopLeftRadius: size * 0.3,
                borderTopRightRadius: size * 0.3,
              }}
            />
            {/* Bell Rim */}
            <View style={{ width: size * 0.75, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
            {/* Bell Clapper */}
            <View style={{ width: size * 0.22, height: size * 0.15, backgroundColor: color, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginTop: 1 }} />
          </View>
        );

      case 'profile':
      case 'user-info':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            {/* Head Circle */}
            <View
              style={{
                width: size * 0.38,
                height: size * 0.38,
                borderRadius: size * 0.19,
                backgroundColor: color,
                marginBottom: 2,
              }}
            />
            {/* Shoulders Arc */}
            <View
              style={{
                width: size * 0.7,
                height: size * 0.32,
                borderTopLeftRadius: size * 0.35,
                borderTopRightRadius: size * 0.35,
                backgroundColor: color,
              }}
            />
          </View>
        );

      case 'unauthorized-transaction':
      case 'lock':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            {/* Lock Shackle */}
            <View
              style={{
                width: size * 0.38,
                height: size * 0.35,
                borderWidth: 2,
                borderColor: color,
                borderTopLeftRadius: size * 0.19,
                borderTopRightRadius: size * 0.19,
                borderBottomWidth: 0,
              }}
            />
            {/* Lock Body */}
            <View
              style={{
                width: size * 0.62,
                height: size * 0.45,
                backgroundColor: color,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 4, height: 6, backgroundColor: colors.base.white, borderRadius: 2 }} />
            </View>
          </View>
        );

      case 'card-fraud':
      case 'card':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.82,
                height: size * 0.55,
                borderWidth: 2,
                borderColor: color,
                borderRadius: 4,
                justifyContent: 'space-between',
                paddingVertical: 3,
              }}
            >
              {/* Magnetic Strip */}
              <View style={{ width: '100%', height: size * 0.12, backgroundColor: color }} />
              {/* Card Chip / Number Line */}
              <View style={{ width: size * 0.25, height: size * 0.1, backgroundColor: color, marginLeft: 4, borderRadius: 1 }} />
            </View>
          </View>
        );

      case 'upi-fraud':
      case 'upi':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            {/* Thunderbolt vector shape */}
            <View
              style={{
                width: 0,
                height: 0,
                borderRightWidth: size * 0.35,
                borderBottomWidth: size * 0.45,
                borderRightColor: 'transparent',
                borderBottomColor: color,
              }}
            />
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: size * 0.35,
                borderTopWidth: size * 0.45,
                borderLeftColor: 'transparent',
                borderTopColor: color,
                marginTop: -size * 0.15,
                marginLeft: size * 0.1,
              }}
            />
          </View>
        );

      case 'phishing':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.78,
                height: size * 0.52,
                borderWidth: 2,
                borderColor: color,
                borderRadius: 3,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: size * 0.34,
                  borderRightWidth: size * 0.34,
                  borderTopWidth: size * 0.22,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: color,
                }}
              />
            </View>
          </View>
        );

      case 'fake-customer-care':
      case 'phone':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.55,
                height: size * 0.72,
                borderWidth: 2,
                borderColor: color,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 3,
              }}
            >
              <View style={{ width: size * 0.2, height: 2, backgroundColor: color, borderRadius: 1 }} />
              <View style={{ width: size * 0.15, height: size * 0.15, borderRadius: size * 0.075, backgroundColor: color }} />
            </View>
          </View>
        );

      case 'history':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.72,
                height: size * 0.72,
                borderRadius: size * 0.36,
                borderWidth: 2,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Clock Hands */}
              <View style={{ width: 2, height: size * 0.25, backgroundColor: color, marginTop: -2 }} />
              <View style={{ width: size * 0.2, height: 2, backgroundColor: color, marginLeft: size * 0.15, marginTop: -2 }} />
            </View>
          </View>
        );

      case 'check-circle':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.76,
                height: size * 0.76,
                borderRadius: size * 0.38,
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: size * 0.22,
                  height: size * 0.38,
                  borderRightWidth: 2,
                  borderBottomWidth: 2,
                  borderColor: colors.base.white,
                  transform: [{ rotate: '45deg' }],
                  marginTop: -2,
                }}
              />
            </View>
          </View>
        );

      case 'chevron-right':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.35,
                height: size * 0.35,
                borderTopWidth: 2,
                borderRightWidth: 2,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
        );

      case 'external-link':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.45,
                height: size * 0.45,
                borderTopWidth: 2,
                borderRightWidth: 2,
                borderColor: color,
                transform: [{ rotate: '15deg' }],
              }}
            />
            <View style={{ width: 2, height: size * 0.5, backgroundColor: color, transform: [{ rotate: '-45deg' }], marginTop: -size * 0.2 }} />
          </View>
        );

      case 'report-fraud':
      case 'alert-triangle':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: size * 0.42,
                borderRightWidth: size * 0.42,
                borderBottomWidth: size * 0.72,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
                alignItems: 'center',
              }}
            />
            <View style={{ width: 2, height: size * 0.22, backgroundColor: colors.base.white, marginTop: -size * 0.42 }} />
            <View style={{ width: 2, height: 2, backgroundColor: colors.base.white, borderRadius: 1, marginTop: 2 }} />
          </View>
        );

      default:
        // Default Shield Vector
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.7,
                height: size * 0.75,
                backgroundColor: color,
                borderTopLeftRadius: size * 0.35,
                borderTopRightRadius: size * 0.35,
                borderBottomLeftRadius: size * 0.35,
                borderBottomRightRadius: size * 0.35,
              }}
            />
          </View>
        );
    }
  };

  return <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{renderVectorGlyph()}</View>;
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
