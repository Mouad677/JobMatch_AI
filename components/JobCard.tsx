import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { JobOffer, ContractType } from "@/types";
import { Ionicons } from "@expo/vector-icons";

interface JobCardProps {
  job: JobOffer;
  onPress?: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const getContractColor = (type: ContractType) => {
    switch (type) {
      case ContractType.CDI:
        return "#10B981";
      case ContractType.STAGE:
        return "#F59E0B";
      case ContractType.ALTERNANCE:
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (date: Date) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    if (diff < 30) return `Il y a ${Math.floor(diff / 7)} semaines`;
    return `Il y a ${Math.floor(diff / 30)} mois`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {job.companyLogo ? (
            <Image source={{ uri: job.companyLogo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{job.company.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
        <View
          style={[
            styles.detailItem,
            styles.contractBadge,
            { backgroundColor: getContractColor(job.contractType) + "20" },
          ]}
        >
          <Text
            style={[
              styles.contractText,
              { color: getContractColor(job.contractType) },
            ]}
          >
            {job.contractType}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {job.salaryMin && job.salaryMax && (
          <View style={styles.salary}>
            <Ionicons name="cash-outline" size={14} color="#10B981" />
            <Text style={styles.salaryText}>
              {job.salaryMin} - {job.salaryMax} DH
            </Text>
          </View>
        )}
        <Text style={styles.date}>{formatDate(job.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: "#6B7280",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  contractBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contractText: {
    fontSize: 11,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  salary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  salaryText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
