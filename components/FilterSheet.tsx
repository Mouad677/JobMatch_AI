import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from "react-native";
import {
  JobFilterCriteria,
  ContractType,
  ExperienceLevel,
  PostedSince,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: JobFilterCriteria) => void;
  initialFilters: JobFilterCriteria;
}

export function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterSheetProps) {
  const [filters, setFilters] = useState<JobFilterCriteria>(initialFilters);
  const [selectedContractTypes, setSelectedContractTypes] = useState<
    ContractType[]
  >(initialFilters.contractType || []);
  const [selectedExperience, setSelectedExperience] = useState<
    ExperienceLevel | undefined
  >(initialFilters.experienceLevel);
  const [location, setLocation] = useState(initialFilters.location || "");
  const [salaryMin, setSalaryMin] = useState(
    initialFilters.salaryMin?.toString() || "",
  );
  const [salaryMax, setSalaryMax] = useState(
    initialFilters.salaryMax?.toString() || "",
  );
  const [postedSince, setPostedSince] = useState<PostedSince | undefined>(
    initialFilters.postedSince,
  );

  const toggleContractType = (type: ContractType) => {
    if (selectedContractTypes.includes(type)) {
      setSelectedContractTypes(selectedContractTypes.filter((t) => t !== type));
    } else {
      setSelectedContractTypes([...selectedContractTypes, type]);
    }
  };

  const handleApply = () => {
    onApply({
      ...filters,
      contractType: selectedContractTypes,
      experienceLevel: selectedExperience,
      location: location || undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      postedSince,
    });
    onClose();
  };

  const resetFilters = () => {
    setSelectedContractTypes([]);
    setSelectedExperience(undefined);
    setLocation("");
    setSalaryMin("");
    setSalaryMax("");
    setPostedSince(undefined);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtres avancés</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Type de contrat</Text>
            <View style={styles.chipContainer}>
              {Object.values(ContractType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    selectedContractTypes.includes(type) && styles.chipSelected,
                  ]}
                  onPress={() => toggleContractType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedContractTypes.includes(type) &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Niveau d'expérience</Text>
            <View style={styles.chipContainer}>
              {Object.values(ExperienceLevel).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.chip,
                    selectedExperience === level && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedExperience(level)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedExperience === level && styles.chipTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Localisation</Text>
            <TextInput
              style={styles.input}
              placeholder="Ville, région..."
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.sectionTitle}>Salaire (DH)</Text>
            <View style={styles.salaryContainer}>
              <TextInput
                style={[styles.input, styles.salaryInput]}
                placeholder="Min"
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
              />
              <Text style={styles.salarySeparator}>-</Text>
              <TextInput
                style={[styles.input, styles.salaryInput]}
                placeholder="Max"
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.sectionTitle}>Date de publication</Text>
            <View style={styles.chipContainer}>
              {Object.values(PostedSince).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.chip,
                    postedSince === period && styles.chipSelected,
                  ]}
                  onPress={() => setPostedSince(period)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      postedSince === period && styles.chipTextSelected,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  chipSelected: {
    backgroundColor: "#4F46E5",
  },
  chipText: {
    fontSize: 14,
    color: "#4B5563",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },
  salaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  salaryInput: {
    flex: 1,
  },
  salarySeparator: {
    fontSize: 16,
    color: "#6B7280",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
