import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SkillBadgeProps {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  onPress?: () => void;
}

export function SkillBadge({ name, level, onPress }: SkillBadgeProps) {
  const getLevelColor = () => {
    switch (level) {
      case "beginner":
        return "#F59E0B";
      case "intermediate":
        return "#3B82F6";
      case "advanced":
        return "#8B5CF6";
      case "expert":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <View style={[styles.container, onPress && styles.pressable]}>
      <Text style={styles.name}>{name}</Text>
      {level && (
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor() }]}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pressable: {
    opacity: 0.8,
  },
  name: {
    fontSize: 14,
    color: "#374151",
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
