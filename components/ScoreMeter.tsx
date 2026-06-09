import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ScoreMeterProps {
  score: number;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export function ScoreMeter({
  score,
  size = "medium",
  showLabel = true,
}: ScoreMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#F97316";
    return "#EF4444";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Très bon";
    if (score >= 40) return "Bon";
    return "À améliorer";
  };

  const dimensions = {
    small: { size: 60, fontSize: 14 },
    medium: { size: 80, fontSize: 18 },
    large: { size: 120, fontSize: 28 },
  };

  const dim = dimensions[size];
  const color = getScoreColor(score);

  return (
    <View style={styles.container}>
      <View
        style={[styles.meterContainer, { width: dim.size, height: dim.size }]}
      >
        <View style={[styles.meterCircle, { borderColor: color }]}>
          <Text style={[styles.scoreText, { fontSize: dim.fontSize }]}>
            {Math.round(score)}%
          </Text>
        </View>
      </View>
      {showLabel && (
        <Text style={styles.scoreLabel}>{getScoreText(score)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  meterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  meterCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  scoreText: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
